import { memo, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Environment, Html, Lightformer, RoundedBox } from '@react-three/drei';
import { CanvasTexture, RepeatWrapping, Vector3, Quaternion, Object3D } from 'three';
import type { InstancedMesh } from 'three';
import type { MeshStandardMaterial } from 'three';
import { nextPixelRatio } from './render-policy';
import type { ModelId } from '../../types';

export type Point = [number, number, number];
export const palette = { mint: '#5eead4', gold: '#ffbd69', blue: '#83aaff', steel: '#647991' };

export function Tag({ position, children, color = '#c9d6e8' }: { position: Point; children: React.ReactNode; color?: string }) {
  return <Html center position={position} style={{ pointerEvents: 'none', width: 'max-content', maxWidth: 'min(260px, 70vw)', textAlign: 'center' }}><span className="scene-tag" style={{ display: 'block', color, fontSize: 10, background: 'rgba(7,17,32,.88)', padding: '4px 7px', border: '1px solid #3a506466', borderRadius: 5 }}>{children}</span></Html>;
}

/** One tiny, repeatable brushed-metal texture per scene. No asset downloads. */
export function useBrushedTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    for (let y = 0; y < 128; y++) {
      const value = 130 + Math.round(24 * Math.sin(y * 17.13) + 12 * Math.sin(y * 3.71));
      ctx.fillStyle = `rgb(${value},${value},${value})`;
      ctx.fillRect(0, y, 128, 1);
    }
    const result = new CanvasTexture(canvas);
    result.wrapS = result.wrapT = RepeatWrapping;
    result.repeat.set(3, 3);
    return result;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

export function Metal({ color = palette.steel, texture }: { color?: string; texture?: CanvasTexture }) {
  return <meshStandardMaterial color={color} metalness={.86} roughness={.24} bumpMap={texture} bumpScale={.009} roughnessMap={texture} envMapIntensity={1.35}/>;
}

