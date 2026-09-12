import { describe, expect, it } from 'vitest';
import { initialPixelRatio, nextPixelRatio } from '../src/components/simulation/render-policy';

describe('bounded rendering budget', () => {
  it('starts phones and low concurrency devices at native resolution', () => {
    expect(initialPixelRatio(390, 8, 3)).toBe(1);
    expect(initialPixelRatio(1440, 4, 2)).toBe(1);
    expect(initialPixelRatio(1440, 12, 3)).toBe(1.5);
    expect(initialPixelRatio(1440, 12, 1)).toBe(1);
  });
  it('reduces resolution on sustained slow frames, never beyond its floor', () => {
    expect(nextPixelRatio(1.5, 40)).toBe(1.25);
    expect(nextPixelRatio(.75, 100)).toBe(.75);
    expect(nextPixelRatio(1.25, 16)).toBe(1.25);
  });
});
