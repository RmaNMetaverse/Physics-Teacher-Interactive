import { describe, expect, it } from 'vitest';
import { lessons, mathTutorials } from '../src/content';

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
      expect(a.explanation.length).toBeGreaterThan(20);
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
