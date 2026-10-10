export interface WorkspaceContext { title: string; latex: string; symbols: string; returnHash: string }
let pending: WorkspaceContext | null = null;
export function openWorkspace(context: WorkspaceContext) { pending = context; window.location.hash = '#/workspace'; }
export function takeWorkspaceContext() { const value = pending; pending = null; return value; }
