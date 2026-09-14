export function shouldAutoplay(reducedMotion: boolean, suspended: boolean) {
  return !reducedMotion && !suspended;
}

export function advancePlayback(time: number, elapsed: number, duration: number) {
  if (!Number.isFinite(time) || !Number.isFinite(elapsed) || !Number.isFinite(duration) || duration <= 0) return 0;
  const next = Math.max(0, time) + Math.max(0, elapsed);
  return next >= duration ? next % duration : next;
}
