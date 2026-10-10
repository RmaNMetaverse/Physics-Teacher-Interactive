// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useMathJob } from '../src/math-workspace/useMathJob';

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
it('limits simultaneous calculation workers across a notebook', () => {
  vi.useFakeTimers();
  const workers: Array<{ terminate: ReturnType<typeof vi.fn> }> = [];
  class FakeWorker { terminate = vi.fn(); postMessage = vi.fn(); constructor() { workers.push(this); } }
  vi.stubGlobal('Worker', FakeWorker);
  const { rerender, unmount } = renderHook(({ enabled }) => {
    useMathJob(enabled ? { kind:'calculate', input:{ operation:'evaluate', latex:'1' } } : null);
    useMathJob({ kind:'calculate', input:{ operation:'evaluate', latex:'2' } });
    useMathJob({ kind:'calculate', input:{ operation:'evaluate', latex:'3' } });
  }, { initialProps:{ enabled:true } });
  act(() => vi.advanceTimersByTime(301)); expect(workers).toHaveLength(2);
  rerender({ enabled:false }); expect(workers[0].terminate).toHaveBeenCalled();
  expect(workers).toHaveLength(3); unmount();
});
it('terminates obsolete workers when input changes, a graph leaves view, or the page unmounts', () => {
  vi.useFakeTimers();
  const workers: Array<{ terminate: ReturnType<typeof vi.fn>; postMessage: ReturnType<typeof vi.fn> }> = [];
  class FakeWorker { terminate = vi.fn(); postMessage = vi.fn(); constructor() { workers.push(this); } }
  vi.stubGlobal('Worker', FakeWorker);
  const { rerender, unmount } = renderHook(({ formula }: { formula: string | null }) => useMathJob(formula === null ? null : { kind: 'calculate', input: { operation:'evaluate', latex: formula } }), { initialProps:{ formula:'x' as string | null } });
  act(() => vi.advanceTimersByTime(301)); expect(workers).toHaveLength(1);
  rerender({ formula:'x^2' }); expect(workers[0].terminate).toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(301)); expect(workers).toHaveLength(2);
  rerender({ formula:null }); expect(workers[1].terminate).toHaveBeenCalled();
  rerender({ formula:'x^3' }); act(() => vi.advanceTimersByTime(301));
  unmount(); expect(workers[2].terminate).toHaveBeenCalled();
});
