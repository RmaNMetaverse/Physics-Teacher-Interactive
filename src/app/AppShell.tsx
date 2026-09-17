import { useEffect, useRef, useState, type MouseEvent, type ReactNode, type RefObject } from 'react';
import { Atom, ChartNoAxesColumn, Cloud, Compass, Flame, Map, Palette, Trophy, UserRound } from 'lucide-react';
import type { AppRoute } from './router';
import { parseHash, toHash } from './router';
import type { LearnerProgressV2 } from '../progress/types';
import { AppearancePopover } from '../components/navigation/AppearancePopover';
import { MobileTabBar } from '../components/navigation/MobileTabBar';
import { AccountPopover } from '../components/navigation/AccountPopover';
import type { CloudAccount } from '../cloud/useCloudAccount';

export interface AppShellProps {
  route: AppRoute;
  learnHash: string;
  recoveryMessage: string;
  mainRef: RefObject<HTMLElement | null>;
  children: ReactNode;
  progress?: LearnerProgressV2;
  onProgressChange?: (next: LearnerProgressV2) => void;
  settings?: LearnerProgressV2['settings'];
  onUpdateSettings?: (partial: Partial<LearnerProgressV2['settings']>) => void;
  account?: CloudAccount;
  onNavigate?: (route: AppRoute) => void;
}

const DEFAULT_SETTINGS: LearnerProgressV2['settings'] = {
  theme: 'dark',
  sound: true,
  reducedMotion: false,
  celebrations: true,
  liquidGlass: true,
  font: 'modern-sans',
  primaryColor: '#a78bfa',
  secondaryColor: '#34d399',
};
const ACCOUNT_GATE_DISMISSED_KEY = 'physics-account-gate-dismissed';

