import { expect, it } from 'vitest';
import { reconcileNotebook, type NotebookRemote } from '../src/math-workspace/notebook-sync';
import { newDocument } from '../src/math-workspace/documents';

it('preserves both notebook edits when cloud revision changes', async () => {
  const local = newDocument(), remote = { ...local, title: 'Another device' };
  const repository: NotebookRemote = { read: async () => ({ revision: 3, document: remote }), write: async () => null };
  const result = await reconcileNotebook(local, { revision: 1, content: 'old' }, repository);
  expect(result.conflict?.title).toContain(local.title);
  expect(result.conflict?.id).not.toBe(local.id);
  expect(result.document.title).toBe('Another device');
});

it('fetches the winning version when a concurrent write rejects compare-and-swap', async () => {
  const local = newDocument(); let reads = 0;
  const repository: NotebookRemote = { read: async () => ++reads === 1 ? { revision: 1, document: { ...local, title: 'Earlier' } } : { revision: 2, document: { ...local, title: 'Winning edit' } }, write: async () => null };
  const result = await reconcileNotebook(local, { revision: 1, content: 'earlier' }, repository);
  expect(result.document.title).toBe('Winning edit');
  expect(result.conflict).toBeDefined();
});

it('creates the first cloud revision without rewriting local progress', async () => {
  const local = newDocument();
  const result = await reconcileNotebook(local, null, { read: async () => null, write: async (_doc, expected) => { expect(expected).toBe(0); return 1; } });
  expect(result.revision).toBe(1);
  expect(result.conflict).toBeUndefined();
});
