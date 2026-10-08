import { useId } from 'react';
import type { ModelId, Parameters, SimulationState } from '../../types';
import type { Trajectory } from '../../physics/scene';
import { supportsTeaching2D } from './render-policy';

interface Props { modelId: ModelId; parameters: Parameters; state: SimulationState; trajectory: Trajectory }
const cyan = '#64e8d0', orange = '#ffb878', blue = '#83a8ff';
const guidance: Partial<Record<ModelId, string>> = {
  vectors: 'Compare A, B and their sum. Change either component to see the resultant move.',
  motion: 'Compare the path and velocity direction. Change speed, angle or acceleration and rerun.',
  forces: 'Increase the applied force until friction can no longer hold the block at rest.',
  energy: 'Follow the height loss; compare kinetic, potential and thermal energy in Graph & data.',
  collisions: 'Compare velocity directions before and after impact. Change mass or restitution.',
  gravity: 'Change the initial speed to compare circular and elliptical orbits.',
  oscillations: 'Compare displacement and velocity at the turning points and equilibrium.',
};

/** Positions come exclusively from the SI model; no decorative particle animation. */
export function Physics2D({ modelId, parameters, state, trajectory }: Props) {
  const marker = useId().replace(/:/g, '');
  if (!supportsTeaching2D(modelId) || modelId === 'circuits' || modelId === 'microcontroller') return null;
  const { min, max } = trajectory.bounds;
  // One fixed, equal scale for both axes throughout the complete trial.
  const scale = Math.min(570 / (max[0] - min[0]), 270 / (max[1] - min[1]));
  const sx = (x: number) => 360 + (x - (min[0] + max[0]) / 2) * scale;
  const sy = (y: number) => 220 - (y - (min[1] + max[1]) / 2) * scale;
  const vectorA = state.bodies.find(body => body.id === 'vector-a');
  const resultant = state.bodies.find(body => body.id === 'resultant');
  const pendulum = modelId === 'oscillations' && parameters.mode === 1;
  const spring = modelId === 'oscillations' && !pendulum;
  return <div className="physics-2d" data-testid="physics-2d" data-model={modelId} data-dynamic>
    <svg viewBox="0 0 720 420" role="img" aria-label={`Live interactive ${modelId} simulation`}>
      <defs><marker id={marker} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="context-stroke" /></marker></defs>
      <rect width="720" height="420" rx="24" fill="#07101d" />
      <text x="24" y="35" fill="#91a7c3" fontSize="14">{modelId === 'vectors' ? 'Vector addition: A + B = resultant' : 'Model positions · fixed scale within each trial'}</text>
      <line x1="50" y1={sy(0)} x2="670" y2={sy(0)} stroke="#9bb0ca" strokeOpacity=".35" />
      <line x1={sx(0)} y1="65" x2={sx(0)} y2="380" stroke="#9bb0ca" strokeOpacity=".25" strokeDasharray="5 7" />
      {modelId !== 'vectors' && <polyline points={trajectory.points.map(p => `${sx(p[0])},${sy(p[1])}`).join(' ')} fill="none" stroke={cyan} strokeOpacity=".4" strokeWidth="2" />}
      {pendulum && state.bodies[0] && <line data-pendulum-string x1={sx(0)} y1={sy(0)} x2={sx(state.bodies[0].position[0])} y2={sy(state.bodies[0].position[1])} stroke={blue} strokeWidth="3" />}
      {spring && state.bodies[0] && <polyline points={Array.from({ length: 17 }, (_, i) => `${55 + (sx(state.bodies[0].position[0]) - 55) * i / 16},${sy(0) + (i === 0 || i === 16 ? 0 : i % 2 ? 9 : -9)}`).join(' ')} fill="none" stroke={blue} strokeWidth="2" />}
      {modelId === 'vectors' && vectorA && resultant && <>
        <line x1={sx(0)} y1={sy(0)} x2={sx(vectorA.position[0])} y2={sy(vectorA.position[1])} stroke={cyan} strokeWidth="4" markerEnd={`url(#${marker})`} />
        <line x1={sx(vectorA.position[0])} y1={sy(vectorA.position[1])} x2={sx(resultant.position[0])} y2={sy(resultant.position[1])} stroke={blue} strokeWidth="4" markerEnd={`url(#${marker})`} />
        <line x1={sx(0)} y1={sy(0)} x2={sx(resultant.position[0])} y2={sy(resultant.position[1])} stroke={orange} strokeWidth="3" markerEnd={`url(#${marker})`} />
        <text x={sx(vectorA.position[0]) + 12} y={sy(vectorA.position[1]) + 20} fill={cyan} fontSize="16">A / start of B</text>
        <text x={sx(resultant.position[0]) - 12} y={sy(resultant.position[1]) - 15} textAnchor="end" fill={orange} fontSize="16">A + B</text>
      </>}
      {modelId !== 'vectors' && state.bodies.map(body => {
        const [vx, vy] = body.velocity ?? [0, 0];
        const speed = Math.hypot(vx, vy);
        return <g key={body.id} data-body={body.id}>
          <circle cx={sx(body.position[0])} cy={sy(body.position[1])} r={Math.max(7, Math.min(22, body.radius * scale))} fill={body.color || cyan} />
          {speed > 0 && <line x1={sx(body.position[0])} y1={sy(body.position[1])} x2={sx(body.position[0]) + vx / speed * 36} y2={sy(body.position[1]) - vy / speed * 36} stroke={orange} strokeWidth="3" markerEnd={`url(#${marker})`} />}
        </g>;
      })}
      <text x="24" y="398" fill="#91a7c3" fontSize="13">{modelId === 'vectors' ? 'Arrow lengths share the same scale.' : 'Orange arrows: velocity direction. Body sizes and arrow lengths are illustrative.'}</text>
    </svg>
    <div className="physics-2d-caption">{guidance[modelId]}</div>
  </div>;
}
