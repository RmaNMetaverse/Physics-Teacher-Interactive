import { describe, expect, it } from 'vitest';
import { evaluate, evaluateModel, modelCatalog, modelDefaults, sanitizeModelParameters } from '../src/physics';
import { createCourseCatalog } from '../src/learning/catalog';
import { foundationCourse } from '../src/learning/foundations';
import type { ModelId, Parameters, SimulationState } from '../src/types';

const advanced = ['waves', 'thermal', 'electromagnetism', 'optics', 'relativity', 'quantum', 'atomic', 'nuclear', 'particle', 'condensed', 'astrophysics', 'cosmology'] as const;
const value = (state: SimulationState, key: string) => {
  const observation = state.observations.find(item => item.key === key);
  expect(observation, `missing observation ${key}`).toBeDefined();
  return observation!.value;
};
const run = (id: ModelId, parameters: Parameters = {}, time = 0) => evaluateModel(id, parameters, time);
function expectFinite(input: unknown): void {
  if (typeof input === 'number') expect(Number.isFinite(input)).toBe(true);
  else if (input && typeof input === 'object') Object.values(input).forEach(expectFinite);
}

describe('independent analytic classroom cases', () => {
  it('propagates a 2 Hz, 3 m wave at 6 m/s with quarter-cycle displacement', () => {
    expect(value(run('waves', { frequency: 2, wavelength: 3 }), 'speed')).toBeCloseTo(6);
    expect(value(run('waves', { frequency: 2, wavelength: 3, amplitude: .4 }, .125), 'displacement')).toBeCloseTo(-.4);
  });
  it('gives 2494.338785 Pa for one mole at 300 K in one cubic meter', () => {
    expect(value(run('thermal', { amount: 1, temperature: 300, volume: 1 }), 'pressure')).toBeCloseTo(2494.338785, 5);
    expect(value(run('thermal', { amount: 2, temperature: 300, volume: 1 }), 'pressure')).toBeCloseTo(4988.677571, 5);
  });
  it('preserves Coulomb magnitude, charge sign and inverse-square scaling', () => {
    expect(value(run('electromagnetism', { charge: 1e-9, distance: 1 }), 'electricField')).toBeCloseTo(8.987551786, 6);
    expect(value(run('electromagnetism', { charge: -1e-9, distance: 2 }), 'electricField')).toBeCloseTo(-2.2468879465, 6);
  });
  it('forms real and virtual thin-lens images with signed magnification', () => {
    const real = run('optics', { focalLength: .1, objectDistance: .2 });
    expect(value(real, 'imageDistance')).toBeCloseTo(.2);
    expect(value(real, 'magnification')).toBeCloseTo(-1);
    const virtual = run('optics', { focalLength: .1, objectDistance: .05 });
    expect(value(virtual, 'imageDistance')).toBeCloseTo(-.1);
    expect(value(virtual, 'magnification')).toBeCloseTo(2);
  });
  it('represents a focal-plane object as collimated rays without a fake finite image', () => {
    const state = run('optics', { focalLength: .1, objectDistance: .1 });
    expect(value(state, 'imageVergence')).toBe(0);
    expect(value(state, 'imageAtInfinity')).toBe(1);
    expect(state.observations.some(o => o.key === 'imageDistance')).toBe(false);
    expectFinite(state);
  });
  it('uses Lorentz gamma 1.25 at either sign of 0.6c', () => {
    for (const beta of [-.6, .6]) expect(value(run('relativity', { beta }), 'gamma')).toBeCloseTo(1.25, 12);
    expect(value(run('relativity', { beta: 0 }), 'gamma')).toBe(1);
  });
  it('normalizes Gaussian probability bins and preserves their mean and variance', () => {
    for (const sigma of [1e-12, 1e-9, 1e-6]) {
      const samples = run('quantum', { sigma, center: 2e-9 }).probabilitySamples!;
      expect(samples.length).toBeGreaterThan(50);
      expect(samples.reduce((sum, s) => sum + s.probability, 0)).toBeCloseTo(1, 12);
      const mean = samples.reduce((sum, s) => sum + s.position * s.probability, 0);
      expect(mean / sigma).toBeCloseTo(2e-9 / sigma, 8);
      const variance = samples.reduce((sum, s) => sum + ((s.position - mean) / sigma) ** 2 * s.probability, 0);
      expect(variance).toBeCloseTo(1, 5);
      for (const sample of samples) {
        expectFinite(sample);
        expect(sample.probability).toBeGreaterThanOrEqual(0);
        expect(sample.probability).toBeLessThanOrEqual(1);
      }
    }
  });
  it('matches the electron 1 eV barrier-excess attenuation at 0.1 nm', () => {
    const parameters = { energy: 1.602176634e-19, barrierHeight: 3.204353268e-19, width: 1e-10 };
    expect(value(run('quantum', parameters), 'transmission')).toBeCloseTo(.35892800828, 8);
    expect(value(run('quantum', { ...parameters, width: 2e-10 }), 'transmission')).toBeLessThan(value(run('quantum', parameters), 'transmission'));
    expect(value(run('quantum', { ...parameters, width: 0 }), 'transmission')).toBe(1);
    expect(value(run('quantum', { energy: 1e-18, barrierHeight: 0 }), 'tunnelingRegime')).toBe(0);
  });
  it('resolves hydrogen levels and converts their classroom eV values to joules', () => {
    expect(value(run('atomic', { n: 2 }), 'energyEv')).toBeCloseTo(-3.4);
    expect(value(run('atomic', { n: 1 }), 'energy') / 1e-18).toBeCloseTo(-2.17896022224, 10);
    expect(value(run('atomic', { n: 2.7 }), 'energyEv')).toBeCloseTo(-13.6 / 9);
  });
  it('decays through two half lives and handles zero population', () => {
    expect(value(run('nuclear', { initial: 100, halfLife: 2 }, 4), 'remaining')).toBeCloseTo(25);
    expect(value(run('nuclear', { initial: 0, halfLife: 2 }, 4), 'remaining')).toBe(0);
    expect(value(run('nuclear', { initial: 100, halfLife: 2 }, 0), 'activity')).toBeCloseTo(34.657359028, 7);
  });
  it('preserves the relativistic energy-momentum invariant and massless limit', () => {
    const mass = 1e-27, momentum = 2.248443435e-19; // p = 0.75 mc, so E = 1.25 mc^2
    const state = run('particle', { mass, momentum });
    expect(value(state, 'energy') / value(state, 'restEnergy')).toBeCloseTo(1.25, 12);
    expect((value(state, 'energy') ** 2 - value(state, 'pc') ** 2) / value(state, 'restEnergy') ** 2).toBeCloseTo(1, 12);
    expect(value(run('particle', { mass: 0, momentum: 1e-20 }), 'energy') / 1e-12).toBeCloseTo(2.99792458, 10);
    expect(value(run('particle', { mass: 0, momentum: 0 }), 'energy')).toBe(0);
  });
  it('gives half Fermi occupancy at the chemical potential and thermal symmetry', () => {
    expect(value(run('condensed', { energy: 1e-19, chemicalPotential: 1e-19 }), 'occupancy')).toBe(.5);
    const low = value(run('condensed', { energy: -1.380649e-21, chemicalPotential: 0, temperature: 100 }), 'occupancy');
    const high = value(run('condensed', { energy: 1.380649e-21, chemicalPotential: 0, temperature: 100 }), 'occupancy');
    expect(high).toBeCloseTo(.26894142137, 10);
    expect(low + high).toBeCloseTo(1, 12);
  });
  it('gives blackbody luminosity for a 1 m sphere at 1000 K and T^4 scaling', () => {
    expect(value(run('astrophysics', { radius: 1, temperature: 1000 }), 'luminosity')).toBeCloseTo(712560.264713, 5);
    expect(value(run('astrophysics', { radius: 1, temperature: 2000 }), 'luminosity') / value(run('astrophysics', { radius: 1, temperature: 1000 }), 'luminosity')).toBeCloseTo(16);
  });
  it('uses SI Hubble rate and distance with linear recession scaling', () => {
    expect(value(run('cosmology', { hubbleConstant: 2e-18, distance: 1e22 }), 'recessionSpeed')).toBeCloseTo(20000);
    expect(value(run('cosmology', { hubbleConstant: 2e-18, distance: 2e22 }), 'recessionSpeed')).toBeCloseTo(40000);
  });
});

