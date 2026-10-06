import type { User } from '@supabase/supabase-js';
import type { CourseCatalog } from '../learning/types';
import { parseProgressV2 } from '../progress/progress';
import type { LearnerProgressV2, StarCount } from '../progress/types';
import { supabase } from './supabase';
import { mergeStreaks } from '../progress/streak';

export type SyncState = 'local' | 'syncing' | 'synced' | 'error';

function newest(local: LearnerProgressV2, remote: LearnerProgressV2) {
  return Date.parse(local.savedAt) >= Date.parse(remote.savedAt) ? local : remote;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

export function sameProgress(first: LearnerProgressV2, second: LearnerProgressV2): boolean {
  const canonical = (value: LearnerProgressV2) => JSON.stringify(value, (_key, item) =>
    item && typeof item === 'object' && !Array.isArray(item)
      ? Object.fromEntries(Object.keys(item).sort().map(key => [key, item[key]])) : item);
  return canonical(first) === canonical(second);
}

export function mergeProgress(
  local: LearnerProgressV2,
  remote: LearnerProgressV2,
  catalog: CourseCatalog,
): LearnerProgressV2 {
  if ((local.resetAt ?? '') !== (remote.resetAt ?? '')) {
    const resetWinner = (local.resetAt ?? '') > (remote.resetAt ?? '') ? local : remote;
    return parseProgressV2(JSON.stringify(resetWinner), catalog, new Date());
  }
  const recent = newest(local, remote);
  const completedMissions = unique([...local.completedMissions, ...remote.completedMissions]);
  const completedSet = new Set(completedMissions);
  const missionStars = Object.fromEntries(completedMissions.map(key => [
    key,
    Math.max(local.missionStars[key] ?? 1, remote.missionStars[key] ?? 1) as StarCount,
  ]));
  const xpLedger = Object.fromEntries(
    Object.entries({ ...local.xpLedger, ...remote.xpLedger })
      .filter(([key]) => completedSet.has(key)),
  );
  const stepKeys = unique([...Object.keys(local.stepAttempts), ...Object.keys(remote.stepAttempts)]);
  const stepAttempts = Object.fromEntries(stepKeys.map(key => [
    key,
    Math.max(local.stepAttempts[key] ?? 0, remote.stepAttempts[key] ?? 0),
  ]));

  const candidate: LearnerProgressV2 = {
    ...recent,
    nextMissionByCourse: { ...local.nextMissionByCourse, ...remote.nextMissionByCourse, ...recent.nextMissionByCourse },
    completedMissions,
    missionStars,
    stepAttempts,
    answers: { ...local.answers, ...remote.answers, ...recent.answers },
    completedMathSteps: unique([...local.completedMathSteps, ...remote.completedMathSteps]),
    xpLedger,
    totalXp: Object.values(xpLedger).reduce((sum, xp) => sum + xp, 0),
    streak: mergeStreaks(local.streak, remote.streak),
    badges: unique([...local.badges, ...remote.badges]),
    settings: { ...recent.settings },
    savedAt: recent.savedAt,
  };

  return parseProgressV2(JSON.stringify(candidate), catalog, new Date());
}

function requireClient() {
  if (!supabase) throw new Error('Cloud sync is not configured.');
  return supabase;
}

export async function loadAndMergeProgress(
  user: User,
  local: LearnerProgressV2,
  catalog: CourseCatalog,
): Promise<LearnerProgressV2> {
  return saveCloudProgress(user, local, catalog);
}

/** Compare-and-swap using the existing updated_at column; no schema migration. */
export async function saveCloudProgress(user: User, progress: LearnerProgressV2, catalog: CourseCatalog): Promise<LearnerProgressV2> {
  const client = requireClient();
  const local = parseProgressV2(JSON.stringify(progress), catalog, new Date());
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data, error } = await client.from('user_progress').select('progress, updated_at').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    const remote = data ? parseProgressV2(JSON.stringify(data.progress), catalog, new Date()) : null;
    const merged = remote ? mergeProgress(local, remote, catalog) : local;
    if (remote && sameProgress(remote, merged)) return merged;
    // A strictly increasing token also handles multiple writes in one millisecond.
    const updatedAt = new Date(Math.max(Date.now(), data ? Date.parse(data.updated_at) + 1 : 0)).toISOString();
    const values = { user_id: user.id, progress: merged, updated_at: updatedAt };
    const query = data
      ? client.from('user_progress').update(values).eq('user_id', user.id).eq('updated_at', data.updated_at)
      : client.from('user_progress').insert(values);
    const written = await query.select('progress').maybeSingle();
    if (written.error) {
      if (!data && written.error.code === '23505') continue; // Another device inserted first.
      throw written.error;
    }
    if (written.data) return parseProgressV2(JSON.stringify(written.data.progress), catalog, new Date());
    // Zero updated rows means another device changed the revision. Read and merge again.
  }
  throw new Error('Another device is updating progress. Your local work is saved; please sync again.');
}
