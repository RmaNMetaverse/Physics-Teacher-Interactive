import type { ModelId, Parameters } from '../types';
import { evaluateModel, modelCatalog } from './catalog';

type Point = [number, number, number];
export interface Trajectory {
  points: Point[];
  bounds: { min: Point; max: Point };
  duration: number;
}

/** SI scene data. Bounds cover every sampled body and the origin, including body radii. */
export function sampleTrajectory(modelId: ModelId, parameters: Parameters): Trajectory {
  const def = modelCatalog[modelId];
  const maxDuration = def?.duration ?? 60;
  const initial = evaluateModel(modelId, parameters, 0);
  let duration = evaluateModel(modelId, parameters, maxDuration).time;
  if (modelId === 'gravity') {
    const period = initial.observations.find(o => o.key === 'period')?.value;
    if (period && Number.isFinite(period)) {
      duration = Math.min(period, maxDuration);
    }
  }
  const points: Point[] = [];
  const min: Point = [0, 0, 0], max: Point = [0, 0, 0];
  const segments = modelId === 'vectors' || modelId === 'measurement' || duration === 0 ? 0 : 120;
  for (let i = 0; i <= segments; i++) {
    const state = evaluateModel(modelId, parameters, segments === 0 ? 0 : duration * i / segments);
    for (const b of state.bodies) {
      for (let axis = 0; axis < 3; axis++) {
        min[axis] = Math.min(min[axis], b.position[axis] - b.radius);
        max[axis] = Math.max(max[axis], b.position[axis] + b.radius);
      }
    }
    if (modelId === 'vectors' || modelId === 'measurement') {
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
