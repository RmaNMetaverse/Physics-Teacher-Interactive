import { useEffect, useId, useRef, useState } from 'react';
import JXG from 'jsxgraph';
// JSXGraph 1.14 exports only its entry point; resolve its bundled stylesheet as a file.
import '../../node_modules/jsxgraph/distrib/jsxgraph.css';
import type { GraphData, GraphSpec } from './types';
import { useMathJob } from './useMathJob';
import { downloadFile } from './documents';

export function GraphPanel({ spec }: { spec: GraphSpec }) {
  const id = 'graph-' + useId().replace(/[^a-z0-9]/gi, ''), host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false), [exportError, setExportError] = useState('');
  useEffect(() => {
    if (!host.current) return;
    const observer = new IntersectionObserver(entries => setVisible(entries.some(entry => entry.isIntersecting)), { rootMargin: '200px' });
    observer.observe(host.current); return () => observer.disconnect();
  }, []);
  const { result, error, busy } = useMathJob<GraphData>(visible ? { kind: 'graph', input: spec } : null);
  useEffect(() => {
    if (!result || !host.current) return;
    const board = JXG.JSXGraph.initBoard(id, { boundingbox: [spec.min, spec.yMax, spec.max, spec.yMin], axis: true, defaultAxes: { x: { ticks: { label: { display: 'internal' } } }, y: { ticks: { label: { display: 'internal' } } } }, showCopyright: false, showNavigation: true, keepaspectratio: false, pan: { enabled: true }, zoom: { wheel: true }, renderer: 'svg' });
    const xs: number[] = [], ys: number[] = [];
    result.segments.forEach(segment => { segment.forEach(([x, y]) => { xs.push(x); ys.push(y); }); xs.push(NaN); ys.push(NaN); });
    board.create('curve', [xs, ys], { strokeColor: '#8b5cf6', strokeWidth: 2, highlight: false });
    if (result.points.length) {
      const dx = (spec.max - spec.min) / 128, dy = (spec.yMax - spec.yMin) / 128;
      const sx: number[] = [], sy: number[] = [];
      result.points.forEach(([x,y]) => { sx.push(x-dx,x+dx,x+dx,x-dx,x-dx,NaN); sy.push(y-dy,y-dy,y+dy,y+dy,y-dy,NaN); });
      board.create('curve', [sx,sy], { strokeWidth: 0, fillColor: '#8b5cf6', fillOpacity: .2, highlight: false });
    }
    return () => JXG.JSXGraph.freeBoard(board);
  }, [id, result, spec.min, spec.max, spec.yMin, spec.yMax]);
  const samples = result?.segments.flat().filter((_, index) => index % Math.max(1, Math.floor((result.segments.flat().length || 1) / 20)) === 0).slice(0, 21) ?? [];
  function exportedSvg() {
    const svg = host.current?.querySelector('svg'); if (!svg) return null;
    const clone = svg.cloneNode(true) as SVGSVGElement;
    // JSXGraph reserves an HTML overlay even with native SVG tick labels.
    // Keep only SVG primitives so raster export remains an origin-clean canvas.
    clone.querySelectorAll('foreignObject').forEach(node => node.remove());
    clone.setAttribute('width', String(svg.clientWidth)); clone.setAttribute('height', String(svg.clientHeight));
    return { source: new XMLSerializer().serializeToString(clone), ratio: svg.clientHeight / svg.clientWidth };
  }
  async function exportPng() {
    const svg = exportedSvg(); if (!svg) return;
    const url = URL.createObjectURL(new Blob([svg.source], { type: 'image/svg+xml' }));
    try {
      const picture = new Image(); picture.src = url; await picture.decode();
      const canvas = document.createElement('canvas'); canvas.width = 1200; canvas.height = Math.round(1200 * svg.ratio);
      const context = canvas.getContext('2d'); if (!context) throw new Error('PNG export is unavailable; use SVG.');
      context.fillStyle = '#f8fafc'; context.fillRect(0,0,canvas.width,canvas.height); context.drawImage(picture,0,0,canvas.width,canvas.height);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve,'image/png'));
      if (!blob) throw new Error('PNG export failed; use SVG.'); downloadFile(blob,'physics-graph.png');
    } catch (cause) { setExportError((cause as Error).message); } finally { URL.revokeObjectURL(url); }
  }
  return <section className="workspace-graph" aria-label="Interactive mathematical graph">
    <div className="workspace-board" id={id} ref={host} role="img" aria-label="Function graph; sample coordinates are available in the table below" />
    <p role="status">{busy ? 'Calculating graph…' : error || result?.note}</p>
    <div className="workspace-actions">
      <button type="button" disabled={!result} onClick={() => { const svg = exportedSvg(); if (svg) downloadFile(svg.source, 'physics-graph.svg', 'image/svg+xml'); }}>Export SVG</button>
      <button type="button" disabled={!result} onClick={() => downloadFile('x,y\n' + (result?.segments.flat().map(p => p.join(',')).join('\n') ?? ''), 'physics-graph.csv', 'text/csv')}>Export CSV</button>
      <button type="button" disabled={!result} onClick={exportPng}>Export PNG</button>
    </div>
    {exportError && <p role="alert">{exportError}</p>}
    <details><summary>Accessible coordinate samples</summary><table className="data-table"><thead><tr><th>x</th><th>y</th></tr></thead><tbody>{samples.map(([x, y], i) => <tr key={i}><td>{x.toPrecision(5)}</td><td>{y.toPrecision(5)}</td></tr>)}</tbody></table></details>
  </section>;
}
