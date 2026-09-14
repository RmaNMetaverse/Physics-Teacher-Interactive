// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { ExplorePage } from '../src/pages/ExplorePage';
import { CoursePathPage } from '../src/pages/CoursePathPage';
import type { CourseDefinition } from '../src/learning/types';
import type { LearnerProgressV2 } from '../src/progress/types';

const mockCourses: readonly CourseDefinition[] = [
  {
    id: 'course-1',
    title: 'Foundations of Motion',
    description: "Learn the fundamentals of kinematics and Newton's laws.",
    group: 'foundations',
    scope: 'Core mechanics',
    color: '#34d399',
    recommendations: [],
    access: 'open',
    estimatedMinutes: 60,
    missions: [
      {
        id: 'm1',
        kind: 'mission',
        title: 'Constant Velocity',
        summary: 'Explore motion at constant speed.',
        objectives: ['Define speed'],
        minutes: 10,
        xp: 100,
        requiredMath: [],
        scienceStatus: 'established',
        equation: 'v = d / t',
        symbols: 'v: speed, d: distance, t: time',
        workedExample: { question: 'What is speed?', steps: ['Divide distance by time'], answer: 'v' },
        reviewedAt: '2026-09-14',
        steps: [{ id: 's1', kind: 'observe', title: 'Observe', body: ['Look at cart'] }],
        sources: [{ label: 'OpenStax', url: 'https://openstax.org' }],
        limitations: ['1D only'],
      },
      {
        id: 'm2',
        kind: 'mission',
        title: 'Acceleration',
        summary: 'Explore changing velocity.',
        objectives: ['Define acceleration'],
        minutes: 15,
        xp: 120,
        requiredMath: [],
        scienceStatus: 'established',
        equation: 'a = \\Delta v / \\Delta t',
        symbols: 'a: acceleration',
        workedExample: { question: 'What is acceleration?', steps: ['Delta v over delta t'], answer: 'a' },
        reviewedAt: '2026-09-14',
        steps: [{ id: 's2', kind: 'observe', title: 'Observe', body: ['Cart speeds up'] }],
        sources: [{ label: 'OpenStax', url: 'https://openstax.org' }],
        limitations: ['1D only'],
      },
      {
        id: 'm3',
        kind: 'checkpoint',
        title: 'Motion Checkpoint',
        summary: 'Demonstrate mastery of 1D kinematics.',
        objectives: ['Pass checkpoint'],
        minutes: 20,
        xp: 200,
        requiredMath: [],
        scienceStatus: 'established',
        checkpoint: { badgeId: 'motion-mastery', requiredMissionIds: ['m1', 'm2'] },
        steps: [{ id: 's3', kind: 'observe', title: 'Review', body: ['Review'] }],
        sources: [{ label: 'OpenStax', url: 'https://openstax.org' }],
        limitations: ['Kinematics only'],
      },
    ],
    sources: [{ label: 'OpenStax', url: 'https://openstax.org' }],
    limitations: ['Classical approximations'],
    reviewedAt: '2026-09-14',
  },
  {
    id: 'course-2',
    title: 'Quantum Mechanics',
    description: 'Wave-particle duality and quanta.',
    group: 'modern',
    scope: 'Modern physics',
    color: '#a78bfa',
    recommendations: [],
    access: 'open',
    estimatedMinutes: 90,
    missions: [
      {
        id: 'qm1',
        kind: 'mission',
        title: 'Photons',
        summary: 'Quantization of light.',
        objectives: ['Planck relation'],
        minutes: 15,
        xp: 150,
        requiredMath: [],
        scienceStatus: 'established',
        equation: 'E = hf',
        symbols: 'E: energy, h: Planck constant, f: frequency',
        workedExample: { question: 'What is photon energy?', steps: ['Multiply h and f'], answer: 'E' },
        reviewedAt: '2026-09-14',
        steps: [{ id: 'qs1', kind: 'observe', title: 'Observe', body: ['Light wave'] }],
        sources: [{ label: 'OpenStax', url: 'https://openstax.org' }],
        limitations: ['Non-relativistic'],
      },
    ],
    sources: [{ label: 'OpenStax', url: 'https://openstax.org' }],
    limitations: ['Non-relativistic'],
    reviewedAt: '2026-09-14',
  },
];

const mockProgress: LearnerProgressV2 = {
  version: 2,
  savedAt: '2026-09-14T00:00:00.000Z',
  selectedCourseId: 'course-1',
  nextMissionByCourse: { 'course-1': 'm2' },
  completedMissions: ['course-1/m1'],
  missionStars: { 'course-1/m1': 3 },
  stepAttempts: {},
  answers: {},
  completedMathSteps: [],
  xpLedger: {},
  totalXp: 450,
  streak: { current: 5, longest: 10, lastActiveDate: '2026-09-14' },
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
});

