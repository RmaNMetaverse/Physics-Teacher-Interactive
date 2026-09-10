import { checkAnswer } from '../lib/assessment';
import type { MissionCompletionInput, StarCount } from '../progress/types';
import type { Assessment } from '../types';
import type { MissionDefinition, MissionStep } from './types';

export interface MissionAnswer {
  attempts: number;
  value: number | string;
  correct: boolean;
}

/** Serializable mission-local state. Storage is deliberately left to the progress layer. */
export interface MissionSessionSaved {
  currentStepIndex: number;
  answers: Record<string, MissionAnswer>;
  hintedStepIds: string[];
  expandedMathStepIds: string[];
  completedSimulationStepIds: string[];
  recapCompleted: boolean;
}

export interface MissionSession extends MissionSessionSaved {
  mission: MissionDefinition;
  canAdvance: boolean;
  isComplete: boolean;
}

/** A completed mission can be passed directly to the version-2 progress reducer. */
export interface MissionCompletion extends MissionCompletionInput {
  attempts: Record<string, number>;
  answers: Record<string, number | string>;
  completedMathStepIds: string[];
}

export type MissionAction =
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'goto'; index: number }
  | { type: 'answer'; stepId: string; value: number | string }
  | { type: 'request-hint'; stepId: string }
  | { type: 'toggle-math-foundation'; stepId: string }
  | { type: 'complete-simulation'; stepId: string }
  | { type: 'restore'; saved: MissionSessionSaved };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}

function hasExactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort(), expected = [...keys].sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function assertMission(mission: MissionDefinition): void {
  if (!mission || !Array.isArray(mission.steps) || mission.steps.length === 0) throw new Error('Mission must contain at least one step.');
  const ids = new Set<string>();
  for (const step of mission.steps) {
    if (!step || typeof step.id !== 'string' || step.id.trim() === '') throw new Error('Mission step ID is invalid.');
    if (ids.has(step.id)) throw new Error(`Mission step ID ${step.id} is duplicated.`);
    ids.add(step.id);
  }
  if (mission.steps.at(-1)?.kind !== 'recap') throw new Error('Mission must end with a recap step.');
}

function stepAt(mission: MissionDefinition, index: number): MissionStep {
  if (!Number.isSafeInteger(index) || index < 0 || index >= mission.steps.length) throw new Error('Mission step index is invalid.');
  return mission.steps[index];
}

function stepById(mission: MissionDefinition, stepId: string): MissionStep {
  if (typeof stepId !== 'string') throw new Error('Mission step ID is invalid.');
  const step = mission.steps.find(candidate => candidate.id === stepId);
  if (!step) throw new Error(`Mission step ${stepId} is unknown.`);
  return step;
}

function assessmentFor(step: MissionStep): Assessment | undefined {
  if (step.kind === 'predict' || step.kind === 'check') return step.assessment;
  if (step.kind === 'math') return step.layer.foundation.check;
  return undefined;
}

function scoredStepIds(mission: MissionDefinition): Set<string> {
  return new Set(mission.steps.filter(step => assessmentFor(step) !== undefined).map(step => step.id));
}

function simulationStepIds(mission: MissionDefinition): Set<string> {
  return new Set(mission.steps.filter(step => step.kind === 'simulate').map(step => step.id));
}

function mathStepIds(mission: MissionDefinition): Set<string> {
  return new Set(mission.steps.filter(step => step.kind === 'math').map(step => step.id));
}

function assertUniqueIds(value: unknown, allowed: ReadonlySet<string>, label: string): string[] {
  if (!Array.isArray(value) || !value.every(item => typeof item === 'string') || new Set(value).size !== value.length || !value.every(item => allowed.has(item))) throw new Error(`${label} contains an invalid step ID.`);
  return [...value];
}

function answerForRestore(value: unknown, step: MissionStep): MissionAnswer {
  if (!isRecord(value) || !hasExactKeys(value, ['attempts', 'correct', 'value'])) throw new Error(`Answer for step ${step.id} is invalid.`);
  const attempts = value.attempts, answer = value.value, correct = value.correct;
  if (typeof attempts !== 'number' || !Number.isSafeInteger(attempts) || attempts <= 0) throw new Error(`Answer attempts for step ${step.id} are invalid.`);
  if (typeof answer !== 'string' && (typeof answer !== 'number' || !Number.isFinite(answer))) throw new Error(`Answer value for step ${step.id} must be finite.`);
  if (typeof correct !== 'boolean') throw new Error(`Answer correctness for step ${step.id} is invalid.`);
  const assessment = assessmentFor(step);
  if (!assessment) throw new Error(`Mission step ${step.id} is not scored.`);
  if (checkAnswer(assessment, answer).correct !== correct) throw new Error(`Answer correctness for step ${step.id} does not match its assessment.`);
  return { attempts, value: answer, correct };
}

