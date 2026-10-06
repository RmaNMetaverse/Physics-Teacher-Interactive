import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { courseCatalog } from '../learning/catalog';
import { saveProgressV2 } from '../progress/progress';
import type { LearnerProgressV2 } from '../progress/types';
import { loadAndMergeProgress, mergeProgress, sameProgress, type SyncState } from './progress-sync';
import { isCloudConfigured, supabase } from './supabase';
import { authRedirectUrl } from './redirect';

export type OAuthProvider = 'google' | 'github';

export interface CloudAccount {
  configured: boolean;
  user: User | null;
  ready: boolean;
  syncState: SyncState;
  error: string;
  signUp(email: string, password: string): Promise<string>;
  signIn(email: string, password: string): Promise<void>;
  signInWithProvider(provider: OAuthProvider): Promise<void>;
  signOut(): Promise<void>;
  syncNow(): Promise<void>;
}

export function useCloudAccount(
  progress: LearnerProgressV2,
  setProgress: (value: LearnerProgressV2 | ((current: LearnerProgressV2) => LearnerProgressV2)) => void,
): CloudAccount {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(!isCloudConfigured);
  const [syncState, setSyncState] = useState<SyncState>('local');
  const [error, setError] = useState('');
  const currentProgress = useRef(progress);
  const hydratedUser = useRef<string | null>(null);
  const activeUser = useRef<string | null>(null);
  const syncQueue = useRef<Promise<unknown>>(Promise.resolve());
  currentProgress.current = progress;

  const synchronize = useCallback((nextUser: User) => {
    const task = syncQueue.current.catch(() => undefined).then(async () => {
      if (activeUser.current !== nextUser.id) return;
      setSyncState('syncing');
      const merged = await loadAndMergeProgress(nextUser, currentProgress.current, courseCatalog);
      if (activeUser.current !== nextUser.id) return;
      // Retain any practice completed while the network request was in flight.
      const combined = mergeProgress(currentProgress.current, merged, courseCatalog);
      saveProgressV2(combined, courseCatalog);
      if (!sameProgress(combined, currentProgress.current)) {
        currentProgress.current = combined;
        setProgress(combined);
      }
      setError('');
      setSyncState('synced');
    });
    syncQueue.current = task;
    return task;
  }, [setProgress]);

  const hydrate = useCallback(async (nextUser: User | null) => {
    activeUser.current = nextUser?.id ?? null;
    setUser(nextUser);
    setError('');
    if (!nextUser) {
      hydratedUser.current = null;
      setSyncState('local');
      setReady(true);
      return;
    }
    setReady(false);
    setSyncState('syncing');
    hydratedUser.current = nextUser.id;
    try {
      await synchronize(nextUser);
      if (activeUser.current !== nextUser.id) return;
      hydratedUser.current = nextUser.id;
      setSyncState('synced');
    } catch (caught) {
      if (activeUser.current !== nextUser.id) return;
      setError(caught instanceof Error ? caught.message : 'Progress could not be synchronized.');
      setSyncState('error');
    } finally {
      if (activeUser.current === nextUser.id) setReady(true);
    }
  }, [synchronize]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) void hydrate(data.user);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session?.user.id !== hydratedUser.current) void hydrate(session?.user ?? null);
    });
    return () => {
      active = false;
      activeUser.current = null;
      data.subscription.unsubscribe();
    };
  }, [hydrate]);

  useEffect(() => {
    if (!user || !ready || hydratedUser.current !== user.id) return;
    const timer = window.setTimeout(() => {
      void synchronize(user)
        .then(() => { setError(''); setSyncState('synced'); })
        .catch(caught => {
          setError(caught instanceof Error ? caught.message : 'Progress could not be synchronized.');
          setSyncState('error');
        });
    }, 700);
    return () => window.clearTimeout(timer);
  }, [progress, ready, user, synchronize]);

  useEffect(() => {
    if (!user || !ready || hydratedUser.current !== user.id) return;
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      void synchronize(user).catch(caught => {
        setError(caught instanceof Error ? caught.message : 'Progress could not be synchronized.');
        setSyncState('error');
      });
    };
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('online', refresh);
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('online', refresh);
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, [user, ready, synchronize]);

  return {
    configured: isCloudConfigured,
    user,
    ready,
    syncState,
    error,
    async signUp(email, password) {
      if (!supabase) throw new Error('Cloud sync is not configured.');
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: authRedirectUrl(window.location) },
      });
      if (authError) throw authError;
      return data.session ? 'Account created and signed in.' : 'Check your email to confirm your account.';
    },
    async signIn(email, password) {
      if (!supabase) throw new Error('Cloud sync is not configured.');
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
    },
    async signInWithProvider(provider) {
      if (!supabase) throw new Error('Cloud sync is not configured.');
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: authRedirectUrl(window.location),
        },
      });
      if (authError) throw authError;
    },
    async signOut() {
      if (!supabase) return;
      const { error: authError } = await supabase.auth.signOut();
      if (authError) throw authError;
    },
    async syncNow() {
      if (!user) return;
      setSyncState('syncing');
      try {
        await synchronize(user);
        setError('');
        setSyncState('synced');
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Progress could not be synchronized.');
        setSyncState('error');
        throw caught;
      }
    },
  };
}
