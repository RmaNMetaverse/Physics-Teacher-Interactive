import { ArrowLeft, Check, Clock3, Flag, Play, Star } from 'lucide-react';
import type { CourseDefinition, MissionDefinition } from '../learning/types';
import type { LearnerProgressV2 } from '../progress/types';

interface CoursePathPageProps { course: CourseDefinition; progress: LearnerProgressV2 }

const keyFor = (courseId: string, missionId: string) => `${courseId}/${missionId}`;

function nextMission(course: CourseDefinition, progress: LearnerProgressV2): MissionDefinition | undefined {
  const saved = progress.nextMissionByCourse[course.id];
  return course.missions.find(mission => mission.id === saved)
    ?? course.missions.find(mission => !progress.completedMissions.includes(keyFor(course.id, mission.id)));
}

export function CoursePathPage({ course, progress }: CoursePathPageProps) {
  const next = nextMission(course, progress);
  const completed = course.missions.filter(mission => progress.completedMissions.includes(keyFor(course.id, mission.id)));
  const remainingMinutes = course.missions
    .filter(mission => !progress.completedMissions.includes(keyFor(course.id, mission.id)))
    .reduce((total, mission) => total + mission.minutes, 0);
  const percent = Math.round(completed.length / course.missions.length * 100);

  return <>
    <header className="course-path-header">
      <a className="contextual-back" href="#/explore"><ArrowLeft aria-hidden="true" />Back to Explore</a>
      <div><p className="eyebrow">Course path</p><h1>{course.title}</h1></div>
      <dl>
        <div><dt>Progress</dt><dd>{percent}%</dd></div>
        <div><dt>Time remaining</dt><dd>{remainingMinutes} min</dd></div>
      </dl>
    </header>
    <progress className="path-progress" value={completed.length} max={course.missions.length} aria-label={`${course.title} course progress`}>{percent}%</progress>
    <p className="path-guidance">Follow the suggested order or choose any available mission.</p>
    <ol className="mission-path" aria-label={`${course.title} mission path`}>
      {course.missions.map((mission, index) => {
        const key = keyFor(course.id, mission.id);
        const isComplete = progress.completedMissions.includes(key);
        const isNext = mission.id === next?.id;
        const state = isComplete ? 'complete' : mission.kind === 'checkpoint' ? 'checkpoint' : isNext ? 'next' : 'available';
        const stars = progress.missionStars[key];
        const stateLabel = isComplete ? 'Complete' : isNext ? 'Up next' : mission.kind === 'checkpoint' ? 'Checkpoint' : 'Available';
        return <li key={mission.id} className={`mission-node mission-node-${state}${isNext ? ' mission-node-recommended' : ''}`}>
          <a href={`#/mission/${course.id}/${mission.id}`} data-state={state} data-kind={mission.kind}>
            <span className="mission-node-marker" aria-hidden="true">{isComplete ? <Check /> : mission.kind === 'checkpoint' ? <Flag /> : isNext ? <Play /> : index + 1}</span>
            <span className="mission-node-copy"><span>{stateLabel}</span><strong>{mission.title}</strong><small>{mission.summary}</small></span>
            <span className="mission-node-reward"><Clock3 aria-hidden="true" />{mission.minutes} min{stars && <><Star aria-hidden="true" />{stars}</>}</span>
          </a>
        </li>;
      })}
    </ol>
  </>;
}
