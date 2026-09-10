import { finalLessons } from '../content/final';
import { lessons as firstLessons } from '../content/foundations';
import { laterLessons } from '../content/later';
import { mathTutorials } from '../content/math';
import type { Assessment, LessonDefinition } from '../types';
import { createMathLayer } from './math-layers';
import type { CourseDefinition, MathLayer, MissionDefinition, MissionStep } from './types';

const legacyLessons = [...firstLessons, ...laterLessons, ...finalLessons];
const tutorialsById = new Map(mathTutorials.map(tutorial => [tutorial.id, tutorial]));

function missionMathLayer(lessonId: string, mathId: string, stepId: string): MathLayer {
  const tutorial = tutorialsById.get(mathId);
  if (!tutorial) throw new Error(`Foundations lesson ${lessonId} references unavailable math tutorial ${mathId}`);
  const layer = createMathLayer(tutorial);
  return {
    ...layer,
    foundation: {
      ...layer.foundation,
      prerequisites: layer.foundation.prerequisites.map(prerequisite => ({ ...prerequisite, returnTo: stepId })),
      returnTo: stepId,
      check: { ...layer.foundation.check, id: `${lessonId}-${layer.foundation.check.id}` },
    },
  };
}

function requireAssessment(lesson: LessonDefinition, index: number): Assessment {
  const assessment = lesson.assessments[index];
  if (!assessment) throw new Error(`Foundations lesson ${lesson.id} is missing legacy assessment ${index + 1}`);
  return assessment;
}

function adaptLesson(lesson: LessonDefinition): MissionDefinition {
  const mathSteps: MissionStep[] = lesson.math.map(mathId => {
    const id = `${lesson.id}-required-${mathId}`;
    return { id, kind: 'math', title: `Math for ${lesson.title}: ${tutorialsById.get(mathId)?.title ?? mathId}`, layer: missionMathLayer(lesson.id, mathId, id) };
  });
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
    steps: [
      { id: `${lesson.id}-observe`, kind: 'observe', title: 'Observe the question', body: [lesson.summary, lesson.prediction] },
      { id: `${lesson.id}-predict`, kind: 'predict', assessment: requireAssessment(lesson, 0) },
      { id: `${lesson.id}-simulate`, kind: 'simulate', modelId: lesson.family, prompt: lesson.experiment.join(' '), preset: lesson.preset },
      ...mathSteps,
      { id: `${lesson.id}-explain`, kind: 'explain', title: 'Explain the evidence', body: lesson.explanation },
      { id: `${lesson.id}-calculation-check`, kind: 'check', assessment: requireAssessment(lesson, 1) },
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