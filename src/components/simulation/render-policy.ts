import type { ModelId } from '../../types';

const SPATIAL_3D_MODELS = new Set<ModelId>([
  'gravity', 'electromagnetism', 'atomic', 'condensed', 'astrophysics',
]);

const TEACHING_2D_MODELS = new Set<ModelId>([
  'vectors', 'motion', 'forces', 'energy', 'collisions', 'gravity', 'oscillations',
  'circuits', 'microcontroller',
]);

/** Only retain spatial views tied to calculated bodies or an interactive circuit. */
export function supportsTeaching2D(modelId: ModelId): boolean {
  return TEACHING_2D_MODELS.has(modelId);
}

export function defaultSimulationView(modelId: ModelId): '2d' | 'graph' {
  return supportsTeaching2D(modelId) ? '2d' : 'graph';
}

/** 3D is offered only when depth carries meaning. */
export function supportsSpatial3D(modelId: ModelId): boolean {
  return SPATIAL_3D_MODELS.has(modelId);
}

/** Conservative initial budget; no device identification or GPU fingerprinting. */
export function initialPixelRatio(width: number, cores: number, deviceRatio: number): number {
  return Math.min(deviceRatio, width < 768 || cores <= 4 ? 1 : 1.5);
}

/** Only downgrade after a measured window; avoids repeated reallocations and oscillation. */
export function nextPixelRatio(current: number, frameMilliseconds: number): number {
  return frameMilliseconds > 28 ? Math.max(.75, current - .25) : current;
}
