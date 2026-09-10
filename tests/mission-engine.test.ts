import { describe, expect, it, expectTypeOf } from 'vitest';
import {
  calculateStars,
  createMissionSession,
  missionReducer,
  type MissionCompletion,
  type MissionSessionSaved,
} from '../src/learning/mission-engine';
import type { MissionDefinition } from '../src/learning/types';
import type { MissionCompletionInput } from '../src/progress/types';

const mission: MissionDefinition = {
  id: 'engine-mission', kind: 'mission', title: 'Engine mission', summary: 'A reducer fixture.', objectives: ['Complete every kind of mission step.'],
  minutes: 5, xp: 60, requiredMath: [], modelId: 'motion', scienceStatus: 'established', equation: 'x=x', symbols: 'x is position.',
  workedExample: { question: 'What equals itself?', steps: ['Read both sides.'], answer: 'x' }, reviewedAt: '2026-09-10',
  steps: [
    { id: 'observe', kind: 'observe', title: 'Observe', body: ['A cart moves.'] },
    { id: 'predict', kind: 'predict', assessment: { id: 'prediction', kind: 'concept', prompt: 'Which option?', options: ['No', 'Yes'], answer: 1, hints: ['Read the labels.'], explanation: 'Yes is correct.' } },
    { id: 'simulate', kind: 'simulate', modelId: 'motion', prompt: 'Run the model.', preset: { speed: 2 } },
    {
      id: 'math', kind: 'math', title: 'Math', layer: {
        quick: { equation: 'v=x/t', summary: 'Speed is distance divided by time.', symbols: [{ symbol: 'v', meaning: 'speed', unit: 'm/s' }] },
        foundation: {
          title: 'Speed', concepts: ['Divide distance by time.'], explanation: ['Measure distance and elapsed time.'], prerequisites: [], returnTo: 'math',
          visual: { tutorialId: 'math-arithmetic', label: 'Speed control', kind: 'number', min: 0, max: 10, step: 1, initial: 2, instruction: 'Move the value.' },
          workedExample: { question: 'What is 9.81 m divided by one second?', steps: ['Divide 9.81 by 1.'], answer: '9.81 m/s' },
          check: { id: 'math-check', kind: 'calculation', prompt: 'What is the speed?', answer: 9.81, tolerance: 0.01, unit: 'm/s', hints: ['Divide distance by time.'], explanation: 'The speed is 9.81 m/s.' },
        },
      },
    },
    { id: 'explain', kind: 'explain', title: 'Explain', body: ['The measurement supports the model.'] },
    { id: 'check', kind: 'check', assessment: { id: 'final-check', kind: 'concept', prompt: 'Does the model match?', options: ['No', 'Yes'], answer: 1, hints: ['Compare the result.'], explanation: 'Yes is correct.' } },
    { id: 'recap', kind: 'recap', takeaways: ['A model connects measurement to explanation.'] },
  ],
  sources: [{ label: 'OpenStax', url: 'https://openstax.org/details/books/university-physics-volume-1' }], limitations: ['The fixture is one-dimensional.'],
};

function reduce(actions: Parameters<typeof missionReducer>[1][]) {
  return actions.reduce(missionReducer, createMissionSession(mission));
}

function completeWith(actions: Parameters<typeof missionReducer>[1][]) {
  return reduce([
    { type: 'next' },
    ...actions,
    { type: 'answer', stepId: 'predict', value: 1 },
    { type: 'next' },
    { type: 'complete-simulation', stepId: 'simulate' },
    { type: 'next' },
    { type: 'answer', stepId: 'math', value: '9.81 m/s' },
    { type: 'next' },
    { type: 'next' },
    { type: 'answer', stepId: 'check', value: 1 },
    { type: 'next' },
    { type: 'next' },
  ]);
}

