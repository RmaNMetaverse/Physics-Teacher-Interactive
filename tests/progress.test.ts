import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  STORAGE_KEY,
  createProgress,
  parseProgress,
  readProgress,
  saveProgress,
} from '../src/lib/progress';
import type { LearnerProgress } from '../src/types';

const validProgress = (): LearnerProgress => ({
  version: 1,
  completed: ['measurement-basics'],
  answers: { 'measurement-basics-concept': 1 },
  mathCompleted: ['arithmetic'],
  lastLesson: 'measurement-basics',
  theme: 'dark',
  savedAt: '2026-09-09T00:00:00.000Z',
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('progress creation and import', () => {
  it('creates an independent empty version-1 progress record', () => {
    const first = createProgress();
    const second = createProgress();

    expect(first).toMatchObject({
      version: 1,
      completed: [],
      answers: {},
      mathCompleted: [],
      lastLesson: '',
      theme: 'dark',
    });
    expect(Number.isNaN(Date.parse(first.savedAt))).toBe(false);
    first.completed.push('changed');
    expect(second.completed).toEqual([]);
  });

  it('accepts a complete valid export and returns fresh data', () => {
    const json = JSON.stringify(validProgress());
    const parsed = parseProgress(json, ['measurement-basics'], ['arithmetic'], {
      'measurement-basics-concept': 1,
    });

    expect(parsed).toEqual(validProgress());
    expect(parsed).not.toBe(validProgress());
  });

  it('rejects unsupported versions, incomplete shapes, and extra fields', () => {
    const unsupported = { ...validProgress(), version: 2 };
    const incomplete: Partial<LearnerProgress> = { ...validProgress() };
    delete incomplete.theme;
    const extra = { ...validProgress(), debug: true };

    expect(() => parseProgress(JSON.stringify(unsupported), ['measurement-basics'], ['arithmetic'])).toThrow();
    expect(() => parseProgress(JSON.stringify(incomplete), ['measurement-basics'], ['arithmetic'])).toThrow();
    expect(() => parseProgress(JSON.stringify(extra), ['measurement-basics'], ['arithmetic'])).toThrow();
  });

  it('rejects invalid themes and non-ISO save timestamps', () => {
    expect(() => parseProgress(JSON.stringify({ ...validProgress(), theme: 'blue' }), ['measurement-basics'], ['arithmetic'])).toThrow();
    expect(() => parseProgress(JSON.stringify({ ...validProgress(), savedAt: '2026-09-09' }), ['measurement-basics'], ['arithmetic'])).toThrow();
  });

  it('rejects unknown curriculum IDs and an invalid last lesson', () => {
    expect(() => parseProgress(JSON.stringify({ ...validProgress(), completed: ['unknown'] }), ['measurement-basics'], ['arithmetic'])).toThrow();
    expect(() => parseProgress(JSON.stringify({ ...validProgress(), mathCompleted: ['unknown'] }), ['measurement-basics'], ['arithmetic'])).toThrow();
    expect(() => parseProgress(JSON.stringify({ ...validProgress(), lastLesson: 'unknown' }), ['measurement-basics'], ['arithmetic'])).toThrow();
  });

  it('rejects malformed answer records and duplicate completion IDs', () => {
    expect(() => parseProgress('{"version":1,"completed":["measurement-basics"],"answers":{"bad id":1},"mathCompleted":["arithmetic"],"lastLesson":"","theme":"dark","savedAt":"2026-09-09T00:00:00.000Z"}', ['measurement-basics'], ['arithmetic'])).toThrow();
    expect(() => parseProgress('{"version":1,"completed":[],"answers":{"answer":1e999},"mathCompleted":[],"lastLesson":"","theme":"dark","savedAt":"2026-09-09T00:00:00.000Z"}', [], [])).toThrow();
    expect(() => parseProgress(JSON.stringify({ ...validProgress(), completed: ['measurement-basics', 'measurement-basics'] }), ['measurement-basics'], ['arithmetic'])).toThrow();
  });

  it('rejects unknown assessment IDs and answers that are not the recorded correct value', () => {
    expect(() => parseProgress(JSON.stringify(validProgress()), ['measurement-basics'], ['arithmetic'], {})).toThrow();
    expect(() => parseProgress(JSON.stringify(validProgress()), ['measurement-basics'], ['arithmetic'], {
      'measurement-basics-concept': 0,
    })).toThrow();
  });
});

describe('browser persistence', () => {
  it('reports available persistence and returns a new record when storage is empty', () => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn() });
    const result = readProgress();

    expect(result.persistent).toBe(true);
    expect(result.progress.version).toBe(1);
  });

  it('loads valid stored progress and falls back safely for invalid data', () => {
    const getItem = vi.fn(() => JSON.stringify(validProgress()));
    vi.stubGlobal('localStorage', { getItem, setItem: vi.fn() });
    expect(readProgress(['measurement-basics'], ['arithmetic'], {
      'measurement-basics-concept': 1,
    })).toEqual({ progress: validProgress(), persistent: true });

    getItem.mockReturnValue(JSON.stringify({ ...validProgress(), completed: ['retired-lesson'] }));
    expect(readProgress(['measurement-basics'], ['arithmetic'], {
      'measurement-basics-concept': 1,
    }).progress.completed).toEqual([]);

    getItem.mockReturnValue('{bad json');
    expect(readProgress(['measurement-basics'], ['arithmetic'], {
      'measurement-basics-concept': 1,
    }).persistent).toBe(true);
    expect(readProgress(['measurement-basics'], ['arithmetic'], {
      'measurement-basics-concept': 1,
    }).progress.completed).toEqual([]);
  });

  it('falls back when reading throws and reports whether saving succeeded', () => {
    const setItem = vi.fn();
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(() => { throw new Error('blocked'); }),
      setItem,
    });
    expect(readProgress().persistent).toBe(false);

    expect(saveProgress(validProgress())).toBe(true);
    expect(setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(validProgress()));

    setItem.mockImplementation(() => { throw new Error('quota'); });
    expect(saveProgress(validProgress())).toBe(false);
  });

  it('is resilient when localStorage does not exist', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(readProgress().persistent).toBe(false);
    expect(saveProgress(validProgress())).toBe(false);
  });
});
