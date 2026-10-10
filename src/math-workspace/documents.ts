import { defaultGraph, type MathDocument, type GraphSpec } from './types';

export function newDocument(): MathDocument {
  return { version: 1, id: crypto.randomUUID(), title: 'My physics notebook', updatedAt: new Date().toISOString(), revision: 0,
    cells: [{ id: crypto.randomUUID(), kind: 'expression', latex: '\\frac{1}{2}mv^2' }, { id: crypto.randomUUID(), kind: 'graph', graph: defaultGraph() }] };
}

export function validGraph(graph: GraphSpec): boolean {
  return Boolean(graph && ['function', 'parametric', 'polar', 'implicit', 'inequality'].includes(graph.kind)
    && typeof graph.latex === 'string' && graph.latex.length <= 2048 && typeof graph.secondary === 'string' && graph.secondary.length <= 2048
    && [graph.min, graph.max, graph.yMin, graph.yMax].every(Number.isFinite) && graph.min < graph.max && graph.yMin < graph.yMax
    && ['rad', 'deg'].includes(graph.angleUnit) && graph.parameters && Object.keys(graph.parameters).length <= 12
    && Object.entries(graph.parameters).every(([key, value]) => /^[a-zA-Z]$/.test(key) && Number.isFinite(value)));
}

export function parseDocument(json: string): MathDocument {
  if (json.length > 500_000) throw new Error('Notebook exceeds the 500 KB import limit.');
  const d = JSON.parse(json) as MathDocument;
  if (!d || d.version !== 1 || typeof d.id !== 'string' || !/^[\w-]{1,80}$/.test(d.id) || typeof d.title !== 'string' || d.title.length > 160 || typeof d.updatedAt !== 'string' || !Number.isFinite(Date.parse(d.updatedAt)) || !Number.isInteger(d.revision) || d.revision < 0 || !Array.isArray(d.cells) || d.cells.length > 40) throw new Error('Invalid or unsupported notebook.');
  const ids = new Set<string>();
  for (const cell of d.cells) {
    if (!cell || typeof cell.id !== 'string' || !/^[\w-]{1,80}$/.test(cell.id) || ids.has(cell.id)) throw new Error('Invalid notebook cell identifier.');
    ids.add(cell.id);
    if (cell.kind === 'text' && typeof cell.text === 'string' && cell.text.length <= 20000) continue;
    if (cell.kind === 'expression' && typeof cell.latex === 'string' && cell.latex.length <= 2048) continue;
    if (cell.kind === 'graph' && validGraph(cell.graph)) continue;
    if (cell.kind === 'data' && Array.isArray(cell.points) && cell.points.length <= 2000 && cell.points.every(p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite))) continue;
    throw new Error('Invalid notebook cell.');
  }
  if (d.context && (typeof d.context.title !== 'string' || d.context.title.length > 300 || typeof d.context.symbols !== 'string' || d.context.symbols.length > 10000 || typeof d.context.returnHash !== 'string' || !/^#\/(?:mission|course)\/[a-z0-9/-]+$/.test(d.context.returnHash))) throw new Error('Invalid lesson context.');
  // Return only the validated public shape; never import account or sync metadata.
  return { version: 1, id: d.id, title: d.title, updatedAt: d.updatedAt, revision: d.revision, cells: d.cells, ...(d.context ? { context: d.context } : {}) };
}

async function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('physics-math-workspace', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('documents', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(new Error('Notebook storage is unavailable. Export a backup before leaving.'));
  });
}

export async function saveDocument(document: MathDocument): Promise<void> {
  const validated = parseDocument(JSON.stringify(document)), db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('documents', 'readwrite');
    tx.objectStore('documents').put(validated);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(new Error('Notebook could not be saved. Export a backup.')); };
  });
}

export async function listDocuments(): Promise<MathDocument[]> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction('documents', 'readonly').objectStore('documents').getAll();
    request.onsuccess = () => {
      db.close();
      try { resolve(request.result.map(value => parseDocument(JSON.stringify(value))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))); }
      catch { reject(new Error('A saved notebook is unreadable. Import a valid backup or create a new notebook.')); }
    };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}

export function downloadFile(contents: string | Blob, name: string, type = 'application/json') {
  const url = URL.createObjectURL(contents instanceof Blob ? contents : new Blob([contents], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
