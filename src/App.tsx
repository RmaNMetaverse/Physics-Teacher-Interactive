import { useEffect, useMemo, useRef, useState } from 'react';
import { Flame, Trophy } from 'lucide-react';
import { AppShell } from './app/AppShell';
import { isValidAppHash, parseHash, toHash, type AppRoute } from './app/router';
import { courseCatalog, courses } from './learning/catalog';
import { readProgressV2, saveProgressV2 } from './progress/progress';
import type { LearnerProgressV2 } from './progress/types';
import { CoursePathPage } from './pages/CoursePathPage';
import { ExplorePage } from './pages/ExplorePage';
import { MissionPage } from './pages/MissionPage';

function learnHash(progress: LearnerProgressV2): string {
  const course = courseCatalog.courses.get(progress.selectedCourseId) ?? courses[0];
  return toHash({ page: 'course', courseId: course.id });
}

function ProgressPlaceholder({ progress }: { progress: LearnerProgressV2 }) {
  return <section className="progress-placeholder">
    <p className="eyebrow">Your learning record</p><h1>Progress</h1>
    <div className="progress-summary-cards">
      <article><Trophy aria-hidden="true" /><strong>{progress.totalXp}</strong><span>Total XP</span></article>
      <article><Flame aria-hidden="true" /><strong>{progress.streak.current}</strong><span>Day streak</span></article>
      <article><strong>{progress.completedMissions.length}</strong><span>Missions complete</span></article>
    </div>
    <p>Your full mastery dashboard, badges, preferences, and backup controls arrive in a later milestone.</p>
  </section>;
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
    document.documentElement.dataset.theme = progress.settings.theme;
    document.querySelector('meta[name=theme-color]')?.setAttribute('content', progress.settings.theme === 'dark' ? '#090e1a' : '#f5f7fb');
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
        course={course}
        mission={mission}
        progress={progress}
        onProgressChange={setProgress}
      />
    );
  }
  else page = <ProgressPlaceholder progress={progress} />;

  return <AppShell route={route} learnHash={learnHash(progress)} recoveryMessage={recoveryMessage} mainRef={mainRef}>{page}</AppShell>;
}
