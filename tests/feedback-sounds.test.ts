import { afterEach, describe, expect, it, vi } from 'vitest';
import { SOUND_RECIPES, playFeedbackSound } from '../src/audio/feedback-sounds';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('procedural feedback sounds', () => {
  it('keeps every cue tiny, synthesized, and short', () => {
    expect(Object.keys(SOUND_RECIPES)).toEqual(['correct', 'try-again', 'complete']);
    for (const recipe of Object.values(SOUND_RECIPES)) {
      expect(recipe.length).toBeGreaterThan(0);
      expect(recipe.length).toBeLessThanOrEqual(4);
      expect(Math.max(...recipe.map(voice => voice.delay + voice.duration))).toBeLessThanOrEqual(.55);
      expect(recipe.every(voice => voice.gain <= .075)).toBe(true);
    }
  });

  it('does not create an audio context when sound is disabled', () => {
    const AudioContext = vi.fn();
    vi.stubGlobal('AudioContext', AudioContext);
    playFeedbackSound('correct', false);
    expect(AudioContext).not.toHaveBeenCalled();
  });
});
