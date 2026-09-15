import type { ModelDefinition, ModelId, Parameters, SimulationState } from '../types';
import { simulations } from './legacy';
import { waves } from './models/waves';
import { thermal } from './models/thermal';
import { electromagnetism } from './models/electromagnetism';
import { circuits } from './models/circuits';
import { microcontroller } from './models/microcontroller';
import { optics } from './models/optics';
import { relativity } from './models/relativity';
import { quantum } from './models/quantum';
import { atomic } from './models/atomic';
import { nuclear } from './models/nuclear';
import { particle } from './models/particle';
import { condensed } from './models/condensed';
import { astrophysics } from './models/astrophysics';
import { cosmology } from './models/cosmology';
import { sanitizeControls } from './models/shared';

/** One closed registry for course validation and model evaluation, including legacy families. */
export const modelCatalog: Readonly<Record<ModelId, ModelDefinition>> = Object.freeze({
  ...simulations, waves, thermal, electromagnetism, circuits, microcontroller, optics, relativity, quantum, atomic, nuclear, particle, condensed, astrophysics, cosmology,
});

function definition(id: ModelId): ModelDefinition {
  if (!Object.hasOwn(modelCatalog, id)) throw new Error(`Unknown model: ${String(id)}`);
  return modelCatalog[id];
}

export function modelDefaults(id: ModelId): Parameters {
  return Object.fromEntries(definition(id).parameters.map(p => [p.key, p.default]));
}

export function sanitizeModelParameters(id: ModelId, input: unknown): Parameters {
  return sanitizeControls(definition(id).parameters, input);
}

export function evaluateModel(id: ModelId, input: unknown, time: number): SimulationState {
  return definition(id).evaluate(sanitizeModelParameters(id, input), time);
}
