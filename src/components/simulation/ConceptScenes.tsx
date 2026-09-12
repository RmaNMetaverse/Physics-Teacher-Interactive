import { useMemo } from 'react';
import { Line } from '@react-three/drei';
import type { ModelId, Parameters, SimulationState } from '../../types';
import { modelCatalog } from '../../physics';
import { Bars, Halo, Housing, Metal, palette, Rod, Surface, Tag } from './Studio';
import type { Point } from './Studio';

const format = (n: number) => n !== 0 && (Math.abs(n) < .01 || Math.abs(n) > 10000) ? n.toExponential(2) : Number(n.toPrecision(3)).toString();

function Orb({ position = [0, 0, 0], radius = .6, color = palette.mint, luminous = false }: { position?: Point; radius?: number; color?: string; luminous?: boolean }) {
  return <mesh position={position}><sphereGeometry args={[radius, 24, 16]}/><Surface color={color} luminous={luminous}/></mesh>;
}

function Dial({ position, fraction, title, value, color = palette.mint, clock = false }: { position: Point; fraction: number; title: string; value: string; color?: string; clock?: boolean }) {
  const angle = Math.max(0, Math.min(1, fraction)) * Math.PI * (clock ? 2 : 1.5);
  return <group position={position}>
    <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[1.22, 1.22, .18, 48]}/><Metal color="#334960"/></mesh>
    <mesh position={[0, 0, .11]}><circleGeometry args={[1.1, 48]}/><meshStandardMaterial color="#091723" roughness={.7}/></mesh>
    <mesh position={[0, 0, .13]} rotation={[0, 0, Math.PI / 2 - angle]}><torusGeometry args={[.94, .028, 6, 48, Math.max(.001, angle)]}/><meshBasicMaterial color={color}/></mesh>
    {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[Math.sin(i * Math.PI / 6) * 1.02, Math.cos(i * Math.PI / 6) * 1.02, .13]} rotation={[0, 0, -i * Math.PI / 6]}><boxGeometry args={[.025, .07, .01]}/><meshBasicMaterial color="#91a8c1"/></mesh>)}
    <Rod start={[0, 0, .15]} end={[.77 * Math.sin(angle), .77 * Math.cos(angle), .15]} color={color} radius={.028}/>
    <Orb position={[0, 0, .16]} radius={.07} color={color}/>
    <Tag position={[0, -1.5, .2]}>{title}</Tag><Tag position={[0, -.5, .2]} color={color}>{value}</Tag>
  </group>;
}

