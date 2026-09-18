import { useMemo } from 'react';
import type { ModelId, Parameters, SimulationState } from '../../types';
import type { Trajectory } from '../../physics/scene';
import { formatNumber as fmt } from '../../lib/format';

interface Props { modelId: ModelId; parameters: Parameters; state: SimulationState; trajectory: Trajectory }
const W=720,H=420, cyan='#64e8d0',blue='#83a8ff',violet='#bd8cff',orange='#ffb878',rose='#ff719c';
const seeded=(n:number)=>{const x=Math.sin(n*91.733)*43758.5453;return x-Math.floor(x)};

function Stage(){
  return <><defs>
    <radialGradient id="p2-glow"><stop stopColor="#315d8f" stopOpacity=".44"/><stop offset="1" stopColor="#08111f" stopOpacity="0"/></radialGradient>
    <linearGradient id="p2-spectrum"><stop stopColor={cyan}/><stop offset=".5" stopColor={blue}/><stop offset="1" stopColor={violet}/></linearGradient>
    <filter id="p2-soft" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <pattern id="p2-grid" width="36" height="36" patternUnits="userSpaceOnUse"><path d="M36 0H0V36" fill="none" stroke="#8db2d9" strokeOpacity=".09"/></pattern>
    <marker id="p2-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10Z" fill={orange}/></marker>
  </defs><rect width={W} height={H} rx="24" fill="#07101d"/><rect width={W} height={H} rx="24" fill="url(#p2-grid)"/><ellipse cx="360" cy="210" rx="310" ry="190" fill="url(#p2-glow)"/></>;
}

function Wave({p,t}:{p:Parameters;t:number}){
  const amp=Math.min(95,28+Math.abs(p.amplitude??1)*25),cycles=Math.max(1,Math.min(8,720/Math.max(80,(p.wavelength??2)*115))),phase=t*(p.frequency??1)*Math.PI*2;
  const points=Array.from({length:121},(_,i)=>`${i*6},${210-amp*Math.sin(i/120*cycles*Math.PI*2-phase)}`).join(' ');
  return <>{[8,0,-8].map((dy,i)=><polyline key={dy} points={points} transform={`translate(0 ${dy})`} fill="none" stroke="url(#p2-spectrum)" strokeWidth={i===1?5:2} opacity={i===1?1:.16} filter={i===1?'url(#p2-soft)':undefined}/>)}
    {Array.from({length:18},(_,i)=><circle key={i} cx={40+i*39} cy={210-amp*Math.sin(i/17*cycles*Math.PI*2-phase)} r="4" fill={i%3?blue:cyan}/>)}</>;
}

function Gas({p,t}:{p:Parameters;t:number}){
  const heat=Math.max(.18,Math.min(2.2,(p.temperature??300)/350));
  return <><rect x="64" y="58" width="592" height="304" rx="28" fill="#0b1727" stroke="#77a9d5" strokeOpacity=".38" strokeWidth="2"/>
    {Array.from({length:54},(_,i)=>{const speed=(.45+seeded(i+2))*heat,x=82+((seeded(i*3)*556+t*28*speed*(i%2?1:-1)+3000)%556),y=78+((seeded(i*7)*264+t*19*speed*(i%3?1:-1)+3000)%264);return <g key={i}><line x1={x} y1={y} x2={x-(i%2?1:-1)*9*heat} y2={y} stroke={orange} strokeOpacity=".3"/><circle cx={x} cy={y} r={3+seeded(i)*3} fill={i%4?orange:rose} opacity=".78"/></g>})}</>;
}

function Field({p,t}:{p:Parameters;t:number}){
  const sign=(p.charge??1)>=0?1:-1;
  return <g transform={`rotate(${t*8*sign} 360 210)`}>{Array.from({length:20},(_,i)=>{const a=i*18*Math.PI/180;return <path key={i} d={`M360 210 Q${360+Math.cos(a+.4)*95} ${210+Math.sin(a+.4)*95} ${360+Math.cos(a)*170} ${210+Math.sin(a)*170}`} fill="none" stroke={i%2?cyan:blue} strokeOpacity=".55" strokeWidth="2"/>})}<circle cx="360" cy="210" r="34" fill={sign>0?rose:blue} filter="url(#p2-soft)"/><text x="360" y="220" textAnchor="middle" fill="white" fontSize="30" fontWeight="700">{sign>0?'+':'−'}</text>{Array.from({length:36},(_,i)=><circle key={i} cx={360+Math.cos(i*.73)*(64+i%6*24)} cy={210+Math.sin(i*.73)*(64+i%6*24)} r="2.5" fill={i%2?cyan:violet}/>)}</g>;
}

