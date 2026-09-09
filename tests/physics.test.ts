import { describe, expect, it } from 'vitest';
import { defaults, evaluate, sanitizeParameters, simulations } from '../src/physics';
import type { Family, Parameters, SimulationState } from '../src/types';

const value = (s: SimulationState, key: string) => {
  const found = s.observations.find(o => o.key === key);
  if (!found) throw new Error(`Missing observation ${key}`);
  return found.value;
};
const run = (family: Family, params: Parameters = {}, t = 0) => evaluate(family, params, t);

describe('measurement and vectors', () => {
  it('propagates a unit conversion to uncertainty without changing relative uncertainty', () => {
    const s = run('measurement', { length: 2, uncertainty: .05, scale: 100 });
    expect(value(s, 'converted')).toBe(200);
    expect(value(s, 'convertedUncertainty')).toBe(5);
    expect(value(s, 'relative')).toBeCloseTo(2.5);
  });
  it('resolves a vector and adds components independently', () => {
    const s = run('vectors', { magnitude: 5, angle: 0, bx: -5, by: 3 });
    expect(value(s, 'ax')).toBe(5);
    expect(value(s, 'ay')).toBe(0);
    expect(value(s, 'resultant')).toBe(3);
  });
});

describe('motion', () => {
  it('integrates constant velocity and acceleration with signed positions', () => {
    expect(value(run('motion', { mode: 0, speed: 3 }, 2), 'x')).toBe(6);
    const s = run('motion', { mode: 1, speed: 3, acceleration: -2 }, 4);
    expect(value(s, 'x')).toBe(-4);
    expect(value(s, 'vx')).toBe(-5);
  });
  it('lands a projectile at its analytic range without extending past impact', () => {
    const s = run('motion', { mode: 3, speed: 20, angle: 45, g: 10, height: 0 }, 10);
    expect(value(s, 'x')).toBeCloseTo(40);
    expect(value(s, 'y')).toBeCloseTo(0);
    expect(s.time).toBeCloseTo(2 * Math.sqrt(2));
    expect(s.ended).toBe(true);
  });
  it('drops from rest and reports mass-independent fall time', () => {
    const s = run('motion', { mode: 2, height: 20, g: 10, speed: 99 }, 10);
    expect(s.time).toBe(2);
    expect(value(s, 'vy')).toBe(-20);
  });
});

describe('forces and energy', () => {
  it('balances a sub-threshold applied force with static friction', () => {
    const s = run('forces', { mass: 2, force: 3, friction: .2, g: 10 }, 3);
    expect(value(s, 'netForce')).toBe(0);
    expect(value(s, 'frictionForce')).toBe(-3);
    expect(value(s, 'displacement')).toBe(0);
  });
  it('accelerates down an incline with the correct normal reaction', () => {
    const s = run('forces', { mass: 2, force: 0, angle: 30, friction: 0, g: 10 }, 2);
    expect(value(s, 'acceleration')).toBeCloseTo(5);
    expect(value(s, 'normal')).toBeCloseTo(10 * Math.sqrt(3));
    expect(value(s, 'displacement')).toBeCloseTo(10);
  });
  it('conserves energy in a frictionless fall and stops at the ground', () => {
    const initial = run('energy', { mass: 2, height: 5, angle: 90, g: 10 });
    const end = run('energy', { mass: 2, height: 5, angle: 90, g: 10 }, 9);
    expect(value(initial, 'totalEnergy')).toBe(100);
    expect(value(end, 'kinetic')).toBeCloseTo(100);
    expect(value(end, 'potential')).toBe(0);
    expect(value(end, 'speed')).toBeCloseTo(10);
    expect(end.time).toBeCloseTo(1);
  });
  it('accounts for frictional thermal energy, including a slope held at rest', () => {
    const p = { mass: 2, height: 5, angle: 30, friction: .2, g: 10 };
    const end = run('energy', p, 20);
    expect(value(end, 'kinetic') + value(end, 'thermal')).toBeCloseTo(100);
    expect(value(end, 'thermal')).toBeCloseTo(.2 * 20 * Math.cos(Math.PI / 6) * 10);
    expect(value(run('energy', { ...p, friction: 1 }, 5), 'speed')).toBe(0);
  });
});

describe('collisions', () => {
  it('exchanges equal-mass velocities in an elastic collision', () => {
    const s = run('collisions', { mass1: 1, mass2: 1, velocity1: 3, velocity2: 0 }, 3);
    expect(value(s, 'velocity1')).toBe(0);
    expect(value(s, 'velocity2')).toBe(3);
    expect(value(s, 'momentum')).toBe(3);
    expect(value(s, 'kinetic')).toBe(4.5);
  });
  it('conserves unequal-mass momentum when bodies stick', () => {
    const s = run('collisions', { mass1: 2, mass2: 3, velocity1: 4, velocity2: -1, restitution: 0 }, 3);
    expect(value(s, 'velocity1')).toBeCloseTo(1);
    expect(value(s, 'velocity2')).toBeCloseTo(1);
    expect(value(s, 'momentum')).toBeCloseTo(5);
    expect(value(s, 'energyLost')).toBeCloseTo(15);
    expect(s.bodies[1].position[0] - s.bodies[0].position[0]).toBeCloseTo(.6);
  });
  it('does not collide bodies moving apart', () => {
    const s = run('collisions', { velocity1: -2, velocity2: 2 }, 3);
    expect(value(s, 'velocity1')).toBe(-2);
    expect(value(s, 'energyLost')).toBe(0);
  });
});

