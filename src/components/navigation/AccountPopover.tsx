import { useState, type FormEvent } from 'react';
import { Check, Cloud, CloudOff, LoaderCircle, LogOut, X } from 'lucide-react';
import type { CloudAccount } from '../../cloud/useCloudAccount';

interface AccountPopoverProps {
  account: CloudAccount;
  isOpen: boolean;
  onClose(): void;
}

export function AccountPopover({ account, isOpen, onClose }: AccountPopoverProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'register'>('sign-in');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (mode === 'register') setMessage(await account.signUp(email.trim(), password));
      else await account.signIn(email.trim(), password);
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : 'Authentication failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="account-popover" role="dialog" aria-label="Account and cloud sync">
      <header className="account-popover-header">
        <div>
          <span className="account-eyebrow">Cloud account</span>
          <h2>{account.user ? 'Your progress is protected' : 'Continue on any device'}</h2>
        </div>
        <button type="button" className="appearance-popover-close" aria-label="Close account" onClick={onClose}>
          <X size={16} aria-hidden="true" />
        </button>
      </header>

      {!account.configured ? (
        <div className="account-notice">
          <CloudOff aria-hidden="true" />
          <div><strong>Cloud sync needs configuration</strong><span>Add the Supabase environment variables to enable accounts.</span></div>
        </div>
      ) : account.user ? (
        <div className="account-signed-in">
          <div className="account-identity">
            <span className="account-avatar">{account.user.email?.slice(0, 1).toUpperCase() ?? 'P'}</span>
            <div><strong>{account.user.email}</strong><span>Signed in securely</span></div>
          </div>
          <div className={`sync-status sync-status-${account.syncState}`} role="status">
            {account.syncState === 'syncing' ? <LoaderCircle className="spin" aria-hidden="true" /> : account.syncState === 'error' ? <CloudOff aria-hidden="true" /> : <Check aria-hidden="true" />}
            <span>{account.syncState === 'syncing' ? 'Syncing changes…' : account.syncState === 'error' ? account.error : 'Progress synced'}</span>
          </div>
          <div className="account-actions">
            <button type="button" className="account-secondary-button" onClick={() => void account.syncNow()} disabled={account.syncState === 'syncing'}>
              <Cloud size={16} aria-hidden="true" /> Sync now
            </button>
            <button type="button" className="account-secondary-button" onClick={() => void account.signOut()}>
              <LogOut size={16} aria-hidden="true" /> Sign out
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="account-mode-tabs" role="tablist" aria-label="Account action">
            <button type="button" role="tab" aria-selected={mode === 'sign-in'} onClick={() => { setMode('sign-in'); setMessage(''); }}>Sign in</button>
            <button type="button" role="tab" aria-selected={mode === 'register'} onClick={() => { setMode('register'); setMessage(''); }}>Register</button>
          </div>
          <form className="account-form" onSubmit={submit}>
            <label>Email<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" required /></label>
            <label>Password<input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} minLength={8} required /></label>
            <button className="account-primary-button" type="submit" disabled={busy}>
              {busy && <LoaderCircle className="spin" aria-hidden="true" />}
              {mode === 'register' ? 'Create account' : 'Sign in'}
            </button>
          </form>
          <div className="account-sso-divider" aria-hidden="true"><span>or continue with</span></div>
          <div className="account-sso-buttons">
            <button type="button" className="account-sso-button" onClick={() => void account.signInWithProvider('google')} disabled={busy}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 0 12c0 1.94.46 3.77 1.28 5.4l3.56-2.77.01-.54z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Google
            </button>
            <button type="button" className="account-sso-button" onClick={() => void account.signInWithProvider('github')} disabled={busy}>
              <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .3a12 12 0 0 0-3.8 23.38c.6.12.83-.26.83-.57L9 21.07c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.8 1.3 3.49 1 .11-.78.42-1.3.76-1.6-2.67-.31-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.66.25 2.88.12 3.18a4.65 4.65 0 0 1 1.24 3.22c0 4.61-2.8 5.62-5.48 5.92.43.37.81 1.1.81 2.22l-.01 3.29c0 .31.22.69.83.57A12 12 0 0 0 12 .3"/></svg>
              GitHub
            </button>
          </div>
          <p className="account-privacy">Your existing device progress is merged into your account after sign-in.</p>
          {message && <p className="account-message" role="status">{message}</p>}
        </>
      )}
    </section>
  );
}
