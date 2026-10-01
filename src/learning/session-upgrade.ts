import type { MissionDefinition } from './types';
import type { MissionSessionSaved } from './mission-engine';

export const MISSION_CURRICULUM_REVISION = 1;

/** Maps pre-contextual-math Foundations sessions to the new seven-stage journey. */
export function upgradeMissionSession(mission: MissionDefinition, saved: MissionSessionSaved, revision = 0): MissionSessionSaved {
  if (revision === MISSION_CURRICULUM_REVISION || mission.kind !== 'mission' || !mission.previousStepOrder) return saved;
  if (revision !== 0) throw new Error('Unsupported mission curriculum revision.');
  const math = mission.steps.find(step => step.kind === 'math');
  if (!math) return saved;
  const oldStep = mission.previousStepOrder[saved.currentStepIndex];
  if (!oldStep) throw new Error('Unknown previous mission step.');
  const oldCalculationId = `${mission.id}-calculation-check`;
  const oldMathIds = new Set((mission.historicalSteps ?? []).filter(step => step.kind === 'math').map(step => step.id));
  const target = oldMathIds.has(oldStep) || oldStep === oldCalculationId ? math.id : oldStep;
  const currentStepIndex = mission.steps.findIndex(step => step.id === target);
  if (currentStepIndex < 0) throw new Error('Previous mission step cannot be upgraded.');
  const answers = { ...saved.answers };
  // A generic arithmetic/algebra quiz does not prove the new applied question.
  for (const id of oldMathIds) delete answers[id];
  if (answers[oldCalculationId]) answers[math.id] = answers[oldCalculationId];
  delete answers[oldCalculationId];
  return {
    ...saved,
    currentStepIndex,
    answers,
    hintedStepIds: saved.hintedStepIds.filter(id => !oldMathIds.has(id)).map(id => id === oldCalculationId ? math.id : id),
    expandedMathStepIds: saved.expandedMathStepIds.length ? [math.id] : [],
  };
}
