import { describe, expect, it } from 'vitest';
import { checkAnswer } from '../src/lib/assessment';
import * as catalogModule from '../src/learning/catalog';
import { mathTutorials } from '../src/content/math';
import { modelCatalog, evaluateModel, sanitizeModelParameters } from '../src/physics';
import type { CourseCatalog } from '../src/learning/types';

const expectedPaths: Record<string, string[]> = {
  'classical-mechanics': ['Frames and motion', 'Force diagrams', 'Rotation', 'Fluids and pressure', 'Chaos and limits'],
  'waves-sound': ['Oscillation', 'Traveling waves', 'Superposition', 'Resonance', 'Sound and spectra'],
  thermodynamics: ['Microscopic temperature', 'Ideal gas', 'First law', 'Entropy', 'Engines and limits'],
  electromagnetism: ['Charge and field', 'Potential', 'Current', 'Magnetic force', "Maxwell's synthesis"],
  optics: ['Reflection', 'Refraction', 'Lenses', 'Interference', 'Photons and imaging'],
  relativity: ['Events and frames', 'Light-clock dilation', 'Length and simultaneity', 'Energy-momentum', 'Curved spacetime'],
  quantum: ['Light quanta', 'Build a wavefunction', 'Measurement probabilities', 'Uncertainty', 'Tunneling'],
  'atomic-molecular': ['Spectra', 'Bohr scale', 'Orbitals', 'Bonds', 'Lasers'],
  nuclear: ['Binding', 'Decay', 'Half-life', 'Fission', 'Fusion'],
  particle: ['Relativistic particles', 'Quantum fields', 'Symmetries', 'Standard Model', 'Neutrinos and open questions'],
  'condensed-matter': ['Lattices', 'Bands', 'Fermi statistics', 'Semiconductors', 'Superconductivity'],
  astrophysics: ['Stellar light', 'Hydrostatic balance', 'Fusion', 'Stellar evolution', 'Compact objects'],
  'cosmology-frontiers': ['Expansion', 'Cosmic background', 'Dark matter evidence', 'Dark energy evidence', 'Tested knowledge versus proposals'],
};
function catalog(): CourseCatalog {
  const result = (catalogModule as unknown as { courseCatalog?: CourseCatalog }).courseCatalog;
  expect(result, 'published course catalog').toBeDefined();
  return result!;
}
describe('released starter course content', () => {
  it('publishes fourteen open courses and eighty-nine normal missions', () => {
    const all = catalog();
    expect(all.courses.size).toBe(14);
    expect([...all.missions.values()].filter(m => m.kind === 'mission')).toHaveLength(89);
    expect([...all.courses.values()].every(c => c.access === 'open')).toBe(true);
    expect(() => catalogModule.createCourseCatalog([...all.courses.values()])).not.toThrow();
  });
  it('preserves every approved five-mission path and its course checkpoint', () => {
    for (const [id, titles] of Object.entries(expectedPaths)) {
      const course = catalog().getCourse(id);
      const normal = course.missions.filter(m => m.kind === 'mission');
      expect(normal.map(m => m.title), id).toEqual(titles);
      const checkpoints = course.missions.filter(m => m.kind === 'checkpoint');
      expect(checkpoints, id).toHaveLength(1);
      expect(checkpoints[0].checkpoint.requiredMissionIds, id).toEqual(normal.map(m => m.id));
      expect(course.missions.at(-1)).toBe(checkpoints[0]);
      expect(new Set(course.sources.map(s => s.url)).size, id).toBeGreaterThanOrEqual(2);
      expect(course.reviewedAt).toBe('2026-09-09');
    }
  });
  it('authors distinctive complete missions with valid layered math and honest model references', () => {
    const knownMath = new Set(mathTutorials.map(m => m.id));
    const explanations = new Set<string>();
    for (const id of Object.keys(expectedPaths)) for (const mission of catalog().getCourse(id).missions) {
      expect(mission.steps.length, mission.id).toBeGreaterThanOrEqual(3);
      expect(mission.steps.length, mission.id).toBeLessThanOrEqual(7);
      expect(mission.sources.length).toBeGreaterThanOrEqual(2);
      expect(mission.limitations.join(' ').length).toBeGreaterThan(40);
      expect(mission.steps.at(-1)?.kind).toBe('recap');
      if (mission.kind === 'checkpoint') continue;
      expect(mission.reviewedAt).toBe('2026-09-09');
      expect(mission.requiredMath.length).toBeGreaterThan(0);
      mission.requiredMath.forEach(mathId => expect(knownMath.has(mathId), mission.id).toBe(true));
      const layers = mission.steps.filter(s => s.kind === 'math');
      expect(layers).toHaveLength(1);
      const layer = layers[0].layer;
      expect(layer.quick.equation).toBe(mission.equation);
      expect(layer.quick.symbols.length).toBeGreaterThan(1);
      expect(layer.foundation.returnTo).toBe(layers[0].id);
      expect(layer.foundation.prerequisites.map(p => p.id)).toEqual(mission.requiredMath);
      expect(layer.foundation.workedExample).toEqual(mission.workedExample);
      expect(mission.workedExample.steps.length).toBeGreaterThanOrEqual(2);
      const scored = mission.steps.flatMap(s => s.kind === 'predict' || s.kind === 'check' ? [s.assessment] : s.kind === 'math' ? [s.layer.foundation.check] : []);
      expect(scored).toHaveLength(3);
      scored.forEach(a => { expect(a.hints.length).toBeGreaterThan(0); expect(a.explanation.length).toBeGreaterThan(20); expect(Number.isFinite(a.answer)).toBe(true); });
      const explanation = mission.steps.flatMap(s => s.kind === 'explain' ? s.body : []).join(' ');
      expect(explanation.length).toBeGreaterThan(150);
      expect(explanations.has(explanation), mission.id).toBe(false); explanations.add(explanation);
      const simulation = mission.steps.find(s => s.kind === 'simulate');
      expect(simulation).toBeDefined();
      if (simulation?.kind === 'simulate') {
        expect(Object.hasOwn(modelCatalog, simulation.modelId)).toBe(true);
        expect(simulation.preset).toEqual(sanitizeModelParameters(simulation.modelId, simulation.preset));
        expect(evaluateModel(simulation.modelId, simulation.preset, 0).observations.every(o => Number.isFinite(o.value))).toBe(true);
        expect(simulation.prompt.length).toBeGreaterThan(70);
      }
    }
  });
  it('keeps the first quantum mission directly addressable and formalism established', () => {
    const course = catalog().getCourse('quantum');
    expect(course.access).toBe('open');
    expect(catalog().getMission('quantum', 'quantum-light-quanta')).toBe(course.missions[0]);
    expect(course.missions.filter(m => m.kind === 'mission').every(m => m.scienceStatus === 'established')).toBe(true);
    const text = course.missions.flatMap(m => m.steps.flatMap(s => s.kind === 'explain' ? s.body : [])).join(' ');
    expect(text).toMatch(/interpretation/i);
  });
  it('labels unconfirmed frontier frameworks as speculative without downgrading expansion evidence', () => {
    const course = catalog().getCourse('cosmology-frontiers');
    expect(course.missions[0].scienceStatus).toBe('established');
    const frontier = course.missions[4];
    expect(frontier.scienceStatus).toBe('speculative');
    const text = frontier.steps.flatMap(s => s.kind === 'explain' ? s.body : []).join(' ');
    for (const framework of ['string theory', 'loop quantum gravity', 'multiverse']) expect(text.toLowerCase()).toContain(framework);
    expect(text).toMatch(/speculative/i);
  });
});

it('makes every authored starter assessment score correct and meaningfully wrong answers', () => {
  for (const id of Object.keys(expectedPaths)) for (const mission of catalog().getCourse(id).missions) {
    const scored = mission.steps.flatMap(step => step.kind === 'predict' || step.kind === 'check' ? [step.assessment] : step.kind === 'math' ? [step.layer.foundation.check] : []);
    for (const assessment of scored) {
      expect(checkAnswer(assessment, assessment.answer).correct, assessment.id).toBe(true);
      const wrong = assessment.kind === 'concept' ? (assessment.answer + 1) % assessment.options!.length : assessment.answer === 0 ? 1 : assessment.answer * 1.1;
      expect(checkAnswer(assessment, wrong).correct, assessment.id).toBe(false);
      if (assessment.kind !== 'concept' && assessment.answer !== 0) expect(checkAnswer(assessment, 0).correct, assessment.id).toBe(false);
    }
  }
});
