export type Family = 'measurement' | 'vectors' | 'motion' | 'forces' | 'energy' | 'collisions' | 'gravity' | 'oscillations';
export type Parameters = Record<string, number>;
export interface Assessment {
  id: string; kind: 'concept' | 'calculation' | 'experiment'; prompt: string;
  options?: string[]; answer: number; tolerance?: number; unit?: string;
  hints: string[]; explanation: string;
}
export interface LessonDefinition {
  id: string; title: string; family: Family; level: string; minutes: number;
  summary: string; objectives: string[]; prerequisites: string[]; math: string[];
  prediction: string; experiment: string[]; explanation: string[];
  equation: string; symbols: string; workedExample: { question: string; steps: string[]; answer: string };
  assessments: Assessment[]; preset: Parameters; assumptions: string[];
  references: { label: string; url: string }[]; reviewedAt: string;
}
export interface MathTutorialDefinition {
  id: string; title: string; summary: string; prerequisites: string[];
  explanation: string[]; equation: string;
  interactive: { kind: 'number' | 'graph' | 'triangle' | 'vector' | 'wave' | 'area'; label: string; min: number; max: number; step: number; initial: number; instruction: string };
  workedExample: { question: string; steps: string[]; answer: string };
  assessment: Assessment;
}
export interface ParameterDefinition { key: string; label: string; unit: string; min: number; max: number; step: number; default: number }
export interface Observation { key: string; label: string; value: number; unit: string; color: string }
export interface Body { id: string; position: [number, number, number]; radius: number; color: string; velocity?: [number, number, number] }
export interface SimulationState { time: number; bodies: Body[]; observations: Observation[]; ended: boolean; description: string }
export interface SimulationDefinition {
  id: Family; title: string; description: string; parameters: ParameterDefinition[];
  duration: number; evaluate: (parameters: Parameters, time: number) => SimulationState;
}
export interface LearnerProgress {
  version: 1; completed: string[]; answers: Record<string, number>; mathCompleted: string[];
  lastLesson: string; theme: 'dark' | 'light'; savedAt: string;
}
