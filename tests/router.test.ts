import { describe, expect, it } from 'vitest';
import { isValidAppHash, parseHash, toHash } from '../src/app/router';

describe('hash router', () => {
  it.each(['', '#', '#/', '#/explore'])(
    'opens Explore for the first-visit hash %j',
    hash => expect(parseHash(hash)).toEqual({ page: 'explore' }),
  );

  it('parses released course and mission routes', () => {
    expect(parseHash('#/course/quantum')).toEqual({ page: 'course', courseId: 'quantum' });
    expect(parseHash('#/mission/quantum/quantum-build-a-wavefunction')).toEqual({
      page: 'mission',
      courseId: 'quantum',
      missionId: 'quantum-build-a-wavefunction',
    });
    expect(parseHash('#/progress')).toEqual({ page: 'progress' });
  });

  it.each([
    '#/course/not-a-course',
    '#/course/quantum/extra',
    '#/mission/quantum/not-a-mission',
    '#/mission/foundations/quantum-build-a-wavefunction',
    '#/lesson/projectile-motion',
    '#/does-not-exist',
  ])('recovers malformed, retired, and unknown routes %s to Explore', hash => {
    expect(isValidAppHash(hash)).toBe(false);
    expect(parseHash(hash)).toEqual({ page: 'explore' });
  });

  it('serializes every supported route to a GitHub Pages-safe hash', () => {
    expect(toHash({ page: 'explore' })).toBe('#/explore');
    expect(toHash({ page: 'course', courseId: 'quantum' })).toBe('#/course/quantum');
    expect(toHash({ page: 'mission', courseId: 'quantum', missionId: 'quantum-build-a-wavefunction' }))
      .toBe('#/mission/quantum/quantum-build-a-wavefunction');
    expect(toHash({ page: 'progress' })).toBe('#/progress');
  });
});
