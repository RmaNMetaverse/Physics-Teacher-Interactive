// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { XpBar } from '../src/components/rewards/XpBar';
import { StreakCard } from '../src/components/rewards/StreakCard';
import { MasteryRing } from '../src/components/rewards/MasteryRing';
import { BadgeShelf } from '../src/components/rewards/BadgeShelf';
import { Celebration } from '../src/components/rewards/Celebration';
import { RecapStep } from '../src/components/mission/RecapStep';
import { createMissionSession } from '../src/learning/mission-engine';
import { ProgressPage } from '../src/pages/ProgressPage';
import { completeMission, createProgressV2, serializeProgressV2 } from '../src/progress/progress';
import { courseCatalog } from '../src/learning/catalog';
import type { LearnerProgressV2 } from '../src/progress/types';

const testNow = new Date('2026-09-11T12:00:00.000Z');

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Rewards: XpBar', () => {
  it('derives level 1 for 0 XP and shows 0 / 500 XP to next level', () => {
    render(<XpBar totalXp={0} />);
    expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 500 XP/i)).toBeInTheDocument();
    expect(screen.getByText(/0 XP total/i)).toBeInTheDocument();
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '500');
  });

  it('derives level 1 with singular/plural XP copy for 1 XP', () => {
    render(<XpBar totalXp={1} />);
    expect(screen.getByText(/Level 1/i)).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 500 XP/i)).toBeInTheDocument();
    expect(screen.getByText(/1 XP/i)).toBeInTheDocument();
  });

  it('derives level 2 at exactly 500 XP threshold and calculates progress to level 3', () => {
    render(<XpBar totalXp={500} />);
    expect(screen.getByText(/Level 2/i)).toBeInTheDocument();
    expect(screen.getByText(/0 \/ 500 XP/i)).toBeInTheDocument();
    expect(screen.getByText(/500 XP total/i)).toBeInTheDocument();
  });

  it('derives level 3 for 1250 XP with 250 / 500 XP', () => {
    render(<XpBar totalXp={1250} />);
    expect(screen.getByText(/Level 3/i)).toBeInTheDocument();
    expect(screen.getByText(/250 \/ 500 XP/i)).toBeInTheDocument();
    expect(screen.getByText(/1,250 XP|1250 XP/i)).toBeInTheDocument();
  });
});

describe('Rewards: StreakCard', () => {
  it('formats streak of 0 days with inactive copy and flame visual', () => {
    render(
      <StreakCard
        streak={{ current: 0, longest: 0, lastActiveDate: '' }}
        today="2026-09-11"
      />
    );
    expect(screen.getByText(/^0 days$/i)).toBeInTheDocument();
    expect(screen.getByText(/Longest: 0 days/i)).toBeInTheDocument();
    expect(screen.getByText(/Not yet active today|Start your streak/i)).toBeInTheDocument();
    const flame = screen.getByTestId('streak-flame');
    expect(flame).toBeInTheDocument();
    expect(flame).toHaveClass('streak-inactive');
  });

  it('formats singular 1 day streak when active today', () => {
    render(
      <StreakCard
        streak={{ current: 1, longest: 1, lastActiveDate: '2026-09-11' }}
        today="2026-09-11"
      />
    );
    expect(screen.getByText(/^1 day$/i)).toBeInTheDocument();
    expect(screen.getByText(/Longest: 1 day/i)).toBeInTheDocument();
    expect(screen.getByText(/Active today/i)).toBeInTheDocument();
    const flame = screen.getByTestId('streak-flame');
    expect(flame).toHaveClass('streak-active');
  });

  it('formats plural streak of many days and handles active yesterday', () => {
    render(
      <StreakCard
        streak={{ current: 5, longest: 14, lastActiveDate: '2026-09-10' }}
        today="2026-09-11"
      />
    );
    expect(screen.getByText(/^5 days$/i)).toBeInTheDocument();
    expect(screen.getByText(/Longest: 14 days/i)).toBeInTheDocument();
    expect(screen.getByText(/Practice today to keep your streak|Not yet active today/i)).toBeInTheDocument();
    const flame = screen.getByTestId('streak-flame');
    expect(flame).toHaveClass('streak-inactive');
  });
});

