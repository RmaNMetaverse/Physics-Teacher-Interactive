import { describe, expect, it } from 'vitest';
import { courseCatalog } from '../src/learning/catalog';
import { createMissionSession, type MissionSessionSaved } from '../src/learning/mission-engine';
import { upgradeMissionSession, MISSION_CURRICULUM_REVISION } from '../src/learning/session-upgrade';
import { completeMission, createProgressV2, parseProgressV2, serializeProgressV2 } from '../src/progress/progress';

const mission = courseCatalog.getMission('foundations', 'measurement-basics');
const old: MissionSessionSaved = {
  currentStepIndex: 8,
  answers: {
    'measurement-basics-predict': { attempts: 1, correct: true, value: 1 },
    'measurement-basics-required-math-arithmetic': { attempts: 1, correct: true, value: 17 },
    'measurement-basics-required-math-decimals': { attempts: 1, correct: true, value: .12 },
    'measurement-basics-calculation-check': { attempts: 1, correct: true, value: 3 },
    'measurement-basics-experiment-check': { attempts: 1, correct: true, value: 4 },
  },
  hintedStepIds: [], expandedMathStepIds: [], completedSimulationStepIds: ['measurement-basics-simulate'], recapCompleted: false,
};

describe('curriculum update preserves learning history', () => {
  it('resumes an old completed journey at recap and transfers the applied answer', () => {
    const upgraded = upgradeMissionSession(mission, old);
    const state = createMissionSession(mission, upgraded);
    expect(mission.steps[state.currentStepIndex].kind).toBe('recap');
    expect(state.canAdvance).toBe(true);
    expect(state.answers['measurement-basics-required-math-arithmetic'].value).toBe(3);
  });

  it('does not treat a passed generic quiz as a passed physics check', () => {
    const saved = { ...old, currentStepIndex: 4, answers: { 'measurement-basics-required-math-arithmetic': old.answers['measurement-basics-required-math-arithmetic'] } };
    const state = createMissionSession(mission, upgradeMissionSession(mission, saved));
    expect(mission.steps[state.currentStepIndex].kind).toBe('math');
    expect(state.canAdvance).toBe(false);
    expect(state.answers).toEqual({});
  });

  it('leaves current-revision sessions alone on reload', () => {
    const state = createMissionSession(mission);
    expect(upgradeMissionSession(mission, state, MISSION_CURRICULUM_REVISION)).toBe(state);
  });

  it('imports previous v2 backups without losing XP, settings, or retired math history', () => {
    const now = new Date('2026-10-01T00:00:00Z');
    const progress = completeMission(createProgressV2(now), { courseId: 'foundations', missionId: mission.id, stars: 3 }, courseCatalog, now);
    progress.answers['foundations/measurement-basics/measurement-basics-required-math-decimals'] = .12;
    progress.stepAttempts['foundations/measurement-basics/measurement-basics-calculation-check'] = 1;
    progress.completedMathSteps.push('foundations/measurement-basics/measurement-basics-required-math-decimals');
    const restored = parseProgressV2(serializeProgressV2(progress, courseCatalog), courseCatalog, now);
    expect(restored.totalXp).toBe(60);
    expect(restored.completedMathSteps).toEqual(progress.completedMathSteps);
    expect(restored.settings).toEqual(progress.settings);
  });
});
