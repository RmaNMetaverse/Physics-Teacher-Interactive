import type { Family, Parameters } from '../types';
import { evaluate, simulations } from './index';

type Point = [number, number, number];
export interface Trajectory {
  points: Point[];
  bounds: { min: Point; max: Point };
  duration: number;
}

/** SI scene data. Bounds cover every sampled body and the origin, including body radii. */
export function sampleTrajectory(family: Family, parameters: Parameters): Trajectory {
  const initial = evaluate(family, parameters, 0);
  let duration = evaluate(family, parameters, simulations[family].duration).time;
  if (family === 'gravity') {
    const period = initial.observations.find(o => o.key === 'period')!.value;
    duration = Math.min(period, simulations[family].duration);
  }
  const points: Point[] = [];
  const min: Point = [0, 0, 0], max: Point = [0, 0, 0];
  const segments = family === 'vectors' || family === 'measurement' || duration === 0 ? 0 : 120;
  for (let i = 0; i <= segments; i++) {
    const state = evaluate(family, parameters, segments === 0 ? 0 : duration * i / segments);
    for (const b of state.bodies) {
      for (let axis = 0; axis < 3; axis++) {
        min[axis] = Math.min(min[axis], b.position[axis] - b.radius);
        max[axis] = Math.max(max[axis], b.position[axis] + b.radius);
      }
    }
    if (family === 'vectors' || family === 'measurement') {
      points.push(...state.bodies.map(b => [...b.position] as Point));
    } else {
      const primary = state.bodies.find(b => b.id !== 'central-mass' && b.id !== 'origin');
      if (primary) points.push([...primary.position]);
    }
  }
  for (let axis = 0; axis < 3; axis++) {
    if (max[axis] - min[axis] < 1) {
      const middle = (min[axis] + max[axis]) / 2;
      min[axis] = middle - .5;
      max[axis] = middle + .5;
    }
  }
  return { points, bounds: { min, max }, duration };
}
