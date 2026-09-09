import type { Assessment, LessonDefinition } from '../types';

export const concept = (prompt: string, options: string[], answer: number, hint: string, explanation: string): Assessment => ({ id: '', kind: 'concept', prompt, options, answer, hints: [hint], explanation });
export const numeric = (kind: 'calculation' | 'experiment', prompt: string, answer: number, unit: string, hint: string, explanation: string, tolerance = 0.02): Assessment => ({ id: '', kind, prompt, answer, unit, tolerance, hints: [hint], explanation });
type Draft = Omit<LessonDefinition, 'reviewedAt' | 'references' | 'level' | 'assessments'> & { source: string; assessments: Assessment[] };
export function defineLesson({ source, ...lesson }: Draft): LessonDefinition {
  return { ...lesson, level: 'Foundations', reviewedAt: '2026-09-09', references: [{ label: 'OpenStax · University Physics Volume 1 · ' + source.replaceAll('-', ' '), url: 'https://openstax.org/books/university-physics-volume-1/pages/' + source }], assessments: lesson.assessments.map(a => ({ ...a, id: `${lesson.id}-${a.kind}` })) };
}
