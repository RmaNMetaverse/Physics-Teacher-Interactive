import { describe, expect, it } from 'vitest';
import { createCourseCatalog } from '../src/learning/catalog';
import { foundationCourse } from '../src/learning/foundations';
import { createMathLayer } from '../src/learning/math-layers';
import { lessons, mathTutorials } from '../src/content';

const equationCoverage: Record<string, string[]> = {
  'math-arithmetic': ['+', '\\times', '='],
  'math-signed-numbers': ['\\Delta x', 'x_f', 'x_i', '−', '='],
  'math-fractions': ['/', '+', '='],
  'math-decimals': ['.', '/', '='],
  'math-ratios': ['y', 'k', 'x', '\\times', '/', '='],
  'math-scientific-notation': ['\\times', '10', '^', '−', '='],
  'math-powers': ['r', '^', '\\times', '=', '\\sqrt{}'],
  'math-algebra': ['x', 'b', '+', '−', '/', '=', '\\Rightarrow'],
  'math-coordinates': ['\\Delta\\mathbf r', 'x_f', 'x_i', 'y_f', 'y_i', '−', '='],
  'math-functions': ['y', 'x', '\\times', '+', '='],
  'math-geometry': ['a', 'b', 'c', 'C', 'A', '\\pi', 'r', '^', '\\times', '='],
  'math-trigonometry': ['x', 'y', 'r', '\\cos', '\\sin', '\\theta', '\\times', '='],
  'math-vectors': ['a_x', 'a_y', 'b_x', 'b_y', '+', '='],
  'math-rates': ['\\text{slope}', 'y_2', 'y_1', 'x_2', 'x_1', '−', '/', '='],
  'math-accumulation': ['\\Delta x', 'v', '\\Delta t', '\\sum_i', 'v_i', '\\Delta t_i', '\\times', '\\approx', '='],
  'math-sine': ['x(t)', 'A', '\\sin', '\\omega', 't', '\\phi', 'T', '\\pi', '/', '+', '\\times', '='],
  'math-uncertainty': ['x', 'u', 'u_r', '|x|', '[,]', '+', '−', '/', '\\times', '%', '='],
};

describe('Foundations mission content', () => {
  it('provides a complete, non-dismissive zero-prior-knowledge layer for every published math tutorial', () => {
    expect(mathTutorials).toHaveLength(17);
    expect(Object.keys(equationCoverage).sort()).toEqual(mathTutorials.map(tutorial => tutorial.id).sort());
    for (const tutorial of mathTutorials) {
      const layer = createMathLayer(tutorial);
      expect(layer.quick.summary.length, tutorial.id).toBeLessThanOrEqual(240);
      expect(layer.quick.symbols.length, tutorial.id).toBeGreaterThan(0);
      expect(layer.foundation.concepts.length, tutorial.id).toBeGreaterThan(0);
      expect(layer.foundation.explanation.length, tutorial.id).toBeGreaterThanOrEqual(2);
      expect(layer.foundation.explanation.join(' '), tutorial.id).not.toMatch(/\b(simply|obviously|trivial)\b/i);
      expect(layer.foundation.visual.tutorialId, tutorial.id).toBe(tutorial.id);
      expect(layer.foundation.visual.label, tutorial.id).toBe(tutorial.interactive.label);
      expect(layer.foundation.visual.instruction, tutorial.id).not.toHaveLength(0);
      expect(layer.foundation.workedExample.steps.length, tutorial.id).toBeGreaterThanOrEqual(2);
      expect(layer.foundation.check.hints.length, tutorial.id).toBeGreaterThan(0);
      expect(layer.foundation.check.explanation.length, tutorial.id).toBeGreaterThan(20);
      expect(layer.foundation.prerequisites.map(prerequisite => prerequisite.id), tutorial.id).toEqual(tutorial.prerequisites);
      expect(layer.foundation.returnTo).toBe('current-mission-step');
      const defined = new Set(layer.quick.symbols.map(symbol => symbol.symbol));
      for (const token of equationCoverage[tutorial.id]) expect(defined, `${tutorial.id} must define ${token}`).toContain(token);
    }
  });

  it('adapts every legacy lesson into an instructional 60-XP mission without losing authored content', () => {
    expect(() => createCourseCatalog([foundationCourse])).not.toThrow();
    expect(foundationCourse.id).toBe('foundations');
    expect(foundationCourse.missions).toHaveLength(24);
    for (const legacy of lessons) {
      const mission = foundationCourse.missions.find(candidate => candidate.id === legacy.id);
      if (!mission || mission.kind !== 'mission') throw new Error(`Missing Foundations mission ${legacy.id}`);
      expect(mission.xp, legacy.id).toBe(60);
      expect(mission.equation, legacy.id).toBe(legacy.equation);
      expect(mission.symbols, legacy.id).toBe(legacy.symbols);
      expect(mission.workedExample, legacy.id).toEqual(legacy.workedExample);
      expect(mission.reviewedAt, legacy.id).toBe(legacy.reviewedAt);
      expect(mission.requiredMath, legacy.id).toEqual(legacy.math);
      expect(mission.sources, legacy.id).toEqual(legacy.references);
      expect(mission.limitations, legacy.id).toEqual(legacy.assumptions);
      expect(mission.steps.some(step => step.kind === 'simulate' && step.modelId === legacy.family && step.preset === legacy.preset), legacy.id).toBe(true);
      expect(mission.steps.find(step => step.kind === 'explain' && step.body === legacy.explanation), legacy.id).toBeDefined();
      expect(mission.steps.flatMap(step => step.kind === 'predict' || step.kind === 'check' ? [step.assessment] : []), legacy.id).toEqual(legacy.assessments);
      const mathSteps = mission.steps.filter(step => step.kind === 'math');
      expect(mathSteps.map(step => step.id.replace(`${legacy.id}-required-`, '')), legacy.id).toEqual(legacy.math);
      for (const step of mathSteps) {
        expect(step.layer.foundation.returnTo, step.id).toBe(step.id);
        expect(step.layer.foundation.prerequisites.every(prerequisite => prerequisite.returnTo === step.id), step.id).toBe(true);
      }
      expect(mission!.steps.map(step => step.kind), legacy.id).toEqual(['observe', 'predict', 'simulate', ...legacy.math.map(() => 'math'), 'explain', 'check', 'check', 'recap']);
    }
  });
});