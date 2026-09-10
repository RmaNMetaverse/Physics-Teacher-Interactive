import { LEGACY_STORAGE_KEY } from '../lib/progress';
import type { CourseCatalog, MissionDefinition, MissionStep } from '../learning/types';
import type { LearnerProgress } from '../types';
import type { LearnerProgressV2, MissionCompletionInput, ProgressStepInput, StarCount } from './types';

export const PROGRESS_V2_STORAGE_KEY = 'physics-teacher-interactive-progress-v2';

const V2_KEYS = ['answers', 'badges', 'completedMathSteps', 'completedMissions', 'dailyGoal', 'missionStars', 'nextMissionByCourse', 'savedAt', 'selectedCourseId', 'settings', 'stepAttempts', 'streak', 'totalXp', 'version', 'xpLedger'];
const SETTINGS_KEYS = ['celebrations', 'reducedMotion', 'sound', 'theme'];
const STREAK_KEYS = ['current', 'lastActiveDate', 'longest'];

type IndexedMission = { mission: MissionDefinition; steps: Map<string, MissionStep> };
type CatalogIndex = {
  courses: Set<string>;
  missions: Map<string, IndexedMission>;
  steps: Set<string>;
  answerSteps: Set<string>;
  mathSteps: Set<string>;
  badges: Map<string, { courseId: string; missionId: string; requiredMissionIds: string[] }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && Object.getPrototypeOf(value) === Object.prototype;
}
function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort(), wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((key, index) => key === wanted[index]);
}
function assertNow(now: Date): void {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) throw new Error('A valid current time is required.');
}
function dateKey(now: Date): string {
  assertNow(now);
  return `${now.getFullYear().toString().padStart(4, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
}
function validDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number), date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}
function canonicalIso(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
}
function missionKey(courseId: string, missionId: string): string { return `${courseId}/${missionId}`; }
function stepKey(courseId: string, missionId: string, stepId: string): string { return `${courseId}/${missionId}/${stepId}`; }
function star(value: unknown): value is StarCount { return value === 1 || value === 2 || value === 3; }
function sum(ledger: Record<string, number>): number {
  const values = Object.values(ledger);
  if (!values.every(value => typeof value === 'number' && Number.isFinite(value) && value >= 0)) throw new Error('XP ledger contains an invalid value.');
  return values.reduce((total, value) => total + value, 0);
}

function indexCatalog(catalog: CourseCatalog): CatalogIndex {
  const index: CatalogIndex = { courses: new Set(), missions: new Map(), steps: new Set(), answerSteps: new Set(), mathSteps: new Set(), badges: new Map() };
  for (const [courseId, course] of catalog.courses) {
    index.courses.add(courseId);
    for (const mission of course.missions) {
      const key = missionKey(courseId, mission.id), steps = new Map(mission.steps.map(step => [step.id, step]));
      index.missions.set(key, { mission, steps });
      for (const step of mission.steps) {
        const current = stepKey(courseId, mission.id, step.id);
        index.steps.add(current);
        if (step.kind === 'predict' || step.kind === 'check' || step.kind === 'math') index.answerSteps.add(current);
        if (step.kind === 'math') index.mathSteps.add(current);
      }
      if (mission.kind === 'checkpoint') index.badges.set(mission.checkpoint.badgeId, { courseId, missionId: mission.id, requiredMissionIds: mission.checkpoint.requiredMissionIds });
    }
  }
  return index;
}
function copy(progress: LearnerProgressV2): LearnerProgressV2 {
  return { ...progress, nextMissionByCourse: { ...progress.nextMissionByCourse }, completedMissions: [...progress.completedMissions], missionStars: { ...progress.missionStars }, stepAttempts: { ...progress.stepAttempts }, answers: { ...progress.answers }, completedMathSteps: [...progress.completedMathSteps], xpLedger: { ...progress.xpLedger }, streak: { ...progress.streak }, badges: [...progress.badges], settings: { ...progress.settings } };
}
function saveAt(progress: LearnerProgressV2, now: Date): LearnerProgressV2 {
  assertNow(now);
  return { ...progress, totalXp: sum(progress.xpLedger), savedAt: now.toISOString() };
}
function requireList(value: unknown, allowed: ReadonlySet<string>, label: string): string[] {
  if (!Array.isArray(value) || !value.every((item): item is string => typeof item === 'string') || new Set(value).size !== value.length || !value.every(item => allowed.has(item))) throw new Error(`${label} contains an unknown or duplicate ID.`);
  return [...value];
}
function requireRecord(value: unknown, allowed: ReadonlySet<string>, label: string, valid: (item: unknown, key: string) => boolean): Record<string, unknown> {
  if (!isRecord(value) || !Object.entries(value).every(([key, item]) => allowed.has(key) && valid(item, key))) throw new Error(`${label} contains an unknown or invalid value.`);
  return { ...value };
}
function updateStreak(streak: LearnerProgressV2['streak'], now: Date): LearnerProgressV2['streak'] {
  const today = dateKey(now);
  if (streak.lastActiveDate === today) return { ...streak };
  if (streak.lastActiveDate === '') return { current: 1, longest: Math.max(1, streak.longest), lastActiveDate: today };
  const [year, month, day] = streak.lastActiveDate.split('-').map(Number);
  const [todayYear, todayMonth, todayDay] = today.split('-').map(Number);
  const elapsed = (Date.UTC(todayYear, todayMonth - 1, todayDay) - Date.UTC(year, month - 1, day)) / 86_400_000;
  const current = elapsed === 1 ? streak.current + 1 : 1;
  return { current, longest: Math.max(streak.longest, current), lastActiveDate: today };
}

export function createProgressV2(now: Date): LearnerProgressV2 {
  assertNow(now);
  return { version: 2, selectedCourseId: '', nextMissionByCourse: {}, completedMissions: [], missionStars: {}, stepAttempts: {}, answers: {}, completedMathSteps: [], xpLedger: {}, totalXp: 0, streak: { current: 0, longest: 0, lastActiveDate: '' }, dailyGoal: 3, badges: [], settings: { theme: 'dark', sound: true, reducedMotion: false, celebrations: true }, savedAt: now.toISOString() };
}

function parseV2(value: unknown, catalog: CourseCatalog): LearnerProgressV2 {
  if (!isRecord(value) || !exactKeys(value, V2_KEYS) || value.version !== 2) throw new Error('Progress import does not have the complete version-2 shape.');
  const index = indexCatalog(catalog), missionIds = new Set(index.missions.keys());
  if (typeof value.selectedCourseId !== 'string' || (value.selectedCourseId !== '' && !index.courses.has(value.selectedCourseId))) throw new Error('Selected course is invalid or unknown.');
  const nextMissionByCourse = requireRecord(value.nextMissionByCourse, index.courses, 'Next missions', (missionId, courseId) => typeof missionId === 'string' && (missionId === '' || index.missions.has(missionKey(courseId, missionId)))) as Record<string, string>;
  const completedMissions = requireList(value.completedMissions, missionIds, 'Completed missions');
  const missionStars = requireRecord(value.missionStars, missionIds, 'Mission stars', (item, key) => star(item) && completedMissions.includes(key)) as Record<string, StarCount>;
  if (Object.keys(missionStars).length !== completedMissions.length) throw new Error('Mission stars must contain one entry for every completed mission.');
  const stepAttempts = requireRecord(value.stepAttempts, index.steps, 'Step attempts', attempts => typeof attempts === 'number' && Number.isSafeInteger(attempts) && attempts > 0) as Record<string, number>;
  const answers = requireRecord(value.answers, index.answerSteps, 'Answers', answer => typeof answer === 'string' || typeof answer === 'number' && Number.isFinite(answer)) as Record<string, number | string>;
  const completedMathSteps = requireList(value.completedMathSteps, index.mathSteps, 'Completed math steps');
  const xpLedger = requireRecord(value.xpLedger, missionIds, 'XP ledger', (xp, key) => { const entry = index.missions.get(key); return entry?.mission.kind === 'mission' && completedMissions.includes(key) && typeof xp === 'number' && Number.isFinite(xp) && xp === entry.mission.xp; }) as Record<string, number>;
  const completedXpMissions = completedMissions.filter(key => index.missions.get(key)?.mission.kind === 'mission');
  if (Object.keys(xpLedger).length !== completedXpMissions.length) throw new Error('XP ledger must contain one catalog-validated entry for every completed mission.');
  const streak = value.streak;
  if (!isRecord(streak) || !exactKeys(streak, STREAK_KEYS) || typeof streak.current !== 'number' || !Number.isSafeInteger(streak.current) || typeof streak.longest !== 'number' || !Number.isSafeInteger(streak.longest) || streak.current < 0 || streak.longest < streak.current || !(streak.lastActiveDate === '' || validDateKey(streak.lastActiveDate))) throw new Error('Streak is invalid.');
  if (value.dailyGoal !== 1 && value.dailyGoal !== 3 && value.dailyGoal !== 5) throw new Error('Daily goal must be 1, 3, or 5.');
  const badges = requireList(value.badges, new Set(index.badges.keys()), 'Badges');
  for (const badge of badges) { const rule = index.badges.get(badge)!; if (!completedMissions.includes(missionKey(rule.courseId, rule.missionId)) || !rule.requiredMissionIds.every(id => completedMissions.includes(missionKey(rule.courseId, id)))) throw new Error('Badge has not been earned.'); }
  if (!isRecord(value.settings) || !exactKeys(value.settings, SETTINGS_KEYS) || (value.settings.theme !== 'light' && value.settings.theme !== 'dark') || typeof value.settings.sound !== 'boolean' || typeof value.settings.reducedMotion !== 'boolean' || typeof value.settings.celebrations !== 'boolean') throw new Error('Settings are invalid.');
  if (!canonicalIso(value.savedAt)) throw new Error('Saved time must be a canonical ISO timestamp.');
  return { version: 2, selectedCourseId: value.selectedCourseId, nextMissionByCourse, completedMissions, missionStars, stepAttempts, answers, completedMathSteps, xpLedger, totalXp: sum(xpLedger), streak: { current: streak.current, longest: streak.longest, lastActiveDate: streak.lastActiveDate }, dailyGoal: value.dailyGoal, badges, settings: { theme: value.settings.theme, sound: value.settings.sound, reducedMotion: value.settings.reducedMotion, celebrations: value.settings.celebrations }, savedAt: value.savedAt };
}

function migrateV1(value: unknown, catalog: CourseCatalog, now: Date): LearnerProgressV2 {
  if (!isRecord(value) || value.version !== 1) throw new Error('Unsupported progress version.');
  const legacy = value as Partial<LearnerProgress>, index = indexCatalog(catalog), progress = createProgressV2(now);
  if (!index.courses.has('foundations')) return progress;
  progress.selectedCourseId = 'foundations';
  const completed = Array.isArray(legacy.completed) ? legacy.completed.filter((id): id is string => typeof id === 'string') : [];
  for (const id of completed) {
    const key = missionKey('foundations', id), entry = index.missions.get(key);
    if (!entry || progress.completedMissions.includes(key)) continue;
    progress.completedMissions.push(key); progress.missionStars[key] = 1;
    if (entry.mission.kind === 'mission') progress.xpLedger[key] = entry.mission.xp;
  }
  if (typeof legacy.lastLesson === 'string' && index.missions.has(missionKey('foundations', legacy.lastLesson))) progress.nextMissionByCourse.foundations = legacy.lastLesson;
  if (isRecord(legacy.answers)) for (const [legacyAssessmentId, answer] of Object.entries(legacy.answers)) {
    if (typeof answer !== 'number' || !Number.isFinite(answer)) continue;
    for (const [key, entry] of index.missions) {
      if (!key.startsWith('foundations/')) continue;
      const matched = [...entry.steps.values()].find(step =>
        ((step.kind === 'predict' || step.kind === 'check') && step.assessment.id === legacyAssessmentId)
        || (step.kind === 'math' && step.layer.foundation.check.id === entry.mission.id + '-' + legacyAssessmentId));
      if (matched) progress.answers[`${key}/${matched.id}`] = answer;
    }
  }
  const completedMath = Array.isArray(legacy.mathCompleted) ? legacy.mathCompleted.filter((id): id is string => typeof id === 'string') : [];
  for (const tutorialId of completedMath) for (const key of index.mathSteps) if (key.endsWith(`-required-${tutorialId}`)) progress.completedMathSteps.push(key);
  if (legacy.theme === 'light' || legacy.theme === 'dark') progress.settings.theme = legacy.theme;
  if (canonicalIso(legacy.savedAt)) progress.savedAt = legacy.savedAt;
  return { ...progress, totalXp: sum(progress.xpLedger) };
}

export function parseProgressV2(json: string, catalog: CourseCatalog, now: Date): LearnerProgressV2 {
  let value: unknown;
  try { value = JSON.parse(json); } catch { throw new Error('Progress import is not valid JSON.'); }
  return isRecord(value) && value.version === 2 ? parseV2(value, catalog) : migrateV1(value, catalog, now);
}

export function recordStep(progress: LearnerProgressV2, event: ProgressStepInput, catalog: CourseCatalog, now: Date): LearnerProgressV2 {
  const index = indexCatalog(catalog), key = stepKey(event.courseId, event.missionId, event.stepId);
  if (!index.steps.has(key)) throw new Error('Step is unknown.');
  if (event.answer !== undefined && !index.answerSteps.has(key)) throw new Error('Answers are only valid for scored steps.');
  if (event.answer !== undefined && typeof event.answer !== 'string' && (typeof event.answer !== 'number' || !Number.isFinite(event.answer))) throw new Error('Answer is invalid.');
  const next = copy(parseV2(progress, catalog));
  next.stepAttempts[key] = (next.stepAttempts[key] ?? 0) + 1;
  if (event.answer !== undefined) next.answers[key] = event.answer;
  if (index.mathSteps.has(key) && !next.completedMathSteps.includes(key)) next.completedMathSteps.push(key);
  next.streak = updateStreak(next.streak, now);
  return saveAt(next, now);
}

export function completeMission(progress: LearnerProgressV2, result: MissionCompletionInput, catalog: CourseCatalog, now: Date): LearnerProgressV2 {
  if (!star(result.stars)) throw new Error('Mission stars must be 1, 2, or 3.');
  const index = indexCatalog(catalog), key = missionKey(result.courseId, result.missionId), entry = index.missions.get(key);
  if (!entry) throw new Error('Mission is unknown.');
  const next = copy(parseV2(progress, catalog));
  if (!next.completedMissions.includes(key)) { next.completedMissions.push(key); if (entry.mission.kind === 'mission') next.xpLedger[key] = entry.mission.xp; }
  next.missionStars[key] = Math.max(next.missionStars[key] ?? 0, result.stars) as StarCount;
  next.selectedCourseId = result.courseId;
  const missions = catalog.getCourse(result.courseId).missions, at = missions.findIndex(mission => mission.id === result.missionId);
  next.nextMissionByCourse[result.courseId] = missions[at + 1]?.id ?? '';
  if (entry.mission.kind === 'checkpoint' && entry.mission.checkpoint.requiredMissionIds.every(id => next.completedMissions.includes(missionKey(result.courseId, id))) && !next.badges.includes(entry.mission.checkpoint.badgeId)) next.badges.push(entry.mission.checkpoint.badgeId);
  return saveAt(next, now);
}

export function serializeProgressV2(progress: LearnerProgressV2): string { return JSON.stringify({ ...copy(progress), totalXp: sum(progress.xpLedger) }); }

export function readProgressV2(catalog: CourseCatalog, now: Date): { progress: LearnerProgressV2; persistent: boolean } {
  let v2: string | null, v1: string | null;
  try { if (typeof localStorage === 'undefined') return { progress: createProgressV2(now), persistent: false }; v2 = localStorage.getItem(PROGRESS_V2_STORAGE_KEY); v1 = v2 === null ? localStorage.getItem(LEGACY_STORAGE_KEY) : null; } catch { return { progress: createProgressV2(now), persistent: false }; }
  const stored = v2 ?? v1;
  if (stored === null) return { progress: createProgressV2(now), persistent: true };
  try {
    const progress = parseProgressV2(stored, catalog, now);
    if (v2 === null && v1 !== null) {
      try { localStorage.setItem(PROGRESS_V2_STORAGE_KEY, serializeProgressV2(progress)); }
      catch { return { progress, persistent: false }; }
    }
    return { progress, persistent: true };
  } catch {
    return { progress: createProgressV2(now), persistent: true };
  }
}
export function saveProgressV2(progress: LearnerProgressV2): boolean {
  try { if (typeof localStorage === 'undefined') return false; localStorage.setItem(PROGRESS_V2_STORAGE_KEY, serializeProgressV2(progress)); return true; } catch { return false; }
}
