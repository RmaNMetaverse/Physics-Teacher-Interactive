import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { foundationCourse } from '../src/learning/foundations';
import { createCourseCatalog } from '../src/learning/catalog';
import {
  PROGRESS_V2_STORAGE_KEY,
  completeMission,
  createProgressV2,
  parseProgressV2,
  readProgressV2,
  recordStep,
  serializeProgressV2,
  saveProgressV2,
} from '../src/progress/progress';
import type { CourseDefinition, CourseCatalog, MissionDefinition } from '../src/learning/types';
import type { LearnerProgressV2, MissionCompletionInput } from '../src/progress/types';

const now = new Date('2026-09-10T10:00:00.000Z');
const tomorrow = new Date('2026-09-11T10:00:00.000Z');
const afterMissedDay = new Date('2026-09-13T10:00:00.000Z');

function mission(id: string, xp = 60): MissionDefinition {
  return {
    id, kind: 'mission', title: id, summary: 'A valid test mission.', objectives: ['Learn a test rule.'], minutes: 5, xp,
    requiredMath: [], modelId: 'motion', scienceStatus: 'established', equation: 'x=x', symbols: 'x is a test value.',
    workedExample: { question: 'What equals itself?', steps: ['Read the equation.'], answer: 'x' }, reviewedAt: '2026-09-10',
    steps: [
      { id: `${id}-observe`, kind: 'observe', title: 'Observe', body: ['Read the test mission.'] },
      { id: `${id}-predict`, kind: 'predict', assessment: { id: `${id}-predict-answer`, kind: 'concept', prompt: 'Choose x.', options: ['x'], answer: 0, hints: ['Read the option.'], explanation: 'x equals x.' } },
      { id: `${id}-simulate`, kind: 'simulate', modelId: 'motion', prompt: 'Run it.', preset: { mode: 0, speed: 1, angle: 45, acceleration: 0, height: 0, g: 9.81, mass: 1 } },
      { id: `${id}-math`, kind: 'math', title: 'Math', layer: { quick: { equation: 'x=x', summary: 'Identity equation.', symbols: [{ symbol: 'x', meaning: 'test value' }] }, foundation: { title: 'Math', concepts: ['Equal values stay equal.'], explanation: ['Both sides have the same value.'], prerequisites: [], returnTo: `${id}-math`, visual: { tutorialId: 'math-arithmetic', label: 'Value', kind: 'number', min: 0, max: 1, step: 1, initial: 0, instruction: 'Move the value.' }, workedExample: { question: 'What equals x?', steps: ['Read x.'], answer: 'x' }, check: { id: `${id}-math-answer`, kind: 'concept', prompt: 'Choose x.', options: ['x'], answer: 0, hints: ['Read it.'], explanation: 'x equals x.' } } } },
      { id: `${id}-explain`, kind: 'explain', title: 'Explain', body: ['Explain the test.'] },
      { id: `${id}-check-one`, kind: 'check', assessment: { id: `${id}-check-one-answer`, kind: 'concept', prompt: 'Choose x.', options: ['x'], answer: 0, hints: ['Read it.'], explanation: 'x equals x.' } },
      { id: `${id}-check-two`, kind: 'check', assessment: { id: `${id}-check-two-answer`, kind: 'concept', prompt: 'Choose x.', options: ['x'], answer: 0, hints: ['Read it.'], explanation: 'x equals x.' } },
      { id: `${id}-recap`, kind: 'recap', takeaways: ['x equals x.'] },
    ], sources: [{ label: 'OpenStax', url: 'https://openstax.org/' }], limitations: ['Test fixture only.'],
  };
}

