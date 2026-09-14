import { useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';
import { CatmullRomCurve3, Vector3 } from 'three';
import type { Family, ModelId, Parameters, SimulationState } from '../../types';
import type { Trajectory } from '../../physics/scene';
import { sanitizeModelParameters } from '../../physics';
import { ConceptScenes } from './ConceptScenes';
import { CameraFraming, Halo, Housing, Metal, RenderBudget, Rod, Studio, Surface, useBrushedTexture } from './Studio';
import { initialPixelRatio } from './render-policy';

type Point = [number, number, number];
export interface SceneProps {
  modelId?: ModelId;
  family?: Family;
  parameters: Parameters;
  state: SimulationState;
  trajectory: Trajectory;
  resetKey: number;
  onParameterChange?: (key: string, value: number) => void;
  shouldThrow?: boolean;
}
const teal = '#5eead4', amber = '#ffae54', blue = '#7da7ff';
const fmt = (value: number) => Math.abs(value) >= 1e5 ? value.toExponential(2) : Number(value.toFixed(2)).toString();

function WoundSpring({ points }: { points: Point[] }) {
  const curve = useMemo(() => new CatmullRomCurve3(points.map(p => new Vector3(...p))), [points]);
  return <mesh><tubeGeometry args={[curve, 96, .038, 8, false]}/><Metal color="#cad9e5"/></mesh>;
}

function Label({ position, children, color = '#c9d6e8' }: { position: Point; children: React.ReactNode; color?: string }) {
  return <Html center position={position} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}><span className="scene-tag" style={{ color, fontSize: 10, letterSpacing: '.04em', background: 'rgba(7,17,32,.8)', padding: '4px 7px', borderRadius: 4 }}>{children}</span></Html>;
}
function Arrow({ start, end, color }: { start: Point; end: Point; color: string }) {
  const direction = new Vector3(...end).sub(new Vector3(...start));
  const length = direction.length();
  if (length < 1e-7) return null;
  return <><Rod start={start} end={end} radius={.035} color={color}/><arrowHelper args={[direction.normalize(), new Vector3(...start), length, color, Math.min(.3, length * .2), Math.min(.16, length * .1)]}/></>;
}

