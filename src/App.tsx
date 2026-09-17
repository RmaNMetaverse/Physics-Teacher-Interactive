import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from './app/AppShell';
import { isSupabaseAuthHash, isValidAppHash, parseHash, toHash, type AppRoute } from './app/router';
import { courseCatalog, courses } from './learning/catalog';
import { readProgressV2, saveProgressV2 } from './progress/progress';
import type { LearnerProgressV2 } from './progress/types';
import { CoursePathPage } from './pages/CoursePathPage';
import { ExplorePage } from './pages/ExplorePage';
import { MissionPage } from './pages/MissionPage';
import { ProgressPage } from './pages/ProgressPage';
import { applyAppearanceSettings } from './appearance';
import { useCloudAccount } from './cloud/useCloudAccount';

function learnHash(progress: LearnerProgressV2): string {
  const course = courseCatalog.courses.get(progress.selectedCourseId) ?? courses[0];
  return toHash({ page: 'course', courseId: course.id });
}

function initialRoute(): { route: AppRoute; recoveryMessage: string } {
  if (typeof window === 'undefined') return { route: { page: 'explore' }, recoveryMessage: '' };
  if (isSupabaseAuthHash(window.location.hash)) return { route: { page: 'explore' }, recoveryMessage: '' };
  const valid = isValidAppHash(window.location.hash);
  return {
    route: parseHash(window.location.hash),
    recoveryMessage: valid ? '' : 'That route is unavailable, so we returned you to Explore.',
  };
}

export function App() {
  const stored = useMemo(() => readProgressV2(courseCatalog, new Date()), []);
  const initial = useMemo(initialRoute, []);
  const [progress, setProgress] = useState(stored.progress);
  const [route, setRoute] = useState(initial.route);
  const [recoveryMessage, setRecoveryMessage] = useState(initial.recoveryMessage);
  const mainRef = useRef<HTMLElement>(null);
  const account = useCloudAccount(progress, setProgress);

  const applyRoute = useCallback((next: AppRoute) => {
    setRoute(next);
    setRecoveryMessage('');
    if (next.page === 'course' || next.page === 'mission') {
      setProgress(current => current.selectedCourseId === next.courseId ? current : {
        ...current,
        selectedCourseId: next.courseId,
        savedAt: new Date().toISOString(),
      });
    }
    window.scrollTo(0, 0);
  }, []);

  const navigate = useCallback((next: AppRoute) => {
    const nextHash = toHash(next);
    if (window.location.hash !== nextHash) {
      window.history.pushState(null, '', `${window.location.pathname}${window.location.search}${nextHash}`);
    }
    applyRoute(next);
  }, [applyRoute]);

  useEffect(() => {
    let canonicalTimer = 0;
    const syncRoute = () => {
      if (isSupabaseAuthHash(window.location.hash)) {
        setRoute({ page: 'explore' });
        setRecoveryMessage('');
        window.scrollTo(0, 0);
        return;
      }
      const valid = isValidAppHash(window.location.hash);
      const next = parseHash(window.location.hash);
      applyRoute(next);
      setRecoveryMessage(valid ? '' : 'That route is unavailable, so we returned you to Explore.');
      const canonicalHash = toHash(next);
      if (window.location.hash !== canonicalHash) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${canonicalHash}`);
      }
    };
    // Initial state already comes from initialRoute(). Defer URL
    // canonicalization until after Strict Mode's development remount so an
    // invalid-route recovery announcement survives that remount.
    const initialHash = window.location.hash;
    if (!isSupabaseAuthHash(initialHash)) {
      const canonicalHash = toHash(parseHash(initialHash));
      if (initialHash !== canonicalHash) {
        canonicalTimer = window.setTimeout(() => {
          if (window.location.hash === initialHash) {
            window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${canonicalHash}`);
          }
        }, 0);
      }
    }
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.clearTimeout(canonicalTimer);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, [applyRoute]);

  useEffect(() => {
    applyAppearanceSettings(progress.settings, progress.settings.reducedMotion);
    saveProgressV2(progress, courseCatalog);
  }, [progress]);

  let page;
  if (route.page === 'explore') page = <ExplorePage courses={courses} progress={progress} />;
  else if (route.page === 'course') page = <CoursePathPage course={courseCatalog.getCourse(route.courseId)} progress={progress} />;
  else if (route.page === 'mission') {
    const course = courseCatalog.getCourse(route.courseId);
    const mission = courseCatalog.getMission(route.courseId, route.missionId);
    page = (
      <MissionPage
        key={`${course.id}:${mission.id}`}
        course={course}
        mission={mission}
        progress={progress}
        onProgressChange={setProgress}
      />
    );
  } else {
    page = <ProgressPage progress={progress} onProgressChange={setProgress} />;
  }

  const updateSettings = (partial: Partial<LearnerProgressV2['settings']>) => {
    setProgress(current => ({
      ...current,
      settings: { ...current.settings, ...partial },
      savedAt: new Date().toISOString(),
    }));
  };

  return (
    <AppShell
      route={route}
      learnHash={learnHash(progress)}
      recoveryMessage={recoveryMessage}
      mainRef={mainRef}
      progress={progress}
      onUpdateSettings={updateSettings}
      account={account}
      onNavigate={navigate}
    >
      {page}
    </AppShell>
  );
}
