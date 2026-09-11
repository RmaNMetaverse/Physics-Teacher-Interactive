import type { CourseDefinition, MissionDefinition } from '../learning/types';
import type { LearnerProgressV2 } from '../progress/types';
import { MissionPlayer } from '../components/mission/MissionPlayer';

interface MissionPageProps {
  course: CourseDefinition;
  mission: MissionDefinition;
  progress: LearnerProgressV2;
  onProgressChange?: (next: LearnerProgressV2) => void;
}

export function MissionPage({ course, mission, progress, onProgressChange }: MissionPageProps) {
  return (
    <MissionPlayer
      course={course}
      mission={mission}
      progress={progress}
      onProgressChange={onProgressChange}
    />
  );
}
