import { useEffect, useRef, useState } from 'react';
import { LiquidGlass } from '@ybouane/liquidglass';
import { parseHash, type AppRoute } from '../../app/router';
import type { LearnerProgressV2 } from '../../progress/types';
import { ChartNoAxesColumn, Compass, Map } from 'lucide-react';

export interface MobileTabBarProps {
  currentRoute: AppRoute;
  learnHash: string;
  liquidGlass?: boolean;
  theme?: LearnerProgressV2['settings']['theme'];
  onNavigate?: (route: AppRoute) => void;
}

interface TabDefinition {
  id: 'explore' | 'learn' | 'progress';
  label: string;
  getHref: (learnHash: string) => string;
  icon: typeof Compass;
  isActive: (route: AppRoute) => boolean;
}

const MOBILE_GLASS_CONFIG = {
  // Preserve narrow saturated UI accents behind the dock. Heavy blur and
  // white specular light previously spread a 4 px course stripe into a pale
  // band; the crisper sample keeps its authored --course-color intact.
  blurAmount: 0.14,
  refraction: 0.74,
  chromAberration: 0.09,
  edgeHighlight: 0.14,
  specular: 0.1,
  fresnel: 0.82,
  distortion: 0.025,
  cornerRadius: 46,
  zRadius: 24,
  opacity: 1,
  saturation: 0.42,
  tintStrength: 0.05,
  brightness: -0.08,
  shadowOpacity: 0.4,
  shadowSpread: 12,
  shadowOffsetY: 6,
  floating: false,
  button: false,
  bevelMode: 0,
} as const;

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

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => (
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia(query).matches
      : false
  ));

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia(query);
    const onChange = () => setMatches(mediaQuery.matches);
    onChange();
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

export function MobileTabBar({
  currentRoute,
  learnHash,
  liquidGlass = true,
  theme,
  onNavigate,
}: MobileTabBarProps) {
  const navRef = useRef<HTMLElement>(null);
  const isMobileViewport = useMediaQuery('(max-width: 768px)');
  const reducesTransparency = useMediaQuery('(prefers-reduced-transparency: reduce)');
  const shouldRenderGlass = liquidGlass && isMobileViewport && !reducesTransparency && theme !== 'high-contrast';

  useEffect(() => {
    const nav = navRef.current;
    const root = nav?.parentElement;
    if (!nav || !root || !shouldRenderGlass) return;

    let cancelled = false;
    let instance: LiquidGlass | null = null;
    let animationFrame = 0;
    let settleTimer = 0;
    const previousUserSelect = root.style.userSelect;
    const previousWebkitUserSelect = root.style.getPropertyValue('-webkit-user-select');

    const renderLatestBackground = () => {
      animationFrame = 0;
      instance?.markChanged();
    };

    const markBackgroundChanged = () => {
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(renderLatestBackground);
      }
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (animationFrame) window.cancelAnimationFrame(animationFrame);
        animationFrame = window.requestAnimationFrame(renderLatestBackground);
      }, 96);
    };

    const markSettledBackground = () => {
      window.clearTimeout(settleTimer);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(renderLatestBackground);
    };

    const initialize = async () => {
      try {
        const nextInstance = await LiquidGlass.init({
          root,
          glassElements: [nav],
          defaults: MOBILE_GLASS_CONFIG,
        });

        if (cancelled) {
          nextInstance.destroy();
          return;
        }

        instance = nextInstance;
        root.style.userSelect = previousUserSelect;
        if (previousWebkitUserSelect) {
          root.style.setProperty('-webkit-user-select', previousWebkitUserSelect);
        } else {
          root.style.removeProperty('-webkit-user-select');
        }
        nav.dataset.liquidGlassRenderer = 'ready';
        window.addEventListener('scroll', markBackgroundChanged, { passive: true });
        window.addEventListener('scrollend', markSettledBackground, { passive: true });
        window.visualViewport?.addEventListener('scroll', markBackgroundChanged, { passive: true });
      } catch {
        // Browsers without the required canvas APIs retain the CSS material fallback.
        nav.dataset.liquidGlassRenderer = 'fallback';
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(settleTimer);
      window.removeEventListener('scroll', markBackgroundChanged);
      window.removeEventListener('scrollend', markSettledBackground);
      window.visualViewport?.removeEventListener('scroll', markBackgroundChanged);
      instance?.destroy();
      nav.removeAttribute('data-liquid-glass-renderer');
      root.style.userSelect = previousUserSelect;
      if (previousWebkitUserSelect) {
        root.style.setProperty('-webkit-user-select', previousWebkitUserSelect);
      } else {
        root.style.removeProperty('-webkit-user-select');
      }
    };
  }, [shouldRenderGlass, theme]);

  return (
    <nav
      ref={navRef}
      className="mobile-tab-bar"
      aria-label="Mobile navigation"
      data-liquid-glass={liquidGlass ? 'true' : 'false'}
      data-config={JSON.stringify(MOBILE_GLASS_CONFIG)}
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
          const nextRoute = tab.id === 'learn' ? parseHash(href) : { page: tab.id } as AppRoute;

          return (
            <a
              key={tab.id}
              href={href}
              onClick={event => {
                if (!onNavigate || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                event.preventDefault();
                onNavigate(nextRoute);
              }}
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
