import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  ChartNoAxesCombined,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  SlidersHorizontal,
  Lightbulb,
  Expand,
  Move,
  AlertTriangle,
} from 'lucide-react';
import type { LessonDefinition, ModelId, Parameters, SimulationState, ParameterDefinition } from '../../types';
import { modelCatalog, modelDefaults, sanitizeModelParameters } from '../../physics';
import { sampleTrajectory } from '../../physics/scene';
import { formatNumber as fmt } from '../../lib/format';
import { GraphView } from './GraphView';
import { SimulationBoundary } from './SimulationBoundary';

const Scene = lazy(() => import('./Scene'));

export interface LabProps {
  modelId?: ModelId;
  lesson?: LessonDefinition;
  preset?: Parameters;
  suspended?: boolean;
  forceSceneError?: boolean;
  onObservation?: (state: SimulationState) => void;
}

const labels: Record<string, string> = {
  speed: 'Launch speed',
  angle: 'Angle',
  g: 'Gravity',
  mode: 'Experiment',
  acceleration: 'Acceleration',
  height: 'Initial height',
  mass: 'Mass',
  length: 'Length',
  uncertainty: 'Uncertainty',
  scale: 'Display multiplier',
  magnitude: 'Vector A magnitude',
  bx: 'B horizontal',
  by: 'B vertical',
  force: 'Applied force',
  friction: 'Friction coefficient',
  mass1: 'Mass A',
  mass2: 'Mass B',
  velocity1: 'Initial velocity A',
  velocity2: 'Initial velocity B',
  restitution: 'Restitution',
  centralMass: 'Central mass',
  radius: 'Orbital radius',
  speedFactor: 'Speed / circular speed',
  springConstant: 'Spring constant',
  stiffness: 'Spring constant',
  amplitude: 'Amplitude',
  frequency: 'Frequency',
  wavelength: 'Wavelength',
  temperature: 'Temperature',
  pressure: 'Pressure',
  volume: 'Volume',
  charge: 'Electric charge',
  voltage: 'Voltage',
  resistance: 'Resistance',
  current: 'Current',
  refractiveIndex: 'Refractive index',
  velocity: 'Velocity',
  workFunction: 'Work function',
  halfLife: 'Half-life',
};

const motionModes = ['Constant velocity', 'Constant acceleration', 'Free fall', 'Projectile'];
const oscillationModes = ['Spring oscillator', 'Pendulum'];

