import { describe, expect, it } from 'vitest';
import { courses, courseCatalog } from '../src/learning/catalog';
import { mathTutorials } from '../src/content/math';
import { checkAnswer } from '../src/lib/assessment';

describe('lesson-specific mathematics across the published curriculum', () => {
  it('uses one applied math step per lesson, with distinct checks rather than copied refresher quizzes', () => {
    const prompts = new Set<string>();
    const refresherPrompts = new Set(mathTutorials.map(tutorial => tutorial.assessment.prompt));
    for (const course of courses) for (const mission of course.missions) {
      if (mission.kind !== 'mission') continue;
      const steps = mission.steps.filter(step => step.kind === 'math');
      expect(steps, mission.id).toHaveLength(1);
      const layer = steps[0].layer;
      expect(layer.quick.equation, mission.id).toBe(mission.equation);
      expect(layer.foundation.prerequisites.map(item => item.id), mission.id).toEqual(mission.requiredMath);
      expect(refresherPrompts.has(layer.foundation.check.prompt), mission.id).toBe(false);
      expect(prompts.has(layer.foundation.check.prompt), mission.id).toBe(false);
      prompts.add(layer.foundation.check.prompt);
      expect(checkAnswer(layer.foundation.check, layer.foundation.check.answer).correct, mission.id).toBe(true);
      expect(layer.foundation.workedExample, mission.id).toEqual(mission.workedExample);
      const assessments = mission.steps.flatMap(step => step.kind === 'predict' || step.kind === 'check'
        ? [step.assessment] : step.kind === 'math' ? [step.layer.foundation.check] : []);
      expect(assessments, mission.id).toHaveLength(3);
      expect(new Set(assessments.map(item => item.prompt)).size, mission.id).toBe(3);
    }
  });

  it('teaches and checks friction instead of a detached algebra exercise', () => {
    const mission = courseCatalog.getMission('foundations', 'friction');
    const math = mission.steps.find(step => step.kind === 'math')!;
    if (math.kind !== 'math') throw new Error('Missing friction math');
    expect(math.layer.quick.equation).toContain('mu');
    expect(math.layer.foundation.check.prompt).toMatch(/friction/i);
    expect(math.layer.foundation.check.answer).toBe(9);
    expect(JSON.stringify(math.layer)).not.toContain('2x+3');
    expect(math.layer.foundation.prerequisites.map(item => item.id)).toContain('math-algebra');
  });
});
