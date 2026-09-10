import { C, defineModel, observation as o, parameter as p, state } from './shared';

export const particle = defineModel('particle', 'Relativistic particle energy', 'Energy and momentum for a free particle.', [
  p('mass', 'Rest mass', 'kg', 0, 1e-24, 1e-31, 9.1093837139e-31),
  p('momentum', 'Momentum magnitude', 'kg·m/s', 0, 1e-15, 1e-23, 1e-22),
], 60, (p, t) => {
  const restEnergy = p.mass * C * C, pc = p.momentum * C;
  const energy = Math.hypot(pc, restEnergy);
  // Rationalized subtraction retains tiny nonzero kinetic energies at small momenta.
  const kinetic = energy === 0 ? 0 : pc * (pc / (energy + restEnergy));
  return state(t, 'Free-particle special-relativistic energy E² = (pc)² + (mc²)². Momentum is a magnitude. Includes the massless limit, but no interactions, particle creation, quantum fields or Standard Model dynamics.', [
    o('energy', 'Total energy', energy, 'J'), o('restEnergy', 'Rest energy', restEnergy, 'J'),
    o('pc', 'Momentum times light speed', pc, 'J'), o('kinetic', 'Kinetic energy', kinetic, 'J'),
  ]);
});
