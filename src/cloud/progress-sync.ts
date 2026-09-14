import type { User } from '@supabase/supabase-js';
import type { CourseCatalog } from '../learning/types';
import { parseProgressV2 } from '../progress/progress';
import type { LearnerProgressV2, StarCount } from '../progress/types';
import { supabase } from './supabase';

export type SyncState = 'local' | 'syncing' | 'synced' | 'error';

function newest(local: LearnerProgressV2, remote: LearnerProgressV2) {
  return Date.parse(local.savedAt) >= Date.parse(remote.savedAt) ? local : remote;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

export function mergeProgress(
  local: LearnerProgressV2,
  remote: LearnerProgressV2,
  catalog: CourseCatalog,
): LearnerProgressV2 {
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
    streak: {
      ...recent.streak,
      longest: Math.max(local.streak.longest, remote.streak.longest),
    },
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
  const client = requireClient();
  const { data, error } = await client
    .from('user_progress')
    .select('progress')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;

  const remote = data?.progress
    ? parseProgressV2(JSON.stringify(data.progress), catalog, new Date())
    : null;
  const merged = remote ? mergeProgress(local, remote, catalog) : local;
  await saveCloudProgress(user, merged);
  return merged;
}

export async function saveCloudProgress(user: User, progress: LearnerProgressV2): Promise<void> {
  const { error } = await requireClient().from('user_progress').upsert({
    user_id: user.id,
    progress,
    updated_at: progress.savedAt,
  });
  if (error) throw error;
}
