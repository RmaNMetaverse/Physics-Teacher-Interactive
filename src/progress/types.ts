import type { FontName, ThemeName } from '../appearance';

export type StarCount = 1 | 2 | 3;

export interface MissionCompletionInput {
  courseId: string;
  missionId: string;
  stars: StarCount;
}

export interface LearnerProgressV2 {
  version: 2;
  selectedCourseId: string;
  nextMissionByCourse: Record<string, string>;
  completedMissions: string[];
  missionStars: Record<string, StarCount>;
  stepAttempts: Record<string, number>;
  answers: Record<string, number | string>;
  completedMathSteps: string[];
  xpLedger: Record<string, number>;
  totalXp: number;
  streak: { current: number; longest: number; lastActiveDate: string };
  dailyGoal: 1 | 3 | 5;
  badges: string[];
  settings: {
    theme: ThemeName;
    sound: boolean;
    reducedMotion: boolean;
    celebrations: boolean;
    primaryColor?: string;
    secondaryColor?: string;
    liquidGlass?: boolean;
    font?: FontName;
  };
  savedAt: string;
}

export interface ProgressStepInput {
  courseId: string;
  missionId: string;
  stepId: string;
  answer?: number | string;
}
