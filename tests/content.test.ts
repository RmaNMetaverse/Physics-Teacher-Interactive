import { describe, expect, it } from 'vitest';
import { lessons, mathTutorials } from '../src/content';
import katex from 'katex';
import { simulations, evaluate, sanitizeParameters } from '../src/physics';

describe('released foundations curriculum', () => {
  it('publishes all eight families with three complete lessons each', () => {
    expect(lessons).toHaveLength(24);
    for (const family of ['measurement','vectors','motion','forces','energy','collisions','gravity','oscillations']) {
      expect(lessons.filter(l => l.family === family)).toHaveLength(3);
    }
    for (const lesson of lessons) {
      expect(new Set(lesson.assessments.map(a => a.kind))).toEqual(new Set(['concept','calculation','experiment']));
      expect(lesson.explanation.length).toBeGreaterThanOrEqual(2);
      expect(lesson.workedExample.steps.length).toBeGreaterThanOrEqual(2);
      expect(lesson.references.length).toBeGreaterThan(0);
      expect(lesson.assumptions.length).toBeGreaterThan(0);
      expect(lesson.reviewedAt).toBe('2026-09-09');
    }
  });
  it('has a closed acyclic prerequisite graph and supplies every required math topic', () => {
    expect(mathTutorials.length).toBeGreaterThanOrEqual(17);
    const nodes = [...lessons, ...mathTutorials];
    const byId = new Map(nodes.map(n => [n.id, n]));
    expect(byId.size).toBe(nodes.length);
    const visit = (id: string, ancestors: string[]) => {
      expect(byId.has(id), `Missing prerequisite ${id}`).toBe(true);
      expect(ancestors, `Cycle at ${id}`).not.toContain(id);
      for (const parent of byId.get(id)!.prerequisites) visit(parent, [...ancestors, id]);
    };
    nodes.forEach(n => visit(n.id, []));
    lessons.forEach(l => l.math.forEach(id => expect(mathTutorials.some(m => m.id === id), id).toBe(true)));
  });
  it('provides unambiguous finite answer keys and useful hints', () => {
    for (const a of [...lessons.flatMap(l => l.assessments), ...mathTutorials.map(m => m.assessment)]) {
      expect(Number.isFinite(a.answer)).toBe(true);
      expect(a.hints.length).toBeGreaterThan(0);
      expect(a.explanation.length, a.id + ": " + a.explanation).toBeGreaterThan(20);
      if (a.kind === 'concept') {
        expect(Number.isInteger(a.answer)).toBe(true);
        expect(a.answer).toBeGreaterThanOrEqual(0);
        expect(a.answer).toBeLessThan(a.options!.length);
      } else {
        expect(a.tolerance).toBeGreaterThan(0);
        expect(a.unit).toBeDefined();
      }
    }
  });
  it('agrees with independent reference calculations in selected lessons', () => {
    const answer = (id: string) => lessons.find(l => l.id === id)?.assessments.find(a => a.kind === 'calculation')?.answer;
    expect(answer('vector-components')).toBeCloseTo(5);
    expect(answer('net-force')).toBeCloseTo(3);
    expect(answer('kinetic-energy')).toBeCloseTo(25);
    expect(answer('momentum')).toBeCloseTo(-6);
    expect(answer('spring-period')).toBeCloseTo(Math.PI);
  });
});

describe('curriculum rendering and laboratory contracts', () => {
  it('renders every equation without broken escaping', () => {
    for (const item of [...lessons, ...mathTutorials]) {
      expect(item.equation, item.id).not.toContain('\\\\');
      expect(() => katex.renderToString(item.equation, { throwOnError: true }), item.id).not.toThrow();
    }
  });
  it('preserves every authored preset without clamping or dropping parameters', () => {
    for (const lesson of lessons) {
      const safe = sanitizeParameters(lesson.family, lesson.preset);
      for (const [key, value] of Object.entries(lesson.preset)) {
        expect(simulations[lesson.family].parameters.some(p => p.key === key), `${lesson.id}: ${key}`).toBe(true);
        expect(safe[key], `${lesson.id}: ${key}`).toBe(value);
      }
    }
  });
  it('matches every experiment answer to an independently selected model observation', () => {
    const fixtures: Record<string, [number, string, Record<string, number>?]> = {
      'measurement-basics':[0,'length',{length:4}], 'unit-conversion':[0,'converted'], 'measurement-uncertainty':[0,'upperBound'],
      'coordinates-displacement':[0,'resultant'], 'vector-components':[0,'ay'], 'vector-addition':[0,'resultant'],
      'constant-velocity':[2,'x'], 'constant-acceleration':[2,'vx'], 'projectile-motion':[12,'x'],
      inertia:[0,'acceleration'], 'net-force':[0,'acceleration'], friction:[0,'acceleration'],
      work:[20,'work'], 'kinetic-energy':[20,'speed'], 'energy-conservation':[20,'thermal'],
      momentum:[8,'momentum'], impulse:[8,'impulse'], 'collision-types':[8,'energyLost'],
      'circular-motion':[0,'eccentricity'], orbits:[0,'eccentricity'], 'hookes-law':[0,'potential'],
      'spring-period':[0,'period',{mass:4}], pendulum:[0,'period'],
    };
    for (const lesson of lessons) {
      const assessment = lesson.assessments.find(a => a.kind === 'experiment')!;
      if (lesson.id === 'universal-gravitation') {
        const force = (mass: number) => evaluate('gravity', {...lesson.preset,mass},0).observations.find(o => o.key === 'force')!.value;
        expect(force(2000)/force(1000)).toBeCloseTo(assessment.answer, 8);
        continue;
      }
      const fixture = fixtures[lesson.id];
      expect(fixture, lesson.id).toBeDefined();
      const [time, key, overrides] = fixture;
      const state = evaluate(lesson.family, {...lesson.preset,...overrides},time);
      const value = state.observations.find(o => o.key === key)!.value;
      expect(Math.abs(value-assessment.answer),lesson.id).toBeLessThanOrEqual(assessment.tolerance!);
    }
  });
  it('contains no damaged Unicode replacement characters', () => {
    expect(JSON.stringify([...lessons,...mathTutorials])).not.toContain('\uFFFD');
  });
});