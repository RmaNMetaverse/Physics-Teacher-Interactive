import { Eye } from 'lucide-react';
import type { MissionStep } from '../../learning/types';

interface ObserveStepProps {
  step: Extract<MissionStep, { kind: 'observe' }>;
}

export function ObserveStep({ step }: ObserveStepProps) {
  return (
    <article className="mission-step mission-step-observe" aria-labelledby={`observe-title-${step.id}`}>
      <header className="step-header">
        <span className="step-kind-badge">
          <Eye size={14} aria-hidden="true" />
          Observe
        </span>
        <h2 id={`observe-title-${step.id}`}>{step.title}</h2>
      </header>
      <div className="step-content">
        {step.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
