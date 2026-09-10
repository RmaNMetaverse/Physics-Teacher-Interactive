import { defineModel, observation as o, parameter as p, state } from './shared';

export const cosmology = defineModel('cosmology', 'Local Hubble law', 'Linear recession speed at a fixed cosmic epoch.', [
  p('hubbleConstant', 'Hubble expansion rate', '1/s', 1e-19, 1e-17, 1e-19, 2.268545503e-18),
  p('distance', 'Proper distance now', 'm', 0, 1e24, 1e21, 3.085677581e22),
], 60, (p, t) => state(t, 'Local linear Hubble law v = H₀d using proper distance and SI expansion rate at a fixed epoch. Ignores peculiar velocities, lookback-time evolution and curvature. This is not a Doppler redshift or cosmological distance solver; bounds keep recession below about 0.034c.', [
  o('recessionSpeed', 'Hubble recession speed', p.hubbleConstant * p.distance, 'm/s'),
  o('hubbleTime', 'Inverse expansion rate (not universe age)', 1 / p.hubbleConstant, 's'),
]));
