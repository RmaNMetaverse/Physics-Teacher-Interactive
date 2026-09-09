import type { Family, Parameters } from '../types';
export interface Trajectory { points: [number, number, number][]; bounds: { min: [number, number, number]; max: [number, number, number] }; duration: number }
export function sampleTrajectory(_family: Family, _parameters: Parameters): Trajectory { throw new Error('Scene sampling not implemented'); }