function catalog(): CourseCatalog {
  const first = mission('quantum-light-quanta');
  const second = mission('quantum-interference');
  const checkpoint: MissionDefinition = {
    id: 'quantum-checkpoint', kind: 'checkpoint', title: 'Checkpoint', summary: 'A valid test checkpoint.', objectives: ['Reflect.'], minutes: 2, xp: 0,
    requiredMath: [], scienceStatus: 'established', checkpoint: { badgeId: 'quantum-badge', requiredMissionIds: [first.id, second.id] },
    steps: [{ id: 'quantum-checkpoint-observe', kind: 'observe', title: 'Observe', body: ['Read.'] }, { id: 'quantum-checkpoint-check', kind: 'check', assessment: { id: 'quantum-checkpoint-answer', kind: 'concept', prompt: 'Choose reflection.', options: ['Reflect.'], answer: 0, hints: ['Read the checkpoint.'], explanation: 'Reflection is the checkpoint action.' } }, { id: 'quantum-checkpoint-recap', kind: 'recap', takeaways: ['Reflect.'] }],
    sources: [{ label: 'OpenStax', url: 'https://openstax.org/' }], limitations: ['Test fixture only.'],
  };
  const course: CourseDefinition = { id: 'quantum', title: 'Quantum', description: 'A test course.', group: 'modern', scope: 'Test scope', color: '#000000', recommendations: [], access: 'open', estimatedMinutes: 12, missions: [first, second, checkpoint], sources: [{ label: 'OpenStax', url: 'https://openstax.org/' }], limitations: ['Test fixture only.'], reviewedAt: '2026-09-10' };
  return createCourseCatalog([course]);
}

afterEach(() => vi.unstubAllGlobals());