describe('Rewards: MasteryRing', () => {
  it('renders SVG with accessible text and visible description', () => {
    render(<MasteryRing completed={6} total={12} label="Quantum Physics" />);
    const ring = screen.getByRole('img', { name: /Quantum Physics: 50% complete/i });
    expect(ring).toBeInTheDocument();
    expect(screen.getByText(/6 of 12 missions complete/i)).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('handles singular mission completed text and 0 total edge case', () => {
    const { rerender } = render(<MasteryRing completed={1} total={10} label="Course" />);
    expect(screen.getByText(/1 of 10 missions complete/i)).toBeInTheDocument();

    rerender(<MasteryRing completed={0} total={0} label="Empty Course" />);
    expect(screen.getByRole('img', { name: /Empty Course: 0% complete/i })).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });
});

describe('Rewards: BadgeShelf', () => {
  it('renders empty badges shelf with singular/plural counter', () => {
    render(<BadgeShelf earnedBadges={[]} />);
    expect(screen.getByText(/0 badges earned/i)).toBeInTheDocument();
    expect(screen.getByText(/Complete checkpoints in any course to earn badges/i)).toBeInTheDocument();
  });

  it('renders earned badge with descriptive title and distinction from locked badges', () => {
    render(<BadgeShelf earnedBadges={['quantum-starter']} />);
    expect(screen.getByText(/1 badge earned/i)).toBeInTheDocument();
    const earnedBadge = screen.getByRole('article', { name: /Quantum Physics Checkpoint/i });
    expect(earnedBadge).toBeInTheDocument();
    expect(earnedBadge).toHaveAttribute('data-earned', 'true');
    expect(within(earnedBadge).getByText('Earned')).toBeInTheDocument();
  });

  it('renders multiple earned badges with plural count', () => {
    render(<BadgeShelf earnedBadges={['quantum-starter', 'relativity-starter', 'optics-starter']} />);
    expect(screen.getByText(/3 badges earned/i)).toBeInTheDocument();
  });
});

describe('Rewards: Celebration', () => {
  it('renders SVG/CSS burst when active and celebrations enabled', () => {
    render(
      <Celebration
        active={true}
        celebrationsEnabled={true}
        reducedMotionEnabled={false}
        soundEnabled={false}
      />
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByTestId('celebration-burst')).toBeInTheDocument();
  });

  it('is disabled and produces no burst when celebrations setting is false', () => {
    render(
      <Celebration
        active={true}
        celebrationsEnabled={false}
        reducedMotionEnabled={false}
        soundEnabled={false}
      />
    );
    expect(screen.queryByTestId('celebration-burst')).not.toBeInTheDocument();
  });

  it('is disabled when reducedMotion setting is true', () => {
    render(
      <Celebration
        active={true}
        celebrationsEnabled={true}
        reducedMotionEnabled={false}
        soundEnabled={false}
      />
    );
    // When reducedMotion is true
    cleanup();
    render(
      <Celebration
        active={true}
        celebrationsEnabled={true}
        reducedMotionEnabled={true}
        soundEnabled={false}
      />
    );
    expect(screen.queryByTestId('celebration-burst')).not.toBeInTheDocument();
  });

  it('respects prefers-reduced-motion media query even if setting is false', () => {
    vi.stubGlobal('matchMedia', vi.fn().mockImplementation(query => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })));

    render(
      <Celebration
        active={true}
        celebrationsEnabled={true}
        reducedMotionEnabled={false}
        soundEnabled={false}
      />
    );
    expect(screen.queryByTestId('celebration-burst')).not.toBeInTheDocument();
  });

  it('defaults sound to off and makes zero network requests', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    render(
      <Celebration
        active={true}
        celebrationsEnabled={true}
        reducedMotionEnabled={false}
      />
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('supports settings prop and suppresses burst when settings.celebrations is false', () => {
    render(
      <Celebration
        active={true}
        settings={{ celebrations: false, sound: false, reducedMotion: false, theme: 'dark' }}
      />
    );
    expect(screen.queryByTestId('celebration-burst')).not.toBeInTheDocument();
  });
});

describe('Mission Completion: RecapStep with Celebration', () => {
  it('mounts Celebration burst on complete recap when celebrations are enabled', () => {
    const recapStep = {
      id: 'quantum-light-quanta-recap',
      kind: 'recap' as const,
      takeaways: ['Key takeaway.'],
    };
    const mission = courseCatalog.getMission('quantum', 'quantum-light-quanta');
    const completedSession = {
      ...createMissionSession(mission),
      isComplete: true,
      canAdvance: false,
    };

    render(
      <RecapStep
        step={recapStep}
        state={completedSession}
        mission={mission}
        courseId="quantum"
        settings={{ theme: 'dark', sound: false, reducedMotion: false, celebrations: true }}
        onContinue={vi.fn()}
        onReplay={vi.fn()}
      />
    );

    expect(screen.getByTestId('celebration-burst')).toBeInTheDocument();
  });
});

describe('ProgressPage: Dashboard, Settings, and Backup Controls', () => {
  function makeProgress(): LearnerProgressV2 {
    let p = createProgressV2(testNow);
    p = completeMission(p, { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 3 }, courseCatalog, testNow);
    p = completeMission(p, { courseId: 'quantum', missionId: 'quantum-build-a-wavefunction', stars: 3 }, courseCatalog, testNow);
    p = completeMission(p, { courseId: 'quantum', missionId: 'quantum-measurement-probabilities', stars: 3 }, courseCatalog, testNow);
    p = completeMission(p, { courseId: 'quantum', missionId: 'quantum-uncertainty', stars: 3 }, courseCatalog, testNow);
    p = completeMission(p, { courseId: 'quantum', missionId: 'quantum-tunneling', stars: 3 }, courseCatalog, testNow);
    p = completeMission(p, { courseId: 'quantum', missionId: 'quantum-checkpoint', stars: 3 }, courseCatalog, testNow);
    p = completeMission(p, { courseId: 'relativity', missionId: 'relativity-events-and-frames', stars: 3 }, courseCatalog, testNow);
    p = completeMission(p, { courseId: 'relativity', missionId: 'relativity-light-clock-dilation', stars: 3 }, courseCatalog, testNow);
    p = completeMission(p, { courseId: 'relativity', missionId: 'relativity-length-and-simultaneity', stars: 3 }, courseCatalog, testNow);
    p = completeMission(p, { courseId: 'relativity', missionId: 'relativity-energy-momentum', stars: 3 }, courseCatalog, testNow);

    return {
      ...p,
      streak: { current: 3, longest: 7, lastActiveDate: '2026-09-11' },
      dailyGoal: 3,
      settings: { theme: 'dark', sound: true, reducedMotion: false, celebrations: true },
    };
  }

  it('renders overall dashboard with level, XP, streak, mastery, and badges', () => {
    const progress = makeProgress();
    render(<ProgressPage progress={progress} />);

    expect(screen.getByRole('heading', { level: 1, name: /Progress/i })).toBeInTheDocument();
    expect(screen.getByText(/Level 2/i)).toBeInTheDocument();
    expect(screen.getByText(/^3 days$/i)).toBeInTheDocument();
    expect(screen.getByText(/10 missions completed/i)).toBeInTheDocument();
    expect(screen.getByText(/1 badge earned/i)).toBeInTheDocument();
  });

  it('displays singular mission copy when exactly 1 mission is completed', () => {
    let progress = createProgressV2(testNow);
    progress = completeMission(progress, { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 3 }, courseCatalog, testNow);

    render(<ProgressPage progress={progress} />);
    expect(screen.getByText(/1 mission completed/i)).toBeInTheDocument();
    expect(screen.getByText(/0 badges earned/i)).toBeInTheDocument();
  });

  it('allows changing daily goals between 1, 3, and 5 missions', async () => {
    const user = userEvent.setup();
    const progress = makeProgress();
    const onChange = vi.fn();

    render(<ProgressPage progress={progress} onProgressChange={onChange} />);

    const goal1Btn = screen.getByRole('button', { name: /1 mission/i });
    const goal5Btn = screen.getByRole('button', { name: /5 missions/i });

    await user.click(goal1Btn);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ dailyGoal: 1 }));

    await user.click(goal5Btn);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ dailyGoal: 5 }));
  });

  it('toggles settings: theme, sound, reduced motion, and celebrations', async () => {
    const user = userEvent.setup();
    const progress = makeProgress();
    const onChange = vi.fn();

    render(<ProgressPage progress={progress} onProgressChange={onChange} />);

    // Theme toggle
    const themeBtn = screen.getByRole('button', { name: 'Light mode' });
    await user.click(themeBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({ theme: 'light' }),
      })
    );

    // Sound toggle
    const soundBtn = screen.getByRole('switch', { name: /Sound/i });
    await user.click(soundBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({ sound: false }),
      })
    );

    // Reduced motion toggle
    const motionBtn = screen.getByRole('switch', { name: /Reduced motion/i });
    await user.click(motionBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({ reducedMotion: true }),
      })
    );

    // Celebrations toggle
    const celebBtn = screen.getByRole('switch', { name: /Celebrations/i });
    await user.click(celebBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        settings: expect.objectContaining({ celebrations: false }),
      })
    );
  });

  it('selects comfort themes, custom colors, and Liquid Glass independently', async () => {
    const user = userEvent.setup();
    const progress = makeProgress();
    const onChange = vi.fn();
    render(<ProgressPage progress={progress} onProgressChange={onChange} />);

    await user.click(screen.getByRole('button', { name: 'Eye Comfort theme' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ settings: expect.objectContaining({
      theme: 'eye-comfort', primaryColor: '#8b5e34', secondaryColor: '#477a5b',
    }) }));

    fireEvent.change(screen.getByLabelText('Custom primary color'), { target: { value: '#ff3366' } });
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ settings: expect.objectContaining({ primaryColor: '#ff3366' }) }));

    await user.click(screen.getByRole('switch', { name: 'Liquid Glass' }));
    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ settings: expect.objectContaining({ liquidGlass: false }) }));
  });

  it('displays recent activity from validated ledger events with newest first', () => {
    const progress = makeProgress();
    render(<ProgressPage progress={progress} />);

    expect(screen.getByRole('heading', { name: /Recent activity/i })).toBeInTheDocument();
    expect(screen.getByText(/Light quanta/i)).toBeInTheDocument();
    expect(screen.getAllByText(/\+60 XP/i).length).toBeGreaterThanOrEqual(1);

    const items = screen.getAllByRole('listitem');
    expect(items.length).toBeGreaterThanOrEqual(2);
    // The newest activity completed in makeProgress was relativity-energy-momentum ("Energy-momentum")
    expect(items[0]).toHaveTextContent(/Energy-momentum/i);
  });

  it('resets progress while strictly preserving user settings', async () => {
    const user = userEvent.setup();
    const customSettings = {
      theme: 'light' as const,
      sound: false,
      reducedMotion: true,
      celebrations: false,
    };
    const progress = {
      ...makeProgress(),
      settings: customSettings,
    };
    const onChange = vi.fn();

    // Mock confirm
    vi.stubGlobal('confirm', vi.fn().mockReturnValue(true));

    render(<ProgressPage progress={progress} onProgressChange={onChange} />);

    const resetBtn = screen.getByRole('button', { name: /Reset progress/i });
    await user.click(resetBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledTimes(1);
    const resetArg = onChange.mock.calls[0][0] as LearnerProgressV2;
    expect(resetArg.totalXp).toBe(0);
    expect(resetArg.completedMissions).toEqual([]);
    expect(resetArg.streak.current).toBe(0);
    expect(resetArg.settings).toEqual(customSettings);
  });

  it('exports progress as valid JSON file download', async () => {
    const user = userEvent.setup();
    const progress = makeProgress();
    render(<ProgressPage progress={progress} />);

    // Spy on URL.createObjectURL and link click
    const createObjectURL = vi.fn().mockReturnValue('blob:mock-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { ...URL, createObjectURL, revokeObjectURL });

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const exportBtn = screen.getByRole('button', { name: /Export progress/i });
    await user.click(exportBtn);

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('imports valid JSON progress and updates state', async () => {
    const progress = makeProgress();
    const json = serializeProgressV2(progress, courseCatalog);
    const onChange = vi.fn();

    render(<ProgressPage progress={createProgressV2(testNow)} onProgressChange={onChange} />);

    const file = new File([json], 'physics-progress.json', { type: 'application/json' });
    const fileInput = screen.getByLabelText(/Import progress/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await vi.waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          totalXp: progress.totalXp,
          completedMissions: expect.arrayContaining(['quantum/quantum-light-quanta']),
        })
      );
    });
  });

  it('rejects invalid JSON import with an accessible error message', async () => {
    const onChange = vi.fn();
    render(<ProgressPage progress={createProgressV2(testNow)} onProgressChange={onChange} />);

    const file = new File(['{"invalid":"data"}'], 'corrupt.json', { type: 'application/json' });
    const fileInput = screen.getByLabelText(/Import progress/i);

    fireEvent.change(fileInput, { target: { files: [file] } });

    await vi.waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(onChange).not.toHaveBeenCalled();
    });
  });
});