/** Analytic surface pattern runs in the existing PBR pass, without texture fetches. */
const surfaceShader: MeshStandardMaterial['onBeforeCompile'] = shader => {
  shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 surfacePosition;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nsurfacePosition = position;');
  shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>
    varying vec3 surfacePosition;
    float grain(vec3 p) { return sin(p.x * 9.0 + sin(p.z * 7.0) * 2.0) * sin(p.y * 11.0 + sin(p.x * 5.0) * 2.0); }
  `).replace('#include <color_fragment>', `#include <color_fragment>
    float pattern = grain(surfacePosition * 1.5);
    diffuseColor.rgb *= 0.7 + 0.3 * pattern;
  `);
};

export function Halo({ radius, warm = false }: { radius: number; warm?: boolean }) {
  const uniforms = useMemo(() => ({ tint: { value: new Vector3(...(warm ? [1, .35, .08] : [.15, .6, 1])) } }), [warm]);
  return <mesh scale={1.08}><sphereGeometry args={[radius, 32, 20]}/><shaderMaterial transparent depthWrite={false} uniforms={uniforms}
    vertexShader="varying vec3 n; varying vec3 v; void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); n=normalize(normalMatrix*normal); v=normalize(-p.xyz); gl_Position=projectionMatrix*p; }"
    fragmentShader="uniform vec3 tint; varying vec3 n; varying vec3 v; void main(){ float rim=pow(1.0-max(dot(normalize(n),normalize(v)),0.0),3.0); gl_FragColor=vec4(tint,rim*0.38); }"/></mesh>;
}

export function Surface({ color, luminous = false }: { color: string; luminous?: boolean }) {
  return <meshStandardMaterial color={color} roughness={luminous ? .85 : .38} metalness={luminous ? .05 : .32} emissive={color} emissiveIntensity={luminous ? .8 : .06} onBeforeCompile={surfaceShader}/>;
}

export function Rod({ start, end, radius = .035, color = palette.steel }: { start: Point; end: Point; radius?: number; color?: string }) {
  const { midpoint, quaternion, length } = useMemo(() => {
    const a = new Vector3(...start), b = new Vector3(...end), delta = b.clone().sub(a);
    return { midpoint: a.add(b).multiplyScalar(.5), length: delta.length(), quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), delta.normalize()) };
  }, [start, end]);
  if (length < 1e-7) return null;
  return <mesh position={midpoint} quaternion={quaternion} scale={[radius, length, radius]}><cylinderGeometry args={[1, 1, 1, 8]}/><Metal color={color}/></mesh>;
}

export function Housing({ size, color, texture }: { size: Point; color: string; texture?: CanvasTexture }) {
  return <RoundedBox args={size} radius={Math.min(.06, ...size.map(v => v / 3))} smoothness={2} bevelSegments={2}><Metal color={color} texture={texture}/></RoundedBox>;
}

/** Probability bins share a geometry and material: one draw call for the whole distribution. */
export function Bars({ items }: { items: { position: Point; scale: Point }[] }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current!;
    const transform = new Object3D();
    items.forEach((item, i) => {
      transform.position.set(...item.position);
      transform.scale.set(...item.scale);
      transform.updateMatrix();
      mesh.setMatrixAt(i, transform.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items]);
  return <instancedMesh ref={ref} args={[undefined, undefined, items.length]}><boxGeometry/><meshStandardMaterial color={palette.blue} emissive={palette.blue} emissiveIntensity={.2} metalness={.25} roughness={.4}/></instancedMesh>;
}

export function CameraFraming() {
  const { camera, size, invalidate } = useThree();
  useLayoutEffect(() => {
    const factor = Math.max(1, size.height / Math.max(size.width, 1) * 1.1);
    camera.position.set(3 * factor, 5.5 * factor, 15.2 * factor);
    camera.lookAt(0, 0, 0);
    invalidate();
  }, [camera, size.width, size.height, invalidate]);
  return null;
}

function Starfield() {
  const positions = useMemo(() => new Float32Array(Array.from({ length: 180 }, (_, i) => {
    const a = i * 2.39996, y = (i / 180 - .5) * 36;
    return [Math.cos(a) * 22, y + 8, -12 - (i % 7)];
  }).flat()), []);
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]}/></bufferGeometry><pointsMaterial color="#acc9ed" size={.065} sizeAttenuation transparent opacity={.65}/></points>;
}

export const Studio = memo(function Studio({ floor, space = false, modelId }: { floor: number; space?: boolean; modelId?: ModelId }) {
  const texture = useBrushedTexture();
  const warm = modelId === 'thermal' || modelId === 'energy' || modelId === 'nuclear';
  return <>
    <color attach="background" args={['#080f1e']}/>
    <Environment resolution={128} frames={1}>
      <Lightformer form="rect" intensity={5} color="#e5f2ff" position={[0, 7, 2]} rotation={[Math.PI / 2, 0, 0]} scale={[12, 5, 1]}/>
      <Lightformer form="rect" intensity={3} color="#6cbaff" position={[-7, 2, 1]} rotation={[0, Math.PI / 2, 0]} scale={[4, 8, 1]}/>
      <Lightformer form="rect" intensity={4} color="#ffe4ba" position={[6, 3, -4]} rotation={[0, -Math.PI / 3, 0]} scale={[2, 9, 1]}/>
    </Environment>
    <fog attach="fog" args={['#080f1e', 24, 48]}/>
    <hemisphereLight args={['#b9d8ff', '#1b2436', .75]}/>
    <directionalLight position={[3, 8, 6]} color="#fff0d8" intensity={3.2}/>
    <directionalLight position={[-6, 3, -4]} color="#64bbff" intensity={2.5}/>
    <directionalLight position={[4, 1, -7]} color="#71f3cf" intensity={1.4}/>
    {space && <Starfield/>}
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, floor - .08, 0]}><planeGeometry args={[60, 60]}/><meshStandardMaterial color="#0d1929" roughness={.85}/></mesh>
    <group position={[0, floor - .23, 0]}>
      <Housing size={[12.5, .3, 5.8]} color="#233348" texture={texture}/>
      <mesh position={[0, .16, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[12.1, 5.4]}/><meshStandardMaterial color={space ? '#0a162b' : '#162c40'} roughness={.7}/></mesh>
      {[-1, 1].map(z => <mesh key={z} position={[0, .07, z * 2.91]}><boxGeometry args={[11.8, .025, .02]}/><meshBasicMaterial color={space ? palette.blue : warm ? palette.gold : palette.mint}/></mesh>)}
      {[-1, 1].flatMap(x => [-1, 1].map(z => <mesh key={`${x}:${z}`} position={[x * 5.9, .17, z * 2.55]}><cylinderGeometry args={[.07, .07, .035, 12]}/><Metal color="#a3b4ca"/></mesh>))}
    </group>
    {!space && <gridHelper args={[12, 12, '#294357', '#172b3e']} position={[0, floor -.055, 0]} scale={[1, 1, .44]}/>}
  </>;
});

/** Measures only consecutive active frames. Idle demand-render gaps never count as slow frames. */
export function RenderBudget({ onDowngrade }: { onDowngrade: (dpr: number) => void }) {
  const { gl, viewport } = useThree();
  const sample = useRef({ previous: 0, total: 0, count: 0 });
  useFrame(() => {
    gl.domElement.dataset.drawCalls = String(gl.info.render.calls);
    gl.domElement.dataset.triangles = String(gl.info.render.triangles);
    gl.domElement.dataset.pixelRatio = String(viewport.dpr);
    const now = performance.now(), elapsed = now - sample.current.previous;
    sample.current.previous = now;
    if (elapsed > 150 || elapsed < 4) { sample.current.total = 0; sample.current.count = 0; return; }
    sample.current.total += elapsed;
    if (++sample.current.count >= 90) {
      const next = nextPixelRatio(viewport.dpr, sample.current.total / sample.current.count);
      if (next !== viewport.dpr) onDowngrade(next);
      sample.current.total = sample.current.count = 0;
    }
  });
  return null;
}
