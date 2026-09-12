import type { ReactNode, RefObject } from 'react';
import { Atom, ChartNoAxesColumn, Compass, Map, Palette } from 'lucide-react';
import type { AppRoute } from './router';
import { toHash } from './router';

interface AppShellProps {
  route: AppRoute;
  learnHash: string;
  recoveryMessage: string;
  mainRef: RefObject<HTMLElement | null>;
  children: ReactNode;
}

export function AppShell({ route, learnHash, recoveryMessage, mainRef, children }: AppShellProps) {
  const current = route.page === 'course' || route.page === 'mission' ? 'learn' : route.page;
  return <div className="adventure-shell">
    <a className="skip-link" href="#main-content" onClick={event => { event.preventDefault(); mainRef.current?.focus(); }}>Skip to content</a>
    <header className="adventure-topbar">
      <a className="adventure-brand" href={toHash({ page: 'explore' })} aria-label="Physics Teacher Interactive home">
        <Atom aria-hidden="true" />
        <span>Physics Teacher Interactive<small>Learn by doing</small></span>
      </a>
      <a className="appearance-shortcut" href={toHash({ page: 'progress' })} aria-label="Appearance and themes" title="Appearance and themes" onClick={() => {
        try { sessionStorage.setItem('physics-focus-appearance', 'true'); } catch { /* Continue if storage is blocked. */ }
      }}>
        <Palette aria-hidden="true" /><span>Appearance</span>
      </a>
      <nav className="primary-nav" aria-label="Main navigation">
        <a href={toHash({ page: 'explore' })} aria-current={current === 'explore' ? 'page' : undefined}><Compass aria-hidden="true" />Explore</a>
        <a href={learnHash} aria-current={current === 'learn' ? 'page' : undefined}><Map aria-hidden="true" />Learn</a>
        <a href={toHash({ page: 'progress' })} aria-current={current === 'progress' ? 'page' : undefined}><ChartNoAxesColumn aria-hidden="true" />Progress</a>
      </nav>
    </header>
    {recoveryMessage && <div className="route-recovery" role="status">{recoveryMessage}</div>}
    <main ref={mainRef} id="main-content" className="adventure-main" tabIndex={-1}>{children}</main>
  </div>;
}