describe('ExplorePage (Apple Design)', () => {
  it('renders Spotlight search bar with search icon, placeholder, and shortcut hint', () => {
    render(<ExplorePage courses={mockCourses} progress={mockProgress} />);

    const searchInput = screen.getByRole('searchbox', { name: /search courses/i });
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveAttribute('placeholder', expect.stringMatching(/search courses/i));

    const shortcutHint = document.querySelector('.search-shortcut-hint');
    expect(shortcutHint).toBeInTheDocument();
    expect(shortcutHint).toHaveTextContent(/⌘K/);
  });

  it('shows clear button when query is entered and clears input on click', () => {
    render(<ExplorePage courses={mockCourses} progress={mockProgress} />);

    const searchInput = screen.getByRole('searchbox', { name: /search courses/i });
    expect(document.querySelector('.search-clear-btn')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Quantum' } });
    expect(searchInput).toHaveValue('Quantum');

    const clearButton = document.querySelector('.search-clear-btn');
    expect(clearButton).toBeInTheDocument();

    fireEvent.click(clearButton!);
    expect(searchInput).toHaveValue('');
    expect(document.querySelector('.search-clear-btn')).not.toBeInTheDocument();
  });

  it('focuses search input when Cmd+K or / is pressed', () => {
    render(<ExplorePage courses={mockCourses} progress={mockProgress} />);

    const searchInput = screen.getByRole('searchbox', { name: /search courses/i });
    expect(document.activeElement).not.toBe(searchInput);

    fireEvent.keyDown(window, { key: 'k', metaKey: true });
    expect(document.activeElement).toBe(searchInput);

    searchInput.blur();
    expect(document.activeElement).not.toBe(searchInput);
    fireEvent.keyDown(window, { key: '/' });
    expect(document.activeElement).toBe(searchInput);
  });

  it('renders segmented filter pills with aria-pressed', () => {
    render(<ExplorePage courses={mockCourses} progress={mockProgress} />);

    const allBtn = screen.getByRole('button', { name: 'All courses' });
    const foundationsBtn = screen.getByRole('button', { name: 'Foundations' });
    const modernBtn = screen.getByRole('button', { name: 'Modern' });

    expect(allBtn).toHaveAttribute('aria-pressed', 'true');
    expect(foundationsBtn).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(modernBtn);
    expect(allBtn).toHaveAttribute('aria-pressed', 'false');
    expect(modernBtn).toHaveAttribute('aria-pressed', 'true');

    expect(screen.getByRole('heading', { name: 'Quantum Mechanics', level: 3 })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Foundations of Motion', level: 3 })).not.toBeInTheDocument();
  });

  it('renders Continue Hero with course details, progress stats, and primary action', () => {
    render(<ExplorePage courses={mockCourses} progress={mockProgress} />);

    const continueSection = screen.getByRole('region', { name: /continue/i });
    expect(continueSection).toBeInTheDocument();
    expect(continueSection).toHaveTextContent('Foundations of Motion');
    expect(continueSection).toHaveTextContent('Acceleration');

    const continueLink = screen.getByRole('link', { name: /continue learning/i });
    expect(continueLink).toHaveAttribute('href', '#/mission/course-1/m2');
  });

  it('renders squircle course cards with level badge, duration, mission count, and progress', () => {
    render(<ExplorePage courses={mockCourses} progress={mockProgress} />);

    const motionCard = screen.getByRole('heading', { name: 'Foundations of Motion', level: 3 }).closest('.course-card');
    expect(motionCard).toBeInTheDocument();

    expect(motionCard).toHaveTextContent('Beginner');
    expect(motionCard).toHaveTextContent('60 min');
    expect(motionCard).toHaveTextContent('3 missions');
    expect(motionCard).toHaveTextContent('1 of 3 complete');
    expect(motionCard).toHaveTextContent('33%');

    const progressEl = motionCard?.querySelector('progress');
    expect(progressEl).toBeInTheDocument();
    expect(progressEl).toHaveAttribute('value', '1');
    expect(progressEl).toHaveAttribute('max', '3');
  });
});

describe('CoursePathPage (Apple Design)', () => {
  it('renders macOS-style back button, course title, stats, and circular mastery ring', () => {
    render(<CoursePathPage course={mockCourses[0]} progress={mockProgress} />);

    const backButton = screen.getByRole('link', { name: /back to explore/i });
    expect(backButton).toBeInTheDocument();
    expect(backButton).toHaveAttribute('href', '#/explore');

    expect(screen.getByRole('heading', { name: 'Foundations of Motion' })).toBeInTheDocument();

    expect(screen.getAllByText('33%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/35 min/)).toBeInTheDocument();

    const masteryRing = document.querySelector('.mastery-ring');
    expect(masteryRing).toBeInTheDocument();
  });

  it('renders milestone pathway with solid connector rail and node states', () => {
    render(<CoursePathPage course={mockCourses[0]} progress={mockProgress} />);

    const rail = document.querySelector('.path-rail');
    expect(rail).toBeInTheDocument();

    const nodes = screen.getAllByRole('listitem');
    expect(nodes).toHaveLength(3);

    expect(nodes[0]).toHaveClass('mission-node-complete');
    expect(nodes[0].querySelector('a')).toHaveAttribute('data-state', 'complete');
    expect(nodes[0]).toHaveTextContent('Constant Velocity');
    expect(nodes[0]).toHaveTextContent('3');

    expect(nodes[1]).toHaveClass('mission-node-next');
    expect(nodes[1].querySelector('a')).toHaveAttribute('data-state', 'next');
    expect(nodes[1]).toHaveTextContent('Up next');
    expect(nodes[1]).toHaveTextContent('Acceleration');

    expect(nodes[2]).toHaveClass('mission-node-checkpoint');
    expect(nodes[2].querySelector('a')).toHaveAttribute('data-state', 'checkpoint');
    expect(nodes[2]).toHaveTextContent('Checkpoint');
    expect(nodes[2]).toHaveTextContent('Motion Checkpoint');
    const marker = nodes[2].querySelector('.mission-node-marker');
    expect(marker?.querySelector('svg')).toBeInTheDocument();
  });
});
