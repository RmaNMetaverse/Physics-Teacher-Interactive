import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Clock3, Flame, Trophy } from 'lucide-react';
import { AppShell } from './app/AppShell';
import { isValidAppHash, parseHash, toHash, type AppRoute } from './app/router';
import { courseCatalog, courses } from './learning/catalog';
import { readProgressV2, saveProgressV2 } from './progress/progress';
import type { LearnerProgressV2 } from './progress/types';
import { CoursePathPage } from './pages/CoursePathPage';
import { ExplorePage } from './pages/ExplorePage';

function learnHash(progress: LearnerProgressV2): string {
  const course = courseCatalog.courses.get(progress.selectedCourseId) ?? courses[0];
  return toHash({ page: 'course', courseId: course.id });
}

function MissionPlaceholder({ route }: { route: Extract<AppRoute, { page: 'mission' }> }) {
  const course = courseCatalog.getCourse(route.courseId);
  const mission = courseCatalog.getMission(route.courseId, route.missionId);
  return <section className="mission-placeholder">
    <a className="contextual-back" href={`#/course/${course.id}`}><ArrowLeft aria-hidden="true" />Back to {course.title} path</a>
    <p className="eyebrow">{mission.kind === 'checkpoint' ? 'Course checkpoint' : 'Mission'}</p>
    <h1>{mission.title}</h1>
    <p>{mission.summary}</p>
    <div className="mission-placeholder-meta"><span><Clock3 aria-hidden="true" />{mission.minutes} min</span><span><Trophy aria-hidden="true" />{mission.xp} XP</span></div>
    <div className="mission-placeholder-note" role="note"><strong>Mission preview</strong><p>The focused interactive player arrives in the next milestone. You can return to the course path and choose any mission.</p></div>
  </section>;
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
  else if (route.page === 'mission') page = <MissionPlaceholder route={route} />;
  else page = <ProgressPlaceholder progress={progress} />;

  return <AppShell route={route} learnHash={learnHash(progress)} recoveryMessage={recoveryMessage} mainRef={mainRef}>{page}</AppShell>;
}
