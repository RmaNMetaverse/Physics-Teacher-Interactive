import { useEffect, useState } from 'react';
import type { MathJob } from './math.worker';
import { scheduleCalculation } from './scheduler';

export function useMathJob<T>(job: MathJob | null) {
  const [state, setState] = useState<{ result?: T; error?: string; busy: boolean }>({ busy: false });
  const serialized = JSON.stringify(job);
  useEffect(() => {
    if (serialized === 'null') return;
    let worker: Worker | undefined;
    let active = true;
    let timeout = 0;
    let cancel: (() => void) | undefined;
    setState({ busy: true });
    const start = window.setTimeout(() => {
      cancel = scheduleCalculation(release => {
        const finish = (next: { result?: T; error?: string }) => {
          if (!active) return;
          active = false;
          window.clearTimeout(timeout); worker?.terminate(); release(); setState({ ...next, busy: false });
        };
        try {
          worker = new Worker(new URL('./math.worker.ts', import.meta.url), { type: 'module' });
          worker.onmessage = event => {
            if (!active) return;
            if (event.data.ready === true) {
              window.clearTimeout(timeout);
              timeout = window.setTimeout(() => finish({ error: 'Calculation exceeded the time limit. Simplify the expression or narrow the domain.' }), 8000);
              worker?.postMessage(JSON.parse(serialized));
            } else finish(event.data);
          };
          worker.onerror = () => finish({ error: 'The calculation worker could not load. Retry after reconnecting.' });
          timeout = window.setTimeout(() => finish({ error: 'The calculation worker took too long to load. Retry after reconnecting.' }), 45000);
        } catch { finish({ error: 'Calculation workers are unavailable in this browser. Your notebook remains editable.' }); }
        return () => { window.clearTimeout(timeout); worker?.terminate(); };
      });
    }, 300);
    return () => { active = false; window.clearTimeout(start); cancel?.(); };
  }, [serialized]);
  return state;
}
