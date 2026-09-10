import katex from 'katex';
import { mathTutorials } from '../content/math';
import { simulations } from '../physics';
import type { Assessment, Parameters } from '../types';
import type { CheckpointRules, CourseCatalog, CourseDefinition, MathLayer, MissionDefinition, MissionStep, ModelId, SourceReference } from './types';

const kebabCase = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const validMathIds = new Set(mathTutorials.map(tutorial => tutorial.id));
const validModelIds = new Set(Object.keys(simulations) as ModelId[]);

function fail(message: string): never { throw new Error(`Invalid course catalog: ${message}`); }
function requireText(value: unknown, context: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') fail(`${context} must be non-empty text`);
}
function requireId(value: unknown, context: string): asserts value is string {
  requireText(value, context);
  if (!kebabCase.test(value)) fail(`${context} must be kebab-case`);
}
function requireFinitePositive(value: unknown, context: string, allowZero = false): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value) || (allowZero ? value < 0 : value <= 0)) fail(`${context} must be a finite ${allowZero ? 'non-negative' : 'positive'} number`);
}
function requireFinite(value: unknown, context: string): asserts value is number {
  if (typeof value !== 'number' || !Number.isFinite(value)) fail(`${context} must be finite`);
}
function requireTextList(value: unknown, context: string): asserts value is string[] {
  if (!Array.isArray(value) || value.length === 0) fail(`${context} must contain at least one item`);
  value.forEach((item, index) => requireText(item, `${context}[${index}]`));
}
function validateSources(sources: SourceReference[], context: string): void {
  if (!Array.isArray(sources) || sources.length === 0) fail(`${context} must include sources`);
  for (const [index, source] of sources.entries()) {
    requireText(source?.label, `${context} source ${index} label`);
    requireText(source?.url, `${context} source ${index} URL`);
    try {
      const url = new URL(source.url);
      if (!['http:', 'https:'].includes(url.protocol)) fail(`${context} source ${index} URL must be http(s)`);
    } catch { fail(`${context} source ${index} URL is invalid`); }
  }
}
function validateAssessment(assessment: Assessment | undefined, context: string, assessmentIds: Set<string>): void {
  if (!assessment || typeof assessment !== 'object') fail(`${context} requires an assessment`);
  requireId(assessment.id, `${context} assessment ID`);
  if (assessmentIds.has(assessment.id)) fail(`duplicate assessment ID ${assessment.id}`);
  assessmentIds.add(assessment.id);
  requireText(assessment.prompt, `${context} assessment prompt`);
  if (!Number.isFinite(assessment.answer)) fail(`${context} assessment answer must be finite`);
}
function validateMathLayer(layer: MathLayer | undefined, context: string, assessmentIds: Set<string>, stepId: string): void {
  if (!layer?.quick || !layer.foundation) fail(`${context} must provide quick and expanded math layers`);
  requireText(layer.quick.equation, `${context} quick equation`);
  requireText(layer.quick.summary, `${context} quick summary`);
  if (!Array.isArray(layer.quick.symbols) || layer.quick.symbols.length === 0) fail(`${context} quick layer must define symbols`);
  layer.quick.symbols.forEach((symbol, index) => { requireText(symbol?.symbol, `${context} symbol ${index}`); requireText(symbol?.meaning, `${context} symbol ${index} meaning`); });
  try { katex.renderToString(layer.quick.equation, { throwOnError: true, output: 'htmlAndMathml' }); } catch { fail(`${context} quick equation is not valid KaTeX`); }
  const foundation = layer.foundation;
  requireText(foundation.title, `${context} expanded math title`); requireTextList(foundation.concepts, `${context} expanded math concepts`); requireTextList(foundation.explanation, `${context} expanded math explanation`);
  const visual = foundation.visual;
  if (!visual || !['number', 'ratio', 'graph', 'triangle', 'vector', 'wave', 'area'].includes(visual.kind)) fail(`${context} expanded math visual is invalid`);
  requireId(visual.tutorialId, `${context} expanded math visual tutorial ID`); if (!validMathIds.has(visual.tutorialId)) fail(`${context} expanded math visual tutorial ID is unknown`); requireText(visual.label, `${context} expanded math visual label`);
  requireFinite(visual.min, `${context} expanded math visual minimum`); requireFinite(visual.max, `${context} expanded math visual maximum`); requireFinitePositive(visual.step, `${context} expanded math visual step`); requireFinite(visual.initial, `${context} expanded math visual initial`);
  if (visual.min > visual.max || visual.initial < visual.min || visual.initial > visual.max) fail(`${context} expanded math visual bounds are invalid`);
  requireText(visual.instruction, `${context} expanded math visual instruction`);
  if (!Array.isArray(foundation.prerequisites)) fail(`${context} expanded math prerequisites are required`);
  foundation.prerequisites.forEach((prerequisite, index) => { requireId(prerequisite?.id, `${context} expanded math prerequisite ${index}`); if (!validMathIds.has(prerequisite.id)) fail(`${context} expanded math prerequisite ${index} is unknown`); requireText(prerequisite.returnTo, `${context} expanded math prerequisite ${index} return target`); if (prerequisite.returnTo !== stepId) fail(`${context} expanded math prerequisite ${index} return target must match its math step`); });
  requireText(foundation.returnTo, `${context} expanded math return target`); if (foundation.returnTo !== stepId) fail(`${context} expanded math return target must match its math step`);
  requireText(foundation.workedExample?.question, `${context} expanded math worked example question`); requireTextList(foundation.workedExample?.steps, `${context} expanded math worked example steps`); requireText(foundation.workedExample?.answer, `${context} expanded math worked example answer`); validateAssessment(foundation.check, `${context} expanded math`, assessmentIds);
}
function validateModel(modelId: unknown, context: string): asserts modelId is ModelId {
  if (typeof modelId !== 'string' || !validModelIds.has(modelId as ModelId)) fail(`${context} references an unknown model`);
}
function validatePreset(modelId: ModelId, preset: Parameters, context: string): void {
  if (!preset || typeof preset !== 'object') fail(`${context} preset is required`);
  const keys = new Set(simulations[modelId].parameters.map(parameter => parameter.key));
  for (const [key, value] of Object.entries(preset)) if (!keys.has(key) || !Number.isFinite(value)) fail(`${context} preset is invalid`);
}
function validateSteps(mission: MissionDefinition, assessmentIds: Set<string>): void {
  if (!Array.isArray(mission.steps) || mission.steps.length === 0) fail(`mission ${mission.id} must contain steps`);
  const stepIds = new Set<string>();
  let recapCount = 0, hasLearnerAction = false, assessmentCount = 0, hasEquation = false, hasWorkedExample = false, hasExplanation = false;
  mission.steps.forEach((step: MissionStep, index) => {
    requireId(step?.id, `mission ${mission.id} step ${index} ID`);
    if (stepIds.has(step.id)) fail(`duplicate step ID ${step.id} in mission ${mission.id}`);
    stepIds.add(step.id);
    switch (step.kind) {
      case 'observe': requireText(step.title, `mission ${mission.id} step ${step.id} title`); requireTextList(step.body, `mission ${mission.id} step ${step.id} body`); break;
      case 'explain': requireText(step.title, `mission ${mission.id} step ${step.id} title`); requireTextList(step.body, `mission ${mission.id} step ${step.id} body`); hasExplanation = true; break;
      case 'predict': case 'check': validateAssessment(step.assessment, `mission ${mission.id} step ${step.id}`, assessmentIds); assessmentCount += 1; hasLearnerAction = true; break;
      case 'simulate': validateModel(step.modelId, `mission ${mission.id} step ${step.id}`); requireText(step.prompt, `mission ${mission.id} step ${step.id} prompt`); validatePreset(step.modelId, step.preset, `mission ${mission.id} step ${step.id}`); hasLearnerAction = true; break;
      case 'math': requireText(step.title, `mission ${mission.id} step ${step.id} title`); validateMathLayer(step.layer, `mission ${mission.id} step ${step.id}`, assessmentIds, step.id); assessmentCount += 1; hasEquation = true; hasWorkedExample = true; break;
      case 'recap': recapCount += 1; requireTextList(step.takeaways, `mission ${mission.id} step ${step.id} takeaways`); if (index !== mission.steps.length - 1) fail(`mission ${mission.id} recap must be final`); break;
      default: fail(`mission ${mission.id} has an unknown step kind`);
    }
  });
  if (recapCount !== 1) fail(`mission ${mission.id} must have exactly one final recap`);
  if (!hasLearnerAction) fail(`mission ${mission.id} must include a learner action before recap`);
  if (mission.kind === 'mission') {
    if (!hasEquation) fail(`normal mission ${mission.id} must include an equation`);
    if (!hasWorkedExample) fail(`normal mission ${mission.id} must include a worked example`);
    if (!hasExplanation) fail(`normal mission ${mission.id} must include an explanation`);
    if (assessmentCount < 3) fail(`normal mission ${mission.id} must include three assessments`);
  }
}
function validateCheckpoint(checkpoint: CheckpointRules | undefined, mission: MissionDefinition, normalMissionIds: Set<string>): void {
  if (mission.kind === 'mission') { if (checkpoint) fail(`mission ${mission.id} cannot include checkpoint rules`); return; }
  if (!checkpoint) fail(`checkpoint ${mission.id} requires checkpoint rules`);
  requireId(checkpoint.badgeId, `checkpoint ${mission.id} badge ID`);
  if (!Array.isArray(checkpoint.requiredMissionIds) || checkpoint.requiredMissionIds.length === 0) fail(`checkpoint ${mission.id} requires mission IDs`);
  const seen = new Set<string>();
  checkpoint.requiredMissionIds.forEach(requiredId => { requireId(requiredId, `checkpoint ${mission.id} required mission ID`); if (seen.has(requiredId) || !normalMissionIds.has(requiredId)) fail(`checkpoint ${mission.id} has invalid required mission IDs`); seen.add(requiredId); });
}
function validateMission(mission: MissionDefinition, normalMissionIds: Set<string>, assessmentIds: Set<string>): void {
  requireId(mission?.id, 'mission ID'); const missionKind: unknown = mission.kind; if (missionKind !== 'mission' && missionKind !== 'checkpoint') fail(`mission ${mission.id} kind is invalid`);
  requireText(mission.title, `mission ${mission.id} title`); requireText(mission.summary, `mission ${mission.id} summary`); requireTextList(mission.objectives, `mission ${mission.id} objectives`); requireFinitePositive(mission.minutes, `mission ${mission.id} minutes`); requireFinitePositive(mission.xp, `mission ${mission.id} XP`, true);
  if (!Array.isArray(mission.requiredMath)) fail(`mission ${mission.id} math references must be an array`);
  const mathIds = new Set<string>(); mission.requiredMath.forEach(mathId => { requireId(mathId, `mission ${mission.id} math reference`); if (!validMathIds.has(mathId) || mathIds.has(mathId)) fail(`mission ${mission.id} references unknown or duplicate math`); mathIds.add(mathId); });
  if (mission.modelId !== undefined) validateModel(mission.modelId, `mission ${mission.id}`);
  if (mission.kind === 'mission') {
    requireText(mission.equation, `mission ${mission.id} equation`); try { katex.renderToString(mission.equation, { throwOnError: true, output: 'htmlAndMathml' }); } catch { fail(`mission ${mission.id} equation is not valid KaTeX`); }
    requireText(mission.symbols, `mission ${mission.id} symbols`); requireText(mission.workedExample?.question, `mission ${mission.id} worked example question`); requireTextList(mission.workedExample?.steps, `mission ${mission.id} worked example steps`); requireText(mission.workedExample?.answer, `mission ${mission.id} worked example answer`); requireText(mission.reviewedAt, `mission ${mission.id} review date`);
  }
  if (!['established', 'active-research', 'interpretation', 'speculative'].includes(mission.scienceStatus)) fail(`mission ${mission.id} science status is invalid`);
  validateSteps(mission, assessmentIds); validateSources(mission.sources, `mission ${mission.id}`); requireTextList(mission.limitations, `mission ${mission.id} limitations`); validateCheckpoint(mission.checkpoint, mission, normalMissionIds);
}
function validateRecommendations(courses: CourseDefinition[]): void {
  const courseIds = new Set(courses.map(course => course.id));
  for (const course of courses) for (const recommendation of course.recommendations) { requireId(recommendation, `course ${course.id} recommendation`); if (!courseIds.has(recommendation)) fail(`course ${course.id} recommends an unknown course`); }
  const visiting = new Set<string>(), visited = new Set<string>(), byId = new Map(courses.map(course => [course.id, course]));
  const visit = (id: string) => { if (visiting.has(id)) fail('recommendation cycle detected'); if (visited.has(id)) return; visiting.add(id); byId.get(id)!.recommendations.forEach(visit); visiting.delete(id); visited.add(id); };
  courses.forEach(course => visit(course.id));
}
export function createCourseCatalog(courses: readonly CourseDefinition[]): CourseCatalog {
  if (!Array.isArray(courses) || courses.length === 0) fail('must contain at least one course');
  const courseMap = new Map<string, CourseDefinition>(), missionMap = new Map<string, MissionDefinition>(), assessmentIds = new Set<string>(), badgeIds = new Set<string>();
  for (const course of courses) {
    requireId(course?.id, 'course ID'); if (courseMap.has(course.id)) fail(`duplicate course ID ${course.id}`);
    requireText(course.title, `course ${course.id} title`); requireText(course.description, `course ${course.id} description`); requireText(course.scope, `course ${course.id} scope`); requireText(course.color, `course ${course.id} color`);
    if (!['foundations', 'classical', 'modern', 'space', 'frontier'].includes(course.group)) fail(`course ${course.id} group is invalid`);
    if (course.access !== 'open') fail(`course ${course.id} access must be open`);
    requireFinitePositive(course.estimatedMinutes, `course ${course.id} estimated minutes`); if (!Array.isArray(course.recommendations)) fail(`course ${course.id} recommendations must be an array`);
    if (!Array.isArray(course.missions) || course.missions.length === 0) fail(`course ${course.id} must contain missions`);
    validateSources(course.sources, `course ${course.id}`); requireTextList(course.limitations, `course ${course.id} limitations`); requireText(course.reviewedAt, `course ${course.id} review date`);
    const missions = course.missions as MissionDefinition[]; const normalMissionIds: Set<string> = new Set(missions.filter((mission: MissionDefinition) => mission.kind === 'mission').map((mission: MissionDefinition) => mission.id)); let hasSimulation = false;
    for (const mission of missions) {
      if (missionMap.has(mission.id)) fail('duplicate mission ID ' + mission.id);
      validateMission(mission, normalMissionIds, assessmentIds);
      if (mission.kind === 'checkpoint') {
        if (badgeIds.has(mission.checkpoint.badgeId)) fail('duplicate badge ID ' + mission.checkpoint.badgeId);
        badgeIds.add(mission.checkpoint.badgeId);
      }
      if (mission.modelId !== undefined || mission.steps.some((step: MissionStep) => step.kind === 'simulate')) hasSimulation = true;
      missionMap.set(mission.id, mission);
    }
    if (!hasSimulation) fail(`course ${course.id} must include a simulation`); courseMap.set(course.id, course);
  }
  const values = [...courseMap.values()]; validateRecommendations(values);
  const ids = { courses: new Set(courseMap.keys()), missions: new Set(missionMap.keys()), math: new Set(values.flatMap(course => course.missions.flatMap(mission => mission.requiredMath))), models: new Set(validModelIds) };
  return { courses: courseMap, missions: missionMap, ids,
    getCourse: (id: string) => courseMap.get(id) ?? fail(`unknown course ${id}`),
    getMission: (courseId: string, missionId: string) => { const course = courseMap.get(courseId); if (!course) fail(`unknown course ${courseId}`); return course.missions.find(candidate => candidate.id === missionId) ?? fail(`unknown mission ${missionId} in course ${courseId}`); },
  };
}
