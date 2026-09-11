import { BookOpen } from 'lucide-react';
import type { MissionStep } from '../../learning/types';

interface ExplainStepProps {
  step: Extract<MissionStep, { kind: 'explain' }>;
}

export function ExplainStep({ step }: ExplainStepProps) {
  return (
    <article className="mission-step mission-step-explain" aria-labelledby={`explain-title-${step.id}`}>
      <header className="step-header">
        <span className="step-kind-badge">
          <BookOpen size={14} aria-hidden="true" />
          Explanation
        </span>
        <h2 id={`explain-title-${step.id}`}>{step.title}</h2>
      </header>
      <div className="step-content">
        {step.body.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>
    </article>
  );
}
