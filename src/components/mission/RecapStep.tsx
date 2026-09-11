import { useState } from 'react';
import { Award, CheckCircle2, ChevronDown, ChevronUp, RotateCcw, Star, Trophy, ArrowRight } from 'lucide-react';
import type { MissionSession } from '../../learning/mission-engine';
import { calculateStars } from '../../learning/mission-engine';
import type { MissionDefinition, MissionStep } from '../../learning/types';
import type { LearnerProgressV2 } from '../../progress/types';
import { Celebration } from '../rewards/Celebration';
import { DeepDive } from './DeepDive';

interface RecapStepProps {
  step: Extract<MissionStep, { kind: 'recap' }>;
  state: MissionSession;
  mission: MissionDefinition;
  courseId: string;
  settings?: LearnerProgressV2['settings'];
  onContinue: () => void;
  onReplay: () => void;
}

export function RecapStep({ step, state, mission, courseId, settings, onContinue, onReplay }: RecapStepProps) {
  const [showDeepDive, setShowDeepDive] = useState(false);

  let stars: 1 | 2 | 3 = 3;
  try {
    if (state.isComplete) {
      stars = calculateStars(state);
    } else if (state.hintedStepIds.length > 0) {
      stars = 1;
    } else {
      const scored = state.mission.steps
        .filter(s => s.kind === 'predict' || s.kind === 'check' || s.kind === 'math')
        .map(s => s.id);
      stars = scored.every(stepId => state.answers[stepId]?.attempts === 1) ? 3 : 2;
    }
  } catch {
    stars = 3;
  }

  return (
    <article className="mission-step mission-step-recap" aria-labelledby={`recap-title-${step.id}`}>
      <Celebration active={state.isComplete} settings={settings} />
      <header className="step-header">
        <span className="step-kind-badge">
          <Award size={14} aria-hidden="true" />
          Mission recap
        </span>
        <h2 id={`recap-title-${step.id}`}>Mission complete: {mission.title}</h2>
      </header>

      <div className="recap-rewards-card">
        <div className="recap-stars" aria-label={`Earned ${stars} of 3 stars`}>
          {[1, 2, 3].map(num => (
            <Star
              key={num}
              size={28}
              className={`recap-star ${num <= stars ? 'earned' : 'empty'}`}
              fill={num <= stars ? '#f59e0b' : 'none'}
              color={num <= stars ? '#f59e0b' : '#64748b'}
              aria-hidden="true"
            />
          ))}
          <span className="recap-stars-label">{stars} / 3 Stars</span>
        </div>

        <div className="recap-xp-badge">
          <Trophy size={20} aria-hidden="true" />
          <span>+{mission.xp} XP</span>
        </div>
      </div>

      <div className="recap-takeaways">
        <h3>Key takeaways</h3>
        <ul>
          {step.takeaways.map((takeaway, idx) => (
            <li key={idx}>
              <CheckCircle2 size={16} aria-hidden="true" />
              <span>{takeaway}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="recap-primary-actions">
        <button
          type="button"
          className="primary-button continue-action"
          onClick={onContinue}
        >
          Continue <ArrowRight size={16} aria-hidden="true" />
        </button>

        <button
          type="button"
          className="secondary-button replay-action"
          onClick={onReplay}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Replay mission
        </button>

        <button
          type="button"
          className="text-button deep-dive-toggle"
          onClick={() => setShowDeepDive(prev => !prev)}
          aria-expanded={showDeepDive}
        >
          {showDeepDive ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          {showDeepDive ? 'Hide deep dive' : 'Explore deep dive'}
        </button>
      </div>

      {showDeepDive && (
        <div className="recap-deep-dive-container">
          <DeepDive mission={mission} courseId={courseId} />
        </div>
      )}
    </article>
  );
}
