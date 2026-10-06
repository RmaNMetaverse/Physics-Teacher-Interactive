import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { User } from '@supabase/supabase-js';
import type { LearnerProgressV2 } from '../src/progress/types';
import { courseCatalog } from '../src/learning/catalog';
import { createProgressV2, recordStep } from '../src/progress/progress';

const database = vi.hoisted(() => ({ writes: 0, row: null as null | { user_id: string; progress: LearnerProgressV2; updated_at: string } }));
vi.mock('../src/cloud/supabase', () => ({
  supabase: { from: () => {
    let operation = 'read', values: typeof database.row = null;
    const filters: Record<string, string> = {};
    const query = {
      select: () => query,
      eq: (key: string, value: string) => { filters[key] = value; return query; },
      update: (value: NonNullable<typeof database.row>) => { operation = 'update'; values = value; return query; },
      insert: (value: NonNullable<typeof database.row>) => { operation = 'insert'; values = value; return query; },
      upsert: (value: NonNullable<typeof database.row>) => { operation = 'upsert'; values = value; return query; },
      maybeSingle: async () => {
        if (operation === 'insert' && database.row) return { data: null, error: { code: '23505' } };
        if (operation === 'update' && database.row?.updated_at !== filters.updated_at) return { data: null, error: null };
        if (values) { database.writes += 1; database.row = structuredClone({ ...database.row, ...values }); }
        return { data: structuredClone(database.row), error: null };
      },
      then: (resolve: (value: unknown) => unknown) => query.maybeSingle().then(resolve),
    };
    return query;
  } },
}));
import { loadAndMergeProgress, saveCloudProgress } from '../src/cloud/progress-sync';

const user = { id: 'test-owner' } as User;
const practice = (day: string) => recordStep(createProgressV2(new Date(day)), {
  courseId: 'quantum', missionId: 'quantum-light-quanta', stepId: 'quantum-light-quanta-predict', answer: 1,
}, courseCatalog, new Date(day));

beforeEach(() => { database.row = null; database.writes = 0; });

describe('cloud synchronization with competing devices', () => {
  it('does not rewrite an unchanged document when PostgreSQL changes JSON object key order', async () => {
    const original = practice('2026-10-05T12:00:00Z');
    await saveCloudProgress(user, original, courseCatalog);
    const stored = database.row!;
    stored.progress = JSON.parse(JSON.stringify(stored.progress, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item));
    const before = database.writes;
    await saveCloudProgress(user, original, courseCatalog);
    expect(database.writes).toBe(before);
  });
  it('retries a concurrent first insert rather than losing either practice day', async () => {
    await Promise.all([
      loadAndMergeProgress(user, practice('2026-10-04T12:00:00Z'), courseCatalog),
      loadAndMergeProgress(user, practice('2026-10-05T12:00:00Z'), courseCatalog),
    ]);
    expect(database.row?.progress.streak.current).toBe(2);
    expect(database.row?.progress.streak.days).toEqual(['2026-10-04', '2026-10-05']);
  });

  it('merges before every save and retries updates using the exact cloud revision', async () => {
    await loadAndMergeProgress(user, practice('2026-10-04T12:00:00Z'), courseCatalog);
    await Promise.all([
      saveCloudProgress(user, practice('2026-10-05T12:00:00Z'), courseCatalog),
      saveCloudProgress(user, practice('2026-10-06T12:00:00Z'), courseCatalog),
    ]);
    expect(database.row?.progress.streak.current).toBe(3);
    const phone = await loadAndMergeProgress(user, createProgressV2(new Date()), courseCatalog);
    expect(phone.streak.days).toEqual(['2026-10-04', '2026-10-05', '2026-10-06']);
  });
});
