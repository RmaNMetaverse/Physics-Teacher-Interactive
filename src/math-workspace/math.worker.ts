import { calculate, sampleGraph, fitData } from './engine';
import type { Calculation, GraphSpec, Point2D } from './types';
export type MathJob = { kind: 'calculate'; input: Calculation } | { kind: 'graph'; input: GraphSpec } | { kind: 'fit'; input: { points: Point2D[]; kind: 'linear' | 'quadratic' | 'exponential' } };
self.onmessage = (event: MessageEvent<MathJob>) => {
  try {
    const job = event.data;
    const result = job.kind === 'calculate' ? calculate(job.input) : job.kind === 'graph' ? sampleGraph(job.input) : fitData(job.input.points, job.input.kind);
    self.postMessage({ result });
  } catch (error) { self.postMessage({ error: error instanceof Error ? error.message : 'Unable to calculate this expression.' }); }
};
self.postMessage({ ready: true });
