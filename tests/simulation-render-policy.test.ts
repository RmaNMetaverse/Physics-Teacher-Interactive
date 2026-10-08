import { describe, expect, it } from 'vitest';
import { supportsSpatial3D, supportsTeaching2D, defaultSimulationView } from '../src/components/simulation/render-policy';
import type { ModelId } from '../src/types';

describe('simulation rendering policy', () => {
  it('offers 2D only for model-driven spatial experiments and electronics workbenches', () => {
    const essential: ModelId[] = ['vectors', 'motion', 'forces', 'energy', 'collisions', 'gravity', 'oscillations', 'circuits', 'microcontroller'];
    const dataFirst: ModelId[] = ['measurement', 'waves', 'thermal', 'electromagnetism', 'optics', 'relativity', 'quantum', 'atomic', 'nuclear', 'particle', 'condensed', 'astrophysics', 'cosmology'];
    essential.forEach(id => {
      expect(supportsTeaching2D(id)).toBe(true);
      expect(defaultSimulationView(id)).toBe('2d');
    });
    dataFirst.forEach(id => {
      expect(supportsTeaching2D(id)).toBe(false);
      expect(defaultSimulationView(id)).toBe('graph');
    });
  });
  it('keeps 3D only where spatial depth carries teaching value', () => {
    const spatial: ModelId[] = ['gravity', 'electromagnetism', 'atomic', 'condensed', 'astrophysics'];
    const planar: ModelId[] = ['measurement', 'vectors', 'motion', 'forces', 'energy', 'collisions', 'oscillations', 'waves', 'thermal', 'circuits', 'microcontroller', 'optics', 'relativity', 'quantum', 'nuclear', 'particle', 'cosmology'];
    spatial.forEach(id => expect(supportsSpatial3D(id)).toBe(true));
    planar.forEach(id => expect(supportsSpatial3D(id)).toBe(false));
  });
});