function Experiment({ modelId, family, parameters, state, trajectory }: Omit<SceneProps, 'resetKey' | 'onParameterChange'>) {
  const id: ModelId = modelId ?? family ?? 'motion';
  const p = useMemo(() => sanitizeModelParameters(id, parameters), [id, parameters]);
  const texture = useBrushedTexture();
  const transform = useMemo(() => {
    const { min, max } = trajectory.bounds;
    const scale = 10 / Math.max(...max.map((v, i) => v - min[i]), 1);
    const center = min.map((v, i) => (v + max[i]) / 2);
    const point = (v: Point): Point => v.map((x, i) => (x - center[i]) * scale) as Point;
    return { scale, point };
  }, [trajectory]);
  const { scale, point } = transform;
  const origin = point([0, 0, 0]);
  const path = useMemo(() => trajectory.points.map(transform.point), [trajectory, transform]);
  const floor = Math.min(point(trajectory.bounds.min)[1], origin[1]) - .25;
  const angle = (p.angle ?? 0) * Math.PI / 180;
  const primary = state.bodies.find(b => b.id !== 'origin' && b.id !== 'central-mass');
  const primaryPoint: Point = primary ? point(primary.position) : origin;
  const mainColor = id === 'motion' ? amber : teal;
  const moving = !['measurement', 'vectors'].includes(id);
  const visibleTrail = Math.max(2, Math.min(path.length, Math.floor(state.time / Math.max(trajectory.duration, 1e-9) * (path.length - 1)) + 1));
  const spring = id === 'oscillations' && p.mode === 0;
  const pendulum = id === 'oscillations' && p.mode === 1;
  const springAnchor: Point = [point(trajectory.bounds.min)[0] - .2, primaryPoint[1], 0];
  const springPoints: Point[] = spring ? Array.from({ length: 81 }, (_, i) => {
    const fraction = i / 80, envelope = i === 0 || i === 80 ? 0 : .14;
    return [springAnchor[0] + (primaryPoint[0] - springAnchor[0]) * fraction, primaryPoint[1] + envelope * Math.sin(fraction * Math.PI * 20), envelope * Math.cos(fraction * Math.PI * 20)];
  }) : [];
  const slope = id === 'forces' || id === 'energy';
  const slopeStart = id === 'energy' ? point([0, p.height ?? 0, 0]) : origin;
  const slopeDistance = id === 'energy' ? Math.min((p.height ?? 0) / Math.sin(angle || 0.01) * scale, 11) : Math.max(4, Math.hypot(primaryPoint[0] - origin[0], primaryPoint[1] - origin[1]) + .8);
  const slopeEnd: Point = [slopeStart[0] + Math.cos(angle) * slopeDistance, slopeStart[1] - Math.sin(angle) * slopeDistance, 0];
  const xLabel: Point = [5.2, origin[1], origin[2]];

  const speedObs = state.observations.find(o => o.key === 'speed');
  const advanced = state.bodies.length === 0;

  return <>
    <Studio modelId={id} floor={advanced ? -3.3 : floor} space={['gravity', 'astrophysics', 'cosmology'].includes(id)}/>
    {advanced && <ConceptScenes id={id} parameters={p} state={state}/>}
    {!advanced && <>
    <Line points={[[-5.5, origin[1], origin[2]], [5.5, origin[1], origin[2]]]} color="#38536b" lineWidth={1}/>
    <Line points={[[origin[0], floor, origin[2]], [origin[0], 5.5, origin[2]]]} color="#38536b" lineWidth={1}/>
    <Label position={xLabel} color="#698398">x</Label>
    <Label position={[origin[0], Math.min(5.3, origin[1] + 2), origin[2]]} color="#698398">y</Label>
    </>}
    {moving && path.length > 1 && <Line points={path} color={id === 'gravity' ? '#356b80' : '#546478'} lineWidth={1.5} dashed dashSize={.12} gapSize={.12}/>}
    {moving && state.time > 0 && path.length > 1 && <Line points={path.slice(0, visibleTrail)} color={mainColor} lineWidth={2}/>}
    {id === 'motion' && speedObs && <>
      <Line points={[[primaryPoint[0], origin[1], 0], primaryPoint]} color="#657282" lineWidth={1} dashed dashSize={.08} gapSize={.09}/>
      <mesh position={[primaryPoint[0], origin[1] + .006, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.1, .15, 32]}/><meshBasicMaterial color={amber} transparent opacity={.6}/></mesh>
      <Label position={[primaryPoint[0] + .25, primaryPoint[1] + .55, 0]} color={amber}>{fmt(speedObs.value)} m/s</Label>
    </>}
    {id === 'measurement' && <>
      <group position={[(origin[0] + primaryPoint[0]) / 2, origin[1] - .18, -.05]}><Housing size={[Math.max(.1, Math.abs(primaryPoint[0] - origin[0])), .25, .65]} color="#516779" texture={texture}/></group>
      <Line points={[origin, point([p.length ?? 1, 0, 0])]} color={teal} lineWidth={5}/>
      {Array.from({ length: 21 }, (_, i) => {
        const x = (p.length ?? 1) * i / 20;
        return <Line key={i} points={[point([x, -.04 * (p.length ?? 1), 0]), point([x, (i % 5 === 0 ? .06 : .03) * (p.length ?? 1), 0])]} color="#8eafc2" lineWidth={1}/>;
      })}
      <Line points={[point([(p.length ?? 1) - (p.uncertainty ?? 0), .13 * (p.length ?? 1), 0]), point([(p.length ?? 1) + (p.uncertainty ?? 0), .13 * (p.length ?? 1), 0])]} color={amber} lineWidth={7}/>
      <Label position={[primaryPoint[0], primaryPoint[1] + .95, 0]} color={amber}>{fmt(p.length ?? 1)} ± {fmt(p.uncertainty ?? 0)} m</Label>
      <Label position={[origin[0], origin[1] - .65, 0]}>0 m</Label>
    </>}
    {id === 'vectors' && state.bodies.length >= 3 && <>
      <Arrow start={origin} end={point(state.bodies[1].position)} color={teal}/>
      <Arrow start={point(state.bodies[1].position)} end={point(state.bodies[2].position)} color={blue}/>
      <Arrow start={origin} end={point(state.bodies[2].position)} color={amber}/>
      <Line points={[origin, point([state.bodies[1].position[0], 0, 0]), point(state.bodies[1].position)]} color="#44686c" dashed dashSize={.09} gapSize={.09}/>
      <Label position={[point(state.bodies[1].position)[0], point(state.bodies[1].position)[1] + .45, 0]} color={teal}>A</Label>
      <Label position={[point(state.bodies[2].position)[0], point(state.bodies[2].position)[1] + .45, 0]} color={amber}>A + B</Label>
    </>}
    {slope && <>
      <Rod start={[slopeStart[0], floor, -.35]} end={[slopeStart[0], slopeStart[1] - .25, -.35]} radius={.06}/>
      <Rod start={[slopeEnd[0], floor, -.35]} end={[slopeEnd[0], slopeEnd[1] - .25, -.35]} radius={.06}/>
      <group position={[(slopeStart[0] + slopeEnd[0]) / 2, (slopeStart[1] + slopeEnd[1]) / 2 - .2, 0]} rotation={[0, 0, -angle]}><Housing size={[slopeDistance, .15, 1.2]} color="#536a80" texture={texture}/></group>
      {[-.53, .53].map(z => <Rod key={z} start={[slopeStart[0], slopeStart[1] - .1, z]} end={[slopeEnd[0], slopeEnd[1] - .1, z]} color={teal} radius={.018}/>)}
      <Line points={[slopeStart, [slopeStart[0], slopeEnd[1], 0], slopeEnd]} color="#33465e" lineWidth={1}/>
      <Label position={[slopeStart[0] + .5, slopeStart[1] - .65, 0]}>{fmt(p.angle ?? 0)}° slope</Label>
    </>}
    {id === 'collisions' && <>
      {[-.24, .24].map(z => <Rod key={z} start={[-5.5, origin[1] - .32, z]} end={[5.5, origin[1] - .32, z]} radius={.045} color="#a2b8ce"/>)}
    </>}
    {spring && <>
      <Rod start={[springAnchor[0], floor, 0]} end={springAnchor} radius={.06}/>
      <Rod start={[springAnchor[0], primaryPoint[1] - .38, 0]} end={[5, primaryPoint[1] - .38, 0]} radius={.045}/>
      <Rod start={[5, floor, 0]} end={[5, primaryPoint[1] - .38, 0]} radius={.06}/>
      <mesh position={springAnchor}><boxGeometry args={[.12, 1.3, .8]}/><meshStandardMaterial color="#536981" metalness={.6} roughness={.35}/></mesh>
      <WoundSpring points={springPoints}/>
      <Label position={[springAnchor[0] + 1, springAnchor[1] + 1, 0]}>k = {fmt(p.stiffness ?? p.springConstant ?? 10)} N/m</Label>
    </>}
    {pendulum && <>
      {[-1, 1].map(side => <group key={side}>
        <Rod start={[origin[0] + side * 1.4, floor, -1]} end={[origin[0] + side * 1.4, origin[1] + .2, -1]} radius={.09} color="#ced9e5"/>
        <group position={[origin[0] + side * 1.4, floor + .05, -1]}><Housing size={[.7, .12, 1.2]} color="#405773"/></group>
      </group>)}
      <Rod start={[origin[0] - 1.4, origin[1] + .2, -1]} end={[origin[0] + 1.4, origin[1] + .2, -1]} radius={.1} color="#ced9e5"/>
      <Rod start={[origin[0], origin[1], -.8]} end={[origin[0], floor, -.8]} radius={.075}/>
      <Rod start={[origin[0], origin[1], -.8]} end={origin} radius={.075}/>
      <mesh position={origin}><sphereGeometry args={[.09, 16, 16]}/><meshStandardMaterial color="#c6d5e1"/></mesh>
      <Rod start={origin} end={primaryPoint} color="#aec4d7" radius={.022}/>
      <Line points={[origin, point([0, -(p.length ?? 1), 0])]} color="#344e66" dashed dashSize={.08} gapSize={.08}/>
      <Label position={[origin[0] + .6, origin[1] - (p.length ?? 1) * scale / 2, 0]}>L = {fmt(p.length ?? 1)} m</Label>
    </>}
    {state.bodies.map((b, index) => {
      if (b.id === 'origin') return null;
      const position = point(b.position), radius = b.id === 'central-mass' ? .95 : Math.min(.75, Math.max(.3, b.radius * scale));
      const color = id === 'motion' ? amber : b.color;
      const cart = id === 'collisions', block = slope || spring;
      return <group key={b.id} position={position} rotation={slope ? [0, 0, -angle] : [0, 0, 0]}>
        {cart || block ? <Housing size={[Math.max(.4, radius * 2), Math.max(.32, radius * 1.6), Math.max(.4, radius * 1.7)]} color={color} texture={texture}/> : <mesh><sphereGeometry args={[radius, 32, 20]}/><Surface color={color}/></mesh>}
        {(cart || block) && <mesh position={[0, Math.max(.32, radius * 1.6) / 2 + .008, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[Math.max(.2, radius), .16]}/><meshBasicMaterial color="#d4e8eb"/></mesh>}
        {!cart && !block && <mesh rotation={[Math.PI / 2, 0, .35]}><torusGeometry args={[radius * 1.015, radius * .035, 6, 40]}/><Metal color="#d0dfed"/></mesh>}
        {b.id === 'central-mass' && <Halo radius={radius}/>}
        {cart && [-1, 1].flatMap(x => [-1, 1].map(z => <group key={x + ':' + z} position={[x * radius * .65, -.22, z * radius]} rotation={[Math.PI / 2, 0, 0]}><mesh><cylinderGeometry args={[.13, .13, .1, 16]}/><meshStandardMaterial color="#162033" roughness={.85}/></mesh><mesh position={[0, z * .055, 0]}><cylinderGeometry args={[.07, .07, .014, 12]}/><Metal color="#b9cce2"/></mesh></group>))}
        {cart && <Label position={[0, .65, 0]} color={color}>{index === 0 ? 'A' : 'B'} · {fmt(index === 0 ? (p.mass1 ?? 1) : (p.mass2 ?? 1))} kg</Label>}
        {b.id === 'central-mass' && <Label position={[0, -radius - .5, 0]} color={amber}>M = {fmt(p.centralMass ?? 1)} kg</Label>}
      </group>;
    })}
  </>;
}

export default function Scene({ modelId, family, parameters, state, trajectory, resetKey, shouldThrow }: SceneProps) {
  const [pixelRatio, setPixelRatio] = useState(() => initialPixelRatio(window.innerWidth, navigator.hardwareConcurrency || 4, window.devicePixelRatio || 1));
  if (shouldThrow) {
    throw new Error('Forced 3D Scene render failure for testing reduced visual mode');
  }
  const id: ModelId = modelId ?? family ?? 'motion';
  return <div className="scene-canvas" style={{ position: 'absolute', inset: 0 }} aria-label="Interactive three-dimensional physics model. Drag to orbit the camera; scroll to zoom.">
    <Canvas key={id + ':' + resetKey} frameloop="demand" dpr={pixelRatio} camera={{ position: [4, 4, 17], fov: 43, near: .1, far: 70 }} gl={{ antialias: true, alpha: false, powerPreference: 'default' }}>
      <RenderBudget onDowngrade={setPixelRatio}/>
      <Experiment modelId={id} family={family} parameters={parameters} state={state} trajectory={trajectory}/>
      <OrbitControls makeDefault target={[0, 0, 0]} enableDamping={false} minDistance={5} maxDistance={45} maxPolarAngle={Math.PI * .85}/>
      <CameraFraming/>
    </Canvas>
  </div>;
}
