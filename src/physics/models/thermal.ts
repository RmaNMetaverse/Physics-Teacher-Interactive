import { defineModel, observation as o, parameter as p, R, state } from './shared';

export const thermal = defineModel('thermal', 'Ideal gas', 'Equilibrium pressure from amount, temperature and volume.', [
  p('amount', 'Amount of gas', 'mol', 0, 100, .01, 1),
  p('temperature', 'Absolute temperature', 'K', 1, 10000, 1, 300),
  p('volume', 'Volume', 'm³', 1e-6, 100, .001, 1),
], 60, (p, t) => state(t, 'PV = nRT for an equilibrium ideal gas with negligible molecular volume and interactions. No phase changes, heat transfer dynamics or real-gas corrections.', [
  o('pressure', 'Pressure', p.amount * R * p.temperature / p.volume, 'Pa'),
  o('pv', 'Pressure times volume', p.amount * R * p.temperature, 'J'),
]));
