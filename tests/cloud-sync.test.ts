import { describe, expect, it } from 'vitest';
import { createCourseCatalog } from '../src/learning/catalog';
import { quantumCourse } from '../src/learning/courses/quantum';
import { completeMission, createProgressV2 } from '../src/progress/progress';
import { mergeProgress } from '../src/cloud/progress-sync';

const catalog = createCourseCatalog([quantumCourse]);

describe('cloud progress sync', () => {
  it('combines independently completed missions without losing either device', () => {
    const first = completeMission(
      createProgressV2(new Date('2026-09-10T08:00:00.000Z')),
      { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 2 },
      catalog,
      new Date('2026-09-10T09:00:00.000Z'),
    );
    const second = completeMission(
      first,
      { courseId: 'quantum', missionId: 'quantum-build-a-wavefunction', stars: 3 },
      catalog,
      new Date('2026-09-11T09:00:00.000Z'),
    );

    const merged = mergeProgress(first, second, catalog);

    expect(merged.completedMissions).toEqual([
      'quantum/quantum-light-quanta',
      'quantum/quantum-build-a-wavefunction',
    ]);
    expect(merged.missionStars).toEqual({
      'quantum/quantum-light-quanta': 2,
      'quantum/quantum-build-a-wavefunction': 3,
    });
    expect(merged.totalXp).toBe(120);
    expect(merged.savedAt).toBe('2026-09-11T09:00:00.000Z');
  });

  it('keeps the newest settings while preserving the strongest durable achievements', () => {
    const older = completeMission(
      createProgressV2(new Date('2026-09-10T08:00:00.000Z')),
      { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 3 },
      catalog,
      new Date('2026-09-10T09:00:00.000Z'),
    );
    const newer = {
      ...older,
      missionStars: { 'quantum/quantum-light-quanta': 1 as const },
      settings: { ...older.settings, theme: 'eye-comfort' as const, sound: false },
      streak: { current: 1, longest: 12, lastActiveDate: '2026-09-12' },
      savedAt: '2026-09-12T09:00:00.000Z',
    };

    const merged = mergeProgress(older, newer, catalog);

    expect(merged.settings.theme).toBe('eye-comfort');
    expect(merged.settings.sound).toBe(false);
    expect(merged.missionStars['quantum/quantum-light-quanta']).toBe(3);
    expect(merged.streak.longest).toBe(12);
  });
});
