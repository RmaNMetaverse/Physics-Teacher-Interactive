import { defineModel, observation as o, parameter as p, state } from './shared';

export const optics = defineModel('optics', 'Thin converging lens', 'Real and virtual paraxial images.', [
  p('focalLength', 'Positive focal length', 'm', .001, 10, .001, .1),
  p('objectDistance', 'Real object distance', 'm', .001, 100, .001, .2),
], 60, (p, t) => {
  const vergence = 1 / p.focalLength - 1 / p.objectDistance;
  // A finite image is unresolved beyond 1e12 m; never substitute a fake finite image.
  const atInfinity = Math.abs(vergence) < 1e-12;
  const observations = [o('imageVergence', 'Image vergence', vergence, '1/m'), o('imageAtInfinity', 'Collimated or unresolved image (1 = yes)', Number(atInfinity))];
  if (!atInfinity) {
    const imageDistance = 1 / vergence;
    observations.push(o('imageDistance', 'Signed image distance', imageDistance, 'm'), o('magnification', 'Signed transverse magnification', -imageDistance / p.objectDistance));
  }
  return state(t, 'Ideal thin converging lens, real object and paraxial rays. Positive image distance means a real image; negative means virtual. No aberration, diffraction or lens thickness.' +
    (atInfinity ? ' Rays are collimated within 1e-12 m⁻¹ resolution; image distance and magnification are undefined or unresolved and omitted.' : ''), observations);
});
