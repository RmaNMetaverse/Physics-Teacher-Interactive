import { describe, expect, it } from 'vitest';
import { createCourseCatalog } from '../src/learning/catalog';
import type { CourseDefinition, MathLayer, MissionDefinition } from '../src/learning/types';
import type { Assessment } from '../src/types';

const assessment: Assessment = {
  id: 'test-check', kind: 'concept', prompt: 'Which value is positive?', options: ['-1', '1'], answer: 1,
  hints: ['Compare each value with zero.'], explanation: 'One is greater than zero, so it is positive.',
};

const mathLayer: MathLayer = {
  quick: { equation: 'v=\\frac{d}{t}', summary: 'Speed is distance divided by time.', symbols: [
    { symbol: 'v', meaning: 'speed', unit: 'm/s' }, { symbol: 'd', meaning: 'distance', unit: 'm' }, { symbol: 't', meaning: 'time', unit: 's' },
  ] },
  foundation: {
    title: 'Division for speed', concepts: ['A rate compares one amount with another.'], explanation: ['Divide distance by elapsed time.'],
    visual: { kind: 'ratio', min: 1, max: 10, step: 1, initial: 2, instruction: 'Move the control to compare rates.' },
    workedExample: { question: 'What is 6 m divided by 2 s?', steps: ['Divide 6 by 2.'], answer: '3 m/s' }, check: assessment,
  },
};

function mission(id = 'motion-start'): MissionDefinition {
  return {
    id, kind: 'mission', title: 'Start with motion', summary: 'Observe a moving object.', objectives: ['Relate distance and time.'],
    minutes: 5, xp: 60, requiredMath: ['math-arithmetic'], modelId: 'motion', scienceStatus: 'established',
    steps: [
      { id: 'observe-motion', kind: 'observe', title: 'Watch', body: ['A cart moves along a straight track.'] },
      { id: 'predict-motion', kind: 'predict', assessment },
      { id: 'simulate-motion', kind: 'simulate', modelId: 'motion', prompt: 'Change the cart speed.', preset: { speed: 2 } },
      { id: 'math-motion', kind: 'math', title: 'Speed', layer: mathLayer },
      { id: 'check-motion', kind: 'check', assessment },
      { id: 'recap-motion', kind: 'recap', takeaways: ['Speed compares distance and time.'] },
    ],
    sources: [{ label: 'OpenStax University Physics', url: 'https://openstax.org/details/books/university-physics-volume-1' }],
    limitations: ['This model represents one-dimensional motion.'],
  };
}

function checkpoint(requiredMissionIds = ['motion-start'], id = 'motion-checkpoint'): MissionDefinition {
  return {
    id, kind: 'checkpoint', title: 'Motion checkpoint', summary: 'Show what you learned.', objectives: ['Check your motion reasoning.'],
    minutes: 5, xp: 20, requiredMath: ['math-arithmetic'], scienceStatus: 'established',
    checkpoint: { badgeId: 'motion-badge', requiredMissionIds },
    steps: [
      { id: 'observe-checkpoint', kind: 'observe', title: 'Review', body: ['Recall how speed changes.'] },
      { id: 'check-checkpoint', kind: 'check', assessment },
      { id: 'recap-checkpoint', kind: 'recap', takeaways: ['You can reason about motion.'] },
    ],
    sources: [{ label: 'OpenStax University Physics', url: 'https://openstax.org/details/books/university-physics-volume-1' }],
    limitations: ['This checkpoint samples only the ideas in this starter mission.'],
  };
}

function course(id = 'quantum', missionId = 'motion-start', recommendations: string[] = []): CourseDefinition {
  const normal = mission(missionId);
  return {
    id, title: 'Quantum Physics', description: 'A starter path for thinking about quantum physics.', group: 'modern', scope: 'Starter path', color: '#6d5efc',
    recommendations, access: 'open', estimatedMinutes: 10, missions: [normal, checkpoint([missionId], `${id}-checkpoint`)],
    sources: [{ label: 'OpenStax University Physics', url: 'https://openstax.org/details/books/university-physics-volume-3' }], limitations: ['This starter path is not complete subject coverage.'], reviewedAt: '2026-09-09',
  };
}

describe('course catalog validation', () => {
  it('creates open courses with readonly IDs and lookup helpers', () => {
    const catalog = createCourseCatalog([course()]);

    expect(catalog.getCourse('quantum').access).toBe('open');
    expect(catalog.getMission('quantum', 'motion-start').title).toBe('Start with motion');
    expect(catalog.ids.courses.has('quantum')).toBe(true);
    expect(catalog.ids.missions.has('quantum-checkpoint')).toBe(true);
    expect(catalog.ids.math.has('math-arithmetic')).toBe(true);
  });

  it('rejects duplicate mission IDs across a catalog', () => {
    const duplicateMissionCourse = course('quantum-two', 'motion-start');
    expect(() => createCourseCatalog([course(), duplicateMissionCourse])).toThrow(/duplicate mission/i);
  });

  it('rejects courses without a simulation', () => {
    const noSimulation = course();
    noSimulation.missions[0] = { ...noSimulation.missions[0], modelId: undefined, steps: noSimulation.missions[0].steps.filter(step => step.kind !== 'simulate') };
    expect(() => createCourseCatalog([noSimulation])).toThrow(/simulation/i);
  });

  it('rejects a math step without the expandable foundation layer', () => {
    const quickMathOnlyCourse = course();
    const steps = [...quickMathOnlyCourse.missions[0].steps];
    const mathIndex = steps.findIndex(step => step.kind === 'math');
    steps[mathIndex] = { ...steps[mathIndex] as Extract<typeof steps[number], { kind: 'math' }>, layer: { quick: mathLayer.quick } as MathLayer };
    quickMathOnlyCourse.missions[0] = { ...quickMathOnlyCourse.missions[0], steps };
    expect(() => createCourseCatalog([quickMathOnlyCourse])).toThrow(/expanded math/i);
  });

  it('rejects absent sources and model limitations', () => {
    const missingSources = course();
    missingSources.missions[0] = { ...missingSources.missions[0], sources: [] };
    expect(() => createCourseCatalog([missingSources])).toThrow(/sources/i);

    const missingLimitations = course();
    missingLimitations.limitations = [];
    expect(() => createCourseCatalog([missingLimitations])).toThrow(/limitations/i);
  });

  it('rejects checkpoints without valid badge rules', () => {
    const malformedCheckpointCourse = course();
    malformedCheckpointCourse.missions[1] = { ...malformedCheckpointCourse.missions[1], checkpoint: { badgeId: 'Motion Badge', requiredMissionIds: ['missing-mission'] } };
    expect(() => createCourseCatalog([malformedCheckpointCourse])).toThrow(/checkpoint/i);
  });

  it('rejects recommendation cycles while leaving recommendations non-blocking', () => {
    const quantum = course('quantum', 'quantum-start', ['relativity']);
    const relativity = course('relativity', 'relativity-start', ['quantum']);
    expect(() => createCourseCatalog([quantum, relativity])).toThrow(/recommendation cycle/i);
  });

  it('rejects unknown math and simulation references', () => {
    const unknownMath = course();
    unknownMath.missions[0] = { ...unknownMath.missions[0], requiredMath: ['math-not-published'] };
    expect(() => createCourseCatalog([unknownMath])).toThrow(/math/i);

    const unknownModel = course();
    unknownModel.missions[0] = { ...unknownModel.missions[0], modelId: 'not-a-model' as never };
    expect(() => createCourseCatalog([unknownModel])).toThrow(/model/i);
  });
});
