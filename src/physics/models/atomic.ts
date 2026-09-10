import { defineModel, E_CHARGE, observation as o, parameter as p, state } from './shared';

export const atomic = defineModel('atomic', 'Hydrogen energy levels', 'Bound hydrogen levels in the Bohr classroom approximation.', [
  p('n', 'Principal quantum number', '', 1, 100, 1, 2),
], 60, (p, t) => {
  const energyEv = -13.6 / p.n ** 2;
  return state(t, 'Hydrogen only: E_n = −13.6/n² eV, with integer n and zero energy at ionization. Rounded Bohr energies neglect reduced-mass corrections, fine structure, spin, external fields and many-electron effects. Levels are not electron trajectories.', [
    o('energy', 'Bound-state energy', energyEv * E_CHARGE, 'J'), o('energyEv', 'Bound-state energy (converted)', energyEv, 'eV'),
    o('ionizationEnergy', 'Energy to ionize this state', -energyEv * E_CHARGE, 'J'),
  ]);
});
