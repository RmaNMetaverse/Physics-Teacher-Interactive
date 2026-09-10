import { attenuation, defineModel, K_B, observation as o, parameter as p, state } from './shared';

export const condensed = defineModel('condensed', 'Fermi-Dirac occupancy', 'Mean equilibrium occupation of one fermion state.', [
  p('energy', 'Single-state energy', 'J', -1e-17, 1e-17, 1e-21, 0),
  p('chemicalPotential', 'Chemical potential', 'J', -1e-17, 1e-17, 1e-21, 0),
  p('temperature', 'Absolute temperature', 'K', .001, 10000, 1, 300),
], 60, (p, t) => {
  const x = (p.energy - p.chemicalPotential) / (K_B * p.temperature);
  const tail = attenuation(Math.abs(x));
  const occupancy = x >= 0 ? tail / (1 + tail) : 1 / (1 + tail);
  return state(t, 'Fermi-Dirac mean occupancy f(E) = 1/[exp((E−μ)/(kBT)) + 1] for an equilibrium independent-fermion state at positive temperature. Chemical potential is prescribed; no density of states, band structure, transport or interacting-electron calculation. Exponential tails clip at magnitude 700.', [
    o('occupancy', 'Mean state occupancy', occupancy), o('energyOffset', 'Energy relative to chemical potential', p.energy - p.chemicalPotential, 'J'),
  ]);
});
