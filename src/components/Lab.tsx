import { Component, lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Box, ChartNoAxesCombined, Pause, Play, RotateCcw, SkipForward, SlidersHorizontal, Lightbulb, Expand, Move } from 'lucide-react';
import type { LessonDefinition, Parameters } from '../types';
import { defaults, evaluate, sanitizeParameters, simulations } from '../physics';
import { sampleTrajectory } from '../physics/scene';
import { formatNumber as fmt } from '../lib/format';
import { GraphView } from './GraphView';
const Scene=lazy(()=>import('./Scene'));
class SceneBoundary extends Component<{children:ReactNode;onFallback:()=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  render(){return this.state.failed?<div className="error-panel"><h2>Use the graph laboratory</h2><p>3D rendering is unavailable on this device. The physics, controls and measurements are still available.</p><button className="secondary-button" onClick={this.props.onFallback}>Open graph & data</button></div>:this.props.children;}
}
const labels:Record<string,string>={speed:'Launch speed',angle:'Angle',g:'Gravity',mode:'Experiment',acceleration:'Acceleration',height:'Initial height',mass:'Mass',length:'Length',uncertainty:'Uncertainty',scale:'Display multiplier',magnitude:'Vector A magnitude',bx:'B horizontal',by:'B vertical',force:'Applied force',friction:'Friction coefficient',mass1:'Mass A',mass2:'Mass B',velocity1:'Initial velocity A',velocity2:'Initial velocity B',restitution:'Restitution',centralMass:'Central mass',radius:'Orbital radius',speedFactor:'Speed / circular speed',springConstant:'Spring constant',amplitude:'Amplitude'};
const motionModes=['Constant velocity','Constant acceleration','Free fall','Projectile'];
const oscillationModes=['Spring oscillator','Pendulum'];
export function Lab({lesson,suspended}:{lesson:LessonDefinition;suspended:boolean}){
  const family=lesson.family,definition=simulations[family];
  const [parameters,setParameters]=useState<Parameters>(()=>sanitizeParameters(family,{...defaults(family),...lesson.preset}));
  const [time,setTime]=useState(0),[playing,setPlaying]=useState(false),[speed,setSpeed]=useState(1),[view,setView]=useState<'3d'|'graph'>('3d'),[camera,setCamera]=useState(0);
  const container=useRef<HTMLDivElement>(null);
  const trajectory=useMemo(()=>sampleTrajectory(family,parameters),[family,parameters]);
  const state=useMemo(()=>evaluate(family,parameters,time),[family,parameters,time]);
  const duration=trajectory.duration||definition.duration,baseSpeed=family==='gravity'?500:1;
  useEffect(()=>{if(suspended)setPlaying(false);},[suspended]);
  useEffect(()=>{
    if(!playing)return;
    let frame=0,previous=0,accumulator=0;
    const tick=(now:number)=>{
      if(document.hidden){previous=now;frame=requestAnimationFrame(tick);return;}
      if(previous)accumulator+=Math.min(.1,(now-previous)/1000);
      previous=now;const steps=Math.floor(accumulator*60);
      if(steps>0){accumulator-=steps/60;setTime(t=>Math.min(duration,t+steps/60*speed*baseSpeed));}
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  },[playing,speed,baseSpeed,duration]);
  useEffect(()=>{if(state.ended||time>=duration)setPlaying(false);},[state.ended,time,duration]);
  function update(key:string,value:number){
    setParameters(p=>sanitizeParameters(family,{...p,[key]:value}));setTime(0);setPlaying(false);
  }
  function play(){if(time>=duration||state.ended)setTime(0);setPlaying(p=>!p);}
  const controls=definition.parameters.filter(p=>{
    if(family!=='motion')return true;
    if(p.key==='angle')return parameters.mode===3;
    if(p.key==='acceleration')return parameters.mode===1;
    if(p.key==='speed')return parameters.mode!==2;
    if(p.key==='g')return parameters.mode>=2;
    return true;
  });
  return <section className="lab" ref={container} aria-label={definition.title}>
    <div className="lab-topline"><div className="lab-label"><span className="live-dot"/>Interactive laboratory</div><div className="segmented"><button className={view==='3d'?'active':''} aria-pressed={view==='3d'} onClick={()=>setView('3d')}><Box size={12}/>3D scene</button><button className={view==='graph'?'active':''} aria-pressed={view==='graph'} onClick={()=>setView('graph')}><ChartNoAxesCombined size={12}/>Graph & data</button></div></div>
    <div className="lab-content"><div className="experiment-viewport">
      {view==='3d'?<><SceneBoundary key={family+camera} onFallback={()=>setView('graph')}><Suspense fallback={<div className="scene-loading">Preparing your experiment…</div>}><Scene family={family} parameters={parameters} state={state} trajectory={trajectory} resetKey={camera} onParameterChange={update}/></Suspense></SceneBoundary>
      <div className="scene-label"><strong>{family==='gravity'?'Orbital reference frame':'World reference frame'}</strong><p>{family==='motion'&&parameters.mode===3?'Horizontal freedom. Vertical gravity.':definition.description}</p></div>
      <div className="scene-controls"><button className="icon-button" aria-label="Reset camera" title="Reset camera" onClick={()=>setCamera(v=>v+1)}><RotateCcw size={13}/></button><button className="icon-button" aria-label="Expand experiment" title="Expand experiment" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen();else void container.current?.requestFullscreen?.().catch(()=>{});}}><Expand size={13}/></button></div>
      <div className="scene-axis-hint"><Move size={12}/>Drag to orbit · scroll to zoom · markers are schematic</div></>:<GraphView family={family} parameters={parameters} state={state} duration={duration}/>}
    </div><div className="parameters"><p className="panel-label"><SlidersHorizontal size={12}/>Experiment controls</p>
    {controls.map(p=><div className="parameter" key={p.key}><div className="parameter-top"><label htmlFor={'param-'+p.key}>{labels[p.key]||p.label}</label>{p.key!=='mode'&&<span className="parameter-value"><input aria-label={p.label+' value'} type="number" min={p.min} max={p.max} step={p.step} value={parameters[p.key]} onChange={e=>{if(e.target.value!==''&&Number.isFinite(e.target.valueAsNumber))update(p.key,e.target.valueAsNumber);}}/><small>{p.unit}</small></span>}</div>
    {p.key==='mode'?<select className="text-input" style={{width:'100%',fontSize:11,padding:7}} id={'param-'+p.key} value={parameters[p.key]} onChange={e=>update(p.key,Number(e.target.value))}>{(family==='motion'?motionModes:oscillationModes).map((name,i)=><option key={name} value={i}>{name}</option>)}</select>:<><input id={'param-'+p.key} type="range" min={p.min} max={p.max} step={p.step} value={parameters[p.key]} onChange={e=>update(p.key,Number(e.target.value))}/><div className="parameter-bounds"><span>{fmt(p.min)}</span><span>{fmt(p.max)}</span></div></>}</div>)}
    <div className="param-tip"><Lightbulb size={13}/>Change one variable at a time. Each change starts a new trial so you can compare cause and effect.</div>
    </div></div>
    <div className="lab-playbar"><button className="play-button" aria-label={playing?'Pause experiment':'Play experiment'} onClick={play}>{playing?<Pause size={14}/>:<Play size={14} fill="currentColor"/>}{playing?'Pause':'Play'}</button><button className="playbar-icon" aria-label="Reset experiment" title="Reset experiment" onClick={()=>{setTime(0);setPlaying(false);}}><RotateCcw size={16}/></button><button className="playbar-icon" aria-label="Step experiment" title="Step forward" onClick={()=>{setPlaying(false);setTime(t=>Math.min(duration,t+baseSpeed/60));}}><SkipForward size={16}/></button><span className="playbar-divider"/><select className="speed-select" aria-label="Playback speed" value={speed} onChange={e=>setSpeed(Number(e.target.value))}>{[.25,.5,1,2].map(s=><option key={s} value={s}>{s*baseSpeed}×</option>)}</select><div className="timeline"><input type="range" aria-label="Experiment time" min="0" max={duration} step={duration/1000} value={Math.min(duration,time)} onChange={e=>{setPlaying(false);setTime(Number(e.target.value));}}/></div><div className="time-label">t = <b data-testid="simulation-time">{fmt(state.time,2)}</b> s</div></div>
    <div className="telemetry">{state.observations.slice(0,4).map(o=><div className="measurement" key={o.key}><div className="measurement-label"><span className="quantity-dot" style={{background:o.color}}/>{o.label}</div><div className="measurement-value">{fmt(o.value)}<small>{o.unit}</small></div></div>)}</div>
  </section>;
}
