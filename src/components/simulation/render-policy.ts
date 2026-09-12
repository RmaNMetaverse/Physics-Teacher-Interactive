/** Conservative initial budget; no device identification or GPU fingerprinting. */
export function initialPixelRatio(width: number, cores: number, deviceRatio: number): number {
  return Math.min(deviceRatio, width < 768 || cores <= 4 ? 1 : 1.5);
}

/** Only downgrade after a measured window; avoids repeated reallocations and oscillation. */
export function nextPixelRatio(current: number, frameMilliseconds: number): number {
  return frameMilliseconds > 28 ? Math.max(.75, current - .25) : current;
}