function assertCompletionReady(mission: MissionDefinition, saved: MissionSessionSaved): void {
  for (const step of mission.steps) {
    if (assessmentFor(step) && !saved.answers[step.id]?.correct) throw new Error('Mission cannot complete before every scored step is correct.');
    if (step.kind === 'simulate' && !saved.completedSimulationStepIds.includes(step.id)) throw new Error('Mission cannot complete before every simulation is complete.');
  }
}

function validateSaved(mission: MissionDefinition, value: unknown): MissionSessionSaved {
  assertMission(mission);
  if (!isRecord(value) || !hasExactKeys(value, ['answers', 'completedSimulationStepIds', 'currentStepIndex', 'expandedMathStepIds', 'hintedStepIds', 'recapCompleted'])) throw new Error('Saved mission session has an invalid shape.');
  const currentStepIndex = value.currentStepIndex;
  if (typeof currentStepIndex !== 'number') throw new Error('Saved mission step index is invalid.');
  stepAt(mission, currentStepIndex);
  const scored = scoredStepIds(mission), simulations = simulationStepIds(mission), math = mathStepIds(mission);
  if (!isRecord(value.answers)) throw new Error('Saved mission answers are invalid.');
  const answers: Record<string, MissionAnswer> = {};
  for (const [stepId, answer] of Object.entries(value.answers)) answers[stepById(mission, stepId).id] = answerForRestore(answer, stepById(mission, stepId));
  if (!Object.keys(answers).every(stepId => scored.has(stepId))) throw new Error('Saved mission answers contain a non-scored step.');
  const saved: MissionSessionSaved = {
    currentStepIndex,
    answers,
    hintedStepIds: assertUniqueIds(value.hintedStepIds, scored, 'Saved mission hints'),
    expandedMathStepIds: assertUniqueIds(value.expandedMathStepIds, math, 'Saved expanded math'),
    completedSimulationStepIds: assertUniqueIds(value.completedSimulationStepIds, simulations, 'Saved simulations'),
    recapCompleted: value.recapCompleted === true,
  };
  if (typeof value.recapCompleted !== 'boolean') throw new Error('Saved recap completion is invalid.');
  if (saved.recapCompleted) assertCompletionReady(mission, saved);
  return saved;
}

function canAdvance(mission: MissionDefinition, saved: MissionSessionSaved): boolean {
  const step = stepAt(mission, saved.currentStepIndex), assessment = assessmentFor(step);
  if (assessment) return saved.answers[step.id]?.correct === true;
  if (step.kind === 'simulate') return saved.completedSimulationStepIds.includes(step.id);
  return true;
}

function session(mission: MissionDefinition, saved: MissionSessionSaved): MissionSession {
  const restored = validateSaved(mission, saved);
  return { mission, ...restored, canAdvance: canAdvance(mission, restored), isComplete: restored.recapCompleted };
}

function savedState(state: MissionSession): MissionSessionSaved {
  return {
    currentStepIndex: state.currentStepIndex,
    answers: { ...state.answers },
    hintedStepIds: [...state.hintedStepIds],
    expandedMathStepIds: [...state.expandedMathStepIds],
    completedSimulationStepIds: [...state.completedSimulationStepIds],
    recapCompleted: state.recapCompleted,
  };
}

function assertState(state: MissionSession): void {
  if (!isRecord(state) || !state.mission) throw new Error('Mission session is invalid.');
  const checked = session(state.mission, savedState(state));
  if (state.canAdvance !== checked.canAdvance || state.isComplete !== checked.isComplete) throw new Error('Mission session derived state is invalid.');
}

function replace(state: MissionSession, update: Partial<MissionSessionSaved>): MissionSession {
  return session(state.mission, { ...savedState(state), ...update });
}

