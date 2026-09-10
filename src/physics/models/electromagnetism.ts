import { COULOMB_K, defineModel, observation as o, parameter as p, state } from './shared';

export const electromagnetism = defineModel('electromagnetism', 'Point-charge field', 'Signed radial electric field in vacuum.', [
  p('charge', 'Source charge', 'C', -1e-3, 1e-3, 1e-9, 1e-9),
  p('distance', 'Radial distance', 'm', 1e-6, 1000, .01, 1),
], 60, (p, t) => state(t, 'Static isolated point charge in vacuum: positive field is radially outward. Distance excludes the singular source. No magnetic fields, radiation, material polarization or finite-size source.', [
  o('electricField', 'Signed radial electric field', COULOMB_K * p.charge / p.distance ** 2, 'N/C'),
  o('potential', 'Potential relative to infinity', COULOMB_K * p.charge / p.distance, 'V'),
]));
