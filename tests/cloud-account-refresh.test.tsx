// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createProgressV2, recordStep } from '../src/progress/progress';
import { courseCatalog } from '../src/learning/catalog';
import { mergeProgress } from '../src/cloud/progress-sync';
import { useCloudAccount } from '../src/cloud/useCloudAccount';

const service = vi.hoisted(() => ({ sync: vi.fn() }));
vi.mock('../src/cloud/supabase', () => ({
  isCloudConfigured: true,
  supabase: { auth: {
    getUser: async () => ({ data: { user: { id: 'owner' } } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
  } },
}));
vi.mock('../src/cloud/progress-sync', async importOriginal => ({
  ...await importOriginal<typeof import('../src/cloud/progress-sync')>(),
  loadAndMergeProgress: service.sync,
}));

const practice = (day: string) => recordStep(createProgressV2(new Date(day)), {
  courseId: 'quantum', missionId: 'quantum-light-quanta', stepId: 'quantum-light-quanta-predict', answer: 1,
}, courseCatalog, new Date(day));
let remote = practice('2026-10-05T12:00:00Z');
function harness() {
  const [progress, setProgress] = useState(() => practice('2026-10-04T12:00:00Z'));
  const account = useCloudAccount(progress, setProgress);
  return { progress, setProgress, account };
}

beforeEach(() => {
  service.sync.mockReset();
  remote = practice('2026-10-05T12:00:00Z');
  service.sync.mockImplementation(async (_user, local) => mergeProgress(local, remote, courseCatalog));
});
afterEach(cleanup);

describe('cross-device account refresh', () => {
  it('retains practice completed while a cloud request is still in flight', async () => {
    const { result } = renderHook(harness);
    await waitFor(() => expect(result.current.progress.streak.current).toBe(2));
    let release!: () => void;
    const gate = new Promise<void>(resolve => { release = resolve; });
    service.sync.mockImplementationOnce(async (_user, local) => { await gate; return mergeProgress(local, remote, courseCatalog); });
    let request!: Promise<void>;
    act(() => { request = result.current.account.syncNow(); });
    await waitFor(() => expect(result.current.account.syncState).toBe('syncing'));
    act(() => result.current.setProgress(current => recordStep(current, {
      courseId: 'quantum', missionId: 'quantum-light-quanta', stepId: 'quantum-light-quanta-predict', answer: 1,
    }, courseCatalog, new Date('2026-10-06T12:00:00Z'))));
    await act(async () => { release(); await request; });
    expect(result.current.progress.streak.current).toBe(3);
  });
  it('pulls new practice days when a signed-in device returns to the app', async () => {
    const { result } = renderHook(harness);
    await waitFor(() => expect(result.current.progress.streak.current).toBe(2));
    remote = practice('2026-10-06T12:00:00Z');
    act(() => { window.dispatchEvent(new Event('focus')); });
    await waitFor(() => expect(result.current.progress.streak.current).toBe(3));
    await act(() => result.current.account.syncNow());
    expect(result.current.progress.streak.current).toBe(3);
  });

  it('recovers from an initial offline failure when the device reconnects', async () => {
    service.sync.mockRejectedValueOnce(new Error('Offline'));
    const { result } = renderHook(harness);
    await waitFor(() => expect(result.current.account.syncState).toBe('error'));
    act(() => { window.dispatchEvent(new Event('online')); });
    await waitFor(() => expect(result.current.progress.streak.current).toBe(2));
    expect(result.current.account.error).toBe('');
  });
});
