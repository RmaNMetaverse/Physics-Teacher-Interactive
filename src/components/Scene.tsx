import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Html, Line, OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import type { Family, Parameters, SimulationState } from '../types';
import type { Trajectory } from '../physics/scene';
import { sanitizeParameters } from '../physics';

type Point = [number, number, number];
interface SceneProps {
  family: Family;
  parameters: Parameters;
  state: SimulationState;
  trajectory: Trajectory;
  resetKey: number;
  onParameterChange?: (key: string, value: number) => void;
}
const teal = '#5eead4', amber = '#ffae54', blue = '#7da7ff';
const fmt = (value: number) => Math.abs(value) >= 1e5 ? value.toExponential(2) : Number(value.toFixed(2)).toString();

function Label({ position, children, color = '#c9d6e8' }: { position: Point; children: React.ReactNode; color?: string }) {
  return <Html center position={position} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}><span className="scene-tag" style={{ color, fontSize: 10, letterSpacing: '.04em', background: 'rgba(7,17,32,.8)', padding: '4px 7px', borderRadius: 4 }}>{children}</span></Html>;
}
function Arrow({ start, end, color }: { start: Point; end: Point; color: string }) {
  const direction = new Vector3(...end).sub(new Vector3(...start));
  const length = direction.length();
  if (length < 1e-7) return null;
  return <arrowHelper args={[direction.normalize(), new Vector3(...start), length, color, Math.min(.3, length * .2), Math.min(.16, length * .1)]}/>;
}