export function Lab({
  modelId,
  lesson,
  preset,
  suspended = false,
  forceSceneError = false,
  onObservation,
}: LabProps) {
  const id: ModelId = modelId ?? lesson?.family ?? 'motion';
  const definition = modelCatalog[id] ?? modelCatalog.motion;
  const shouldForceError =
    forceSceneError ||
    (typeof window !== 'undefined' &&
      ((window as unknown as { __FORCE_SIMULATION_ERROR__?: boolean }).__FORCE_SIMULATION_ERROR__ === true ||
        window.location.search.includes('forceFallback=true')));

  const [parameters, setParameters] = useState<Parameters>(() =>
    sanitizeModelParameters(id, { ...modelDefaults(id), ...(preset ?? lesson?.preset) })
  );
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const respectMotion = () => {
      if (media.matches || document.documentElement.dataset.reducedMotion === 'true') setPlaying(false);
    };
    media.addEventListener?.('change', respectMotion);
    const observer = new MutationObserver(respectMotion);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-reduced-motion'] });
    return () => {
      media.removeEventListener?.('change', respectMotion);
      observer.disconnect();
    };
  }, []);
  const [speed, setSpeed] = useState(1);
  const [view, setView] = useState<'3d' | 'graph'>('3d');
  const [camera, setCamera] = useState(0);
  const [reducedModeActive, setReducedModeActive] = useState(false);

  const container = useRef<HTMLDivElement>(null);
  const trajectory = useMemo(() => sampleTrajectory(id, parameters), [id, parameters]);
  const state = useMemo(() => definition.evaluate(parameters, time), [definition, parameters, time]);
  const duration = trajectory.duration || definition.duration;
  const baseSpeed = id === 'gravity' ? 500 : 1;

  useEffect(() => {
    onObservation?.(state);
  }, [state, onObservation]);

  useEffect(() => {
    if (suspended) setPlaying(false);
  }, [suspended]);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let previous = 0;
    let accumulator = 0;
    const tick = (now: number) => {
      if (document.hidden) {
        previous = now;
        frame = requestAnimationFrame(tick);
        return;
      }
      if (previous) accumulator += Math.min(0.1, (now - previous) / 1000);
      previous = now;
      const steps = Math.floor(accumulator * 60);
      if (steps > 0) {
        accumulator -= steps / 60;
        setTime(t => Math.min(duration, t + (steps / 60) * speed * baseSpeed));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed, baseSpeed, duration]);

  useEffect(() => {
    if (state.ended || time >= duration) setPlaying(false);
  }, [state.ended, time, duration]);

  function update(key: string, value: number) {
    setParameters(p => sanitizeModelParameters(id, { ...p, [key]: value }));
    setTime(0);
    setPlaying(false);
  }

  function play() {
    if (time >= duration || state.ended) setTime(0);
    setPlaying(p => !p);
  }

  const controls = definition.parameters.filter(p => {
    if (id !== 'motion') return true;
    if (p.key === 'angle') return parameters.mode === 3;
    if (p.key === 'acceleration') return parameters.mode === 1;
    if (p.key === 'speed') return parameters.mode !== 2;
    if (p.key === 'g') return parameters.mode >= 2;
    return true;
  });

  const essentialControls = controls.slice(0, 3);
  const extraControls = controls.slice(3);

  function renderParameter(p: ParameterDefinition) {
    const labelText = labels[p.key] || p.label;
    const isMode = p.key === 'mode';
    const value = parameters[p.key] ?? p.default;

    return (
      <div className="parameter" key={p.key}>
        <div className="parameter-top">
          <label htmlFor={`param-${p.key}`}>{labelText}</label>
          {!isMode && (
            <span className="parameter-value">
              <input
                id={`param-num-${p.key}`}
                aria-label={`${labelText} value`}
                type="number"
                min={p.min}
                max={p.max}
                step={p.step}
                value={value}
                onChange={e => {
                  if (e.target.value !== '' && Number.isFinite(e.target.valueAsNumber)) {
                    update(p.key, e.target.valueAsNumber);
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    update(p.key, Math.min(p.max, value + p.step));
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    update(p.key, Math.max(p.min, value - p.step));
                  }
                }}
              />
              <small>{p.unit}</small>
            </span>
          )}
        </div>
        {isMode ? (
          <select
            className="text-input"
            style={{ width: '100%', fontSize: 11, padding: 7 }}
            id={`param-${p.key}`}
            aria-label={labelText}
            value={value}
            onChange={e => update(p.key, Number(e.target.value))}
          >
            {(id === 'motion' ? motionModes : oscillationModes).map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
        ) : (
          <>
            <input
              id={`param-${p.key}`}
              aria-label={labelText}
              type="range"
              min={p.min}
              max={p.max}
              step={p.step}
              value={value}
              onChange={e => update(p.key, Number(e.target.value))}
              onKeyDown={e => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  update(p.key, Math.min(p.max, value + p.step));
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  update(p.key, Math.max(p.min, value - p.step));
                }
              }}
            />
            <div className="parameter-bounds">
              <span>{fmt(p.min)}</span>
              <span>{fmt(p.max)}</span>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <section className="lab" ref={container} aria-label={definition.title}>
      <div className="lab-topline">
        <div className="lab-label">
          <span className="live-dot" />
          Interactive laboratory
        </div>
        <div className="segmented">
          <button
            type="button"
            className={view === '3d' && !reducedModeActive ? 'active' : ''}
            aria-pressed={view === '3d' && !reducedModeActive}
            onClick={() => {
              setReducedModeActive(false);
              setView('3d');
            }}
          >
            <Box size={12} />
            3D scene
          </button>
          <button
            type="button"
            className={view === 'graph' ? 'active' : ''}
            aria-pressed={view === 'graph'}
            onClick={() => setView('graph')}
          >
            <ChartNoAxesCombined size={12} />
            Graph & data
          </button>
        </div>
      </div>

      <div className="lab-content">
        <div className="experiment-viewport">
          {view === '3d' && !reducedModeActive ? (
            <>
              <SimulationBoundary
                key={id + ':' + camera}
                onError={() => setReducedModeActive(true)}
                fallback={
                  <div className="reduced-visual-mode" role="region" aria-label="Reduced visual mode">
                    <div className="simulation-recovery-banner" role="status" aria-live="polite">
                      <div className="recovery-header">
                        <AlertTriangle size={16} aria-hidden="true" />
                        <strong>3D rendering unavailable</strong>
                      </div>
                      <p className="recovery-copy">
                        3D rendering is unavailable on this device. The physics model, controls, observations, graph, and data table remain fully active.
                      </p>
                    </div>
                    <div className="model-description-panel">
                      <p className="model-description-text">{definition.description}</p>
                      {state.description && (
                        <p className="state-description-text">{state.description}</p>
                      )}
                    </div>
                    <GraphView
                      modelId={id}
                      parameters={parameters}
                      state={state}
                      duration={duration}
                    />
                  </div>
                }
              >
                <Suspense fallback={<div className="scene-loading">Preparing your experiment…</div>}>
                  <Scene
                    modelId={id}
                    parameters={parameters}
                    state={state}
                    trajectory={trajectory}
                    resetKey={camera}
                    onParameterChange={update}
                    shouldThrow={shouldForceError}
                  />
                </Suspense>
              </SimulationBoundary>

              {!shouldForceError && (
                <>
                  <div className="scene-label">
                    <strong>{id === 'gravity' ? 'Orbital reference frame' : 'World reference frame'}</strong>
                    <p>{id === 'motion' && parameters.mode === 3 ? 'Horizontal freedom. Vertical gravity.' : definition.description}</p>
                  </div>
                  <div className="scene-controls">
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Reset camera"
                      title="Reset camera"
                      onClick={() => setCamera(v => v + 1)}
                    >
                      <RotateCcw size={13} />
                    </button>
                    <button
                      type="button"
                      className="icon-button"
                      aria-label="Expand experiment"
                      title="Expand experiment"
                      onClick={() => {
                        if (document.fullscreenElement) void document.exitFullscreen();
                        else void container.current?.requestFullscreen?.().catch(() => {});
                      }}
                    >
                      <Expand size={13} />
                    </button>
                  </div>
                  <div className="scene-axis-hint">
                    <Move size={12} />
                    Drag to orbit · scroll to zoom · markers are schematic
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="graph-viewport-wrapper">
              {reducedModeActive && (
                <div className="simulation-recovery-banner" role="status" aria-live="polite">
                  <p className="recovery-copy">
                    3D rendering is unavailable on this device. The physics model, controls, observations, graph, and data table remain fully active.
                  </p>
                </div>
              )}
              <div className="model-description-panel">
                <p className="model-description-text">{definition.description}</p>
                {state.description && (
                  <p className="state-description-text">{state.description}</p>
                )}
              </div>
              <GraphView modelId={id} parameters={parameters} state={state} duration={duration} />
            </div>
          )}
        </div>

        <div className="parameters">
          <p className="panel-label">
            <SlidersHorizontal size={12} />
            Experiment controls
          </p>

          {/* Essential controls (at most 3) */}
          <div className="essential-controls">
            {essentialControls.map(p => renderParameter(p))}
          </div>

          {/* Explore further disclosure for extra controls */}
          {extraControls.length > 0 && (
            <details className="explore-further-disclosure">
              <summary className="explore-further-summary">
                Explore further ({extraControls.length} more {extraControls.length === 1 ? 'control' : 'controls'})
              </summary>
              <div className="extra-controls">
                {extraControls.map(p => renderParameter(p))}
              </div>
            </details>
          )}

          <div className="param-tip">
            <Lightbulb size={13} />
            Change one variable at a time. Each change starts a new trial so you can compare cause and effect.
          </div>
        </div>
      </div>

      <div className="lab-playbar">
        <button
          type="button"
          className="play-button"
          aria-label={playing ? 'Pause experiment' : 'Play experiment'}
          onClick={play}
        >
          {playing ? <Pause size={14} /> : <Play size={14} fill="currentColor" />}
          {playing ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          className="playbar-icon"
          aria-label="Reset experiment"
          title="Reset experiment"
          onClick={() => {
            setTime(0);
            setPlaying(false);
          }}
        >
          <RotateCcw size={16} />
        </button>
        <button
          type="button"
          className="playbar-icon"
          aria-label="Step experiment"
          title="Step forward"
          onClick={() => {
            setPlaying(false);
            setTime(t => Math.min(duration, t + baseSpeed / 60));
          }}
        >
          <SkipForward size={16} />
        </button>
        <span className="playbar-divider" />
        <select
          className="speed-select"
          aria-label="Playback speed"
          value={speed}
          onChange={e => setSpeed(Number(e.target.value))}
        >
          {[0.25, 0.5, 1, 2].map(s => (
            <option key={s} value={s}>
              {s * baseSpeed}×
            </option>
          ))}
        </select>
        <div className="timeline">
          <input
            type="range"
            aria-label="Experiment time"
            min="0"
            max={duration}
            step={duration / 1000}
            value={Math.min(duration, time)}
            onChange={e => {
              setPlaying(false);
              setTime(Number(e.target.value));
            }}
          />
        </div>
        <div className="time-label">
          t = <b data-testid="simulation-time">{fmt(state.time, 2)}</b> s
        </div>
      </div>

      <div className="telemetry" aria-label="Numerical observations">
        {state.observations.slice(0, 4).map(o => (
          <div className="measurement" key={o.key}>
            <div className="measurement-label">
              <span className="quantity-dot" style={{ background: o.color }} />
              {o.label}
            </div>
            <div className="measurement-value">
              {fmt(o.value)}
              <small>{o.unit}</small>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