describe('registry, sanitized boundaries and determinism', () => {
  it('preserves legacy evaluation through the new registry', () => {
    expect(run('motion', { speed: 10 }, 1)).toEqual(evaluate('motion', { speed: 10 }, 1));
  });
  it('allows course validation against registered advanced model controls', () => {
    const course = structuredClone(foundationCourse);
    const mission = course.missions[0];
    mission.modelId = 'waves';
    const simulation = mission.steps.find(step => step.kind === 'simulate')!;
    if (simulation.kind === 'simulate') { simulation.modelId = 'waves'; simulation.preset = { frequency: 2 }; }
    expect(() => createCourseCatalog([course])).not.toThrow();
  });
  it.each(advanced)('%s clamps finite input, defaults invalid input and discards unknown keys', id => {
    const defaults = modelDefaults(id);
    const definitions = modelCatalog[id].parameters;
    for (const definition of definitions) {
      expect(sanitizeModelParameters(id, { [definition.key]: -Number.MAX_VALUE })[definition.key]).toBe(definition.min);
      expect(sanitizeModelParameters(id, { [definition.key]: Number.MAX_VALUE })[definition.key]).toBe(definition.max);
      for (const invalid of [NaN, Infinity, -Infinity, '3', null, undefined]) {
        expect(sanitizeModelParameters(id, { [definition.key]: invalid })[definition.key]).toBe(defaults[definition.key]);
      }
    }
    for (const invalid of [null, undefined, [], 42, 'bad']) expect(sanitizeModelParameters(id, invalid)).toEqual(defaults);
    expect(sanitizeModelParameters(id, { unknown: 3 })).not.toHaveProperty('unknown');
    defaults[definitions[0].key] = -999;
    expect(modelDefaults(id)[definitions[0].key]).not.toBe(-999);
    const input = Object.freeze(modelDefaults(id));
    expect(run(id, input, 1)).toEqual(run(id, input, 1));
  });
  it.each(advanced)('%s stays finite at every parameter corner and sanitized time boundary', id => {
    const definition = modelCatalog[id];
    for (let mask = 0; mask < 2 ** definition.parameters.length; mask++) {
      const input = Object.fromEntries(definition.parameters.map((p, i) => [p.key, mask & 2 ** i ? p.max : p.min]));
      for (const time of [-1, NaN, Infinity, 0, definition.duration / 2, Number.MAX_VALUE]) {
        const state = run(id, input, time);
        expectFinite(state);
        expect(state.time).toBeGreaterThanOrEqual(0);
        expect(state.time).toBeLessThanOrEqual(definition.duration);
        if (!Number.isFinite(time) || time < 0) expect(state.time).toBe(0);
      }
    }
  });
  it('bounds exponential tails without overflowing or creating probabilities outside [0, 1]', () => {
    for (const energy of [-1e-17, 1e-17]) {
      const occupancy = value(run('condensed', { energy, chemicalPotential: -energy, temperature: .001 }), 'occupancy');
      expect(occupancy).toBeGreaterThanOrEqual(0); expect(occupancy).toBeLessThanOrEqual(1);
    }
    expect(value(run('condensed', { energy: 1e-17, chemicalPotential: -1e-17, temperature: .001 }), 'occupancy')).toBeLessThan(1e-100);
    expect(value(run('nuclear', { halfLife: 1e-6 }, 1e12), 'remaining')).toBeLessThan(1e-100);
    expect(value(run('quantum', { barrierHeight: 1e-16, energy: 0, width: 1e-6 }), 'transmission')).toBeLessThan(1e-100);
  });
  it('rejects unknown model identifiers rather than reading inherited object keys', () => {
    for (const id of ['missing', '__proto__', 'toString']) {
      expect(() => run(id as ModelId)).toThrow(/Unknown model/);
      expect(() => modelDefaults(id as ModelId)).toThrow(/Unknown model/);
      expect(() => sanitizeModelParameters(id as ModelId, {})).toThrow(/Unknown model/);
    }
  });
});



