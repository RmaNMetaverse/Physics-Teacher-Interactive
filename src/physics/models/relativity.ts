import { C, defineModel, observation as o, parameter as p, state } from './shared';

export const relativity = defineModel('relativity', 'Lorentz factor', 'Compare inertial clocks and lengths.', [
  p('beta', 'Signed velocity / light speed', '', -.999999, .999999, .001, .6),
], 60, (p, t) => {
  const gamma = 1 / Math.sqrt((1 - p.beta) * (1 + p.beta));
  return state(t, 'Special relativity for constant inertial relative velocity in flat spacetime. Beta is strictly subluminal. Time dilation compares coordinate time to proper time; no acceleration or gravity.', [
    o('gamma', 'Lorentz factor', gamma), o('speed', 'Signed relative velocity', p.beta * C, 'm/s'),
    o('properTime', 'Moving clock elapsed proper time', t / gamma, 's'), o('lengthRatio', 'Parallel length / rest length', 1 / gamma),
  ]);
});
