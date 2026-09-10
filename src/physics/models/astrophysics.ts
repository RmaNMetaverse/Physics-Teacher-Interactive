import { defineModel, observation as o, parameter as p, state, STEFAN_BOLTZMANN } from './shared';

export const astrophysics = defineModel('astrophysics', 'Blackbody luminosity', 'Thermal luminosity of a spherical blackbody.', [
  p('radius', 'Radius', 'm', 1, 1e12, 1e6, 6.957e8),
  p('temperature', 'Effective temperature', 'K', 1, 1e6, 1, 5772),
], 60, (p, t) => {
  const flux = STEFAN_BOLTZMANN * p.temperature ** 4;
  return state(t, 'Spherical uniform ideal blackbody with unit emissivity: L = 4πR²σT⁴. Temperature is an effective surface temperature. No stellar structure, atmosphere, spectral lines, evolution, extinction or relativistic corrections.', [
    o('luminosity', 'Bolometric luminosity', 4 * Math.PI * p.radius ** 2 * flux, 'W'),
    o('surfaceFlux', 'Radiant surface flux', flux, 'W/m²'),
  ]);
});