function accountGateDismissedForSession() {
  try {
    return sessionStorage.getItem(ACCOUNT_GATE_DISMISSED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function AppShell({
  route,
  learnHash,
  recoveryMessage,
  mainRef,
  children,
  progress,
  onProgressChange,
  settings,
  onUpdateSettings,
  account,
  onNavigate,
}: AppShellProps) {
  const [isAppearanceOpen, setIsAppearanceOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAccountGateOpen, setIsAccountGateOpen] = useState(false);
  const [accountReminder, setAccountReminder] = useState('');
  const initialAccountResolved = useRef(false);
  const current = route.page === 'course' || route.page === 'mission' ? 'learn' : route.page;

  const activeSettings = settings ?? progress?.settings ?? DEFAULT_SETTINGS;

  const handleUpdateSettings = (partial: Partial<LearnerProgressV2['settings']>) => {
    if (onUpdateSettings) {
      onUpdateSettings(partial);
    } else if (onProgressChange && progress) {
      onProgressChange({
        ...progress,
        settings: { ...progress.settings, ...partial },
        savedAt: new Date().toISOString(),
      });
    }
  };

  const totalXp = progress?.totalXp ?? 0;
  const streakCount = progress?.streak?.current ?? 0;

  useEffect(() => {
    if (!account?.ready || initialAccountResolved.current) return;
    initialAccountResolved.current = true;
    setIsAccountGateOpen(account.configured && !account.user && !accountGateDismissedForSession());
  }, [account?.configured, account?.ready, account?.user]);

  useEffect(() => {
    if (account?.user) {
      setIsAccountGateOpen(false);
      setAccountReminder('');
    }
  }, [account?.user]);

  const continueLocally = () => {
    try {
      sessionStorage.setItem(ACCOUNT_GATE_DISMISSED_KEY, 'true');
    } catch {
      // The current mounted shell still remembers the dismissal in component state.
    }
    setIsAccountGateOpen(false);
    setAccountReminder("You're continuing with progress saved only on this device. To protect and sync it, be sure to sign in later from the avatar in the top bar.");
  };

  const navigateFromTab = (event: MouseEvent<HTMLAnchorElement>, next: AppRoute) => {
    if (!onNavigate || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onNavigate(next);
  };

  return (
    <div className="adventure-shell">
      <a
        className="skip-link"
        href="#main-content"
        onClick={event => {
          event.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>

      <header className="adventure-topbar">
        <div className="topbar-leading">
          <a
            className="adventure-brand"
            href={toHash({ page: 'explore' })}
            aria-label="Physics Teacher Interactive home"
            onClick={event => navigateFromTab(event, { page: 'explore' })}
          >
            <Atom aria-hidden="true" />
            <span>
              Physics Teacher Interactive
              <small>Learn by doing</small>
            </span>
          </a>
        </div>

        <nav className="macos-segmented-nav" aria-label="Main navigation">
          <a
            href={toHash({ page: 'explore' })}
            onClick={event => navigateFromTab(event, { page: 'explore' })}
            className={`macos-segment-item ${current === 'explore' ? 'is-active' : ''}`}
            aria-current={current === 'explore' ? 'page' : undefined}
          >
            <Compass size={16} aria-hidden="true" />
            <span>Explore</span>
          </a>
          <a
            href={learnHash}
            onClick={event => navigateFromTab(event, parseHash(learnHash))}
            className={`macos-segment-item ${current === 'learn' ? 'is-active' : ''}`}
            aria-current={current === 'learn' ? 'page' : undefined}
          >
            <Map size={16} aria-hidden="true" />
            <span>Learn</span>
          </a>
          <a
            href={toHash({ page: 'progress' })}
            onClick={event => navigateFromTab(event, { page: 'progress' })}
            className={`macos-segment-item ${current === 'progress' ? 'is-active' : ''}`}
            aria-current={current === 'progress' ? 'page' : undefined}
          >
            <ChartNoAxesColumn size={16} aria-hidden="true" />
            <span>Progress</span>
          </a>
        </nav>

        <div className="topbar-trailing">
          <a
            href={toHash({ page: 'progress' })}
            className="telemetry-pill"
            aria-label={`${totalXp} XP, ${streakCount} day streak`}
            onClick={event => navigateFromTab(event, { page: 'progress' })}
          >
            <span className="telemetry-stat">
              <Trophy size={14} aria-hidden="true" />
              <span>{totalXp} XP</span>
            </span>
            <span className="telemetry-separator" aria-hidden="true" />
            <span className="telemetry-stat">
              <Flame size={14} aria-hidden="true" />
              <span>{streakCount} day streak</span>
            </span>
          </a>

          <button
            type="button"
            className={`appearance-toggle-button ${isAppearanceOpen ? 'is-active' : ''}`}
            aria-label="Appearance settings"
            aria-expanded={isAppearanceOpen}
            aria-haspopup="dialog"
            onClick={() => { setIsAppearanceOpen(prev => !prev); setIsAccountOpen(false); }}
          >
            <Palette size={18} aria-hidden="true" />
            <span className="sr-only">Appearance</span>
          </button>

          <AppearancePopover
            isOpen={isAppearanceOpen}
            onClose={() => setIsAppearanceOpen(false)}
            settings={activeSettings}
            onUpdateSettings={handleUpdateSettings}
          />

          {account && (
            <>
              <button
                type="button"
                className={`account-toggle-button ${isAccountOpen ? 'is-active' : ''} ${account.user ? 'is-signed-in' : ''}`}
                aria-label={account.user ? 'Account and cloud sync' : 'Sign in or register'}
                aria-expanded={isAccountOpen}
                aria-haspopup="dialog"
                onClick={() => {
                  setIsAccountOpen(previous => !previous);
                  setIsAppearanceOpen(false);
                  setAccountReminder('');
                }}
              >
                {account.syncState === 'syncing' ? <Cloud className="syncing-cloud" size={18} aria-hidden="true" /> : <UserRound size={18} aria-hidden="true" />}
                <span className="sr-only">Account</span>
              </button>
              <AccountPopover account={account} isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
            </>
          )}
        </div>
      </header>

      {recoveryMessage && <div className="route-recovery" role="status">{recoveryMessage}</div>}
      {accountReminder && <div className="account-local-notice" role="status">{accountReminder}</div>}
      <main ref={mainRef} id="main-content" className="adventure-main" tabIndex={-1}>
        {children}
      </main>

      <MobileTabBar currentRoute={route} learnHash={learnHash} liquidGlass={activeSettings.liquidGlass ?? true} theme={activeSettings.theme} onNavigate={onNavigate} />
      {account && isAccountGateOpen && (
        <div className="account-gate-backdrop">
          <AccountPopover account={account} isOpen variant="gate" onClose={continueLocally} />
        </div>
      )}
    </div>
  );
}