function Experiment({ family, parameters, state, trajectory }: Omit<SceneProps, 'resetKey' | 'onParameterChange'>) {
  const p = useMemo(() => sanitizeParameters(family, parameters), [family, parameters]);
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
  const primary = state.bodies.find(b => b.id !== 'origin' && b.id !== 'central-mass')!;
  const primaryPoint = point(primary.position);
  const mainColor = family === 'motion' ? amber : teal;
  const moving = !['measurement', 'vectors'].includes(family);
  const visibleTrail = Math.max(2, Math.min(path.length, Math.floor(state.time / Math.max(trajectory.duration, 1e-9) * (path.length - 1)) + 1));
  const spring = family === 'oscillations' && p.mode === 0;
  const pendulum = family === 'oscillations' && p.mode === 1;
  const springAnchor: Point = [point(trajectory.bounds.min)[0] - .2, primaryPoint[1], 0];
  const springPoints: Point[] = spring ? Array.from({ length: 81 }, (_, i) => {
    const fraction = i / 80, envelope = i === 0 || i === 80 ? 0 : .14;
    return [springAnchor[0] + (primaryPoint[0] - springAnchor[0]) * fraction, primaryPoint[1] + envelope * Math.sin(fraction * Math.PI * 20), envelope * Math.cos(fraction * Math.PI * 20)];
  }) : [];
  const slope = family === 'forces' || family === 'energy';
  const slopeStart = family === 'energy' ? point([0, p.height, 0]) : origin;
  const slopeDistance = family === 'energy' ? Math.min(p.height / Math.sin(angle) * scale, 11) : Math.max(4, Math.hypot(primaryPoint[0] - origin[0], primaryPoint[1] - origin[1]) + .8);
  const slopeEnd: Point = [slopeStart[0] + Math.cos(angle) * slopeDistance, slopeStart[1] - Math.sin(angle) * slopeDistance, 0];
  const xLabel: Point = [5.2, origin[1], origin[2]];
  return <>
    <color attach="background" args={['#0b1526']}/>
    <fog attach="fog" args={['#0b1526', 19, 38]}/>
    <ambientLight intensity={.6}/>
    <directionalLight position={[4, 9, 7]} intensity={2.1} castShadow shadow-mapSize={[1024, 1024]}/>
    <pointLight position={[-5, 3, 3]} intensity={25} color="#4c83ad"/>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floor - .015, 0]} receiveShadow><planeGeometry args={[28, 24]}/><meshStandardMaterial color="#101d30" roughness={.9}/></mesh>
    <gridHelper args={[24, 48, '#29415c', '#1b2e45']} position={[0, floor, 0]}/>
    <Line points={[[-5.5, origin[1], origin[2]], [5.5, origin[1], origin[2]]]} color="#38536b" lineWidth={1}/>
    <Line points={[[origin[0], floor, origin[2]], [origin[0], 5.5, origin[2]]]} color="#38536b" lineWidth={1}/>
    <Label position={xLabel} color="#698398">x</Label>
    <Label position={[origin[0], Math.min(5.3, origin[1] + 2), origin[2]]} color="#698398">y</Label>
    {moving && path.length > 1 && <Line points={path} color={family === 'gravity' ? '#356b80' : '#546478'} lineWidth={1.5} dashed dashSize={.12} gapSize={.12}/>}
    {moving && state.time > 0 && path.length > 1 && <Line points={path.slice(0, visibleTrail)} color={mainColor} lineWidth={2}/>}
    {family === 'motion' && <>
      <Line points={[[primaryPoint[0], origin[1], 0], primaryPoint]} color="#657282" lineWidth={1} dashed dashSize={.08} gapSize={.09}/>
      <mesh position={[primaryPoint[0], origin[1] + .006, 0]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[.1, .15, 32]}/><meshBasicMaterial color={amber} transparent opacity={.6}/></mesh>
      <Label position={[primaryPoint[0] + .25, primaryPoint[1] + .55, 0]} color={amber}>{fmt(state.observations.find(o => o.key === 'speed')!.value)} m/s</Label>
    </>}
    {family === 'measurement' && <>
      <Line points={[origin, point([p.length, 0, 0])]} color={teal} lineWidth={5}/>
      {Array.from({ length: 21 }, (_, i) => {
        const x = p.length * i / 20;
        return <Line key={i} points={[point([x, -.04 * p.length, 0]), point([x, (i % 5 === 0 ? .06 : .03) * p.length, 0])]} color="#8eafc2" lineWidth={1}/>;
      })}
      <Line points={[point([p.length - p.uncertainty, .13 * p.length, 0]), point([p.length + p.uncertainty, .13 * p.length, 0])]} color={amber} lineWidth={7}/>
      <Label position={[primaryPoint[0], primaryPoint[1] + .95, 0]} color={amber}>{fmt(p.length)} ± {fmt(p.uncertainty)} m</Label>
      <Label position={[origin[0], origin[1] - .65, 0]}>0 m</Label>
    </>}
    {family === 'vectors' && <>
      <Arrow start={origin} end={point(state.bodies[1].position)} color={teal}/>
      <Arrow start={point(state.bodies[1].position)} end={point(state.bodies[2].position)} color={blue}/>
      <Arrow start={origin} end={point(state.bodies[2].position)} color={amber}/>
      <Line points={[origin, point([state.bodies[1].position[0], 0, 0]), point(state.bodies[1].position)]} color="#44686c" dashed dashSize={.09} gapSize={.09}/>
      <Label position={[point(state.bodies[1].position)[0], point(state.bodies[1].position)[1] + .45, 0]} color={teal}>A</Label>
      <Label position={[point(state.bodies[2].position)[0], point(state.bodies[2].position)[1] + .45, 0]} color={amber}>A + B</Label>
    </>}
    {slope && <>
      <Line points={[slopeStart, slopeEnd]} color="#70859d" lineWidth={6}/>
      <Line points={[slopeStart, [slopeStart[0], slopeEnd[1], 0], slopeEnd]} color="#33465e" lineWidth={1}/>
      <Label position={[slopeStart[0] + .5, slopeStart[1] - .65, 0]}>{fmt(p.angle)}° slope</Label>
    </>}
    {family === 'collisions' && <>
      <Line points={[[-5.5, origin[1] - .28, -.45], [5.5, origin[1] - .28, -.45]]} color="#54687e" lineWidth={3}/>
      <Line points={[[-5.5, origin[1] - .28, .45], [5.5, origin[1] - .28, .45]]} color="#54687e" lineWidth={3}/>
    </>}
    {spring && <>
      <mesh position={springAnchor}><boxGeometry args={[.12, 1.3, .8]}/><meshStandardMaterial color="#536981" metalness={.6} roughness={.35}/></mesh>
      <Line points={springPoints} color="#a0bdd0" lineWidth={2.5}/>
      <Label position={[springAnchor[0] + 1, springAnchor[1] + 1, 0]}>k = {fmt(p.stiffness)} N/m</Label>
    </>}
    {pendulum && <>
      <mesh position={origin}><sphereGeometry args={[.09, 16, 16]}/><meshStandardMaterial color="#c6d5e1"/></mesh>
      <Line points={[origin, primaryPoint]} color="#aec4d7" lineWidth={2}/>
      <Line points={[origin, point([0, -p.length, 0])]} color="#344e66" dashed dashSize={.08} gapSize={.08}/>
      <Label position={[origin[0] + .6, origin[1] - p.length * scale / 2, 0]}>L = {fmt(p.length)} m</Label>
    </>}
    {state.bodies.map((b, index) => {
      if (b.id === 'origin') return null;
      const position = point(b.position), radius = Math.min(.65, Math.max(.13, b.radius * scale));
      const color = family === 'motion' ? amber : b.color;
      const cart = family === 'collisions', block = slope || spring;
      return <group key={b.id} position={position} rotation={slope ? [0, 0, -angle] : [0, 0, 0]}>
        <mesh castShadow>
          {cart || block ? <boxGeometry args={[Math.max(.4, radius * 2), Math.max(.32, radius * 1.6), Math.max(.4, radius * 1.7)]}/> : <sphereGeometry args={[radius, 32, 24]}/>}
          <meshStandardMaterial color={color} roughness={.28} metalness={.28} emissive={color} emissiveIntensity={b.id === 'central-mass' ? .18 : .05}/>
        </mesh>
        {cart && [-1, 1].flatMap(x => [-1, 1].map(z => <mesh key={x + ':' + z} position={[x * .18, -.22, z * .24]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[.1, .1, .08, 16]}/><meshStandardMaterial color="#71849a" metalness={.7} roughness={.3}/></mesh>))}
        {cart && <Label position={[0, .65, 0]} color={color}>{index === 0 ? 'A' : 'B'} · {fmt(index === 0 ? p.mass1 : p.mass2)} kg</Label>}
        {b.id === 'central-mass' && <Label position={[0, -radius - .5, 0]} color={amber}>M = {fmt(p.centralMass)} kg</Label>}
      </group>;
    })}
  </>;
}

export default function Scene({ family, parameters, state, trajectory, resetKey }: SceneProps) {
  return <div className="scene-canvas" style={{ position: 'absolute', inset: 0 }} aria-label="Interactive three-dimensional physics model. Drag to orbit the camera; scroll to zoom.">
    <Canvas key={family + ':' + resetKey} frameloop="demand" shadows dpr={[1, 1.5]} camera={{ position: [7, 5.5, 13], fov: 43, near: .1, far: 70 }} gl={{ antialias: true, alpha: false }}>
      <Experiment family={family} parameters={parameters} state={state} trajectory={trajectory}/>
      <OrbitControls makeDefault target={[0, 0, 0]} enableDamping={false} minDistance={5} maxDistance={25} maxPolarAngle={Math.PI * .85}/>
    </Canvas>
    <div style={{ position: 'absolute', left: 16, bottom: 12, color: '#7f96ae', fontSize: 10, pointerEvents: 'none', letterSpacing: '.04em' }}>DRAG TO ORBIT · SCROLL TO ZOOM · MARKER SIZES SCHEMATIC</div>
  </div>;
}
