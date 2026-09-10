import { attenuation, defineModel, observation as o, parameter as p, state } from './shared';

export const nuclear = defineModel('nuclear', 'Radioactive decay', 'Expected population for a single exponential decay channel.', [
  p('initial', 'Initial nucleus count', '', 0, 1e24, 1, 100),
  p('halfLife', 'Half-life', 's', 1e-6, 1e12, .1, 2),
], 1e12, (p, t) => {
  const decayConstant = Math.LN2 / p.halfLife;
  const remaining = p.initial * attenuation(decayConstant * t);
  return state(t, 'Expected ensemble population N = N₀ 2^(−t/t_half), allowing fractional counts. A single isolated decay channel; no decay chains, background, stochastic events or detector response. Negligible tails floor at N₀ exp(−700).', [
    o('remaining', 'Expected undecayed nuclei', remaining), o('decayed', 'Expected decayed nuclei', p.initial - remaining),
    o('activity', 'Expected activity', decayConstant * remaining, 'Bq'), o('decayConstant', 'Decay constant', decayConstant, '1/s'),
  ]);
});
