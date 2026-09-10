import type { MathTutorialDefinition } from '../types';
import type { MathLayer } from './types';

/** Turns one published tutorial into the concise and expandable teaching views used in a mission. */
export function createMathLayer(tutorial: MathTutorialDefinition): MathLayer {
  return {
    quick: {
      equation: tutorial.equation,
      summary: tutorial.summary,
      symbols: tutorial.symbols,
    },
    foundation: {
      title: tutorial.title,
      concepts: tutorial.concepts,
      explanation: tutorial.explanation,
      prerequisites: tutorial.prerequisites.map(id => ({ id, returnTo: 'current-mission-step' as const })),
      returnTo: 'current-mission-step',
      visual: {
        tutorialId: tutorial.id,
        label: tutorial.interactive.label,
        kind: tutorial.interactive.kind,
        min: tutorial.interactive.min,
        max: tutorial.interactive.max,
        step: tutorial.interactive.step,
        initial: tutorial.interactive.initial,
        instruction: tutorial.interactive.instruction,
      },
      workedExample: tutorial.workedExample,
      check: tutorial.assessment,
    },
  };
}