export type FeedbackSound = 'correct' | 'try-again' | 'complete';

export interface SynthVoice {
  frequency: number;
  endFrequency: number;
  delay: number;
  duration: number;
  gain: number;
  wave: OscillatorType;
}

export const SOUND_RECIPES: Readonly<Record<FeedbackSound, readonly SynthVoice[]>> = {
  correct: [
    { frequency: 659.25, endFrequency: 783.99, delay: 0, duration: .13, gain: .055, wave: 'sine' },
    { frequency: 987.77, endFrequency: 1174.66, delay: .075, duration: .16, gain: .045, wave: 'sine' },
  ],
  'try-again': [
    { frequency: 392, endFrequency: 329.63, delay: 0, duration: .16, gain: .04, wave: 'triangle' },
  ],
  complete: [
    { frequency: 523.25, endFrequency: 587.33, delay: 0, duration: .18, gain: .05, wave: 'sine' },
    { frequency: 659.25, endFrequency: 783.99, delay: .09, duration: .2, gain: .055, wave: 'sine' },
    { frequency: 783.99, endFrequency: 1046.5, delay: .19, duration: .26, gain: .06, wave: 'triangle' },
  ],
};

let sharedContext: AudioContext | null = null;

function audioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext
    || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  try {
    if (!sharedContext || sharedContext.state === 'closed') sharedContext = new AudioContextClass();
    return sharedContext;
  } catch {
    return null;
  }
}

/** Plays a tiny Web Audio cue. It creates no files, requests, or persistent streams. */
export function playFeedbackSound(cue: FeedbackSound, enabled = true): void {
  if (!enabled) return;
  const context = audioContext();
  if (!context) return;
  if (context.state === 'suspended') void context.resume().catch(() => {});

  const now = context.currentTime;
  for (const voice of SOUND_RECIPES[cue]) {
    const start = now + voice.delay;
    const stop = start + voice.duration;
    const oscillator = context.createOscillator();
    const envelope = context.createGain();

    oscillator.type = voice.wave;
    oscillator.frequency.setValueAtTime(voice.frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(voice.endFrequency, stop);
    envelope.gain.setValueAtTime(.0001, start);
    envelope.gain.exponentialRampToValueAtTime(voice.gain, start + Math.min(.018, voice.duration / 3));
    envelope.gain.exponentialRampToValueAtTime(.0001, stop);

    oscillator.connect(envelope);
    envelope.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(stop + .01);
  }
}
