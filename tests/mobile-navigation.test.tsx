// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { MobileTabBar } from '../src/components/navigation/MobileTabBar';
import type { AppRoute } from '../src/app/router';

const liquidGlassInit = vi.hoisted(() => vi.fn());

vi.mock('@ybouane/liquidglass', () => ({
  LiquidGlass: { init: liquidGlassInit },
}));

afterEach(() => {
  cleanup();
  liquidGlassInit.mockReset();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('MobileTabBar', () => {
  const defaultLearnHash = '#/course/foundations-of-motion';

  it('marks the navigation as liquid-glass enabled by default', () => {
    const route: AppRoute = { page: 'explore' };
    render(<MobileTabBar currentRoute={route} learnHash={defaultLearnHash} />);

    const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('mobile-tab-bar');
    expect(nav).toHaveAttribute('data-liquid-glass', 'true');
  });

  it('initializes the requested refraction renderer for an enabled mobile navigation', async () => {
    const destroy = vi.fn();
    liquidGlassInit.mockResolvedValue({ destroy, markChanged: vi.fn() });
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 768px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));

    const { container } = render(
      <div className="adventure-shell">
        <MobileTabBar currentRoute={{ page: 'explore' }} learnHash={defaultLearnHash} />
      </div>
    );
    const root = container.firstElementChild as HTMLElement;
    const nav = screen.getByRole('navigation', { name: 'Mobile navigation' });

    await waitFor(() => expect(liquidGlassInit).toHaveBeenCalledWith(expect.objectContaining({
      root,
      glassElements: [nav],
      defaults: expect.objectContaining({ blurAmount: expect.any(Number), refraction: expect.any(Number) }),
    })));
    expect(nav).toHaveAttribute('data-liquid-glass-renderer', 'ready');
  });

  it('keeps refreshing through rapid scrolling and performs a settled final redraw', async () => {
    const markChanged = vi.fn();
    liquidGlassInit.mockResolvedValue({ destroy: vi.fn(), markChanged });
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 768px)',
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })));
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => (
      window.setTimeout(() => callback(performance.now()), 16)
    ));
    vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));

    render(
      <div className="adventure-shell">
        <MobileTabBar currentRoute={{ page: 'explore' }} learnHash={defaultLearnHash} />
      </div>
    );
    await waitFor(() => expect(liquidGlassInit).toHaveBeenCalledOnce());

    fireEvent.scroll(window);
    fireEvent.scroll(window);
    fireEvent.scroll(window);
    await act(async () => {
      await new Promise(resolve => window.setTimeout(resolve, 180));
    });

    expect(markChanged.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
  it('renders the 3 primary tabs with correct links and accessible labels', () => {
    const route: AppRoute = { page: 'explore' };
    const customLearnHash = '#/course/gravity-orbits';
    render(<MobileTabBar currentRoute={route} learnHash={customLearnHash} />);

    const exploreLink = screen.getByRole('link', { name: /explore/i });
    expect(exploreLink).toBeInTheDocument();
    expect(exploreLink).toHaveAttribute('href', '#/explore');

    const learnLink = screen.getByRole('link', { name: /learn/i });
    expect(learnLink).toBeInTheDocument();
    expect(learnLink).toHaveAttribute('href', customLearnHash);

    const progressLink = screen.getByRole('link', { name: /progress/i });
    expect(progressLink).toBeInTheDocument();
    expect(progressLink).toHaveAttribute('href', '#/progress');
  });

  it('marks Explore tab as active when route is explore', () => {
    const route: AppRoute = { page: 'explore' };
    render(<MobileTabBar currentRoute={route} learnHash={defaultLearnHash} />);

    const exploreLink = screen.getByRole('link', { name: /explore/i });
    const learnLink = screen.getByRole('link', { name: /learn/i });
    const progressLink = screen.getByRole('link', { name: /progress/i });

    expect(exploreLink).toHaveAttribute('aria-current', 'page');
    expect(exploreLink).toHaveClass('active');

    expect(learnLink).not.toHaveAttribute('aria-current');
    expect(learnLink).not.toHaveClass('active');

    expect(progressLink).not.toHaveAttribute('aria-current');
    expect(progressLink).not.toHaveClass('active');
  });

  it('marks Learn tab as active when route is course', () => {
    const route: AppRoute = { page: 'course', courseId: 'foundations-of-motion' };
    render(<MobileTabBar currentRoute={route} learnHash={defaultLearnHash} />);

    const exploreLink = screen.getByRole('link', { name: /explore/i });
    const learnLink = screen.getByRole('link', { name: /learn/i });
    const progressLink = screen.getByRole('link', { name: /progress/i });

    expect(learnLink).toHaveAttribute('aria-current', 'page');
    expect(learnLink).toHaveClass('active');

    expect(exploreLink).not.toHaveAttribute('aria-current');
    expect(exploreLink).not.toHaveClass('active');

    expect(progressLink).not.toHaveAttribute('aria-current');
    expect(progressLink).not.toHaveClass('active');
  });

  it('marks Learn tab as active when route is mission', () => {
    const route: AppRoute = {
      page: 'mission',
      courseId: 'foundations-of-motion',
      missionId: 'vector-addition',
    };
    render(<MobileTabBar currentRoute={route} learnHash={defaultLearnHash} />);

    const exploreLink = screen.getByRole('link', { name: /explore/i });
    const learnLink = screen.getByRole('link', { name: /learn/i });
    const progressLink = screen.getByRole('link', { name: /progress/i });

    expect(learnLink).toHaveAttribute('aria-current', 'page');
    expect(learnLink).toHaveClass('active');

    expect(exploreLink).not.toHaveAttribute('aria-current');
    expect(progressLink).not.toHaveAttribute('aria-current');
  });

  it('marks Progress tab as active when route is progress', () => {
    const route: AppRoute = { page: 'progress' };
    render(<MobileTabBar currentRoute={route} learnHash={defaultLearnHash} />);

    const exploreLink = screen.getByRole('link', { name: /explore/i });
    const learnLink = screen.getByRole('link', { name: /learn/i });
    const progressLink = screen.getByRole('link', { name: /progress/i });

    expect(progressLink).toHaveAttribute('aria-current', 'page');
    expect(progressLink).toHaveClass('active');

    expect(exploreLink).not.toHaveAttribute('aria-current');
    expect(learnLink).not.toHaveAttribute('aria-current');
  });

  it('ensures all tab items have minimum touch target dimensions of at least 44px', () => {
    const route: AppRoute = { page: 'explore' };
    render(<MobileTabBar currentRoute={route} learnHash={defaultLearnHash} />);

    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(3);

    for (const link of links) {
      const minHeight = parseInt(link.style.minHeight || '0', 10);
      const minWidth = parseInt(link.style.minWidth || '0', 10);
      expect(minHeight).toBeGreaterThanOrEqual(44);
      expect(minWidth).toBeGreaterThanOrEqual(44);
    }
  });

  it('renders filled icon visual state when tab is active and outlined when inactive', () => {
    const route: AppRoute = { page: 'explore' };
    const { rerender } = render(<MobileTabBar currentRoute={route} learnHash={defaultLearnHash} />);

    const exploreLink = screen.getByRole('link', { name: /explore/i });
    const learnLink = screen.getByRole('link', { name: /learn/i });
    const progressLink = screen.getByRole('link', { name: /progress/i });

    const exploreSvg = exploreLink.querySelector('svg');
    const learnSvg = learnLink.querySelector('svg');
    const progressSvg = progressLink.querySelector('svg');

    expect(exploreSvg).toHaveAttribute('fill', 'currentColor');
    expect(exploreSvg).toHaveAttribute('aria-hidden', 'true');

    expect(learnSvg).toHaveAttribute('fill', 'none');
    expect(learnSvg).toHaveAttribute('aria-hidden', 'true');

    expect(progressSvg).toHaveAttribute('fill', 'none');
    expect(progressSvg).toHaveAttribute('aria-hidden', 'true');

    // Switch to Learn route
    rerender(<MobileTabBar currentRoute={{ page: 'course', courseId: 'work-energy' }} learnHash={defaultLearnHash} />);

    const updatedExploreSvg = screen.getByRole('link', { name: /explore/i }).querySelector('svg');
    const updatedLearnSvg = screen.getByRole('link', { name: /learn/i }).querySelector('svg');

    expect(updatedExploreSvg).toHaveAttribute('fill', 'none');
    expect(updatedLearnSvg).toHaveAttribute('fill', 'currentColor');
  });

  it('renders active indicator pill and tactile press styling', () => {
    const route: AppRoute = { page: 'explore' };
    render(<MobileTabBar currentRoute={route} learnHash={defaultLearnHash} />);

    const exploreLink = screen.getByRole('link', { name: /explore/i });
    expect(exploreLink).toHaveClass('active:scale-95');

    const pill = exploreLink.querySelector('.mobile-tab-active-pill');
    expect(pill).toBeInTheDocument();

    const learnLink = screen.getByRole('link', { name: /learn/i });
    const learnPill = learnLink.querySelector('.mobile-tab-active-pill');
    expect(learnPill).not.toBeInTheDocument();
  });
});
