import { describe, expect, it } from 'vitest';
import { createCourseCatalog } from '../src/learning/catalog';
import { foundationCourse } from '../src/learning/foundations';
import { createMathLayer } from '../src/learning/math-layers';
import { lessons, mathTutorials } from '../src/content';

describe('Foundations mission content', () => {
  it('provides a complete, non-dismissive zero-prior-knowledge layer for every published math tutorial', () => {
    expect(mathTutorials).toHaveLength(17);
    for (const tutorial of mathTutorials) {
      const layer = createMathLayer(tutorial);
      expect(layer.quick.summary.length, tutorial.id).toBeLessThanOrEqual(240);
      expect(layer.quick.symbols.length, tutorial.id).toBeGreaterThan(0);
      expect(layer.foundation.concepts.length, tutorial.id).toBeGreaterThan(0);
      expect(layer.foundation.explanation.length, tutorial.id).toBeGreaterThanOrEqual(2);
      expect(layer.foundation.explanation.join(' '), tutorial.id).not.toMatch(/\b(simply|obviously|trivial)\b/i);
      expect(layer.foundation.visual.instruction, tutorial.id).not.toHaveLength(0);
      expect(layer.foundation.workedExample.steps.length, tutorial.id).toBeGreaterThanOrEqual(2);
      expect(layer.foundation.check.hints.length, tutorial.id).toBeGreaterThan(0);
      expect(layer.foundation.check.explanation.length, tutorial.id).toBeGreaterThan(20);
      expect(layer.foundation.prerequisites?.map(prerequisite => prerequisite.id), tutorial.id).toEqual(tutorial.prerequisites);
      expect(layer.foundation.returnTo).toBe('current-mission-step');
    }
  });

  it('adapts every legacy lesson into an instructional 60-XP mission without losing authored content', () => {
    expect(() => createCourseCatalog([foundationCourse])).not.toThrow();
    expect(foundationCourse.id).toBe('foundations');
    expect(foundationCourse.missions).toHaveLength(24);
    for (const legacy of lessons) {
      const mission = foundationCourse.missions.find(candidate => candidate.id === legacy.id);
      expect(mission, legacy.id).toBeDefined();
      expect(mission!.xp, legacy.id).toBe(60);
      expect(mission!.requiredMath, legacy.id).toEqual(legacy.math);
      expect(mission!.sources, legacy.id).toEqual(legacy.references);
      expect(mission!.limitations, legacy.id).toEqual(legacy.assumptions);
      expect(mission!.steps.some(step => step.kind === 'simulate' && step.modelId === legacy.family && step.preset === legacy.preset), legacy.id).toBe(true);
      expect(mission!.steps.find(step => step.kind === 'explain' && step.body === legacy.explanation), legacy.id).toBeDefined();
      expect(mission!.steps.flatMap(step => step.kind === 'predict' || step.kind === 'check' ? [step.assessment] : []), legacy.id).toEqual(legacy.assessments);
      const mathSteps = mission!.steps.filter(step => step.kind === 'math');
      expect(mathSteps.map(step => step.id.replace(`${legacy.id}-required-`, '')), legacy.id).toEqual(legacy.math);
      expect(mission!.steps.map(step => step.kind), legacy.id).toEqual(['observe', 'predict', 'simulate', ...legacy.math.map(() => 'math'), 'explain', 'check', 'check', 'recap']);
    }
  });
});