export function createMissionSession(mission: MissionDefinition, saved?: MissionSessionSaved): MissionSession {
  const initial: MissionSessionSaved = { currentStepIndex: 0, answers: {}, hintedStepIds: [], expandedMathStepIds: [], completedSimulationStepIds: [], recapCompleted: false };
  return session(mission, saved ?? initial);
}

export function missionReducer(state: MissionSession, action: MissionAction): MissionSession {
  assertState(state);
  if (!isRecord(action) || typeof action.type !== 'string') throw new Error('Mission action is invalid.');
  const current = stepAt(state.mission, state.currentStepIndex);
  switch (action.type) {
    case 'next':
      if (!state.canAdvance) throw new Error('The current mission step cannot advance yet.');
      if (current.kind === 'recap') {
        if (state.recapCompleted) throw new Error('Mission recap is already complete.');
        assertCompletionReady(state.mission, savedState(state));
        return replace(state, { recapCompleted: true });
      }
      return replace(state, { currentStepIndex: state.currentStepIndex + 1 });
    case 'back':
      if (state.currentStepIndex === 0) throw new Error('The first mission step has no previous step.');
      return replace(state, { currentStepIndex: state.currentStepIndex - 1 });
    case 'goto':
      stepAt(state.mission, action.index);
      return replace(state, { currentStepIndex: action.index });
    case 'answer': {
      const step = stepById(state.mission, action.stepId), assessment = assessmentFor(step);
      if (!assessment) throw new Error(`Mission step ${action.stepId} is not scored.`);
      if (typeof action.value !== 'string' && (typeof action.value !== 'number' || !Number.isFinite(action.value))) throw new Error('Answer value must be finite.');
      const prior = state.answers[step.id], checked = checkAnswer(assessment, action.value);
      return replace(state, { answers: { ...state.answers, [step.id]: { attempts: (prior?.attempts ?? 0) + 1, value: action.value, correct: checked.correct } } });
    }
    case 'request-hint': {
      const step = stepById(state.mission, action.stepId);
      if (!assessmentFor(step)) throw new Error(`Mission step ${action.stepId} is not scored.`);
      return state.hintedStepIds.includes(step.id) ? state : replace(state, { hintedStepIds: [...state.hintedStepIds, step.id] });
    }
    case 'toggle-math-foundation': {
      const step = stepById(state.mission, action.stepId);
      if (step.kind !== 'math') throw new Error(`Mission step ${action.stepId} is not a math step.`);
      const expanded = state.expandedMathStepIds.includes(step.id)
        ? state.expandedMathStepIds.filter(stepId => stepId !== step.id)
        : [...state.expandedMathStepIds, step.id];
      return replace(state, { expandedMathStepIds: expanded });
    }
    case 'complete-simulation': {
      const step = stepById(state.mission, action.stepId);
      if (step.kind !== 'simulate') throw new Error(`Mission step ${action.stepId} is not a simulation step.`);
      if (state.completedSimulationStepIds.includes(step.id)) throw new Error(`Simulation step ${action.stepId} is already complete.`);
      return replace(state, { completedSimulationStepIds: [...state.completedSimulationStepIds, step.id] });
    }
    case 'restore':
      return createMissionSession(state.mission, action.saved);
    default:
      throw new Error('Mission action is unknown.');
  }
}

export function calculateStars(state: MissionSession): StarCount {
  assertState(state);
  if (!state.isComplete) throw new Error('Mission must be complete before stars are calculated.');
  const scored = [...scoredStepIds(state.mission)];
  if (state.hintedStepIds.length > 0) return 1;
  return scored.every(stepId => state.answers[stepId]?.attempts === 1) ? 3 : 2;
}

export function createMissionCompletion(state: MissionSession, courseId: string): MissionCompletion {
  if (typeof courseId !== 'string' || courseId.trim() === '') throw new Error('Course ID is required for mission completion.');
  const stars = calculateStars(state), attempts: Record<string, number> = {}, answers: Record<string, number | string> = {};
  for (const [stepId, answer] of Object.entries(state.answers)) {
    attempts[stepId] = answer.attempts;
    answers[stepId] = answer.value;
  }
  return { courseId, missionId: state.mission.id, stars, attempts, answers, completedMathStepIds: state.mission.steps.filter(step => step.kind === 'math' && state.answers[step.id]?.correct).map(step => step.id) };
}
