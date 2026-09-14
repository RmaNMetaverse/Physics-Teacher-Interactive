// @vitest-environment jsdom
import { createRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { AppShell } from '../src/app/AppShell';
import type { AppRoute } from '../src/app/router';
import type { LearnerProgressV2 } from '../src/progress/types';

const mockProgress: LearnerProgressV2 = {
  version: 2,
  savedAt: '2026-09-14T00:00:00.000Z',
  selectedCourseId: 'foundations-of-motion',
  nextMissionByCourse: {},
  completedMissions: [],
  missionStars: {},
  stepAttempts: {},
  answers: {},
  completedMathSteps: [],
  xpLedger: {},
  totalXp: 350,
  streak: {
    current: 4,
    longest: 7,
    lastActiveDate: '2026-09-14',
  },
  dailyGoal: 3,
  badges: [],
  settings: {
    theme: 'dark',
    sound: true,
    reducedMotion: false,
    celebrations: true,
    liquidGlass: true,
    primaryColor: '#a78bfa',
    secondaryColor: '#34d399',
  },
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('AppShell', () => {
  const mainRef = createRef<HTMLElement>();
  const defaultLearnHash = '#/course/foundations-of-motion';

  it('renders skip link, brand header, main content, and recovery message when present', () => {
    const route: AppRoute = { page: 'explore' };
    render(
      <AppShell
        route={route}
        learnHash={defaultLearnHash}
        recoveryMessage="Route reset notice"
        mainRef={mainRef}
        progress={mockProgress}
      >
        <div data-testid="child-content">Child Content</div>
      </AppShell>
    );

    const skipLink = screen.getByRole('link', { name: /skip to content/i });
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');

    const brandLink = screen.getByRole('link', { name: /physics teacher interactive home/i });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute('href', '#/explore');

    expect(screen.getByRole('status')).toHaveTextContent('Route reset notice');
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders macOS-style segmented navigation with 3 segments and aria-current="page" on active item', () => {
    const route: AppRoute = { page: 'explore' };
    const { rerender } = render(
      <AppShell
        route={route}
        learnHash={defaultLearnHash}
        recoveryMessage=""
        mainRef={mainRef}
        progress={mockProgress}
      >
        <div>Content</div>
      </AppShell>
    );

    const nav = screen.getByRole('navigation', { name: 'Main navigation' });
    expect(nav).toBeInTheDocument();
    expect(nav).toHaveClass('macos-segmented-nav');

    // Desktop segmented links
    const desktopLinks = nav.querySelectorAll('a');
    expect(desktopLinks).toHaveLength(3);

    const [exploreLink, learnLink, progressLink] = Array.from(desktopLinks);
    expect(exploreLink).toHaveTextContent('Explore');
    expect(exploreLink).toHaveAttribute('aria-current', 'page');
    expect(exploreLink).toHaveAttribute('href', '#/explore');

    expect(learnLink).toHaveTextContent('Learn');
    expect(learnLink).not.toHaveAttribute('aria-current');
    expect(learnLink).toHaveAttribute('href', defaultLearnHash);

    expect(progressLink).toHaveTextContent('Progress');
    expect(progressLink).not.toHaveAttribute('aria-current');
    expect(progressLink).toHaveAttribute('href', '#/progress');

    // Switch to Learn (course route)
    rerender(
      <AppShell
        route={{ page: 'course', courseId: 'foundations-of-motion' }}
        learnHash={defaultLearnHash}
        recoveryMessage=""
        mainRef={mainRef}
        progress={mockProgress}
      >
        <div>Content</div>
      </AppShell>
    );
    expect(learnLink).toHaveAttribute('aria-current', 'page');
    expect(exploreLink).not.toHaveAttribute('aria-current');

    // Switch to Learn (mission route)
    rerender(
      <AppShell
        route={{ page: 'mission', courseId: 'foundations-of-motion', missionId: 'vector-addition' }}
        learnHash={defaultLearnHash}
        recoveryMessage=""
        mainRef={mainRef}
        progress={mockProgress}
      >
        <div>Content</div>
      </AppShell>
    );
    expect(learnLink).toHaveAttribute('aria-current', 'page');

    // Switch to Progress route
    rerender(
      <AppShell
        route={{ page: 'progress' }}
        learnHash={defaultLearnHash}
        recoveryMessage=""
        mainRef={mainRef}
        progress={mockProgress}
      >
        <div>Content</div>
      </AppShell>
    );
    expect(progressLink).toHaveAttribute('aria-current', 'page');
    expect(learnLink).not.toHaveAttribute('aria-current');
  });

  it('renders telemetry stats pill with XP and streak', () => {
    const route: AppRoute = { page: 'explore' };
    const { rerender } = render(
      <AppShell
        route={route}
        learnHash={defaultLearnHash}
        recoveryMessage=""
        mainRef={mainRef}
        progress={mockProgress}
      >
        <div>Content</div>
      </AppShell>
    );

    expect(screen.getByText(/350 XP/i)).toBeInTheDocument();
    expect(screen.getByText(/4 day streak/i)).toBeInTheDocument();

    // Fallback when progress is undefined
    rerender(
      <AppShell
        route={route}
        learnHash={defaultLearnHash}
        recoveryMessage=""
        mainRef={mainRef}
      >
        <div>Content</div>
      </AppShell>
    );

    expect(screen.getByText(/0 XP/i)).toBeInTheDocument();
    expect(screen.getByText(/0 day streak/i)).toBeInTheDocument();
  });

  it('renders palette button that toggles AppearancePopover and forwards onUpdateSettings', () => {
    const onUpdateSettings = vi.fn();
    const route: AppRoute = { page: 'explore' };

    render(
      <AppShell
        route={route}
        learnHash={defaultLearnHash}
        recoveryMessage=""
        mainRef={mainRef}
        progress={mockProgress}
        onUpdateSettings={onUpdateSettings}
      >
        <div>Content</div>
      </AppShell>
    );

    // Popover is initially closed
    expect(screen.queryByRole('dialog', { name: 'Appearance settings' })).not.toBeInTheDocument();

    const paletteBtn = screen.getByRole('button', { name: /appearance/i });
    expect(paletteBtn).toBeInTheDocument();

    // Open popover
    fireEvent.click(paletteBtn);
    expect(screen.getByRole('dialog', { name: 'Appearance settings' })).toBeInTheDocument();

    // Interact with theme in popover
    const lightChip = screen.getByRole('button', { name: /light/i });
    fireEvent.click(lightChip);
    expect(onUpdateSettings).toHaveBeenCalledWith({ theme: 'light' });

    // Close popover
    const closeBtn = screen.getByRole('button', { name: 'Close appearance settings' });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole('dialog', { name: 'Appearance settings' })).not.toBeInTheDocument();
  });

  it('renders MobileTabBar with active route and learnHash', () => {
    const route: AppRoute = { page: 'explore' };
    render(
      <AppShell
        route={route}
        learnHash={defaultLearnHash}
        recoveryMessage=""
        mainRef={mainRef}
        progress={mockProgress}
      >
        <div>Content</div>
      </AppShell>
    );

    const mobileNav = screen.getByRole('navigation', { name: 'Mobile navigation' });
    expect(mobileNav).toBeInTheDocument();
    expect(mobileNav).toHaveClass('mobile-tab-bar');
  });
});
