import { useLayoutEffect, useMemo, useRef } from 'react';
import { Object3D, Color } from 'three';
import type { InstancedMesh } from 'three';
import { Metal, palette } from './Studio';
import type { Point } from './Studio';

type ProbabilitySample = { position: number; probability: number };

/** Extrudes the exact 1D model profile; width is presentation, not a second wave. */
export function WaveRibbon({ profile }: { profile: Point[] }) {
  const positions = useMemo(() => new Float32Array(profile.flatMap(([x,y]) => [x,y,-.5,x,y,.5])), [profile]);
  const normals = useMemo(() => new Float32Array(profile.flatMap((_,i) => {
    const left = profile[Math.max(0,i-1)], right = profile[Math.min(profile.length-1,i+1)];
    const slope = (right[1]-left[1]) / Math.max(.0001,right[0]-left[0]);
    const length = Math.sqrt(slope*slope+1);
    return [-slope/length,1/length,0,-slope/length,1/length,0];
  })), [profile]);
  const indices = useMemo(() => new Uint16Array(Array.from({length: Math.max(0,profile.length-1)}, (_,i) => [i*2,i*2+1,i*2+2,i*2+1,i*2+3,i*2+2]).flat()), [profile.length]);
  return <mesh><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions,3]}/><bufferAttribute attach="attributes-normal" args={[normals,3]}/><bufferAttribute attach="index" args={[indices,1]}/></bufferGeometry><meshPhysicalMaterial color="#69bad4" metalness={.72} roughness={.22} clearcoat={1} side={2}/></mesh>;
}

/** Decorative particles: fixed seeds, one draw call, and the simulation clock only. */
export function ParticleSculpture({ time, mode, color = palette.blue, count = 360 }: {
  time: number; mode: 'gas' | 'shell' | 'galaxy' | 'lattice' | 'corona'; color?: string; count?: number;
}) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const tint = new Color(color), white = new Color('#ffffff'), mixed = new Color();
    for (let i = 0; i < count; i++) mesh.setColorAt(i, mixed.copy(tint).lerp(white, (i % 9) / 13));
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [color, count]);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    for (let i = 0; i < count; i++) {
      const a = i * 2.399963, f = (i + .5) / count;
      let x = 0, y = 0, z = 0;
      if (mode === 'gas') {
        x = Math.sin(a * 3 + time * .7) * 1.28;
        y = Math.sin(a * 5 + time * .93) * 1.28;
        z = Math.cos(a * 7 + time * .61) * .98;
      } else if (mode === 'lattice') {
        x = (i % 7 - 3) * .48;
        z = (Math.floor(i / 49) - 3) * .48;
        y = (Math.floor(i / 7) % 7 - 3) * .48 + Math.sin(time * 1.4 + x * 2.2 + z * 1.7) * .055;
      } else if (mode === 'galaxy') {
        const r = Math.sqrt(f) * 2.4, angle = a + r * 1.7 + time * .06;
        x = Math.cos(angle) * r; z = Math.sin(angle) * r; y = Math.sin(a * 7) * .12 * (1 - f);
      } else {
        const yy = 1 - 2 * f, r = mode === 'corona' ? 1.85 + .23 * Math.sin(a * 3 + time * .4) : 1.7;
        const ring = Math.sqrt(1 - yy * yy);
        const phase = a + (mode === 'shell' ? time * .16 : 0);
        x = Math.cos(phase) * ring * r; y = yy * r; z = Math.sin(phase) * ring * r;
      }
      dummy.position.set(x, y, z);
      dummy.scale.setScalar(mode === 'gas' ? .055 : mode === 'lattice' ? .072 : .018 + .025 * (i % 5) / 4);
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [time, mode, count, dummy]);
  return <instancedMesh ref={ref} args={[undefined, undefined, count]}><icosahedronGeometry args={[1, 1]}/><meshStandardMaterial metalness={.82} roughness={.2} emissive={color} emissiveIntensity={.12}/></instancedMesh>;
}

/**
 * A deterministic bead volume sampled from the model's one-dimensional probability bins.
 * Bead count along x follows |ψ|²; radial spread adds presentation depth only.
 */
export function ProbabilityCloud({ samples, center, sigma, time, count = 420 }: {
  samples: ProbabilitySample[]; center: number; sigma: number; time: number; count?: number;
}) {
  const ref = useRef<InstancedMesh>(null);
  const dummy = useMemo(() => new Object3D(), []);
  const beads = useMemo(() => {
    const safeSigma = Math.max(Math.abs(sigma), 1e-9);
    const total = samples.reduce((sum, sample) => sum + Math.max(0, sample.probability), 0);
    const peak = Math.max(...samples.map(sample => sample.probability), 1e-12);
    if (!samples.length || total <= 0) return [];
    let sampleIndex = 0;
    let cumulative = Math.max(0, samples[0].probability);
    return Array.from({ length: count }, (_, i) => {
      const target = (i + .5) / count * total;
      while (sampleIndex < samples.length - 1 && cumulative < target) {
        sampleIndex++;
        cumulative += Math.max(0, samples[sampleIndex].probability);
      }
      const sample = samples[sampleIndex];
      return {
        x: (sample.position - center) / safeSigma * .72,
        envelope: Math.sqrt(Math.max(0, sample.probability) / peak),
        seed: i * 2.399963,
        layer: ((i * 37) % 101) / 100,
      };
    });
  }, [samples, center, sigma, count]);

  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const blue = new Color('#83aaff'), violet = new Color('#b79cff'), white = new Color('#ffffff'), tint = new Color();
    beads.forEach((bead, i) => {
      const angle = bead.seed + time * .12;
      const radius = (.12 + .92 * Math.sqrt(bead.layer)) * bead.envelope;
      dummy.position.set(bead.x, Math.cos(angle) * radius, Math.sin(angle) * radius * .9);
      dummy.scale.setScalar(.035 + .035 * bead.envelope * (0.35 + bead.layer * .65));
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      tint.copy(blue).lerp(violet, bead.layer).lerp(white, bead.envelope * .18);
      mesh.setColorAt(i, tint);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [beads, time, dummy]);

  return <instancedMesh ref={ref} args={[undefined, undefined, beads.length]}>
    <icosahedronGeometry args={[1, 0]}/>
    <meshPhysicalMaterial vertexColors metalness={.52} roughness={.16} clearcoat={1} emissive="#6d7dff" emissiveIntensity={.38}/>
  </instancedMesh>;
}

/** Instrument mounting hardware stays visually separate from measured quantities. */
export function InstrumentRing({ radius = 2, color = palette.gold }: { radius?: number; color?: string }) {
  return <group rotation={[Math.PI / 2, 0, 0]}>
    <mesh><torusGeometry args={[radius, .055, 8, 64]}/><Metal color={color}/></mesh>
    <mesh position={[0, 0, .1]}><torusGeometry args={[radius + .12, .025, 6, 64]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={.7}/></mesh>
  </group>;
}

export function Pedestal({ radius = 1.8 }: { radius?: number }) {
  return <group>
    <mesh><cylinderGeometry args={[radius, radius + .08, .16, 48]}/><meshStandardMaterial color="#d2dce3" roughness={.26} metalness={.2}/></mesh>
    <mesh position={[0, -.12, 0]}><cylinderGeometry args={[radius + .08, radius + .08, .08, 48]}/><Metal color={palette.gold}/></mesh>
    <mesh position={[0, -.22, 0]}><cylinderGeometry args={[radius, radius, .16, 48]}/><Metal color="#233449"/></mesh>
  </group>;
}
