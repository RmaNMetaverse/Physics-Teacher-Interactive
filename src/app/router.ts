import { courseCatalog } from '../learning/catalog';

export type AppRoute =
  | { page: 'explore' }
  | { page: 'course'; courseId: string }
  | { page: 'mission'; courseId: string; missionId: string }
  | { page: 'progress' };

const exploreHashes = new Set(['', '#', '#/', '#/explore']);

/**
 * Supabase's browser auth flow returns sessions and errors in the fragment.
 * This app also uses fragments for navigation, so callbacks must be excluded
 * from route recovery until the Supabase client has processed and removed them.
 */
export function isSupabaseAuthHash(hash: string): boolean {
  if (!hash.startsWith('#') || hash.startsWith('#/')) return false;
  const values = new URLSearchParams(hash.slice(1));
  return values.has('access_token') || values.has('refresh_token') || values.has('error') || values.has('error_code');
}

function routeParts(hash: string): string[] {
  if (!hash.startsWith('#/')) return [];
  return hash.slice(2).split('/');
}

export function isValidAppHash(hash: string): boolean {
  if (exploreHashes.has(hash)) return true;
  const parts = routeParts(hash);
  if (parts.length === 1 && parts[0] === 'progress') return true;
  if (parts.length === 2 && parts[0] === 'course') {
    return courseCatalog.ids.courses.has(parts[1]);
  }
  if (parts.length === 3 && parts[0] === 'mission') {
    const course = courseCatalog.courses.get(parts[1]);
    return Boolean(course?.missions.some(mission => mission.id === parts[2]));
  }
  return false;
}

export function parseHash(hash: string): AppRoute {
  if (!isValidAppHash(hash) || exploreHashes.has(hash)) return { page: 'explore' };
  const parts = routeParts(hash);
  if (parts[0] === 'course') return { page: 'course', courseId: parts[1] };
  if (parts[0] === 'mission') {
    return { page: 'mission', courseId: parts[1], missionId: parts[2] };
  }
  return { page: 'progress' };
}

export function toHash(route: AppRoute): string {
  switch (route.page) {
    case 'explore': return '#/explore';
    case 'course': return `#/course/${route.courseId}`;
    case 'mission': return `#/mission/${route.courseId}/${route.missionId}`;
    case 'progress': return '#/progress';
  }
}
