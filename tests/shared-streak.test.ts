import { describe, expect, it } from 'vitest';
import { courseCatalog } from '../src/learning/catalog';
import { createProgressV2, recordStep, completeMission, parseProgressV2 } from '../src/progress/progress';
import { mergeProgress } from '../src/cloud/progress-sync';

const event = { courseId: 'quantum', missionId: 'quantum-light-quanta', stepId: 'quantum-light-quanta-predict', answer: 1 };
const practice = (day: string) => recordStep(createProgressV2(new Date(day)), event, courseCatalog, new Date(day));

describe('shared practice-day streaks', () => {
  it('joins consecutive days from independent devices and ignores a newer settings-only save', () => {
    const phone = practice('2026-10-04T12:00:00Z');
    const tablet = practice('2026-10-05T12:00:00Z');
    const laptop = practice('2026-10-06T12:00:00Z');
    phone.savedAt = '2026-10-06T20:00:00.000Z';
    const merged = mergeProgress(mergeProgress(phone, tablet, courseCatalog), laptop, courseCatalog);
    expect(merged.streak).toMatchObject({ current: 3, longest: 3, lastActiveDate: '2026-10-06' });
    expect(merged.streak.days).toEqual(['2026-10-04', '2026-10-05', '2026-10-06']);
    expect(mergeProgress(laptop, mergeProgress(tablet, phone, courseCatalog), courseCatalog).streak).toEqual(merged.streak);
    expect(mergeProgress(merged, merged, courseCatalog).streak).toEqual(merged.streak);
  });

  it('counts one common UTC day across time zones and multiple devices', () => {
    const phone = practice('2026-10-06T00:30:00+03:30');
    const laptop = practice('2026-10-05T17:30:00-04:00');
    const merged = mergeProgress(phone, laptop, courseCatalog);
    expect(merged.streak).toMatchObject({ current: 1, lastActiveDate: '2026-10-05', days: ['2026-10-05'] });
  });

  it('recomputes gaps and longest runs when offline dates arrive out of order', () => {
    const day4 = practice('2026-10-04T12:00:00Z');
    const day6 = practice('2026-10-06T12:00:00Z');
    let merged = mergeProgress(day6, day4, courseCatalog);
    expect(merged.streak.current).toBe(1);
    merged = mergeProgress(merged, practice('2026-10-05T12:00:00Z'), courseCatalog);
    expect(merged.streak.current).toBe(3);
    merged = recordStep(merged, event, courseCatalog, new Date('2026-10-09T12:00:00Z'));
    expect(merged.streak).toMatchObject({ current: 1, longest: 3 });
    expect(parseProgressV2(JSON.stringify(merged), courseCatalog, new Date()).streak).toEqual(merged.streak);
  });

  it('credits completion and replay without adding duplicate daily credit or XP', () => {
    const completion = { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 3 as const };
    const first = completeMission(createProgressV2(new Date()), completion, courseCatalog, new Date('2026-10-05T12:00:00Z'));
    const replay = completeMission(first, completion, courseCatalog, new Date('2026-10-06T12:00:00Z'));
    expect(replay.streak.current).toBe(2);
    expect(replay.totalXp).toBe(first.totalXp);
  });

  it('upgrades old counters into their known consecutive dates without losing a personal best', () => {
    const old = { ...createProgressV2(new Date()), streak: { current: 3, longest: 12, lastActiveDate: '2026-10-05' } };
    const upgraded = parseProgressV2(JSON.stringify(old), courseCatalog, new Date());
    expect(upgraded.streak.days).toEqual(['2026-10-03', '2026-10-04', '2026-10-05']);
    expect(upgraded.streak.longest).toBe(12);
  });
});
