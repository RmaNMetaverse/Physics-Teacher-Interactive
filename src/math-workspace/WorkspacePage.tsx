import { useEffect, useRef, useState } from 'react';
import { Equation } from '../components/Equation';
import { MathInput } from './MathInput';
import { GraphPanel } from './GraphPanel';
import { defaultGraph, type MathCell, type MathDocument, type MathOperation, type CalculationResult } from './types';
import { downloadFile, listDocuments, newDocument, parseDocument, saveDocument } from './documents';
import { takeWorkspaceContext } from './context';
import { useMathJob } from './useMathJob';
import { downloadNotebooks, syncNotebook } from './cloud-notebooks';
import './workspace.css';

function ExpressionCell({ cell, update }: { cell: Extract<MathCell, { kind: 'expression' }>; update: (cell: MathCell) => void }) {
  const [operation, setOperation] = useState<MathOperation>('evaluate');
  const [variable, setVariable] = useState('x');
  const [angleUnit, setAngleUnit] = useState<'rad' | 'deg'>('rad');
  const { result, error, busy } = useMathJob<CalculationResult>({ kind: 'calculate', input: { latex: cell.latex, operation, variable, angleUnit } });
  return <><MathInput value={cell.latex} onChange={latex => update({ ...cell, latex })} label="Mathematical expression" />
    <div className="workspace-fields"><label>Operation<select value={operation} onChange={e => setOperation(e.target.value as MathOperation)}>{Object.entries({ evaluate: 'Exact evaluation', approximate: 'Numerical approximation', simplify: 'Simplify', solve: 'Solve linear / quadratic', differentiate: 'Differentiate', integrate: 'Antiderivative' }).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Variable<input maxLength={1} value={variable} onChange={e => setVariable(e.target.value)} /></label><label>Angles<select value={angleUnit} onChange={e => setAngleUnit(e.target.value as 'rad' | 'deg')}><option value="rad">Radians</option><option value="deg">Degrees</option></select></label></div>
    <div aria-live="polite">{busy ? <p>Calculating…</p> : error ? <p className="workspace-notice">{error} You can keep this notation in your notebook.</p> : result && <><Equation value={result.latex} label="Calculation result" /><p>{result.explanation}</p></>}</div>
  </>;
}

function DataCell({ cell, update }: { cell: Extract<MathCell, { kind: 'data' }>; update: (cell: MathCell) => void }) {
  const [raw, setRaw] = useState(cell.points.map(p => p.join(',')).join('\n'));
  const [error, setError] = useState('');
  const [kind, setKind] = useState<'linear' | 'quadratic' | 'exponential'>('linear');
  const fit = useMathJob<{ coefficients: number[]; residuals: number[] }>({ kind: 'fit', input: { points: cell.points, kind } });
  return <><label>Data pairs (x,y), one per line<textarea rows={5} value={raw} onChange={e => {
    setRaw(e.target.value); const points = e.target.value.trim().split('\n').map(line => line.split(',').map(Number));
    if (points.length > 2000 || points.some(p => p.length !== 2 || !p.every(Number.isFinite))) { setError('Use two finite numbers per row, up to 2,000 rows.'); return; }
    setError(''); update({ ...cell, points: points as [number, number][] });
  }} /></label><label>Fit<select value={kind} onChange={e => setKind(e.target.value as typeof kind)}><option value="linear">a + bx</option><option value="quadratic">a + bx + cx²</option><option value="exponential">exp(a + bx), positive y only</option></select></label><p role="status">{error || fit.error || (fit.busy ? 'Fitting…' : '')}</p>{fit.result && <><p>Coefficients a, b{kind === 'quadratic' ? ', c' : ''}: {fit.result.coefficients.map(n => n.toPrecision(6)).join(', ')}</p><p>Least squares; exponential fits minimize errors in log(y). A fit describes these data and does not establish a physical law.</p><details><summary>Residuals (observed − fitted)</summary><table><tbody>{fit.result.residuals.map((n,i) => <tr key={i}><th>Row {i+1}</th><td>{n.toPrecision(5)}</td></tr>)}</tbody></table></details></>}</>;
}

function CellEditor({ cell, update }: { cell: MathCell; update: (cell: MathCell) => void }) {
  if (cell.kind === 'expression') return <ExpressionCell cell={cell} update={update} />;
  if (cell.kind === 'text') return <label>Explanation or observation<textarea rows={4} maxLength={20000} value={cell.text} onChange={e => update({ ...cell, text: e.target.value })} /></label>;
  if (cell.kind === 'data') return <DataCell cell={cell} update={update} />;
  const graph = cell.graph;
  const change = (partial: Partial<typeof graph>) => update({ ...cell, graph: { ...graph, ...partial } });
  return <><label>Graph type<select value={graph.kind} onChange={e => change({ kind: e.target.value as typeof graph.kind })}><option value="function">Function y = f(x)</option><option value="parametric">Parametric x(t), y(t)</option><option value="polar">Polar r(t)</option><option value="implicit">Implicit f(x,y) = 0</option><option value="inequality">Region f(x,y) ≤ 0</option></select></label>
    <MathInput value={graph.latex} onChange={latex => change({ latex })} label={graph.kind === 'parametric' ? 'x(t)' : 'Graph expression'} />
    {graph.kind === 'parametric' && <MathInput value={graph.secondary} onChange={secondary => change({ secondary })} label="y(t)" />}
    <div className="workspace-fields">{(['min', 'max', 'yMin', 'yMax'] as const).map(key => <label key={key}>{({ min: 'x / t minimum', max: 'x / t maximum', yMin: 'y minimum', yMax: 'y maximum' })[key]}<input type="number" value={graph[key]} onChange={e => { if (Number.isFinite(e.target.valueAsNumber)) change({ [key]: e.target.valueAsNumber }); }} /></label>)}<label>Angles<select value={graph.angleUnit} onChange={e => change({ angleUnit: e.target.value as 'rad' | 'deg' })}><option value="rad">Radians</option><option value="deg">Degrees</option></select></label></div>
    <label>Parameter a = {graph.parameters.a ?? 1}<input type="range" min={-10} max={10} step={.1} value={graph.parameters.a ?? 1} onChange={e => change({ parameters: { ...graph.parameters, a: Number(e.target.value) } })} /></label><GraphPanel spec={graph} />
  </>;
}

export default function WorkspacePage({ userId }: { userId?: string }) {
  const [document, setDocument] = useState<MathDocument | null>(null);
  const [library, setLibrary] = useState<MathDocument[]>([]);
  const [message, setMessage] = useState('Opening your notebooks…');
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('');
  const latest = useRef({ document, userId }); latest.current = { document, userId };
  const context = useRef(takeWorkspaceContext());
  useEffect(() => {
    let active = true;
    listDocuments().then(saved => {
      if (!active) return;
      setLibrary(saved);
      const initial = context.current ? newDocument() : saved[0] ?? newDocument();
      if (context.current) { initial.title = context.current.title; initial.context = context.current; initial.cells = [{ id: crypto.randomUUID(), kind: 'expression', latex: context.current.latex }]; }
      setDocument(initial); setMessage('Saved on this device.');
    }).catch(e => { if (active) { setDocument(newDocument()); setError(String(e.message)); } });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    if (!document) return;
    let active = true;
    void saveDocument(document).then(() => { if (active) { setMessage('Saved on this device.'); setLibrary(previous => [document, ...previous.filter(d => d.id !== document.id)]); } }).catch(e => { if (active) setError(e.message); });
    return () => { active = false; };
  }, [document]);
  function edit(partial: Partial<MathDocument>) { if (document) { setMessage('Saving…'); setDocument({ ...document, ...partial, updatedAt: new Date().toISOString(), revision: document.revision + 1 }); } }
  function add(kind: MathCell['kind']) {
    if (!document || document.cells.length >= 40) return;
    const id = crypto.randomUUID();
    const cell: MathCell = kind === 'text' ? { id, kind, text: '' } : kind === 'expression' ? { id, kind, latex: 'x^2' } : kind === 'graph' ? { id, kind, graph: defaultGraph() } : { id, kind, points: [[0,1],[1,3],[2,5]] };
    edit({ cells: [...document.cells, cell] });
  }
  async function synchronize() {
    if (!userId || !document || syncing) return;
    setSyncing(true); setError(''); setSyncMessage('');
    try {
      await saveDocument(document);
      const result = await syncNotebook(userId, document);
      await downloadNotebooks(userId);
      if (latest.current.userId !== userId) return;
      if (latest.current.document?.id === document.id && latest.current.document.revision === document.revision) setDocument(result.document);
      else if (latest.current.document) await saveDocument(latest.current.document);
      setLibrary(await listDocuments());
      setSyncMessage(result.conflict ? 'Both edits are safe. Open the recovered local edit from the notebook list.' : 'Notebook synchronized. New cloud notebooks are available in the list.');
    } catch (cause) { setError((cause as Error).message); }
    finally { setSyncing(false); }
  }
  return <section className="math-workspace"><header><p className="eyebrow">Your mathematical laboratory</p><h1>Math Workspace</h1><p>Write, calculate, graph, and keep your reasoning alongside the results.</p><a href="#/explore">Back to Explore</a></header>
    <details className="workspace-help"><summary>Notation, supported operations, and mathematical rules</summary><p>Use the keyboard button in a formula field for fractions, roots, matrices, sums, derivatives, and integrals. Paste LaTeX directly. Ctrl/Cmd+Z undoes typing; Ctrl/Cmd+Shift+Z redoes it. Advanced notation can be stored even when calculation is unsupported.</p><p>Use single-letter variables. Evaluation preserves unknown quantities; numerical mode approximates them. Solve supports explicit candidate roots. Always keep the original domain: for example, x/x requires x ≠ 0 even after simplifying to 1. Numerical agreement is not a proof of equivalence.</p><p>For derivatives, d(xⁿ)/dx = nxⁿ⁻¹; a constant has derivative zero. Products require both terms: (fg)′ = f′g + fg′. Compositions require the chain rule: (f(g(x)))′ = f′(g(x))g′(x). Partial derivatives hold other variables constant. Calculus uses radians. An antiderivative describes a family F(x)+C; differentiate it to verify the result.</p><p>Graphs interpret coordinates as numbers; supply units in an explanation cell. Implicit graphs plot f(x,y)=0; region graphs shade f(x,y)≤0. Numerical sampling can miss narrow features. For a circle enter x²+y²−1. Graph cells and calculations are bounded and cancelled when you edit or leave the page.</p><p>These tools calculate supported expressions; they do not automatically prove identities, infer units, or solve every equation. Keep a notebook export as a portable backup.</p></details>
    <p role="status">{message}</p>{error && <p role="alert">{error}</p>}
    {syncMessage && <p role="status">{syncMessage}</p>}
    <div className="workspace-actions"><button disabled={!userId || syncing || !document} onClick={synchronize}>{syncing ? 'Synchronizing…' : 'Sync notebook & fetch cloud notebooks'}</button><p>{userId ? 'Sync each edited notebook when you are ready to switch devices.' : 'Notebooks save locally. Sign in with the avatar to use optional cloud sync.'}</p></div>
    {document && <><div className="workspace-actions"><label>Notebook<select value={document.id} onChange={e => { const found = library.find(d => d.id === e.target.value); if (found) setDocument(found); }}>{!library.some(d => d.id === document.id) && <option value={document.id}>{document.title}</option>}{library.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}</select></label><button onClick={() => setDocument(newDocument())}>New notebook</button><button onClick={() => downloadFile(JSON.stringify(document, null, 2), 'physics-notebook.json')}>Export notebook</button><label className="workspace-import">Import notebook<input type="file" accept="application/json,.json" onChange={async e => { const file = e.target.files?.[0]; if (!file) return; try { if (file.size > 500000) throw new Error('Notebook exceeds 500 KB.'); const imported = parseDocument(await file.text()); setDocument({ ...imported, id: crypto.randomUUID(), title: imported.title.slice(0,140) + ' (imported)', revision: 0 }); setError(''); } catch (cause) { setError((cause as Error).message); } e.target.value = ''; }} /></label></div>
    <label>Notebook title<input maxLength={160} value={document.title} onChange={e => edit({ title: e.target.value })} /></label>
    {document.context && <aside className="workspace-help"><h2>{document.context.title}</h2><p>{document.context.symbols}</p><a href={document.context.returnHash}>Return to lesson</a></aside>}
    {document.cells.map((cell,index) => <article className="workspace-cell" key={cell.id}><header><h2>{index+1}. {cell.kind === 'expression' ? 'Formula & calculation' : cell.kind === 'graph' ? 'Graph' : cell.kind === 'data' ? 'Experiment data' : 'Explanation'}</h2><button aria-label={`Remove cell ${index+1}`} onClick={() => edit({ cells: document.cells.filter(c => c.id !== cell.id) })}>Remove</button></header><CellEditor cell={cell} update={value => edit({ cells: document.cells.map(c => c.id === value.id ? value : c) })} /></article>)}
    <div className="workspace-actions" aria-label="Add notebook cell">{(['text','expression','graph','data'] as const).map(kind => <button key={kind} disabled={document.cells.length >= 40} onClick={() => add(kind)}>Add {kind}</button>)}</div></>}
  </section>;
}
