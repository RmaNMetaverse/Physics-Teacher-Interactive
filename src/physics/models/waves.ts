import { defineModel, observation as o, parameter as p, state } from './shared';

export const waves = defineModel('waves', 'Traveling wave', 'An ideal sinusoidal wave in one dimension.', [
  p('frequency', 'Frequency', 'Hz', .01, 1000, .01, 2),
  p('wavelength', 'Wavelength', 'm', .001, 100, .001, 3),
  p('amplitude', 'Amplitude', 'm', 0, 10, .01, .5),
  p('position', 'Sample position', 'm', -100, 100, .1, 0),
], 60, (p, t) => {
  const phase = 2 * Math.PI * (p.position / p.wavelength - p.frequency * t);
  return state(t, 'Prescribed sinusoidal displacement y = A sin(2π(x/λ − ft)). Uniform nondispersive medium; no damping, boundaries or wave interactions. Phase speed is not material speed.', [
    o('speed', 'Phase speed', p.frequency * p.wavelength, 'm/s'),
    o('displacement', 'Transverse displacement at sample', p.amplitude * Math.sin(phase), 'm'),
    o('transverseVelocity', 'Transverse velocity at sample', -2 * Math.PI * p.frequency * p.amplitude * Math.cos(phase), 'm/s'),
    o('period', 'Period', 1 / p.frequency, 's'),
  ]);
});
