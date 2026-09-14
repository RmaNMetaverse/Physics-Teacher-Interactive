import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowRight, Clock3, Flame, Search, Sparkles, Trophy, X } from 'lucide-react';
import type { CourseDefinition, CourseGroup } from '../learning/types';
import type { LearnerProgressV2 } from '../progress/types';

interface ExplorePageProps {
  courses: readonly CourseDefinition[];
  progress: LearnerProgressV2;
}

const filters: Array<{ id: 'all' | CourseGroup; label: string }> = [
  { id: 'all', label: 'All courses' },
  { id: 'foundations', label: 'Foundations' },
  { id: 'classical', label: 'Classical' },
  { id: 'modern', label: 'Modern' },
  { id: 'space', label: 'Space' },
  { id: 'frontier', label: 'Frontier' },
];

const levels: Record<CourseGroup, string> = {
  foundations: 'Beginner',
  classical: 'Developing',
  modern: 'Intermediate',
  space: 'Intermediate',
  frontier: 'Advanced',
};

const courseKey = (courseId: string, missionId: string) => `${courseId}/${missionId}`;
const completedFor = (course: CourseDefinition, progress: LearnerProgressV2) =>
  course.missions.filter(mission => progress.completedMissions.includes(courseKey(course.id, mission.id))).length;

function nextDestination(courses: readonly CourseDefinition[], progress: LearnerProgressV2): { course: CourseDefinition; missionId: string } {
  const selected = courses.find(course => course.id === progress.selectedCourseId) ?? courses[0];
  const saved = progress.nextMissionByCourse[selected.id];
  const mission = selected.missions.find(candidate => candidate.id === saved)
    ?? selected.missions.find(candidate => !progress.completedMissions.includes(courseKey(selected.id, candidate.id)))
    ?? selected.missions[0];
  return { course: selected, missionId: mission.id };
}

export function ExplorePage({ courses, progress }: ExplorePageProps) {
  const [filter, setFilter] = useState<'all' | CourseGroup>('all');
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const next = nextDestination(courses, progress);
  const nextMissionItem = next.course.missions.find(mission => mission.id === next.missionId);
  const nextCompleted = completedFor(next.course, progress);
  const nextPercent = Math.round((nextCompleted / next.course.missions.length) * 100);

  const normalizedQuery = query.trim().toLowerCase();
  const shown = courses.filter(course =>
    (filter === 'all' || course.group === filter)
    && (!normalizedQuery || `${course.title} ${course.description} ${course.scope}`.toLowerCase().includes(normalizedQuery)),
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrlK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      const isSlash = e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA';
      if (isCmdOrCtrlK || isSlash) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return <>
    <header className="explore-heading">
      <div><p className="eyebrow">Choose your next question</p><h1>Explore physics</h1><p>Pick any open course, follow its mission path, and learn by testing ideas.</p></div>
      <div className="learner-summary" aria-label="Learner summary">
        <span><Trophy aria-hidden="true" />{progress.totalXp} XP</span>
        <span><Flame aria-hidden="true" />{progress.streak.current} day streak</span>
      </div>
    </header>

    <section className="continue-hero" aria-label="Continue learning">
      <div className="continue-hero-info">
        <div className="continue-hero-meta">
          <p className="eyebrow">Continue learning</p>
          <span className="continue-badge">{levels[next.course.group]}</span>
          <span className="continue-stats">{nextCompleted} of {next.course.missions.length} complete ({nextPercent}%)</span>
        </div>
        <h2 id="continue-title">{next.course.title}</h2>
        <p className="continue-mission-title">{nextMissionItem?.title}</p>
      </div>
      <a className="adventure-primary-action" href={`#/mission/${next.course.id}/${next.missionId}`}>Continue learning <ArrowRight aria-hidden="true" /></a>
    </section>

    <section aria-labelledby="course-gallery-title">
      <div className="gallery-heading"><div><p className="eyebrow">All paths are open</p><h2 id="course-gallery-title">Course gallery</h2></div><p><Sparkles aria-hidden="true" /> Recommendations are guidance, never gates.</p></div>
      <div className="course-search">
        <Search aria-hidden="true" className="search-icon" />
        <label className="sr-only" htmlFor="course-search">Search courses</label>
        <input
          ref={inputRef}
          id="course-search"
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Search courses (⌘K or /)"
          aria-label="Search courses"
        />
        {query.length > 0 && (
          <button
            type="button"
            className="search-clear-btn"
            aria-label="Clear search"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <X aria-hidden="true" />
          </button>
        )}
        <div className="search-shortcut-hint" aria-hidden="true">
          <kbd>⌘K</kbd>
        </div>
      </div>
      <div className="filter-chips" role="group" aria-label="Filter courses">
        {filters.map(item => <button key={item.id} type="button" className={`filter-chip${filter === item.id ? ' active' : ''}`} aria-pressed={filter === item.id} onClick={() => setFilter(item.id)}>{item.label}</button>)}
      </div>
      <div className="course-card-grid">
        {shown.map(course => {
          const completed = completedFor(course, progress);
          const percent = Math.round((completed / course.missions.length) * 100);
          return <article className="course-card" key={course.id} style={{ '--course-color': course.color } as CSSProperties}>
            <div className="course-card-meta">
              <span className="course-level-badge">{levels[course.group]}</span>
              <span className="course-duration"><Clock3 aria-hidden="true" />{course.estimatedMinutes} min</span>
            </div>
            <h3>{course.title}</h3>
            <p>{course.description}</p>
            <dl>
              <div><dt>Missions</dt><dd>{course.missions.length} missions</dd></div>
              <div><dt>Scope</dt><dd>{course.scope}</dd></div>
            </dl>
            <div className="course-progress">
              <span>{completed} of {course.missions.length} complete</span>
              <span className="tabular-num">{percent}%</span>
            </div>
            <progress value={completed} max={course.missions.length} aria-label={`${course.title} progress`}>{percent}%</progress>
            <a href={`#/course/${course.id}`} aria-label={`Open course: ${course.title}`}>
              <span>Open course</span>
              <ArrowRight aria-hidden="true" />
            </a>
          </article>;
        })}
      </div>
      {shown.length === 0 && <p className="empty-state">No courses match that search and filter.</p>}
    </section>
  </>;
}
