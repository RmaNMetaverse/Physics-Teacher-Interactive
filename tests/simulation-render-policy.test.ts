import { describe, expect, it } from 'vitest';
import { supportsSpatial3D } from '../src/components/simulation/render-policy';
import type { ModelId } from '../src/types';

describe('simulation rendering policy', () => {
  it('keeps 3D only where spatial depth carries teaching value', () => {
    const spatial: ModelId[] = ['gravity', 'electromagnetism', 'atomic', 'condensed', 'astrophysics'];
    const planar: ModelId[] = ['measurement', 'vectors', 'motion', 'forces', 'energy', 'collisions', 'oscillations', 'waves', 'thermal', 'circuits', 'microcontroller', 'optics', 'relativity', 'quantum', 'nuclear', 'particle', 'cosmology'];
    spatial.forEach(id => expect(supportsSpatial3D(id)).toBe(true));
    planar.forEach(id => expect(supportsSpatial3D(id)).toBe(false));
  });
});