function Probability({state,t}:{state:SimulationState;t:number}){
  const samples=state.probabilitySamples?.length?state.probabilitySamples:Array.from({length:61},(_,i)=>({position:i/6-5,probability:Math.exp(-Math.pow(i/6-5,2)/3)})),max=Math.max(...samples.map(s=>s.probability),1e-9);
  const pts=samples.map((s,i)=>`${46+i*628/Math.max(1,samples.length-1)},${338-s.probability/max*245}`).join(' ');
  return <><polygon points={`46,338 ${pts} 674,338`} fill="#826dff25"/><polyline points={pts} fill="none" stroke="url(#p2-spectrum)" strokeWidth="5" filter="url(#p2-soft)"/>{Array.from({length:34},(_,i)=>{const idx=Math.floor(seeded(i+Math.floor(t*3))*samples.length),s=samples[idx];return <circle key={i} cx={46+idx*628/Math.max(1,samples.length-1)} cy={338-s.probability/max*245+seeded(i*9)*28} r={2+seeded(i)*3} fill={i%2?cyan:violet} opacity=".72"/>})}<line x1="46" y1="338" x2="674" y2="338" stroke="#9cb4d0" strokeOpacity=".45"/></>;
}

function Optics({p}:{p:Parameters}){
  const bend=Math.max(20,Math.min(92,120/Math.max(1,p.refractiveIndex??1.5)));
  return <><path d="M360 48Q310 210 360 372Q410 210 360 48Z" fill="#79dfff25" stroke={cyan} strokeWidth="3" filter="url(#p2-soft)"/>{[-90,-45,0,45,90].map((dy,i)=><path key={dy} d={`M42 ${210+dy}L360 ${210+dy*.36}L678 ${210+dy*.36+(i-2)*bend/5}`} fill="none" stroke={i%2?orange:blue} strokeWidth="3" opacity=".86"/>)}<line x1="360" y1="34" x2="360" y2="386" stroke="white" strokeOpacity=".16" strokeDasharray="7 8"/></>;
}

function Matter({id,t}:{id:ModelId;t:number}){
  if(id==='condensed')return <>{Array.from({length:55},(_,i)=>{const col=i%11,row=Math.floor(i/11),w=Math.sin(t*2+i)*2;return <g key={i}><line x1={80+col*56} y1={88+row*58} x2={80+Math.min(10,col+1)*56} y2={88+row*58} stroke="#7da1ca" strokeOpacity=".18"/><circle cx={80+col*56+w} cy={88+row*58-w} r="9" fill={i%3?blue:violet} opacity=".82" filter="url(#p2-soft)"/></g>})}</>;
  return <>{Array.from({length:id==='particle'?22:34},(_,i)=>{const a=i*2.399+t*(i%2?.18:-.12),r=18+Math.sqrt(i)*21;return <circle key={i} cx={360+Math.cos(a)*r} cy={210+Math.sin(a)*r*.72} r={5+i%4} fill={[cyan,blue,violet,rose,orange][i%5]} opacity=".84"/>})}<circle cx="360" cy="210" r="42" fill="#ec7fa733" stroke={rose} strokeWidth="3" filter="url(#p2-soft)"/>{Array.from({length:6},(_,i)=><ellipse key={i} cx="360" cy="210" rx={95+i*18} ry={28+i*7} fill="none" stroke={i%2?blue:cyan} strokeOpacity=".32" transform={`rotate(${i*30+t*5} 360 210)`}/>)}</>;
}

