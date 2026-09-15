import type { AdvancedModelId, ModelDefinition, Observation, ParameterDefinition, Parameters, SimulationState } from '../../types';

// SI constants; measured constants are rounded classroom values (see README).
export const C = 299792458;
export const K_B = 1.380649e-23;
export const R = 8.31446261815324;
export const E_CHARGE = 1.602176634e-19;
export const ELECTRON_MASS = 9.1093837139e-31;
export const HBAR = 1.054571817e-34;
export const COULOMB_K = 8.9875517862e9;
export const STEFAN_BOLTZMANN = 5.670374419e-8;

export const parameter = (key: string, label: string, unit: string, min: number, max: number, step: number, initial: number): ParameterDefinition =>
  ({ key, label, unit, min, max, step, default: initial });
export const observation = (key: string, label: string, value: number, unit = ''): Observation =>
  ({ key, label, value, unit, color: '#5eead4' });
export const state = (time: number, description: string, observations: Observation[]): SimulationState =>
  ({ time, description, observations, bodies: [], ended: false });

/** No coercion or slider quantization; unknown keys and non-record inputs are ignored. */
export function sanitizeControls(parameters: ParameterDefinition[], input: unknown): Parameters {
  const record = input && typeof input === 'object' && !Array.isArray(input) ? input as Record<string, unknown> : {};
  return Object.fromEntries(parameters.map(p => {
    const candidate = Object.hasOwn(record, p.key) ? record[p.key] : undefined;
    let value = typeof candidate === 'number' && Number.isFinite(candidate) ? Math.max(p.min, Math.min(p.max, candidate)) : p.default;
    if (p.key === 'n' || p.key === 'mode' || p.key === 'switchClosed' || p.key === 'buttonPressed' || p.key === 'board') value = Math.round(value);
    return [p.key, value];
  }));
}

/** Exponent clipping gives a finite ~1e-304 numerical floor for negligible tails. */
export const attenuation = (exponent: number): number => Math.exp(-Math.max(0, Math.min(700, exponent)));

export function defineModel(id: AdvancedModelId, title: string, description: string, parameters: ParameterDefinition[], duration: number,
  calculate: (parameters: Parameters, time: number) => SimulationState): ModelDefinition {
  return { id, title, description, parameters, duration, evaluate: (input, time) => {
    const t = Number.isFinite(time) ? Math.max(0, Math.min(duration, time)) : 0;
    const result = calculate(sanitizeControls(parameters, input), t);
    return { ...result, ended: result.ended || t >= duration };
  } };
}
