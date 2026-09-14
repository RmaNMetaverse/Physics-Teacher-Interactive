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
          <p className="account-privacy">Your existing device progress is merged into your account after sign-in.</p>
          {message && <p className="account-message" role="status">{message}</p>}
        </>
      )}
    </section>
  );
}