describe('gravity', () => {
  it('returns to the initial point after one circular period', () => {
    const s = run('gravity');
    const period = value(s, 'period');
    const later = run('gravity', {}, period);
    expect(later.bodies[1].position[0]).toBeCloseTo(7e6, 4);
    expect(later.bodies[1].position[1]).toBeCloseTo(0, 4);
  });
  it.each([.75, 1, 1.2])('conserves energy and angular momentum at speed factor %s', speedFactor => {
    const initial = run('gravity', { speedFactor });
    for (const t of [100, 900, 2300, 5200]) {
      const s = run('gravity', { speedFactor }, t);
      expect(value(s, 'totalEnergy') / value(initial, 'totalEnergy')).toBeCloseTo(1, 10);
      expect(value(s, 'angularMomentum') / value(initial, 'angularMomentum')).toBeCloseTo(1, 10);
    }
  });
});

describe('oscillations', () => {
  it('preserves spring energy and reaches equilibrium in a quarter period', () => {
    const p = { mass: 2, stiffness: 8, amplitude: 3 };
    const s = run('oscillations', p, Math.PI / 4);
    expect(value(s, 'displacement')).toBeCloseTo(0);
    expect(value(s, 'velocity')).toBeCloseTo(-6);
    expect(value(s, 'totalEnergy')).toBeCloseTo(36);
  });
  it('uses the small-angle pendulum period and actual bob geometry', () => {
    const initial = run('oscillations', { mode: 1, length: 2, angle: 10, g: 10 });
    expect(value(initial, 'period')).toBeCloseTo(2 * Math.PI * Math.sqrt(.2));
    const [x, y] = initial.bodies[0].position;
    expect(x * x + y * y).toBeCloseTo(4);
    expect(initial.description).toContain('small-angle');
  });
});

describe('boundary and deterministic contract', () => {
  it('exposes all eight families and independent defaults', () => {
    expect(Object.keys(simulations)).toHaveLength(8);
    const p = defaults('motion'); p.speed = 999;
    expect(defaults('motion').speed).toBe(12);
  });
  it('clamps bounds, defaults non-finite inputs and rejects unknown keys', () => {
    expect(sanitizeParameters('motion', { speed: Infinity, height: -100, mode: 2.7, unknown: 3 }))
      .toMatchObject({ speed: 12, height: 0, mode: 3 });
    expect(sanitizeParameters('motion', { unknown: 3 })).not.toHaveProperty('unknown');
  });
  it.each(['measurement', 'vectors', 'motion', 'forces', 'energy', 'collisions', 'gravity', 'oscillations'] as Family[])('returns only finite deterministic states for %s at boundaries', family => {
    for (const time of [-10, NaN, Infinity, 0, 1e8]) {
      const s = run(family, { mass: NaN, g: Infinity }, time);
      expect(s).toEqual(run(family, { mass: NaN, g: Infinity }, time));
      expect(s.time).toBeGreaterThanOrEqual(0);
      expect(s.time).toBeLessThanOrEqual(simulations[family].duration);
      for (const o of s.observations) expect(Number.isFinite(o.value)).toBe(true);
      for (const b of s.bodies) for (const x of b.position) expect(Number.isFinite(x)).toBe(true);
    }
  });
});


it('reports symmetric measurement interval bounds in SI', () => {
  const s = run('measurement', { length: 2, uncertainty: .05, scale: 100 });
  expect(value(s, 'lowerBound')).toBeCloseTo(1.95);
  expect(value(s, 'upperBound')).toBeCloseTo(2.05);
});

it('keeps all observations and body kinematics finite at every control corner', () => {
  for (const family of Object.keys(simulations) as Family[]) {
    const defs = simulations[family].parameters;
    for (let mask = 0; mask < 2 ** defs.length; mask++) {
      const p = Object.fromEntries(defs.map((d, i) => [d.key, mask & 2 ** i ? d.max : d.min]));
      for (const time of [0, simulations[family].duration / 2, simulations[family].duration]) {
        const s = run(family, p, time);
        for (const o of s.observations) expect(Number.isFinite(o.value)).toBe(true);
        for (const b of s.bodies) for (const v of [...b.position, ...(b.velocity ?? []), b.radius]) expect(Number.isFinite(v)).toBe(true);
      }
    }
  }
});
