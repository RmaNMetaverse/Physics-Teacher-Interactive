import { attenuation, defineModel, ELECTRON_MASS, HBAR, observation as o, parameter as p, state } from './shared';

export const quantum = defineModel('quantum', 'Probability and barrier attenuation', 'A Gaussian position distribution and electron barrier estimate.', [
  p('sigma', 'Position standard deviation', 'm', 1e-12, 1e-6, 1e-12, 1e-9),
  p('center', 'Mean position', 'm', -1e-6, 1e-6, 1e-10, 0),
  p('energy', 'Incident electron energy', 'J', 0, 1e-16, 1e-20, 1.602176634e-19),
  p('barrierHeight', 'Barrier potential energy', 'J', 0, 1e-16, 1e-20, 3.204353268e-19),
  p('width', 'Barrier width', 'm', 0, 1e-6, 1e-11, 1e-10),
], 60, (p, t) => {
  // Midpoint bins on [-6σ, 6σ], normalized as discrete probability masses.
  const count = 121;
  const samples = Array.from({ length: count }, (_, index) => {
    const z = -6 + (index + .5) * 12 / count;
    return { position: p.center + z * p.sigma, probability: Math.exp(-.5 * z * z) };
  });
  const total = samples.reduce((sum, sample) => sum + sample.probability, 0);
  const probabilitySamples = samples.map(sample => ({ ...sample, probability: sample.probability / total }));
  const excess = Math.max(0, p.barrierHeight - p.energy);
  const kappa = Math.sqrt(2 * ELECTRON_MASS * excess) / HBAR;
  return { ...state(t, 'Static Gaussian Born position probabilities, discretized and renormalized over ±6σ; not a trajectory, spreading wave packet or collapse simulation. Separate electron rectangular-barrier estimate T ≈ exp(−2κa) neglects the prefactor and is most useful for opaque barriers below the barrier energy. At or above the barrier it reports the classical no-reflection value 1, not exact quantum transmission. Numerical attenuation floors at exp(−700).', [
    o('transmission', 'Approximate transmission probability', attenuation(2 * kappa * p.width)),
    o('kappa', 'Evanescent inverse length', kappa, '1/m'), o('tunnelingRegime', 'Below barrier (1 = yes)', Number(excess > 0)),
    o('meanPosition', 'Gaussian mean position', p.center, 'm'), o('sigma', 'Gaussian position standard deviation', p.sigma, 'm'),
  ]), probabilitySamples };
});
