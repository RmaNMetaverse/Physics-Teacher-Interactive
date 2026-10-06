import type { LearnerProgressV2 } from './types';

type Streak = LearnerProgressV2['streak'];
const DAY = 86_400_000;

/** One shared day boundary, independent of which device records a practice. */
export function practiceDay(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function isPracticeDay(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(`${value}T00:00:00Z`))
    && practiceDay(new Date(`${value}T00:00:00Z`)) === value;
}

export function streakDays(streak: Streak): string[] {
  if (streak.days) return [...streak.days];
  // Old saves establish the most recent consecutive run, but not older dates.
  if (!streak.lastActiveDate || !streak.current) return [];
  const end = Date.parse(`${streak.lastActiveDate}T00:00:00Z`);
  return Array.from({ length: streak.current }, (_, index) => practiceDay(new Date(end - index * DAY))).sort();
}

export function deriveStreak(days: readonly string[], previousLongest = 0): Streak {
  const sorted = [...new Set(days)].sort();
  let current = 0, longest = previousLongest, previous = 0;
  for (const day of sorted) {
    const time = Date.parse(`${day}T00:00:00Z`);
    current = current && time - previous === DAY ? current + 1 : 1;
    longest = Math.max(longest, current);
    previous = time;
  }
  return { current, longest, lastActiveDate: sorted.at(-1) ?? '', days: sorted };
}

export function creditPractice(streak: Streak, now: Date): Streak {
  return deriveStreak([...streakDays(streak), practiceDay(now)], streak.longest);
}

export function mergeStreaks(first: Streak, second: Streak): Streak {
  return deriveStreak([...streakDays(first), ...streakDays(second)], Math.max(first.longest, second.longest));
}

export function currentStreakOn(streak: Streak, today: string): number {
  if (!streak.lastActiveDate) return 0;
  const elapsed = (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${streak.lastActiveDate}T00:00:00Z`)) / DAY;
  return elapsed === 0 || elapsed === 1 ? streak.current : 0;
}
