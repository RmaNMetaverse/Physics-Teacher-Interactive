import type { MathDocument } from './types';

export interface NotebookRemote {
  read(): Promise<{ revision: number; document: MathDocument } | null>;
  write(document: MathDocument, expectedRevision: number): Promise<number | null>;
}
export interface NotebookBaseline { revision: number; content: string }
export const notebookContent = (document: MathDocument) => JSON.stringify({ title: document.title, cells: document.cells, context: document.context });

/** Optimistic concurrency. Never discard a local edit to resolve a cloud conflict. */
export async function reconcileNotebook(local: MathDocument, baseline: NotebookBaseline | null, repository: NotebookRemote): Promise<{ document: MathDocument; revision: number; conflict?: MathDocument }> {
  let remote = await repository.read();
  const content = notebookContent(local);
  const conflictResult = () => {
    if (!remote) throw new Error('The cloud notebook changed during synchronization. Your local copy is safe; retry.');
    return { document: remote.document, revision: remote.revision, conflict: { ...local, id: crypto.randomUUID(), title: local.title.slice(0,130) + ' (recovered local edit)', revision: 0, updatedAt: new Date().toISOString() } };
  };
  if (remote && notebookContent(remote.document) === content) return { document: local, revision: remote.revision };
  if (remote && baseline?.content === content) return { document: remote.document, revision: remote.revision };
  if (remote && remote.revision !== baseline?.revision) return conflictResult();
  const revision = await repository.write(local, remote?.revision ?? 0);
  if (revision !== null) return { document: local, revision };
  remote = await repository.read();
  return conflictResult();
}
