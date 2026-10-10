import { describe, expect, it } from 'vitest';
import { calculate, compileExpression, sampleGraph, fitData } from '../src/math-workspace/engine';
import { parseDocument, newDocument } from '../src/math-workspace/documents';

describe('learner mathematical workspace', () => {
  it('evaluates, solves and differentiates with explicit supported operations', () => {
    expect(calculate({ operation: 'evaluate', latex: '\\frac{1}{2}+\\frac{1}{3}' }).latex).toBe('\\frac{5}{6}');
    expect(calculate({ operation: 'solve', latex: 'x^2-4', variable: 'x' }).latex).toContain('2');
    const result = calculate({ operation: 'differentiate', latex: 'x^3', variable: 'x' });
    expect(compileExpression(result.latex)({ x: 2 })).toBe(12);
  });
  it('respects angle units and refuses executable or excessively nested input', () => {
    expect(compileExpression('\\sin(x)', 'deg')({ x: 30 })).toBeCloseTo(.5);
    expect(() => compileExpression('\\operatorname{fetch}(x)')).toThrow();
    expect(() => compileExpression('('.repeat(100) + 'x' + ')'.repeat(100))).toThrow();
  });
  it('does not claim a finite root list solves periodic equations or erase excluded roots', () => {
    expect(() => calculate({ operation: 'solve', latex: '\\sin(x)' })).toThrow(/linear|quadratic/);
    expect(() => calculate({ operation: 'solve', latex: '\\frac{x^2-1}{x-1}' })).toThrow(/linear|quadratic/);
    expect(() => calculate({ operation: 'solve', latex: 'x^3-1' })).toThrow(/linear|quadratic/);
  });
  it('breaks a reciprocal graph at its singularity instead of drawing a false vertical segment', () => {
    const graph = sampleGraph({ kind: 'function', latex: '1/x', secondary: '', min: -2, max: 2, yMin: -10, yMax: 10, angleUnit: 'rad', parameters: {} });
    expect(graph.segments.length).toBeGreaterThan(1);
    expect(graph.segments.every(segment => !(segment[0][0] < 0 && segment.at(-1)![0] > 0))).toBe(true);
  });
  it('preserves holes in unsimplified graph domains', () => {
    expect(Number.isNaN(compileExpression('x/x')({ x:0 }))).toBe(true);
    expect(Number.isNaN(compileExpression('\\frac{x^2-1}{x-1}')({ x:1 }))).toBe(true);
  });
  it('does not mistake an implicit pole for a zero contour', () => {
    const graph = sampleGraph({ kind:'implicit', latex:'1/(x-0.03)', secondary:'', min:-1, max:1, yMin:-1, yMax:1, angleUnit:'rad', parameters:{} });
    expect(graph.segments).toEqual([]);
  });
  it('plots a unit circle parametrically and implicitly', () => {
    const settings = { secondary: '\\sin(t)', min: 0, max: Math.PI * 2, yMin: -2, yMax: 2, angleUnit: 'rad' as const, parameters: {} };
    const parametric = sampleGraph({ ...settings, kind: 'parametric', latex: '\\cos(t)' });
    expect(parametric.segments[0][0][0]).toBeCloseTo(1);
    const implicit = sampleGraph({ ...settings, min: -2, max: 2, kind: 'implicit', latex: 'x^2+y^2-1' });
    expect(implicit.segments.length).toBeGreaterThan(20);
    implicit.segments.flat().forEach(([x, y]) => expect(Math.abs(x * x + y * y - 1)).toBeLessThan(.01));
  });
  it('fits independent observations and reports residuals', () => {
    const fit = fitData([[0, 1], [1, 3], [2, 5]], 'linear');
    expect(fit.coefficients).toEqual([1, 2]);
    expect(fit.residuals).toEqual([0, 0, 0]);
  });
  it('validates imported notebooks without accepting unknown versions or nonfinite graph bounds', () => {
    const document = newDocument();
    expect(parseDocument(JSON.stringify(document)).id).toBe(document.id);
    expect(() => parseDocument(JSON.stringify({ ...document, version: 99 }))).toThrow();
    expect(() => parseDocument(JSON.stringify({ ...document, updatedAt: 2026 }))).toThrow();
    expect(() => parseDocument(JSON.stringify({ ...document, cells: [{ kind: 'graph', id: 'a', graph: { min: 'bad' } }] }))).toThrow();
  });
});
