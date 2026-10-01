import { finalLessons } from '../content/final';
import { lessons as firstLessons } from '../content/foundations';
import { laterLessons } from '../content/later';
import { mathTutorials } from '../content/math';
import type { Assessment, LessonDefinition } from '../types';
import type { CourseDefinition, MathLayer, MissionDefinition, MissionStep } from './types';
import { biteSizedExplanation } from './concise';

const legacyLessons = [...firstLessons, ...laterLessons, ...finalLessons];
const tutorialsById = new Map(mathTutorials.map(tutorial => [tutorial.id, tutorial]));

function missionMathLayer(lesson: LessonDefinition, mathId: string, stepId: string): MathLayer {
  const tutorial = tutorialsById.get(mathId);
  if (!tutorial) throw new Error(`Foundations lesson ${lesson.id} references unavailable math tutorial ${mathId}`);
  return {
    quick: {
      equation: lesson.equation,
      summary: lesson.summary,
      symbols: lesson.symbols.split(';').map(definition => {
        const colon = definition.indexOf(':');
        return colon >= 0 ? { symbol: definition.slice(0, colon).trim(), meaning: definition.slice(colon + 1).trim() }
          : { symbol: '=', meaning: definition.trim() };
      }),
    },
    foundation: {
      title: `Apply the math: ${lesson.title.toLowerCase()}`,
      concepts: lesson.objectives,
      explanation: lesson.explanation,
      prerequisites: lesson.math.map(id => ({ id, returnTo: stepId })),
      returnTo: stepId,
      visual: { ...tutorial.interactive, tutorialId: tutorial.id, optionalRefresher: true },
      workedExample: lesson.workedExample,
      check: requireAssessment(lesson, 1),
    },
  };
}

function requireAssessment(lesson: LessonDefinition, index: number): Assessment {
  const assessment = lesson.assessments[index];
  if (!assessment) throw new Error(`Foundations lesson ${lesson.id} is missing legacy assessment ${index + 1}`);
  return assessment;
}

function adaptLesson(lesson: LessonDefinition): MissionDefinition {
  const mathId = lesson.math[0];
  const mathStepId = `${lesson.id}-required-${mathId}`;
  const oldMathIds = lesson.math.map(id => `${lesson.id}-required-${id}`);
  const mathStep: MissionStep = { id: mathStepId, kind: 'math', title: `Math in context: ${lesson.title}`, layer: missionMathLayer(lesson, mathId, mathStepId) };
  return {
    id: lesson.id,
    kind: 'mission',
    title: lesson.title,
    summary: lesson.summary,
    objectives: lesson.objectives,
    minutes: lesson.minutes,
    xp: 60,
    requiredMath: lesson.math,
    modelId: lesson.family,
    scienceStatus: 'established',
    equation: lesson.equation,
    symbols: lesson.symbols,
    workedExample: lesson.workedExample,
    reviewedAt: lesson.reviewedAt,
    detailedExplanation: lesson.explanation,
    historicalSteps: [
      ...oldMathIds.map(id => ({ id, kind: 'math' as const })),
      { id: `${lesson.id}-calculation-check`, kind: 'check' },
    ],
    previousStepOrder: [
      `${lesson.id}-observe`, `${lesson.id}-predict`, `${lesson.id}-simulate`, ...oldMathIds,
      `${lesson.id}-explain`, `${lesson.id}-calculation-check`, `${lesson.id}-experiment-check`, `${lesson.id}-recap`,
    ],
    steps: [
      { id: `${lesson.id}-observe`, kind: 'observe', title: 'Observe the question', body: [lesson.summary] },
      { id: `${lesson.id}-predict`, kind: 'predict', assessment: requireAssessment(lesson, 0) },
      { id: `${lesson.id}-simulate`, kind: 'simulate', modelId: lesson.family, prompt: lesson.experiment.join(' '), preset: lesson.preset },
      { id: `${lesson.id}-explain`, kind: 'explain', title: 'Explain the evidence', body: biteSizedExplanation(lesson.explanation, lesson.summary) },
      mathStep,
      { id: `${lesson.id}-experiment-check`, kind: 'check', assessment: requireAssessment(lesson, 2) },
      { id: `${lesson.id}-recap`, kind: 'recap', takeaways: lesson.objectives },
    ],
    sources: lesson.references,
    limitations: lesson.assumptions,
  };
}

export const foundationCourse: CourseDefinition = {
  id: 'foundations',
  title: 'Physics Foundations',
  description: 'A complete mission-based introduction to measurement, motion, forces, energy, momentum, gravity, and oscillations.',
  group: 'foundations',
  scope: 'Released foundations course',
  color: '#6d5efc',
  recommendations: [],
  access: 'open',
  estimatedMinutes: legacyLessons.reduce((total, lesson) => total + lesson.minutes, 0),
  missions: legacyLessons.map(adaptLesson),
  sources: legacyLessons.flatMap(lesson => lesson.references),
  limitations: ['Each mission records the approximation limits for its own model and evidence.'],
  reviewedAt: '2026-09-09',
};
