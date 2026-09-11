import { Check, Play, Zap } from 'lucide-react';
import type { MissionStep } from '../../learning/types';
import { Lab } from './Lab';

export interface SimulationStepProps {
  step: Extract<MissionStep, { kind: 'simulate' }>;
  isCompleted?: boolean;
  onComplete?: () => void;
  forceSceneError?: boolean;
}

export function SimulationStep({
  step,
  isCompleted = false,
  onComplete,
  forceSceneError = false,
}: SimulationStepProps) {
  return (
    <article className="mission-step mission-step-simulate">
      <header className="step-header">
        <span className="step-kind-badge">
          <Play size={14} aria-hidden="true" />
          Interactive simulation
        </span>
        <h2>Simulate physical model</h2>
      </header>

      <div className="simulation-prompt-card">
        <p>{step.prompt}</p>
        {step.preset && Object.keys(step.preset).length > 0 && (
          <div className="simulation-presets">
            <strong>Initial parameters:</strong>
            <ul>
              {Object.entries(step.preset).map(([key, val]) => (
                <li key={key}>
                  <code>{key}</code>: {String(val)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="simulation-lab-container">
        <Lab
          modelId={step.modelId}
          preset={step.preset}
          forceSceneError={forceSceneError}
        />
      </div>

      <div className="simulation-boundary-box">
        {isCompleted ? (
          <div className="simulation-completed-banner" role="status">
            <Check size={20} aria-hidden="true" />
            <strong>Observation complete.</strong>
            <p>You have observed the physical behavior and are ready to continue.</p>
          </div>
        ) : (
          <div className="simulation-action-prompt">
            <button
              type="button"
              className="primary-button run-simulation-button"
              onClick={onComplete}
            >
              <Zap size={16} aria-hidden="true" />
              Run simulation & record observation
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
