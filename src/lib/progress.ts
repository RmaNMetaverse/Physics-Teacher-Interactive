import type { LearnerProgress } from '../types';

export const STORAGE_KEY = 'physics-teacher-interactive-progress-v1';
export const LEGACY_STORAGE_KEY = STORAGE_KEY;

const PROGRESS_KEYS = [
  'answers',
  'completed',
  'lastLesson',
  'mathCompleted',
  'savedAt',
  'theme',
  'version',
] as const;
const SAFE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function createProgress(): LearnerProgress {
  return {
    version: 1,
    completed: [],
    answers: {},
    mathCompleted: [],
    lastLesson: '',
    theme: 'dark',
    savedAt: new Date().toISOString(),
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object'
    && value !== null
    && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype;
}

function hasExactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const keys = Object.keys(value).sort();
  return keys.length === expected.length && keys.every((key, index) => key === expected[index]);
}

function validateIdList(value: unknown, validIds?: ReadonlySet<string>): value is string[] {
  if (!Array.isArray(value) || !value.every((id): id is string => typeof id === 'string')) return false;
  if (new Set(value).size !== value.length) return false;
  return value.every((id) => SAFE_ID.test(id) && (!validIds || validIds.has(id)));
}

function validateAnswers(
  value: unknown,
  validAnswers?: Readonly<Record<string, number>>,
): value is Record<string, number> {
  if (!isRecord(value)) return false;
  return Object.keys(value).every((id) => SAFE_ID.test(id)
    && Number.isFinite(value[id])
    && (!validAnswers || (Object.hasOwn(validAnswers, id) && value[id] === validAnswers[id])));
}

function parseAndValidate(
  json: string,
  validLessonIds?: readonly string[],
  validMathIds?: readonly string[],
  validAnswers?: Readonly<Record<string, number>>,
): LearnerProgress {
  let value: unknown;
  try {
    value = JSON.parse(json);
  } catch {
    throw new Error('Progress import is not valid JSON.');
  }

  if (!isRecord(value) || !hasExactKeys(value, PROGRESS_KEYS)) {
    throw new Error('Progress import does not have the complete version-1 shape.');
  }

  const lessons = validLessonIds ? new Set(validLessonIds) : undefined;
  const math = validMathIds ? new Set(validMathIds) : undefined;
  if (value.version !== 1) throw new Error('Unsupported progress version.');
  if (!validateIdList(value.completed, lessons)) throw new Error('Completed lessons contain invalid or unknown IDs.');
  if (!validateIdList(value.mathCompleted, math)) throw new Error('Completed math tutorials contain invalid or unknown IDs.');
  if (!validateAnswers(value.answers, validAnswers)) throw new Error('Assessment answers contain invalid IDs or values.');
  if (typeof value.lastLesson !== 'string'
    || (value.lastLesson !== '' && (!SAFE_ID.test(value.lastLesson) || (lessons && !lessons.has(value.lastLesson))))) {
    throw new Error('Last lesson is invalid or unknown.');
  }
  if (value.theme !== 'dark' && value.theme !== 'light') throw new Error('Theme must be dark or light.');
  if (typeof value.savedAt !== 'string'
    || Number.isNaN(Date.parse(value.savedAt))
    || new Date(value.savedAt).toISOString() !== value.savedAt) {
    throw new Error('Saved time must be a canonical ISO timestamp.');
  }

  return {
    version: 1,
    completed: [...value.completed],
    answers: { ...value.answers },
    mathCompleted: [...value.mathCompleted],
    lastLesson: value.lastLesson,
    theme: value.theme,
    savedAt: value.savedAt,
  };
}

export function parseProgress(
  json: string,
  validLessonIds: string[],
  validMathIds: string[],
  validAnswers?: Readonly<Record<string, number>>,
): LearnerProgress {
  return parseAndValidate(json, validLessonIds, validMathIds, validAnswers);
}

export function readProgress(
  validLessonIds?: readonly string[],
  validMathIds?: readonly string[],
  validAnswers?: Readonly<Record<string, number>>,
): { progress: LearnerProgress; persistent: boolean } {
  let stored: string | null;
  try {
    if (typeof localStorage === 'undefined') return { progress: createProgress(), persistent: false };
    stored = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { progress: createProgress(), persistent: false };
  }

  if (stored === null) return { progress: createProgress(), persistent: true };
  try {
    return { progress: parseAndValidate(stored, validLessonIds, validMathIds, validAnswers), persistent: true };
  } catch {
    return { progress: createProgress(), persistent: true };
  }
}

export function saveProgress(progress: LearnerProgress): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch {
    return false;
  }
}
