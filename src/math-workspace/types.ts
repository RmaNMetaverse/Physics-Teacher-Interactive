export type AngleUnit = 'rad' | 'deg';
export type MathOperation = 'evaluate' | 'approximate' | 'simplify' | 'solve' | 'differentiate' | 'integrate';
export interface Calculation { operation: MathOperation; latex: string; variable?: string; angleUnit?: AngleUnit }
export interface CalculationResult { latex: string; explanation: string }
export interface GraphSpec {
  kind: 'function' | 'parametric' | 'polar' | 'implicit' | 'inequality';
  latex: string; secondary: string; min: number; max: number; yMin: number; yMax: number;
  angleUnit: AngleUnit; parameters: Record<string, number>;
}
export type Point2D = [number, number];
export interface GraphData { segments: Point2D[][]; points: Point2D[]; note: string }
export type MathCell = { id: string; kind: 'text'; text: string } | { id: string; kind: 'expression'; latex: string } | { id: string; kind: 'graph'; graph: GraphSpec } | { id: string; kind: 'data'; points: Point2D[] };
export interface MathDocument {
  version: 1; id: string; title: string; updatedAt: string; revision: number;
  context?: { title: string; symbols: string; returnHash: string };
  cells: MathCell[];
}
export const defaultGraph = (): GraphSpec => ({ kind: 'function', latex: 'x^2', secondary: '\\sin(t)', min: -5, max: 5, yMin: -5, yMax: 5, angleUnit: 'rad', parameters: { a: 1 } });
