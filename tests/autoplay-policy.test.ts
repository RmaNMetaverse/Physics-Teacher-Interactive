import { describe, expect, it } from 'vitest';
import { advancePlayback, shouldAutoplay } from '../src/components/simulation/playback-policy';

describe('simulation autoplay policy', () => {
  it('starts automatically unless motion is reduced or the lab is suspended', () => {
    expect(shouldAutoplay(false, false)).toBe(true);
    expect(shouldAutoplay(true, false)).toBe(false);
    expect(shouldAutoplay(false, true)).toBe(false);
  });

  it('advances continuously and loops instead of stopping at the model duration', () => {
    expect(advancePlayback(2, 0.5, 3)).toBe(2.5);
    expect(advancePlayback(2.75, 0.25, 3)).toBe(0);
    expect(advancePlayback(2.9, 0.3, 3)).toBeCloseTo(0.2);
  });

  it('keeps invalid or zero-duration models at their initial frame', () => {
    expect(advancePlayback(2, 1, 0)).toBe(0);
    expect(advancePlayback(Number.NaN, 1, 3)).toBe(0);
  });
});