describe('version-2 learner progress', () => {
  it('awards a mission XP once while a replay improves its stars', () => {
    const courseCatalog = catalog();
    const once = completeMission(createProgressV2(now), { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 2 }, courseCatalog, now);
    const replay = completeMission(once, { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 3 }, courseCatalog, tomorrow);

    expect(once.totalXp).toBe(60);
    expect(replay.totalXp).toBe(60);
    expect(replay.missionStars['quantum/quantum-light-quanta']).toBe(3);
    expect(replay.xpLedger).toEqual({ 'quantum/quantum-light-quanta': 60 });
  });

  it('rejects unknown mission IDs and invalid stars rather than corrupting progress', () => {
    const courseCatalog = catalog();
    const progress = createProgressV2(now);

    expect(() => completeMission(progress, { courseId: 'quantum', missionId: 'missing', stars: 2 }, courseCatalog, now)).toThrow(/unknown/i);
    expect(() => completeMission(progress, { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 4 as 1 | 2 | 3 }, courseCatalog, now)).toThrow(/stars/i);
  });

  it('awards a checkpoint badge after its required missions are complete', () => {
    const courseCatalog = catalog();
    const first = completeMission(createProgressV2(now), { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 3 }, courseCatalog, now);
    const second = completeMission(first, { courseId: 'quantum', missionId: 'quantum-interference', stars: 3 }, courseCatalog, now);
    const checkpoint = completeMission(second, { courseId: 'quantum', missionId: 'quantum-checkpoint', stars: 3 }, courseCatalog, now);

    expect(checkpoint.badges).toEqual(['quantum-badge']);
    expect(checkpoint.totalXp).toBe(120);
  });

  it('records valid steps, accepts each supported daily goal, and advances local-day streaks without punishing missed days', () => {
    const courseCatalog = catalog();
    const initial = { ...createProgressV2(now), dailyGoal: 5 as const };
    const first = recordStep(initial, { courseId: 'quantum', missionId: 'quantum-light-quanta', stepId: 'quantum-light-quanta-predict', answer: 0 }, courseCatalog, now);
    const second = recordStep(first, { courseId: 'quantum', missionId: 'quantum-light-quanta', stepId: 'quantum-light-quanta-predict', answer: 0 }, courseCatalog, tomorrow);
    const missed = recordStep(second, { courseId: 'quantum', missionId: 'quantum-light-quanta', stepId: 'quantum-light-quanta-predict', answer: 0 }, courseCatalog, afterMissedDay);

    expect(first.stepAttempts['quantum/quantum-light-quanta/quantum-light-quanta-predict']).toBe(1);
    expect(first.answers['quantum/quantum-light-quanta/quantum-light-quanta-predict']).toBe(0);
    expect(first.streak).toEqual({ current: 1, longest: 1, lastActiveDate: '2026-09-10' });
    expect(second.streak).toEqual({ current: 2, longest: 2, lastActiveDate: '2026-09-11' });
    expect(missed.streak).toEqual({ current: 1, longest: 2, lastActiveDate: '2026-09-13' });
    expect([1, 3, 5]).toContain(initial.dailyGoal);
  });

  it('migrates known version-1 Foundations history and gives its historical XP exactly once', () => {
    const courseCatalog = createCourseCatalog([foundationCourse]);
    const legacy = { version: 1, completed: ['measurement-basics'], answers: { 'measurement-basics-concept': 1 }, mathCompleted: ['math-arithmetic'], lastLesson: 'measurement-basics', theme: 'light', savedAt: '2026-09-09T00:00:00.000Z' };
    const migrated = parseProgressV2(JSON.stringify(legacy), courseCatalog, now);

    expect(migrated.completedMissions).toEqual(['foundations/measurement-basics']);
    expect(migrated.xpLedger).toEqual({ 'foundations/measurement-basics': 60 });
    expect(migrated.totalXp).toBe(60);
    expect(migrated.answers['foundations/measurement-basics/measurement-basics-predict']).toBe(1);
    expect(migrated.completedMathSteps).toContain('foundations/measurement-basics/measurement-basics-required-math-arithmetic');
    expect(migrated.settings.theme).toBe('light');
    expect(migrated.settings).toMatchObject({ primaryColor: '#7c3aed', secondaryColor: '#059669', liquidGlass: true });
  });

  it('upgrades original version-2 appearance settings and rejects unsafe custom colors', () => {
    const courseCatalog = catalog();
    const original = createProgressV2(now);
    const legacySettings = { theme: 'dark', sound: true, reducedMotion: false, celebrations: true };
    const upgraded = parseProgressV2(JSON.stringify({ ...original, settings: legacySettings }), courseCatalog, now);
    expect(upgraded.settings).toMatchObject({ primaryColor: '#a78bfa', secondaryColor: '#34d399', liquidGlass: true });
    expect(() => parseProgressV2(JSON.stringify({ ...original, settings: { ...original.settings, primaryColor: 'url(bad)' } }), courseCatalog, now)).toThrow(/color/i);
  });

  it('rejects corrupt imports and unknown version-2 IDs while serializing a derived XP total', () => {
    const courseCatalog = catalog();
    const valid = completeMission(createProgressV2(now), { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 2 }, courseCatalog, now);
    const tampered = { ...valid, totalXp: 99999 };

    expect(() => parseProgressV2('{broken', courseCatalog, now)).toThrow(/JSON/i);
    expect(parseProgressV2(JSON.stringify(tampered), courseCatalog, now).totalXp).toBe(60);
    expect(JSON.parse(serializeProgressV2(valid, courseCatalog)).totalXp).toBe(60);
  });

  it('recovers from blocked storage and corrupt saved data without throwing', () => {
    const courseCatalog = catalog();
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => { throw new Error('blocked'); }) });
    expect(readProgressV2(courseCatalog, now)).toMatchObject({ persistent: false, progress: { version: 2 } });

    vi.stubGlobal('localStorage', { getItem: vi.fn(() => '{broken') });
    expect(readProgressV2(courseCatalog, now)).toMatchObject({ persistent: true, progress: { version: 2 } });

    vi.stubGlobal('localStorage', { getItem: vi.fn((key: string) => key === PROGRESS_V2_STORAGE_KEY ? null : '{broken') });
    expect(readProgressV2(courseCatalog, now).progress.version).toBe(2);
  });

  it('persists a migrated legacy record under the version-2 key', () => {
    const courseCatalog = createCourseCatalog([foundationCourse]);
    const legacy = { version: 1, completed: ['measurement-basics'], answers: {}, mathCompleted: [], lastLesson: '', theme: 'dark', savedAt: '2026-09-09T00:00:00.000Z' };
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { getItem: vi.fn((key: string) => key === PROGRESS_V2_STORAGE_KEY ? null : JSON.stringify(legacy)), setItem });

    const result = readProgressV2(courseCatalog, now);

    expect(result.progress.completedMissions).toEqual(['foundations/measurement-basics']);
    expect(setItem).toHaveBeenCalledWith(PROGRESS_V2_STORAGE_KEY, serializeProgressV2(result.progress, courseCatalog));
  });

  it('maps legacy math practice answers to their adapted mission step IDs', () => {
    const courseCatalog = createCourseCatalog([foundationCourse]);
    const legacy = { version: 1, completed: [], answers: { 'math-arithmetic-practice': 17 }, mathCompleted: [], lastLesson: '', theme: 'dark', savedAt: '2026-09-09T00:00:00.000Z' };

    const migrated = parseProgressV2(JSON.stringify(legacy), courseCatalog, now);

    expect(migrated.answers['foundations/measurement-basics/measurement-basics-required-math-arithmetic']).toBe(17);
  });

  it('rejects a completed normal mission with a missing XP ledger entry', () => {
    const courseCatalog = catalog();
    const valid = completeMission(createProgressV2(now), { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 2 }, courseCatalog, now);
    const tampered = { ...valid, xpLedger: {}, totalXp: 0 };

    expect(() => parseProgressV2(JSON.stringify(tampered), courseCatalog, now)).toThrow(/XP ledger/i);
  });

  it('exports the exact mission completion input contract', () => {
    expectTypeOf<MissionCompletionInput>().toEqualTypeOf<{
      courseId: string;
      missionId: string;
      stars: 1 | 2 | 3;
    }>();
  });

  it.each([1, 3, 5] as const)('accepts %i as a saved daily goal', (dailyGoal) => {
    const progress = { ...createProgressV2(now), dailyGoal };

    expect(parseProgressV2(JSON.stringify(progress), catalog(), now).dailyGoal).toBe(dailyGoal);
  });

  it('uses local calendar-day boundaries for streaks', () => {
    const courseCatalog = catalog();
    const beforeLocalMidnight = new Date(2026, 8, 10, 23, 59);
    const afterLocalMidnight = new Date(2026, 8, 11, 0, 1);
    const event = { courseId: 'quantum', missionId: 'quantum-light-quanta', stepId: 'quantum-light-quanta-predict', answer: 0 };
    const first = recordStep(createProgressV2(beforeLocalMidnight), event, courseCatalog, beforeLocalMidnight);
    const second = recordStep(first, event, courseCatalog, afterLocalMidnight);

    expect(first.streak).toEqual({ current: 1, longest: 1, lastActiveDate: '2026-09-10' });
    expect(second.streak).toEqual({ current: 2, longest: 2, lastActiveDate: '2026-09-11' });
  });

  it('rejects unknown IDs in a version-2 import', () => {
    const tampered = { ...createProgressV2(now), completedMissions: ['quantum/missing'] };

    expect(() => parseProgressV2(JSON.stringify(tampered), catalog(), now)).toThrow(/Completed missions/i);
  });

  it('requires one star record for every completed mission', () => {
    const courseCatalog = catalog();
    const valid = completeMission(createProgressV2(now), { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 2 }, courseCatalog, now);
    const tampered = { ...valid, missionStars: {} };

    expect(() => parseProgressV2(JSON.stringify(tampered), courseCatalog, now)).toThrow(/Mission stars/i);
  });

  it('rejects invalid saved progress before reducing another event', () => {
    const courseCatalog = catalog();
    const valid = completeMission(createProgressV2(now), { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 2 }, courseCatalog, now);
    const tampered = { ...valid, xpLedger: {}, totalXp: 0 };
    const step = { courseId: 'quantum', missionId: 'quantum-interference', stepId: 'quantum-interference-predict', answer: 0 };

    expect(() => recordStep(tampered, step, courseCatalog, tomorrow)).toThrow(/XP ledger/i);
    expect(() => completeMission(tampered, { courseId: 'quantum', missionId: 'quantum-interference', stars: 2 }, courseCatalog, tomorrow)).toThrow(/XP ledger/i);
  });

  it('returns migrated progress without throwing when version-2 persistence is blocked', () => {
    const legacy = { version: 1, completed: ['measurement-basics'], answers: {}, mathCompleted: [], lastLesson: '', theme: 'dark', savedAt: '2026-09-09T00:00:00.000Z' };
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => key === PROGRESS_V2_STORAGE_KEY ? null : JSON.stringify(legacy)),
      setItem: vi.fn(() => { throw new Error('blocked'); }),
    });

    const result = readProgressV2(createCourseCatalog([foundationCourse]), now);

    expect(result.progress.completedMissions).toEqual(['foundations/measurement-basics']);
    expect(result.persistent).toBe(false);
  });

  it('discards unknown legacy IDs during migration', () => {
    const legacy = { version: 1, completed: ['retired-lesson'], answers: { 'retired-answer': 4 }, mathCompleted: ['retired-math'], lastLesson: 'retired-lesson', theme: 'light', savedAt: '2026-09-09T00:00:00.000Z' };

    const migrated = parseProgressV2(JSON.stringify(legacy), createCourseCatalog([foundationCourse]), now);

    expect(migrated.completedMissions).toEqual([]);
    expect(migrated.answers).toEqual({});
    expect(migrated.completedMathSteps).toEqual([]);
    expect(migrated.nextMissionByCourse).toEqual({});
    expect(migrated.xpLedger).toEqual({});
    expect(migrated.totalXp).toBe(0);
  });

  it('round-trips and persists only catalog-validated version-2 progress', () => {
    const courseCatalog = catalog();
    const valid = completeMission(createProgressV2(now), { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 2 }, courseCatalog, now);
    const serialized = serializeProgressV2(valid, courseCatalog);
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { setItem });

    expect(parseProgressV2(serialized, courseCatalog, tomorrow)).toEqual(valid);
    expect(saveProgressV2(valid, courseCatalog)).toBe(true);
    expect(setItem).toHaveBeenCalledWith(PROGRESS_V2_STORAGE_KEY, serialized);
  });

  it('does not persist an invalid version-2 object', () => {
    const courseCatalog = catalog();
    const valid = completeMission(createProgressV2(now), { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 2 }, courseCatalog, now);
    const invalid = { ...valid, xpLedger: { 'quantum/quantum-light-quanta': 61 } };
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', { setItem });

    expect(saveProgressV2(invalid, courseCatalog)).toBe(false);
    expect(setItem).not.toHaveBeenCalled();
  });

  it('rejects invalid shape, catalog IDs, ledgers, stars, and badges before serialization', () => {
    const courseCatalog = catalog();
    const valid = completeMission(createProgressV2(now), { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 2 }, courseCatalog, now);
    const missionKey = 'quantum/quantum-light-quanta';
    const second = completeMission(valid, { courseId: 'quantum', missionId: 'quantum-interference', stars: 2 }, courseCatalog, now);
    const earnedBadge = completeMission(second, { courseId: 'quantum', missionId: 'quantum-checkpoint', stars: 2 }, courseCatalog, now);
    const prematureCheckpoint = {
      ...createProgressV2(now),
      completedMissions: ['quantum/quantum-checkpoint'],
      missionStars: { 'quantum/quantum-checkpoint': 2 as const },
    };
    const invalidCases: Array<[string, LearnerProgressV2]> = [
      ['full shape', { ...valid, unexpected: true } as unknown as LearnerProgressV2],
      ['selected course ID', { ...valid, selectedCourseId: 'missing' }],
      ['next mission ID', { ...valid, nextMissionByCourse: { quantum: 'missing' } }],
      ['completed mission ID', { ...valid, completedMissions: ['quantum/missing'], missionStars: { 'quantum/missing': 2 }, xpLedger: { 'quantum/missing': 60 } }],
      ['step attempt ID', { ...valid, stepAttempts: { 'quantum/missing/missing-step': 1 } }],
      ['answer ID', { ...valid, answers: { 'quantum/missing/missing-step': 0 } }],
      ['math step ID', { ...valid, completedMathSteps: ['quantum/missing/missing-step'] }],
      ['XP ledger ID', { ...valid, xpLedger: { ...valid.xpLedger, 'quantum/missing': 60 } }],
      ['XP ledger amount', { ...valid, xpLedger: { [missionKey]: 61 } }],
      ['XP ledger completeness', { ...valid, xpLedger: {} }],
      ['star value', { ...valid, missionStars: { [missionKey]: 4 as 1 } }],
      ['star alignment', { ...valid, missionStars: { ...valid.missionStars, 'quantum/quantum-interference': 2 } }],
      ['badge ID', { ...valid, badges: ['missing-badge'] }],
      ['badge eligibility', { ...valid, badges: ['quantum-badge'] }],
      ['checkpoint prerequisites', prematureCheckpoint],
      ['badge completeness', { ...earnedBadge, badges: [] }],
    ];

    for (const [label, progress] of invalidCases) {
      expect(() => serializeProgressV2(progress, courseCatalog), label).toThrow();
    }
  });

  it('rejects checkpoint completion until all required missions are complete', () => {
    const courseCatalog = catalog();
    const initial = createProgressV2(now);

    expect(() => completeMission(initial, { courseId: 'quantum', missionId: 'quantum-checkpoint', stars: 3 }, courseCatalog, now)).toThrow(/required missions/i);
    expect(initial.completedMissions).toEqual([]);

    const first = completeMission(initial, { courseId: 'quantum', missionId: 'quantum-light-quanta', stars: 3 }, courseCatalog, now);
    const second = completeMission(first, { courseId: 'quantum', missionId: 'quantum-interference', stars: 3 }, courseCatalog, now);
    const checkpoint = completeMission(second, { courseId: 'quantum', missionId: 'quantum-checkpoint', stars: 3 }, courseCatalog, now);

    expect(checkpoint.badges).toEqual(['quantum-badge']);
  });
});
