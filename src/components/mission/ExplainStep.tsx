import { useState } from 'react';
import { BookOpen, Calculator, Sparkles } from 'lucide-react';
import type { MissionDefinition, MissionStep } from '../../learning/types';
import { Equation } from '../Equation';
import { FormattedText } from '../FormattedText';
import { FormulaReasoning } from './FormulaReasoning';
import { formulaReasoning } from '../../learning/formula-reasoning';

interface ExplainStepProps {
  step: Extract<MissionStep, { kind: 'explain' }>;
  mission?: MissionDefinition;
}

export function ExplainStep({ step, mission }: ExplainStepProps) {
  const [revealedSteps, setRevealedSteps] = useState<number>(1);

  const hasEquation = Boolean(mission && mission.kind === 'mission' && mission.equation);
  const workedExample = mission && mission.kind === 'mission' ? mission.workedExample : undefined;
  const symbols = mission && mission.kind === 'mission' ? mission.symbols : undefined;

  return (
    <article className="mission-step mission-step-explain" aria-labelledby={`explain-title-${step.id}`}>
      <header className="step-header">
        <span className="step-kind-badge">
          <BookOpen size={14} aria-hidden="true" />
          Explanation & Mathematical Principles
        </span>
        <h2 id={`explain-title-${step.id}`}>{step.title}</h2>
      </header>

      {/* Mathematical Principles & Equation Card */}
      {hasEquation && mission && mission.kind === 'mission' && (
        <section className="explain-math-card" aria-label="Key formula and worked example">
          <div className="explain-math-header">
            <span className="step-kind-badge">
              <Calculator size={14} aria-hidden="true" />
              Core Equation & Math Breakdown
            </span>
          </div>

          <FormulaReasoning title={mission.title} reasoning={formulaReasoning[mission.id]} />

          <div className="equation-container">
            <Equation value={mission.equation} label={`Key formula for ${mission.title}`} />
          </div>

          {symbols && (
            <div className="math-symbols">
              <h3>Symbol Definitions</h3>
              <p className="symbols-text">
                <FormattedText text={symbols} />
              </p>
            </div>
          )}

          {workedExample && (
            <div className="foundation-worked-example">
              <div className="worked-example-header">
                <Sparkles size={16} aria-hidden="true" />
                <h4>Worked Example</h4>
              </div>
              <p className="example-question">
                <FormattedText text={workedExample.question} />
              </p>
              <ol className="worked-steps-list">
                {workedExample.steps.slice(0, revealedSteps).map((s, idx) => (
                  <li key={idx} className="worked-step-item">
                    <FormattedText text={s} />
                  </li>
                ))}
              </ol>

              {revealedSteps < workedExample.steps.length ? (
                <button
                  type="button"
                  className="secondary-button reveal-step-button"
                  onClick={() => setRevealedSteps(prev => prev + 1)}
                >
                  Reveal next step
                </button>
              ) : (
                <p className="example-answer">
                  <strong>Result:</strong> <FormattedText text={workedExample.answer} />
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Detailed Concept Explanation Body */}
      <div className="step-content">
        {step.body.map((paragraph, index) => (
          <FormattedText key={index} text={paragraph} as="p" />
        ))}
      </div>
    </article>
  );
}