describe('mission engine', () => {
  it('moves forward through ready steps, back to revisited steps, and validates goto indices', () => {
    const initial = createMissionSession(mission);
    expect(initial.currentStepIndex).toBe(0);
    expect(initial.canAdvance).toBe(true);

    const prediction = missionReducer(initial, { type: 'next' });
    expect(prediction.currentStepIndex).toBe(1);
    expect(prediction.canAdvance).toBe(false);
    expect(() => missionReducer(prediction, { type: 'next' })).toThrow(/advance/i);

    const answered = missionReducer(prediction, { type: 'answer', stepId: 'predict', value: 1 });
    expect(answered.canAdvance).toBe(true);
    expect(missionReducer(answered, { type: 'back' }).currentStepIndex).toBe(0);
    expect(missionReducer(answered, { type: 'goto', index: 0 }).currentStepIndex).toBe(0);
    expect(() => missionReducer(answered, { type: 'goto', index: 99 })).toThrow(/step/i);
    expect(() => missionReducer(initial, { type: 'back' })).toThrow(/first/i);
  });

  it('uses the established assessment tolerance and rejects answer actions on non-scored or unknown steps', () => {
    const math = reduce([
      { type: 'next' }, { type: 'answer', stepId: 'predict', value: 1 }, { type: 'next' },
      { type: 'complete-simulation', stepId: 'simulate' }, { type: 'next' },
    ]);
    const tolerated = missionReducer(math, { type: 'answer', stepId: 'math', value: '9.805 m/s' });
    expect(tolerated.answers.math).toMatchObject({ attempts: 1, correct: true, value: '9.805 m/s' });
    expect(() => missionReducer(math, { type: 'answer', stepId: 'simulate', value: 1 })).toThrow(/scored/i);
    expect(() => missionReducer(math, { type: 'answer', stepId: 'missing', value: 1 })).toThrow(/step/i);
    expect(() => missionReducer(math, { type: 'answer', stepId: 'math', value: Number.NaN })).toThrow(/finite/i);
  });

  it('records hints as guidance and toggles only real math foundation steps', () => {
    const prediction = missionReducer(createMissionSession(mission), { type: 'goto', index: 1 });
    const hinted = missionReducer(prediction, { type: 'request-hint', stepId: 'predict' });
    expect(hinted.hintedStepIds).toEqual(['predict']);
    expect(missionReducer(hinted, { type: 'request-hint', stepId: 'predict' })).toEqual(hinted);

    const expanded = missionReducer(hinted, { type: 'toggle-math-foundation', stepId: 'math' });
    expect(expanded.expandedMathStepIds).toEqual(['math']);
    expect(missionReducer(expanded, { type: 'toggle-math-foundation', stepId: 'math' }).expandedMathStepIds).toEqual([]);
    expect(() => missionReducer(hinted, { type: 'toggle-math-foundation', stepId: 'predict' })).toThrow(/math/i);
    expect(() => missionReducer(hinted, { type: 'request-hint', stepId: 'observe' })).toThrow(/scored/i);
  });

  it('requires a valid simulation completion before advancing and rejects duplicate simulation completion', () => {
    const simulation = reduce([{ type: 'next' }, { type: 'answer', stepId: 'predict', value: 1 }, { type: 'next' }]);
    expect(simulation.canAdvance).toBe(false);
    expect(() => missionReducer(simulation, { type: 'complete-simulation', stepId: 'predict' })).toThrow(/simulation/i);
    const completed = missionReducer(simulation, { type: 'complete-simulation', stepId: 'simulate' });
    expect(completed.canAdvance).toBe(true);
    expect(completed.completedSimulationStepIds).toEqual(['simulate']);
    expect(() => missionReducer(completed, { type: 'complete-simulation', stepId: 'simulate' })).toThrow(/already complete/i);
  });

  it('completes only after the recap and preserves completed status while revisiting', () => {
    const atRecap = reduce([
      { type: 'next' }, { type: 'answer', stepId: 'predict', value: 1 }, { type: 'next' },
      { type: 'complete-simulation', stepId: 'simulate' }, { type: 'next' }, { type: 'answer', stepId: 'math', value: 9.81 }, { type: 'next' },
      { type: 'next' }, { type: 'answer', stepId: 'check', value: 1 }, { type: 'next' },
    ]);
    expect(atRecap.currentStepIndex).toBe(6);
    expect(atRecap.isComplete).toBe(false);
    const done = missionReducer(atRecap, { type: 'next' });
    expect(done.isComplete).toBe(true);
    expect(done.recapCompleted).toBe(true);
    expect(missionReducer(done, { type: 'back' }).isComplete).toBe(true);
    expect(() => missionReducer(done, { type: 'next' })).toThrow(/already complete/i);
  });

  it('awards three stars only for first-attempt unguided completion', () => {
    const complete = completeWith([]);
    expect(complete.isComplete).toBe(true);
    expect(calculateStars(complete)).toBe(3);
  });

  it('awards two stars after a retry without guidance', () => {
    const complete = completeWith([
      { type: 'answer', stepId: 'predict', value: 0 },
    ]);
    expect(calculateStars(complete)).toBe(2);
  });

  it('awards one star when a scored step uses guidance', () => {
    const complete = completeWith([
      { type: 'request-hint', stepId: 'predict' },
    ]);
    expect(calculateStars(complete)).toBe(1);
  });

  it('restores only a complete, mission-valid saved session deterministically', () => {
    const saved: MissionSessionSaved = {
      currentStepIndex: 3,
      answers: { predict: { attempts: 2, value: 1, correct: true } },
      hintedStepIds: ['predict'],
      expandedMathStepIds: ['math'],
      completedSimulationStepIds: ['simulate'],
      recapCompleted: false,
    };
    const restored = createMissionSession(mission, saved);
    expect(restored).toMatchObject(saved);
    expect(missionReducer(createMissionSession(mission), { type: 'restore', saved })).toEqual(restored);
    expect(() => createMissionSession(mission, { ...saved, currentStepIndex: 99 })).toThrow(/step/i);
    expect(() => createMissionSession(mission, { ...saved, answers: { observe: { attempts: 1, value: 1, correct: true } } })).toThrow(/scored/i);
    expect(() => createMissionSession(mission, { ...saved, completedSimulationStepIds: ['predict'] })).toThrow(/simulation/i);
  });

  it('keeps the completion payload compatible with progress completion', () => {
    expectTypeOf<MissionCompletion>().toExtend<MissionCompletionInput>();
  });
});
