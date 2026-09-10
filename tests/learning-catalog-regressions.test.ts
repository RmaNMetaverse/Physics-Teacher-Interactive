import { describe, expect, it } from 'vitest';
import { createCourseCatalog } from '../src/learning/catalog';
import type { CourseDefinition, MathLayer, MissionDefinition } from '../src/learning/types';
import type { Assessment } from '../src/types';

function assessment(id: string): Assessment {
  return { id, kind: 'concept', prompt: 'Which direction is positive?', options: ['Left', 'Right'], answer: 1, hints: ['Use the chosen axis.'], explanation: 'The positive direction is the one selected by the coordinate system.' };
}
function layer(checkId = 'math-check'): MathLayer {
  return {
    quick: { equation: 'x=x_0+vt', summary: 'Position changes with constant speed.', symbols: [{ symbol: 'x', meaning: 'position', unit: 'm' }] },
    foundation: {
      title: 'Position and speed', concepts: ['A signed position can be negative.'], explanation: ['Add the displacement to the starting position.'],
      visual: { tutorialId: 'math-arithmetic', label: 'Position control', kind: 'number', min: 0, max: 10, step: 1, initial: 2, instruction: 'Move the position marker.' },
      prerequisites: [], returnTo: 'instructional-math',
      workedExample: { question: 'Where is a cart after 2 m from x = 1 m?', steps: ['Add 1 m and 2 m.'], answer: '3 m' }, check: assessment(checkId),
    },
  };
}
function normalMission(): MissionDefinition {
  return {
    id: 'instructional-motion', kind: 'mission', title: 'Instructional motion', summary: 'Build a motion explanation.', objectives: ['Connect position and speed.'],
    minutes: 5, xp: 60, requiredMath: ['math-arithmetic'], modelId: 'motion', scienceStatus: 'established', equation: 'x=x', symbols: 'x: test value.', workedExample: { question: 'What equals itself?', steps: ['Read both sides.'], answer: 'x' }, reviewedAt: '2026-09-09',
    steps: [
      { id: 'instructional-observe', kind: 'observe', title: 'Observe', body: ['A cart moves on a line.'] },
      { id: 'instructional-predict', kind: 'predict', assessment: assessment('prediction-check') },
      { id: 'instructional-simulate', kind: 'simulate', modelId: 'motion', prompt: 'Change the starting speed.', preset: { speed: 2 } },
      { id: 'instructional-math', kind: 'math', title: 'Position equation', layer: layer() },
      { id: 'instructional-explain', kind: 'explain', title: 'Explain', body: ['The equation connects the observed displacement to time.'] },
      { id: 'instructional-check', kind: 'check', assessment: assessment('final-check') },
      { id: 'instructional-recap', kind: 'recap', takeaways: ['Position depends on where measurement begins.'] },
    ],
    sources: [{ label: 'OpenStax University Physics', url: 'https://openstax.org/details/books/university-physics-volume-1' }], limitations: ['The model is one-dimensional.'],
  };
}
function checkpoint(): MissionDefinition {
  return {
    id: 'instructional-checkpoint', kind: 'checkpoint', title: 'Checkpoint', summary: 'Confirm motion understanding.', objectives: ['Check core reasoning.'], minutes: 5, xp: 20,
    requiredMath: [], scienceStatus: 'established', checkpoint: { badgeId: 'instructional-badge', requiredMissionIds: ['instructional-motion'] },
    steps: [
      { id: 'checkpoint-observe', kind: 'observe', title: 'Review', body: ['Recall the motion relationship.'] },
      { id: 'checkpoint-check', kind: 'check', assessment: assessment('checkpoint-check') },
      { id: 'checkpoint-recap', kind: 'recap', takeaways: ['You checked the course checkpoint.'] },
    ],
    sources: [{ label: 'OpenStax University Physics', url: 'https://openstax.org/details/books/university-physics-volume-1' }], limitations: ['The checkpoint samples the course mission.'],
  };
}
function course(): CourseDefinition {
  return {
    id: 'instructional-course', title: 'Instructional course', description: 'A catalog validation fixture.', group: 'foundations', scope: 'Starter path', color: '#6d5efc', recommendations: [], access: 'open', estimatedMinutes: 10,
    missions: [normalMission(), checkpoint()], sources: [{ label: 'OpenStax University Physics', url: 'https://openstax.org/details/books/university-physics-volume-1' }], limitations: ['This is test content.'], reviewedAt: '2026-09-09',
  };
}

