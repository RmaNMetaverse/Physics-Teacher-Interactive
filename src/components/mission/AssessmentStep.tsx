import { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, Lightbulb, ArrowRight } from 'lucide-react';
import type { MissionAction, MissionSession } from '../../learning/mission-engine';
import type { MissionStep } from '../../learning/types';
import { checkAnswer } from '../../lib/assessment';
import { FormattedText } from '../FormattedText';

interface AssessmentStepProps {
  step: Extract<MissionStep, { kind: 'predict' | 'check' }>;
  state: MissionSession;
  dispatch: (action: MissionAction) => void;
  onAnswered?: (stepId: string, answer: number | string) => void;
}

export function AssessmentStep({ step, state, dispatch, onAnswered }: AssessmentStepProps) {
  const assessment = step.assessment;
  const currentAnswer = state.answers[step.id];
  const [selectedOption, setSelectedOption] = useState<number | null>(
    typeof currentAnswer?.value === 'number' && assessment.kind === 'concept' ? currentAnswer.value : null
  );
  const [textInput, setTextInput] = useState<string>(
    assessment.kind !== 'concept' && currentAnswer?.value !== undefined ? String(currentAnswer.value) : ''
  );
  const [hintIndex, setHintIndex] = useState<number>(state.hintedStepIds.includes(step.id) ? 1 : 0);

  const isPredict = step.kind === 'predict';
  const label = isPredict ? 'Prediction' : 'Concept check';

  const checkResult = currentAnswer ? checkAnswer(assessment, currentAnswer.value) : null;

  // Clear/sync form fields whenever step ID or current answer changes
  useEffect(() => {
    setSelectedOption(
      typeof currentAnswer?.value === 'number' && assessment.kind === 'concept' ? currentAnswer.value : null
    );
    setTextInput(
      assessment.kind !== 'concept' && currentAnswer?.value !== undefined ? String(currentAnswer.value) : ''
    );
    setHintIndex(state.hintedStepIds.includes(step.id) ? 1 : 0);
  }, [step.id, currentAnswer, assessment.kind, state.hintedStepIds]);

  const handleSubmit = (valueToSubmit?: number | string) => {
    let val: number | string;
    if (valueToSubmit !== undefined) {
      val = valueToSubmit;
    } else if (assessment.kind === 'concept') {
      if (selectedOption === null) return;
      val = selectedOption;
    } else {
      const trimmed = textInput.trim();
      if (!trimmed) return;
      const parsed = Number(trimmed);
      val = !Number.isNaN(parsed) && assessment.unit === undefined ? parsed : trimmed;
    }

    dispatch({ type: 'answer', stepId: step.id, value: val });
    onAnswered?.(step.id, val);
  };

  const handleRequestHint = () => {
    dispatch({ type: 'request-hint', stepId: step.id });
    setHintIndex(prev => Math.min(prev + 1, assessment.hints.length));
  };

  return (
    <article className={`mission-step mission-step-assessment mission-step-${step.kind}`}>
      <header className="step-header">
        <span className="step-kind-badge">
          {isPredict ? <HelpCircle size={14} aria-hidden="true" /> : <CheckCircle2 size={14} aria-hidden="true" />}
          {label}
        </span>
        <h2>
          <FormattedText text={assessment.prompt} />
        </h2>
      </header>

      <div className="assessment-body">
        {assessment.kind === 'concept' && assessment.options && (
          <div className="answer-options" role="group" aria-label={assessment.prompt}>
            {assessment.options.map((option, index) => {
              const isSelected = selectedOption === index;
              return (
                <button
                  key={index}
                  type="button"
                  className={`answer-option ${isSelected ? 'selected' : ''}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedOption(index)}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">
                    <FormattedText text={option} />
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {assessment.kind !== 'concept' && (
          <div className="numeric-answer">
            <label htmlFor={`input-${step.id}`} className="sr-only">
              Answer: {assessment.prompt}
            </label>
            <input
              id={`input-${step.id}`}
              type="text"
              inputMode="decimal"
              placeholder="Your answer"
              value={textInput}
              onChange={e => setTextInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSubmit();
              }}
              autoComplete="off"
            />
            {assessment.unit && <span className="unit-label">{assessment.unit}</span>}
          </div>
        )}

        <div className="assessment-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => handleSubmit()}
            disabled={assessment.kind === 'concept' ? selectedOption === null : textInput.trim() === ''}
          >
            Check answer <ArrowRight size={14} aria-hidden="true" />
          </button>

          {assessment.hints && assessment.hints.length > 0 && (
            <button
              type="button"
              className="text-button hint-button"
              onClick={handleRequestHint}
              disabled={hintIndex >= assessment.hints.length}
            >
              <Lightbulb size={14} aria-hidden="true" />
              {hintIndex > 0 ? 'Another hint' : 'Give me a hint'}
            </button>
          )}
        </div>

        {hintIndex > 0 && (
          <div className="assessment-hints">
            {assessment.hints.slice(0, hintIndex).map((hint, idx) => (
              <p key={idx} className="hint-message">
                <strong>Hint {idx + 1}:</strong> <FormattedText text={hint} />
              </p>
            ))}
          </div>
        )}

        {checkResult && (
          <div
            role="status"
            className={`feedback ${checkResult.correct ? 'correct' : 'incorrect'}`}
            aria-live="polite"
          >
            <strong>{checkResult.correct ? "That's right! " : 'Keep exploring. '}</strong>
            <span>
              <FormattedText text={checkResult.message} />
            </span>
          </div>
        )}
      </div>
    </article>
  );
}
