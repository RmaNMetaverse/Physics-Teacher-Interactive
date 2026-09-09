import { describe, expect, it } from 'vitest';
import { sampleTrajectory } from '../src/physics/scene';
import { evaluate, simulations } from '../src/physics';
import type { Family } from '../src/types';

describe('physical scene sampling', () => {
  it('terminates a projectile path exactly at its analytic ground impact', () => {
    const trajectory = sampleTrajectory('motion', { mode: 3, speed: 20, angle: 45, g: 10, height: 0 });
    expect(trajectory.duration).toBeCloseTo(2 * Math.sqrt(2));
    expect(trajectory.points.at(-1)?.[0]).toBeCloseTo(40);
    expect(trajectory.points.at(-1)?.[1]).toBeCloseTo(0);
    expect(trajectory.bounds.max[1]).toBeGreaterThanOrEqual(10);
  });
  it('samples the satellite through one circular orbit and includes the central mass in bounds', () => {
    const trajectory = sampleTrajectory('gravity', {});
    const period = evaluate('gravity', {}, 0).observations.find(o => o.key === 'period')!.value;
    expect(trajectory.duration).toBeCloseTo(period);
    expect(trajectory.points[0][0]).toBe(7e6);
    expect(trajectory.points.at(-1)?.[0]).toBeCloseTo(7e6, 4);
    expect(trajectory.bounds.min[0]).toBeLessThan(-6e6);
    expect(trajectory.bounds.max[0]).toBeGreaterThan(6e6);
  });
  it('clamps a long orbital trajectory to the simulation duration', () => {
    expect(sampleTrajectory('gravity', { radius: 2e7, centralMass: 1e24 }).duration).toBe(simulations.gravity.duration);
  });
  it('uses all three static vector endpoints in head-to-tail order', () => {
    expect(sampleTrajectory('vectors', { magnitude: 5, angle: 0, bx: -5, by: 3 }).points)
      .toEqual([[0, 0, 0], [5, 0, 0], [0, 3, 0]]);
  });
  it('keeps both collision bodies in bounds while the line follows body A', () => {
    const trajectory = sampleTrajectory('collisions', { velocity1: -2, velocity2: 2 });
    expect(trajectory.points[0][0]).toBe(-3);
    expect(trajectory.bounds.min[0]).toBeLessThanOrEqual(-19.3);
    expect(trajectory.bounds.max[0]).toBeGreaterThanOrEqual(19.3);
  });
  it('gives stationary scenes positive finite extents', () => {
    const trajectory = sampleTrajectory('motion', { mode: 0, speed: 0 });
    for (let axis = 0; axis < 3; axis++) {
      expect(trajectory.bounds.max[axis] - trajectory.bounds.min[axis]).toBeGreaterThanOrEqual(1);
    }
  });
  it.each(Object.keys(simulations) as Family[])('returns finite points within scene bounds for %s', family => {
    const trajectory = sampleTrajectory(family, {});
    expect(trajectory.points.length).toBeGreaterThan(0);
    for (const point of trajectory.points) for (let axis = 0; axis < 3; axis++) {
      expect(Number.isFinite(point[axis])).toBe(true);
      expect(point[axis]).toBeGreaterThanOrEqual(trajectory.bounds.min[axis]);
      expect(point[axis]).toBeLessThanOrEqual(trajectory.bounds.max[axis]);
    }
  });
});
