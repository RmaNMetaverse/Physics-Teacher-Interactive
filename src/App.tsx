import { useEffect, useMemo, useRef, useState } from 'react';
import { AppShell } from './app/AppShell';
import { isValidAppHash, parseHash, toHash, type AppRoute } from './app/router';
import { courseCatalog, courses } from './learning/catalog';
import { readProgressV2, saveProgressV2 } from './progress/progress';
import type { LearnerProgressV2 } from './progress/types';
import { CoursePathPage } from './pages/CoursePathPage';
import { ExplorePage } from './pages/ExplorePage';
import { MissionPage } from './pages/MissionPage';
import { ProgressPage } from './pages/ProgressPage';
import { accentContrast, normalizeAppearanceSettings } from './appearance';

function learnHash(progress: LearnerProgressV2): string {
  const course = courseCatalog.courses.get(progress.selectedCourseId) ?? courses[0];
  return toHash({ page: 'course', courseId: course.id });
}

function initialRoute(): { route: AppRoute; recoveryMessage: string } {
  if (typeof window === 'undefined') return { route: { page: 'explore' }, recoveryMessage: '' };
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

  useEffect(() => {
    const syncRoute = () => {
      const valid = isValidAppHash(window.location.hash);
      const next = parseHash(window.location.hash);
      setRoute(next);
      if (next.page === 'course' || next.page === 'mission') {
        setProgress(current => current.selectedCourseId === next.courseId ? current : {
          ...current,
          selectedCourseId: next.courseId,
          savedAt: new Date().toISOString(),
        });
      }
      setRecoveryMessage(valid ? '' : 'That route is unavailable, so we returned you to Explore.');
      const canonicalHash = toHash(next);
      if (window.location.hash !== canonicalHash) {
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${canonicalHash}`);
      }
      window.scrollTo(0, 0);
    };
    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    return () => window.removeEventListener('hashchange', syncRoute);
  }, []);

  useEffect(() => {
    const appearance = normalizeAppearanceSettings(progress.settings);
    document.documentElement.dataset.theme = appearance.theme;
    document.documentElement.dataset.liquidGlass = appearance.liquidGlass ? 'true' : 'false';
    document.documentElement.dataset.reducedMotion = progress.settings.reducedMotion ? 'true' : 'false';
    document.documentElement.style.setProperty('--accent', appearance.primaryColor);
    document.documentElement.style.setProperty('--journey-violet', appearance.primaryColor);
    document.documentElement.style.setProperty('--accent-hover', `color-mix(in srgb, ${appearance.primaryColor} 82%, white)`);
    document.documentElement.style.setProperty('--accent-soft', `${appearance.primaryColor}24`);
    document.documentElement.style.setProperty('--accent-contrast', accentContrast(appearance.primaryColor));
    document.documentElement.style.setProperty('--teal', appearance.secondaryColor);
    document.documentElement.style.setProperty('--mastery-mint', appearance.secondaryColor);
    document.documentElement.style.setProperty('--mastery-soft', `${appearance.secondaryColor}24`);
    const darkSurface = appearance.theme === 'dark' || appearance.theme === 'ocean' || appearance.theme === 'high-contrast';
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', darkSurface ? '#08101f' : appearance.theme === 'eye-comfort' ? '#f4ecd8' : '#fbfbfe');
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

  return <AppShell route={route} learnHash={learnHash(progress)} recoveryMessage={recoveryMessage} mainRef={mainRef}>{page}</AppShell>;
}
