import type { Assessment, ModelId, Parameters } from '../types';
export type { ModelId } from '../types';

export type ScienceStatus = 'established' | 'active-research' | 'interpretation' | 'speculative';
export type CourseGroup = 'foundations' | 'classical' | 'modern' | 'space' | 'frontier';
export interface SourceReference { label: string; url: string }
export interface MathLayer {
  quick: { equation: string; summary: string; symbols: Array<{ symbol: string; meaning: string; unit?: string }> };
  foundation: {
    title: string; concepts: string[]; explanation: string[];
    prerequisites: Array<{ id: string; returnTo: string }>;
    returnTo: string;
    visual: { tutorialId: string; label: string; kind: 'number' | 'ratio' | 'graph' | 'triangle' | 'vector' | 'wave' | 'area'; min: number; max: number; step: number; initial: number; instruction: string };
    workedExample: { question: string; steps: string[]; answer: string }; check: Assessment;
  };
}
export type MissionStep =
  | { id: string; kind: 'observe'; title: string; body: string[] }
  | { id: string; kind: 'predict' | 'check'; assessment: Assessment }
  | { id: string; kind: 'simulate'; modelId: ModelId; prompt: string; preset: Parameters }
  | { id: string; kind: 'math'; title: string; layer: MathLayer }
  | { id: string; kind: 'explain'; title: string; body: string[] }
  | { id: string; kind: 'recap'; takeaways: string[] };
export interface CheckpointRules { badgeId: string; requiredMissionIds: string[] }
interface MissionBase {
  id: string; title: string; summary: string; objectives: string[]; minutes: number; xp: number;
  requiredMath: string[]; modelId?: ModelId; scienceStatus: ScienceStatus; steps: MissionStep[]; sources: SourceReference[]; limitations: string[];
}
export interface NormalMissionDefinition extends MissionBase {
  kind: 'mission'; equation: string; symbols: string; workedExample: { question: string; steps: string[]; answer: string }; reviewedAt: string; detailedExplanation?: string[]; checkpoint?: never;
}
export interface CheckpointMissionDefinition extends MissionBase {
  kind: 'checkpoint'; checkpoint: CheckpointRules;
}
export type MissionDefinition = NormalMissionDefinition | CheckpointMissionDefinition;export interface CourseDefinition {
  id: string; title: string; description: string; group: CourseGroup; scope: string; color: string; recommendations: string[]; access: 'open'; estimatedMinutes: number;
  missions: MissionDefinition[]; sources: SourceReference[]; limitations: string[]; reviewedAt: string;
}
export interface CatalogIds { courses: ReadonlySet<string>; missions: ReadonlySet<string>; math: ReadonlySet<string>; models: ReadonlySet<ModelId> }
export interface CourseCatalog {
  courses: ReadonlyMap<string, CourseDefinition>; missions: ReadonlyMap<string, MissionDefinition>; ids: CatalogIds;
  getCourse(id: string): CourseDefinition; getMission(courseId: string, missionId: string): MissionDefinition;
}
