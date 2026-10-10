import { supabase } from '../cloud/supabase';
import { listDocuments, parseDocument, saveDocument } from './documents';
import { notebookContent, reconcileNotebook, type NotebookBaseline } from './notebook-sync';
import type { MathDocument } from './types';

const metadataKey = (user: string, id: string) => `physics-notebook-sync:${user}:${id}`;
function baseline(user: string, id: string): NotebookBaseline | null {
  try { const value = JSON.parse(localStorage.getItem(metadataKey(user,id)) ?? 'null'); return value && Number.isSafeInteger(value.revision) && typeof value.content === 'string' ? value : null; } catch { return null; }
}
function remember(user: string, document: MathDocument, revision: number) {
  try { localStorage.setItem(metadataKey(user,document.id), JSON.stringify({ revision, content: notebookContent(document) })); } catch { /* Missing baseline causes a safe conflict copy next time. */ }
}
export async function syncNotebook(userId: string, document: MathDocument) {
  const client = supabase;
  if (!client) throw new Error('Sign in to synchronize notebooks.');
  const result = await reconcileNotebook(document, baseline(userId,document.id), {
    read: async () => {
      const { data, error } = await client.from('math_notebooks').select('document,revision').eq('user_id',userId).eq('id',document.id).maybeSingle();
      if (error) throw new Error('Notebook sync is unavailable. Check your connection and apply the notebook database migration.');
      return data ? { revision: Number(data.revision), document: parseDocument(JSON.stringify(data.document)) } : null;
    },
    write: async (value, expected) => {
      const { data, error } = await client.rpc('save_math_notebook', { notebook_id: value.id, expected_revision: expected, contents: value, owner_id: userId });
      if (error) throw new Error('Notebook upload failed. Your local notebook is saved; retry after checking your connection.');
      return data === null ? null : Number(data);
    },
  });
  if (result.conflict) await saveDocument(result.conflict);
  await saveDocument(result.document);
  remember(userId,result.document,result.revision);
  return result;
}
export async function downloadNotebooks(userId: string) {
  if (!supabase) return;
  const { data, error } = await supabase.from('math_notebooks').select('document,revision').eq('user_id',userId).order('updated_at', { ascending: false }).limit(100);
  if (error) throw new Error('Could not fetch cloud notebooks. Check your connection and the notebook migration.');
  const existing = new Set((await listDocuments()).map(d => d.id));
  for (const row of data ?? []) {
    const document = parseDocument(JSON.stringify(row.document));
    if (existing.has(document.id)) continue;
    await saveDocument(document); remember(userId,document,Number(row.revision));
  }
}