/** Every numerical mark comes from the SI model. Apparatus is a labeled schematic. */
export function ConceptScenes({ id, parameters: p, state }: { id: ModelId; parameters: Parameters; state: SimulationState }) {
  const value = (key: string) => state.observations.find(o => o.key === key)?.value ?? 0;
  const wave = useMemo<Point[]>(() => id === 'waves' ? Array.from({ length: 65 }, (_, i) => {
    const position = p.position + (i / 64 - .5) * p.wavelength * 2;
    const y = modelCatalog.waves.evaluate({ ...p, position }, state.time).observations.find(o => o.key === 'displacement')!.value;
    return [(i / 64 - .5) * 9, y / Math.max(p.amplitude, 1) * 1.7, 0];
  }) : [], [id, p, state.time]);
  const caption: Partial<Record<ModelId, string>> = {
    waves: 'Two wavelengths · normalized axes', thermal: 'Equilibrium chamber · decorative molecules',
    electromagnetism: 'Radial field direction · arrows not to scale', optics: 'Lens instrument · not a ray trace',
    relativity: 'Clocks: one turn = 60 s · normalized lengths', quantum: 'Position probability bins · ±6σ',
    atomic: 'Hydrogen energy level · not an electron orbit', nuclear: 'Expected population · not individual events',
    particle: 'Energy components / total energy', condensed: 'Single-state mean occupancy',
    astrophysics: 'Blackbody · illustrative texture and color', cosmology: 'Fixed-epoch distance · not evolving galaxies',
  };
  if (!caption[id]) return null;
  const peak = Math.max(...(state.probabilitySamples?.map(s => s.probability) ?? [1]));
  return <group>
    <Tag position={[0, 3.3, 0]} color={palette.blue}>{caption[id]}</Tag>
    {id === 'waves' && <>
      <Line points={wave} color={palette.mint} lineWidth={4}/>
      {wave.filter((_, i) => i % 4 === 0).map((point, i) => <group key={i}><Rod start={[point[0], -2, 0]} end={point} radius={.014} color="#38536a"/><Orb position={point} radius={i === 8 ? .14 : .065} color={i === 8 ? palette.gold : palette.mint}/></group>)}
      <Tag position={[0, -2.5, 0]}>λ = {format(p.wavelength)} m · f = {format(p.frequency)} Hz</Tag>
    </>}
    {id === 'thermal' && <>
      <mesh position={[-1.8, 0, 0]}><boxGeometry args={[3, 3, 2.4]}/><meshStandardMaterial color="#729cae" wireframe transparent opacity={.4}/></mesh>
      {p.amount > 0 && Array.from({ length: 24 }, (_, i) => <Orb key={i} position={[-3 + (i * .618 % 1) * 2.4, -1.2 + (i * .414 % 1) * 2.4, -.9 + (i * .732 % 1) * 1.8]} radius={.09} color={palette.gold}/>)}
      {[-1.6, 1.6].map(y => <group key={y} position={[-1.8, y, 0]}><Housing size={[3.3, .16, 2.7]} color="#53667d"/></group>)}
      <Dial position={[2.4, 0, 0]} fraction={p.temperature / 10000} title="Temperature / 10,000 K" value={format(p.temperature) + ' K'} color={palette.gold}/>
    </>}
    {id === 'electromagnetism' && <>
      <Orb radius={.65} color={p.charge < 0 ? palette.blue : palette.gold}/>
      <Tag position={[0, 0, .8]}>{p.charge > 0 ? '+' : p.charge < 0 ? '−' : '0'}</Tag>
      {p.charge !== 0 && Array.from({ length: 12 }, (_, i) => {
        const a = i * Math.PI / 6, outward = p.charge > 0;
        const start: Point = [Math.cos(a) * .95, Math.sin(a) * .95, 0];
        const end: Point = [Math.cos(a) * 2.6, Math.sin(a) * 2.6, 0];
        return <group key={i}><Rod start={start} end={end} color={palette.blue} radius={.018}/><mesh position={outward ? end : start} rotation={[0, 0, a + (outward ? -Math.PI / 2 : Math.PI / 2)]}><coneGeometry args={[.1, .25, 10]}/><meshBasicMaterial color={palette.blue}/></mesh></group>;
      })}
      <Tag position={[0, -3, 0]}>E = {format(value('electricField'))} N/C</Tag>
    </>}
    {id === 'optics' && <>
      <mesh rotation={[0, Math.PI / 2, 0]}><torusGeometry args={[1.65, .09, 8, 48]}/><Metal/></mesh>
      <mesh scale={[.18, 1.6, 1.6]}><sphereGeometry args={[1, 24, 16]}/><meshStandardMaterial color="#8cddff" metalness={.2} roughness={.15} transparent opacity={.28} depthWrite={false}/></mesh>
      <Rod start={[0, -1.65, 0]} end={[0, -2.7, 0]} radius={.07}/>
      <Rod start={[-4.5, -2.7, 0]} end={[4.5, -2.7, 0]} radius={.09}/>
      <Tag position={[-2.7, .5, 0]}>Object: {format(p.objectDistance)} m</Tag>
      <Tag position={[2.8, .5, 0]}>{value('imageAtInfinity') ? 'Image at infinity' : (value('imageDistance') < 0 ? 'Virtual: ' : 'Real: ') + format(value('imageDistance')) + ' m'}</Tag>
      <Tag position={[0, 2.2, 0]}>f = {format(p.focalLength)} m</Tag>
    </>}
    {id === 'relativity' && <>
      <Dial clock position={[-2, .3, 0]} fraction={(state.time % 60) / 60} title="Coordinate time" value={format(state.time) + ' s'}/>
      <Dial clock position={[2, .3, 0]} fraction={(value('properTime') % 60) / 60} title="Proper time" value={format(value('properTime')) + ' s'} color={palette.gold}/>
      <group position={[-2, -2.3, 0]}><Housing size={[3, .16, .3]} color={palette.mint}/></group>
      <mesh position={[2, -2.3, 0]} scale={[3 * value('lengthRatio'), .16, .3]}><boxGeometry/><Metal color={palette.gold}/></mesh>
    </>}
    {id === 'quantum' && <>
      <Bars items={state.probabilitySamples?.map(sample => {
        const height = sample.probability / peak * 3;
        return { position: [(sample.position - p.center) / p.sigma * .72, height / 2 - 1.5, 0] as Point, scale: [.06, Math.max(.003, height), .45] as Point };
      }) ?? []}/>
      <Tag position={[0, -2.3, 0]}>σ = {format(p.sigma)} m · T ≈ {format(value('transmission'))}</Tag>
    </>}
    {id === 'atomic' && <>
      <Rod start={[-3.5, -2, 0]} end={[-3.5, 2, 0]}/>
      <Line points={[[-3.5, 2, 0], [3.5, 2, 0]]} color="#768699" dashed dashSize={.12} gapSize={.1}/>
      <group position={[0, 2 + value('energyEv') / 13.6 * 4, 0]}><Housing size={[6, .08, .5]} color={palette.gold}/><Tag position={[0, -.5, .2]}>n = {p.n} · {format(value('energyEv'))} eV</Tag></group>
      <Tag position={[0, 2.5, 0]}>Ionization limit · 0 eV</Tag>
    </>}
    {id === 'nuclear' && <Dial position={[0, 0, 0]} fraction={p.initial === 0 ? 0 : value('remaining') / p.initial} title="Expected fraction remaining" value={format(value('remaining')) + ' / ' + format(p.initial)} color={palette.gold}/>}
    {id === 'particle' && <>
      {['energy', 'restEnergy', 'pc', 'kinetic'].map((key, i) => <group key={key} position={[-3.6 + i * 2.4, -1.5, 0]}>
        <mesh position={[0, value(key) / (value('energy') || 1) * 1.5, 0]} scale={[.55, Math.max(.003, value(key) / (value('energy') || 1) * 3), .55]}><boxGeometry/><Metal color={i % 2 ? palette.blue : palette.mint}/></mesh>
        <Tag position={[0, -.5, 0]}>{key === 'pc' ? 'pc' : key}</Tag>
      </group>)}
    </>}
    {id === 'condensed' && <Dial position={[0, 0, 0]} fraction={value('occupancy')} title="Mean occupancy · 0 to 1" value={format(value('occupancy'))}/>}
    {id === 'astrophysics' && <>
      <Orb radius={1.7} color="#ff913a" luminous/><Halo radius={1.7} warm/>
      <mesh rotation={[.3, .3, 0]}><torusGeometry args={[2.1, .012, 6, 64]}/><meshBasicMaterial color="#bc8558"/></mesh>
      <Tag position={[0, -2.6, 0]}>R = {format(p.radius)} m · L = {format(value('luminosity'))} W</Tag>
    </>}
    {id === 'cosmology' && <>
      <Orb position={[-3.5, 0, 0]} color={palette.blue}/><Orb position={[3.5, 0, 0]} color={palette.gold}/>
      <Line points={[[-2.8, 0, 0], [2.8, 0, 0]]} color={palette.mint} dashed dashSize={.15} gapSize={.12}/>
      <Tag position={[0, .7, 0]}>d = {format(p.distance)} m</Tag>
      <Tag position={[0, -1, 0]}>v = {format(value('recessionSpeed'))} m/s</Tag>
    </>}
  </group>;
}