describe('catalog regression coverage', () => {
  it('accepts negative math visual ranges and rejects non-finite range values', () => {
    const negativeRange = course();
    const math = negativeRange.missions[0].steps.find(step => step.kind === 'math');
    if (!math || math.kind !== 'math') throw new Error('Missing math fixture');
    math.layer.foundation.visual = { ...math.layer.foundation.visual, min: -10, max: 10, initial: -2 };
    expect(() => createCourseCatalog([negativeRange])).not.toThrow();

    const nonFiniteRange = course();
    const nonFiniteMath = nonFiniteRange.missions[0].steps.find(step => step.kind === 'math');
    if (!nonFiniteMath || nonFiniteMath.kind !== 'math') throw new Error('Missing math fixture');
    nonFiniteMath.layer.foundation.visual = { ...nonFiniteMath.layer.foundation.visual, max: Number.NaN };
    expect(() => createCourseCatalog([nonFiniteRange])).toThrow(/finite/i);
  });

  it('rejects non-kebab and duplicate assessment IDs, including nested math checks', () => {
    const nonKebab = course();
    const prediction = nonKebab.missions[0].steps.find(step => step.kind === 'predict');
    if (!prediction || prediction.kind !== 'predict') throw new Error('Missing prediction fixture');
    prediction.assessment = { ...prediction.assessment, id: 'Not valid' };
    expect(() => createCourseCatalog([nonKebab])).toThrow(/kebab-case/i);

    const duplicate = course();
    const duplicateMath = duplicate.missions[0].steps.find(step => step.kind === 'math');
    if (!duplicateMath || duplicateMath.kind !== 'math') throw new Error('Missing math fixture');
    duplicateMath.layer.foundation.check = assessment('prediction-check');
    expect(() => createCourseCatalog([duplicate])).toThrow(/duplicate assessment/i);
  });

  it('requires normal missions to include equation, worked example, explanation, and three assessments', () => {
    const withoutEquation = course();
    withoutEquation.missions[0].steps = withoutEquation.missions[0].steps.filter(step => step.kind !== 'math');
    expect(() => createCourseCatalog([withoutEquation])).toThrow(/equation/i);

    const withoutWorkedExample = course();
    const workedExampleMath = withoutWorkedExample.missions[0].steps.find(step => step.kind === 'math');
    if (!workedExampleMath || workedExampleMath.kind !== 'math') throw new Error('Missing math fixture');
    workedExampleMath.layer.foundation.workedExample = undefined as never;
    expect(() => createCourseCatalog([withoutWorkedExample])).toThrow(/worked example/i);

    const withoutExplanation = course();
    withoutExplanation.missions[0].steps = withoutExplanation.missions[0].steps.filter(step => step.kind !== 'explain');
    expect(() => createCourseCatalog([withoutExplanation])).toThrow(/explanation/i);

    const tooFewAssessments = course();
    tooFewAssessments.missions[0].steps = tooFewAssessments.missions[0].steps.filter(step => step.kind !== 'check');
    expect(() => createCourseCatalog([tooFewAssessments])).toThrow(/three assessments/i);
  });

  it('keeps checkpoint validation separate from normal mission instructional requirements', () => {
    expect(() => createCourseCatalog([course()])).not.toThrow();
  });
  it('requires math visual identity and a prerequisite return target matching its containing step', () => {
    const missingIdentity = course();
    const missingIdentityMath = missingIdentity.missions[0].steps.find(step => step.kind === 'math');
    if (!missingIdentityMath || missingIdentityMath.kind !== 'math') throw new Error('Missing math fixture');
    delete (missingIdentityMath.layer.foundation.visual as { tutorialId?: string }).tutorialId;
    expect(() => createCourseCatalog([missingIdentity])).toThrow(/tutorial ID/i);

    const wrongReturn = course();
    const wrongReturnMath = wrongReturn.missions[0].steps.find(step => step.kind === 'math');
    if (!wrongReturnMath || wrongReturnMath.kind !== 'math') throw new Error('Missing math fixture');
    wrongReturnMath.layer.foundation.returnTo = 'another-math-step';
    expect(() => createCourseCatalog([wrongReturn])).toThrow(/return target/i);
  });

  it('rejects duplicate checkpoint badge IDs across courses', () => {
    const first = course();
    const second = course();
    second.id = 'second-course';
    for (const mission of second.missions) {
      mission.id = 'second-' + mission.id;
      if (mission.kind === 'checkpoint') {
        mission.checkpoint = {
          ...mission.checkpoint,
          requiredMissionIds: mission.checkpoint.requiredMissionIds.map(id => 'second-' + id),
        };
      }
      for (const step of mission.steps) {
        step.id = 'second-' + step.id;
        if (step.kind === 'predict' || step.kind === 'check') {
          step.assessment = { ...step.assessment, id: 'second-' + step.assessment.id };
        }
        if (step.kind === 'math') {
          step.layer.foundation = {
            ...step.layer.foundation,
            returnTo: step.id,
            prerequisites: step.layer.foundation.prerequisites.map(prerequisite => ({ ...prerequisite, returnTo: step.id })),
            check: { ...step.layer.foundation.check, id: 'second-' + step.layer.foundation.check.id },
          };
        }
      }
    }

    expect(() => createCourseCatalog([first, second])).toThrow(/duplicate badge/i);
  });
});