function Space({id,t}:{id:ModelId;t:number}){
 return <>{Array.from({length:80},(_,i)=><circle key={i} cx={seeded(i)*W} cy={seeded(i*5)*H} r={.6+seeded(i*8)*1.8} fill="white" opacity={.25+seeded(i)*.7}/>)}<g transform={`rotate(${t*3} 360 210)`}>{Array.from({length:5},(_,i)=><ellipse key={i} cx="360" cy="210" rx={70+i*38} ry={30+i*17} fill="none" stroke={i%2?violet:blue} strokeOpacity={.32-i*.035}/>)}<circle cx="360" cy="210" r={id==='cosmology'?24:38} fill={orange} filter="url(#p2-soft)"/>{Array.from({length:28},(_,i)=>{const a=i*1.8,r=62+i*5.4;return <circle key={i} cx={360+Math.cos(a)*r} cy={210+Math.sin(a)*r*.45} r={2+i%4} fill={i%3?blue:rose}/>})}</g></>;
}

function Bodies({state,trajectory}:{state:SimulationState;trajectory:Trajectory}){
 const pts=[...trajectory.points,...state.bodies.map(b=>b.position)],max=Math.max(1,...pts.flatMap(p=>[Math.abs(p[0]),Math.abs(p[1])]));const sx=(x:number)=>360+x/max*270,sy=(y:number)=>325-y/max*235;
 const trail=trajectory.points.map(p=>`${sx(p[0])},${sy(p[1])}`).join(' ');
 return <><line x1="50" y1="325" x2="680" y2="325" stroke="#9bb0ca" strokeOpacity=".36"/><line x1="360" y1="52" x2="360" y2="370" stroke="#9bb0ca" strokeOpacity=".18" strokeDasharray="6 8"/>{trail&&<polyline points={trail} fill="none" stroke={cyan} strokeOpacity=".38" strokeWidth="2"/>}{state.bodies.map((b,i)=>{const v=b.velocity??[0,0,0],vs=Math.max(10,45/max);return <g key={b.id}><circle cx={sx(b.position[0])} cy={sy(b.position[1])} r={Math.max(7,Math.min(25,b.radius/max*120))} fill={b.color||[cyan,orange][i%2]} stroke="white" strokeOpacity=".5" filter="url(#p2-soft)"/>{(v[0]!==0||v[1]!==0)&&<line x1={sx(b.position[0])} y1={sy(b.position[1])} x2={sx(b.position[0])+v[0]*vs} y2={sy(b.position[1])-v[1]*vs} stroke={orange} strokeWidth="3" markerEnd="url(#p2-arrow)"/>}</g>})}</>;
}

export function Physics2D({modelId,parameters,state,trajectory}:Props){
 const visual=useMemo(()=>{if(modelId==='waves'||modelId==='oscillations')return <Wave p={parameters} t={state.time}/>;if(modelId==='thermal')return <Gas p={parameters} t={state.time}/>;if(modelId==='electromagnetism')return <Field p={parameters} t={state.time}/>;if(modelId==='quantum'||modelId==='relativity')return <Probability state={state} t={state.time}/>;if(modelId==='optics')return <Optics p={parameters}/>;if(['atomic','nuclear','particle','condensed'].includes(modelId))return <Matter id={modelId} t={state.time}/>;if(['gravity','astrophysics','cosmology'].includes(modelId))return <Space id={modelId} t={state.time}/>;return <Bodies state={state} trajectory={trajectory}/>},[modelId,parameters,state,trajectory]);
 const readout=state.observations[0];
 return <div className="physics-2d" data-testid="physics-2d" data-model={modelId} data-dynamic><svg viewBox="0 0 720 420" role="img" aria-label={`Live interactive ${modelId} simulation`} preserveAspectRatio="xMidYMid meet"><Stage/>{visual}<g className="sim-readout"><rect x="22" y="18" width="270" height="44" rx="14" fill="#050a12" fillOpacity=".76" stroke="#9fc5ea" strokeOpacity=".2"/><circle cx="44" cy="40" r="5" fill={cyan}/><text x="58" y="35" fill="#91a7c3" fontSize="11">LIVE MODEL</text><text x="58" y="51" fill="white" fontSize="13" fontWeight="650">{readout?`${readout.label}: ${fmt(readout.value)} ${readout.unit}`:modelId}</text></g></svg><div className="physics-2d-caption"><span className="live-dot"/>Drag a parameter—the model responds instantly.</div></div>;
}
