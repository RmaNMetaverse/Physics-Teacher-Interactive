import type { AppRoute } from '../../app/router';
import { ChartNoAxesColumn, Compass, Map } from 'lucide-react';

export interface MobileTabBarProps {
  currentRoute: AppRoute;
  learnHash: string;
}

interface TabDefinition {
  id: 'explore' | 'learn' | 'progress';
  label: string;
  getHref: (learnHash: string) => string;
  icon: typeof Compass;
  isActive: (route: AppRoute) => boolean;
}

const TABS: readonly TabDefinition[] = [
  {
    id: 'explore',
    label: 'Explore',
    getHref: () => '#/explore',
    icon: Compass,
    isActive: (route) => route.page === 'explore',
  },
  {
    id: 'learn',
    label: 'Learn',
    getHref: (learnHash) => learnHash,
    icon: Map,
    isActive: (route) => route.page === 'course' || route.page === 'mission',
  },
  {
    id: 'progress',
    label: 'Progress',
    getHref: () => '#/progress',
    icon: ChartNoAxesColumn,
    isActive: (route) => route.page === 'progress',
  },
];

export function MobileTabBar({ currentRoute, learnHash }: MobileTabBarProps) {
  return (
    <nav
      className="mobile-tab-bar liquid-glass-surface"
      aria-label="Mobile navigation"
      style={{
        position: 'fixed',
        bottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      <div className="mobile-tab-bar-items">
        {TABS.map((tab) => {
          const active = tab.isActive(currentRoute);
          const Icon = tab.icon;
          const href = tab.getHref(learnHash);

          return (
            <a
              key={tab.id}
              href={href}
              aria-label={tab.label}
              aria-current={active ? 'page' : undefined}
              className={`mobile-tab-item active:scale-95 ${active ? 'active is-active' : ''}`}
              style={{
                minHeight: '48px',
                minWidth: '48px',
              }}
            >
              {active && <span className="mobile-tab-active-pill" aria-hidden="true" />}
              <Icon
                size={22}
                aria-hidden="true"
                fill={active ? 'currentColor' : 'none'}
                strokeWidth={active ? 2.4 : 2}
                className={`mobile-tab-icon ${active ? 'mobile-tab-icon-filled' : ''}`}
              />
              <span className="mobile-tab-label">{tab.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileTabBar;
