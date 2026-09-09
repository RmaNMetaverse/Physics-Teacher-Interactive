import { useState } from 'react';
import type { MathTutorialDefinition } from '../types';
const fmt = (n: number) => Math.abs(n) < 1e-12 ? '0' : Math.abs(n) > 1e5 || (Math.abs(n) < .001 && n !== 0) ? n.toExponential(2) : Number(n.toFixed(6)).toString();
const signed = (n: number) => fmt(n).replace('-', '−');
const ink = '#a8b7cf', axis = '#62708b', blue = '#91a9ff', green = '#6fddc3', orange = '#ffbc83';
const label = (x: number, y: number, text: string, color = ink, anchor: 'middle' | 'start' | 'end' = 'middle') => <text x={x} y={y} fill={color} textAnchor={anchor} fontSize="12">{text}</text>;
export function MathWidget({ tutorial }: { tutorial: MathTutorialDefinition }) {
  return <InteractiveMath key={tutorial.id} tutorial={tutorial}/>;
}
function InteractiveMath({ tutorial }: { tutorial: MathTutorialDefinition }) {
  const c = tutorial.interactive, [n, setN] = useState(c.initial), id = tutorial.id.replace('math-', ''), rad = n * Math.PI / 180;
  const output: Record<string, string> = {
    arithmetic: `${fmt(n)} + 3 = ${fmt(n + 3)}`, 'signed-numbers': `${fmt(n)} + 3 = ${fmt(n + 3)}`,
    fractions: `${fmt(n)} / 8 = ${fmt(n / 8)}`, decimals: `${fmt(n)} / 100 = ${fmt(n / 100)}`,
    ratios: `${fmt(n)} × 3 = ${fmt(n * 3)}`, 'scientific-notation': `3.2 × 10^${fmt(n)} = ${fmt(3.2 * 10 ** n)}`,
    powers: `2^${fmt(n)} = ${fmt(2 ** n)}`, algebra: `2x + 3 = ${fmt(n)} → x = ${fmt((n - 3) / 2)}`,
    coordinates: `P = (${fmt(n)}, 3)`, functions: `y = 2(${fmt(n)}) + 1 = ${fmt(2 * n + 1)}`,
    geometry: `A = ${fmt(n)}² = ${fmt(n * n)}`, trigonometry: `x ≈ ${fmt(5 * Math.cos(rad))}, y ≈ ${fmt(5 * Math.sin(rad))}`,
    vectors: `(${fmt(n)}, 3) + (2, 1) = (${fmt(n + 2)}, 4)`, rates: `slope = ${fmt(n)}; y = ${fmt(n)}x`,
    accumulation: `area = 3 × ${fmt(n)} = ${fmt(3 * n)}`, sine: `sin(${fmt(n)}) ≈ ${fmt(Math.sin(n))}`,
    uncertainty: `[${fmt(10 - n)}, ${fmt(10 + n)}] = 10 ± ${fmt(n)}`,
  };
  let art;
  if (id === 'arithmetic' || id === 'signed-numbers') {
    const lo = id === 'arithmetic' ? 0 : -10, hi = id === 'arithmetic' ? 15 : 15;
    const px = (v: number) => 38 + (v - lo) / (hi - lo) * 344;
    const ticks = id === 'arithmetic' ? [0,3,6,9,12,15] : [-10,-5,0,5,10,15];
    art = <><line x1="38" y1="105" x2="382" y2="105" stroke={axis}/>{ticks.map(v => <g key={v}><line x1={px(v)} y1="100" x2={px(v)} y2="111" stroke={axis}/>{label(px(v),130,signed(v))}</g>)}
      <line x1={px(n)} y1="76" x2={px(n+3)} y2="76" stroke={green} strokeWidth="3"/><path d={`M${px(n+3)-7} 71 L${px(n+3)} 76 L${px(n+3)-7} 81`} stroke={green} fill="none" strokeWidth="2"/>
      <line x1={px(n)} y1="78" x2={px(n)} y2="105" stroke={blue} strokeDasharray="3 3"/><line x1={px(n+3)} y1="78" x2={px(n+3)} y2="105" stroke={green} strokeDasharray="3 3"/>
      <circle cx={px(n)} cy="76" r="4" fill={blue}/>{label((px(n)+px(n+3))/2,61,'+3',green)}{label(110,28,`Start ${signed(n)}`,blue)}{label(310,28,`Result ${signed(n+3)}`,green)}</>;
  } else if (id === 'fractions' || id === 'decimals') {
    const count = id === 'fractions' ? 8 : 100;
    art = <>{Array.from({ length: count }, (_, i) => <rect key={i} x={count===8 ? 30+i*46 : 105+(i%10)*21} y={count===8 ? 42 : 12+Math.floor(i/10)*13} width={count===8 ? 41 : 17} height={count===8 ? 62 : 9} rx="2" fill={i<n ? blue : '#253045'}/>)}{label(210,161,`${fmt(n)} of ${count} equal parts = ${fmt(n/count)} of one whole`)}</>;
  } else if (id === 'ratios') {
    art = <>{Array.from({length:10},(_,i) => <g key={i}><rect x={26+i*37} y="43" width="30" height="78" rx="5" fill={i<n ? '#91a9ff15' : 'none'} stroke={i<n ? blue : axis}/>{[0,1,2].map(j=><circle key={j} cx={41+i*37} cy={60+j*22} r="5" fill={i<n ? green : '#253045'}/>)}</g>)}{label(210,25,`${fmt(n)} groups of 3`,blue)}{label(210,153,`${fmt(n*3)} units altogether; total / groups = 3`)}</>;
  } else if (id === 'scientific-notation' || id === 'powers') {
    const px=(v:number)=>40+(v-c.min)/(c.max-c.min)*340;
    const base=id==='powers'?2:10;
    art=<>{label(210,28,id==='powers'?'Each exponent step multiplies the value by 2':'Each exponent step multiplies the value by 10')}
      <line x1="40" y1="92" x2="380" y2="92" stroke={axis}/>{Array.from({length:c.max-c.min+1},(_,i)=>c.min+i).map(v=><g key={v}><line x1={px(v)} y1="87" x2={px(v)} y2="97" stroke={axis}/>{label(px(v),116,signed(v))}</g>)}
      <circle cx={px(n)} cy="92" r="6" fill={green}/>{label(210,62,`Exponent ${signed(n)} → ${id==='powers' ? fmt(2**n) : fmt(3.2*10**n)}`,green)}
      {label(210,151,`Exponent axis: equal spacing means ×${base}, not equal value increments`)}</>;
  } else if (id === 'algebra') {
    const x=(n-3)/2, width=x*12;
    art=<><rect x="62" y="28" width={width} height="35" fill="#91a9ff35" stroke={blue}/><rect x={62+width} y="28" width={width} height="35" fill="#6fddc335" stroke={green}/><rect x={62+width*2} y="28" width="36" height="35" fill="#ffbc8335" stroke={orange}/>
      {x>0 && <>{label(62+width/2,51,'x',blue)}{label(62+width*1.5,51,'x',green)}</>}{label(80+width*2,51,'3',orange)}
      {label(210,91,`${fmt(n)} − 3 = ${fmt(n-3)}`)}{label(210,122,`${fmt(n-3)} ÷ 2 = ${fmt(x)}`,green)}{label(210,155,`Check: 2 × ${fmt(x)} + 3 = ${fmt(n)}`)}</>;
  } else if (id === 'trigonometry') {
    const x=58+120*Math.cos(rad),y=145-120*Math.sin(rad);
    art=<><path d={`M58 145 H${x} V${y} Z`} fill="#91a9ff13" stroke={blue} strokeWidth="2"/><line x1="58" y1="145" x2={x} y2={y} stroke={green} strokeWidth="3"/>
      {n>5&&n<85&&<path d={`M${x-8} 145 V137 H${x}`} fill="none" stroke={axis}/>}
      {label(222,47,'hypotenuse = 5',green,'start')}{label(222,73,`angle = ${fmt(n)}°`,ink,'start')}{label(222,99,`adjacent ≈ ${Number((5*Math.cos(rad)).toFixed(3))}`,blue,'start')}{label(222,125,`opposite ≈ ${Number((5*Math.sin(rad)).toFixed(3))}`,blue,'start')}
      {label(115,169,'Equal scale on both axes')}</>;
  } else if (id==='geometry' || id==='accumulation') {
    const scale=18,w=n*scale,h=(id==='geometry'?n:3)*scale;
    art=<><rect data-diagram={id==='geometry'?'square':'accumulation'} x="62" y={142-h} width={w} height={h} fill="#6fddc329" stroke={green} strokeWidth="2"/>
      {Array.from({length:Math.floor(n)},(_,i)=>i+1).filter(i=>i<n).map(i=><line key={i} x1={62+i*scale} y1={142-h} x2={62+i*scale} y2="142" stroke={axis} strokeOpacity=".6"/>)}
      {Array.from({length:Math.floor(id==='geometry'?n:3)},(_,i)=>i+1).filter(i=>i<(id==='geometry'?n:3)).map(i=><line key={i} x1="62" y1={142-i*scale} x2={62+w} y2={142-i*scale} stroke={axis} strokeOpacity=".6"/>)}
      {label(252,60,`width = ${fmt(n)}`,ink,'start')}{label(252,88,`height = ${id==='geometry'?fmt(n):'3'}`,ink,'start')}{label(252,116,`area = ${fmt(id==='geometry'?n*n:3*n)}`,green,'start')}{label(130,164,id==='geometry'?'Each cell is one square unit':'Rate × duration = total')}</>;
  } else if(id==='sine') {
    const points=Array.from({length:121},(_,i)=>`${35+i*2.9},${85-Math.sin(i/120*2*Math.PI)*48}`).join(' ');
    art=<><line x1="35" y1="85" x2="383" y2="85" stroke={axis}/><line x1="35" y1="25" x2="35" y2="144" stroke={axis}/><polyline points={points} fill="none" stroke={blue} strokeWidth="2"/>
      {[['0',0],['π/2',.25],['π',.5],['3π/2',.75],['2π',1]].map(([text,f])=> <g key={text}>{label(35+Number(f)*348,158,String(text))}</g>)}
      {label(23,41,'1')}{label(20,137,'−1')}{label(350,20,'phase (rad)')}<circle cx={35+n/(2*Math.PI)*348} cy={85-Math.sin(n)*48} r="6" fill={green}/></>;
  } else if(id==='functions') {
    const px=(x:number)=>210+x*32,py=(y:number)=>85-y*6;
    art=<><line x1="40" y1="85" x2="382" y2="85" stroke={axis}/><line x1="210" y1="19" x2="210" y2="149" stroke={axis}/>
      {[-4,-2,0,2,4].map(v=><g key={v}><line x1={px(v)} y1="82" x2={px(v)} y2="88" stroke={axis}/>{label(px(v),104,signed(v))}</g>)}{[-8,-4,4,8].map(v=><g key={v}>{label(194,py(v)+4,signed(v),'#a8b7cf','end')}</g>)}
      <line data-diagram="function-line" x1={px(-4)} y1={py(-7)} x2={px(4)} y2={py(9)} stroke={blue} strokeWidth="2"/>
      <line x1={px(n)} y1="85" x2={px(n)} y2={py(2*n+1)} stroke={green} strokeDasharray="3 3"/><circle cx={px(n)} cy={py(2*n+1)} r="5" fill={green}/>{label(392,81,'x')}{label(223,19,'y')}{label(210,170,'y = 2x + 1; highlighted point is the selected input')}</>;
  } else if(id==='rates') {
    const scale=16,px=(x:number)=>210+x*scale,py=(y:number)=>86-y*scale,end=n===0?9:Math.min(9,4/Math.abs(n));
    art=<><line x1="52" y1="86" x2="368" y2="86" stroke={axis}/><line x1="210" y1="15" x2="210" y2="153" stroke={axis}/>
      {[-8,-4,4,8].map(v=><g key={v}>{label(px(v),104,signed(v))}</g>)}{[-4,-2,2,4].map(v=><g key={v}>{label(199,py(v)+4,signed(v),ink,'end')}</g>)}
      <line x1={px(-end)} y1={py(-end*n)} x2={px(end)} y2={py(end*n)} stroke={blue} strokeWidth="2"/>
      <path d={`M210 86 H${px(1)} V${py(n)}`} fill="none" stroke={green} strokeWidth="3"/><circle cx={px(1)} cy={py(n)} r="4" fill={green}/>{label(70,24,'run = 1',green)}{label(339,24,`rise = ${signed(n)}`,green)}{label(380,85,'x')}{label(223,16,'y')}{label(210,174,'Equal axis scale; slope = rise / run')}</>;
  } else if(id==='coordinates'||id==='vectors') {
    const px=(x:number)=>210+x*18,py=(y:number)=>124-y*18;
    art=<><line x1="44" y1="124" x2="376" y2="124" stroke={axis}/><line x1="210" y1="23" x2="210" y2="144" stroke={axis}/>
      {[-6,-3,0,3,6].map(v=><g key={v}>{label(px(v),143,signed(v))}</g>)}{[1,2,3,4,5].map(v=><g key={v}>{label(198,py(v)+4,fmt(v),ink,'end')}</g>)}
      <line x1={px(n)} y1="124" x2={px(n)} y2={py(3)} stroke={blue} strokeDasharray="3 3"/><line x1="210" y1={py(3)} x2={px(n)} y2={py(3)} stroke={blue} strokeDasharray="3 3"/><circle cx={px(n)} cy={py(3)} r="5" fill={blue}/>
      {id==='vectors'&&<><line x1="210" y1="124" x2={px(n)} y2={py(3)} stroke={blue} strokeWidth="2"/><line x1={px(n)} y1={py(3)} x2={px(n+2)} y2={py(4)} stroke={orange} strokeWidth="3"/><line x1="210" y1="124" x2={px(n+2)} y2={py(4)} stroke={green} strokeWidth="2"/><circle cx={px(n+2)} cy={py(4)} r="5" fill={green}/>{label(210,171,'A (blue) + B (orange) = resultant (green)')}</>}
      {id==='coordinates'&&label(210,171,`Point (${signed(n)}, 3): horizontal x changes; height stays 3`)}{label(391,126,'x')}{label(223,24,'y')}</>;
  } else if(id==='uncertainty') {
    const px=(v:number)=>210+(v-10)*68;
    art=<><line x1="40" y1="101" x2="380" y2="101" stroke={axis}/><rect x={px(10-n)} y="65" width={n*136} height="36" fill="#6fddc340"/>
      {[8,9,10,11,12].map(v=><g key={v}><line x1={px(v)} y1="96" x2={px(v)} y2="106" stroke={axis}/>{label(px(v),128,fmt(v))}</g>)}
      <line x1={px(10-n)} y1="60" x2={px(10-n)} y2="104" stroke={green}/><line x1={px(10+n)} y1="60" x2={px(10+n)} y2="104" stroke={green}/><circle cx="210" cy="83" r="4" fill={blue}/>
      {label(100,28,`Lower ${fmt(10-n)}`,green)}{label(310,28,`Upper ${fmt(10+n)}`,green)}{label(210,160,`Center stays 10; interval width = ${fmt(2*n)}`)}</>;
  }
  return <div className="math-widget"><svg viewBox="0 0 420 180" role="img" aria-label={'Interactive illustration: '+output[id]}>{art}</svg><div className="math-widget-output" aria-live="polite">{output[id]}</div><label htmlFor={'math-slider-'+tutorial.id}>{c.label}<strong>{fmt(n)}</strong></label><input id={'math-slider-'+tutorial.id} type="range" min={c.min} max={c.max} step={c.step} value={n} onChange={e=>setN(Number(e.target.value))}/><p>{c.instruction}</p></div>;
}