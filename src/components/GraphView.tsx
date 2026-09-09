import { useMemo, useState } from 'react';
import type { Family, Parameters, SimulationState } from '../types';
import { evaluate } from '../physics';
import { formatNumber as fmt } from '../lib/format';
export function GraphView({family,parameters,state,duration}:{family:Family;parameters:Parameters;state:SimulationState;duration:number}){
  const [selected,setSelected]=useState('');
  const observation=state.observations.find(o=>o.key===selected)||state.observations[0];
  const data=useMemo(()=>Array.from({length:81},(_,i)=>{
    const t=i/80*duration,s=evaluate(family,parameters,t);
    return {t,v:s.observations.find(o=>o.key===observation.key)?.value||0};
  }),[family,parameters,duration,observation.key]);
  const min=Math.min(0,...data.map(p=>p.v)),max=Math.max(1,...data.map(p=>p.v)),range=max-min||1;
  const points=data.map(p=>`${45+p.t/(duration||1)*380},${145-(p.v-min)/range*115}`).join(' ');
  return <div className="graph-view">
    <label className="sr-only" htmlFor="graph-quantity">Plot quantity</label><select className="speed-select" style={{maxWidth:'100%',marginBottom:10}} id="graph-quantity" value={observation.key} onChange={e=>setSelected(e.target.value)}>{state.observations.map(o=><option key={o.key} value={o.key}>{o.label} ({o.unit})</option>)}</select>
    <svg viewBox="0 0 460 180" role="img" aria-label={observation.label+' against time; full predicted trial with current time marker'}>
      {[0,.5,1].map(i=><g key={i}><line x1="45" y1={145-i*115} x2="425" y2={145-i*115} stroke="#33415b" strokeDasharray="3 5"/><text className="chart-label" x="38" y={149-i*115} textAnchor="end">{fmt(min+i*range,1)}</text></g>)}
      <line x1="45" y1="145" x2="425" y2="145" stroke="#62708b"/><polyline points={points} fill="none" stroke={observation.color} strokeWidth="2.3"/><line x1={45+Math.min(1,state.time/(duration||1))*380} y1="20" x2={45+Math.min(1,state.time/(duration||1))*380} y2="145" stroke="#ffbc83" strokeDasharray="3 4"/>
      <text x="45" y="164" className="chart-label">0 s</text><text x="235" y="175" className="chart-label" textAnchor="middle">Time (s)</text><text x="425" y="164" className="chart-label" textAnchor="end">{fmt(duration)} s</text>
    </svg><p className="graph-caption">Full predicted trial. The amber marker shows the current time. All measurements use the same physics as the 3D scene.</p>
    <table className="data-table" aria-label="Live measurements"><thead><tr><th>Quantity</th><th>Value</th><th>Unit</th></tr></thead><tbody>{state.observations.map(o=><tr key={o.key}><td>{o.label}</td><td>{fmt(o.value,4)}</td><td>{o.unit||'dimensionless'}</td></tr>)}</tbody></table>
  </div>;
}
