import { useState, useRef, useEffect } from 'react';
import { Sparkles, Calculator, X, ArrowLeft, ArrowRight, Lightbulb, CheckCircle2 } from 'lucide-react';
import type { MissionAction, MissionSession } from '../../learning/mission-engine';
import type { MissionStep } from '../../learning/types';
import { mathTutorials } from '../../content/math';
import { checkAnswer } from '../../lib/assessment';
import { Equation } from '../Equation';
import { MathWidget } from '../MathWidget';
import { FormattedText } from '../FormattedText';

interface MathStepProps {
  step: Extract<MissionStep, { kind: 'math' }>;
  state: MissionSession;
  dispatch: (action: MissionAction) => void;
  onAnswered?: (stepId: string, answer: number | string) => void;
}

export function MathStep({ step, state, dispatch, onAnswered }: MathStepProps) {
  const layer = step.layer;
  const isExpandedInSession = state.expandedMathStepIds.includes(step.id);
  const [isExpanded, setIsExpanded] = useState<boolean>(isExpandedInSession);
  const [revealedSteps, setRevealedSteps] = useState<number>(1);
  const [activePrereqId, setActivePrereqId] = useState<string | null>(null);

  // Focus management refs
  const articleRef = useRef<HTMLElement>(null);
  const teachButtonRef = useRef<HTMLButtonElement>(null);
  const lastPrereqIdRef = useRef<string | null>(null);
  const prevExpandedRef = useRef(isExpanded);
  const prevPrereqRef = useRef(activePrereqId);

  // Sync with session state when it changes
  useEffect(() => {
    setIsExpanded(state.expandedMathStepIds.includes(step.id));
  }, [state.expandedMathStepIds, step.id]);

  useEffect(() => {
    if (prevExpandedRef.current && !isExpanded) {
      teachButtonRef.current?.focus();
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded]);

  useEffect(() => {
    if (prevPrereqRef.current && activePrereqId === null && lastPrereqIdRef.current) {
      const targetId = lastPrereqIdRef.current;
      const button = articleRef.current?.querySelector<HTMLButtonElement>(
        `button[data-prereq-id="${targetId}"]`
      );
      button?.focus();
      lastPrereqIdRef.current = null;
    }
    prevPrereqRef.current = activePrereqId;
  }, [activePrereqId]);

  const handleOpenFoundation = () => {
    setIsExpanded(true);
    dispatch({ type: 'toggle-math-foundation', stepId: step.id });
  };

  const handleCloseFoundation = () => {
    setIsExpanded(false);
    setActivePrereqId(null);
    dispatch({ type: 'toggle-math-foundation', stepId: step.id });
  };

  // Assessment check state
  const currentAnswer = state.answers[step.id];
  const checkAssessment = layer.foundation.check;
  const [checkInput, setCheckInput] = useState<string>(
    currentAnswer?.value !== undefined ? String(currentAnswer.value) : ''
  );
  const [checkSelectedOption, setCheckSelectedOption] = useState<number | null>(
    typeof currentAnswer?.value === 'number' && checkAssessment.kind === 'concept' ? currentAnswer.value : null
  );
  const [checkHints, setCheckHints] = useState<number>(state.hintedStepIds.includes(step.id) ? 1 : 0);

  const checkResult = currentAnswer ? checkAnswer(checkAssessment, currentAnswer.value) : null;

  // Clear/sync form fields whenever step ID or current answer changes
  useEffect(() => {
    setCheckInput(currentAnswer?.value !== undefined ? String(currentAnswer.value) : '');
    setCheckSelectedOption(
      typeof currentAnswer?.value === 'number' && checkAssessment.kind === 'concept' ? currentAnswer.value : null
    );
    setCheckHints(state.hintedStepIds.includes(step.id) ? 1 : 0);
  }, [step.id, currentAnswer, checkAssessment.kind, state.hintedStepIds]);

  const handleCheckSubmit = () => {
    let val: number | string;
    if (checkAssessment.kind === 'concept') {
      if (checkSelectedOption === null) return;
      val = checkSelectedOption;
    } else {
      const trimmed = checkInput.trim();
      if (!trimmed) return;
      const parsed = Number(trimmed);
      val = !Number.isNaN(parsed) ? parsed : trimmed;
    }

    dispatch({ type: 'answer', stepId: step.id, value: val });
    onAnswered?.(step.id, val);
  };

  const handleRequestCheckHint = () => {
    dispatch({ type: 'request-hint', stepId: step.id });
    setCheckHints(prev => Math.min(prev + 1, checkAssessment.hints?.length ?? 0));
  };

  // Prerequisite navigation
  const openPrereq = (id: string) => {
    lastPrereqIdRef.current = id;
    setActivePrereqId(id);
  };

  const closePrereq = () => {
    setActivePrereqId(null);
  };

  const activePrereqTutorial = activePrereqId
    ? mathTutorials.find(t => t.id === activePrereqId)
    : null;

  // Visual interactive tutorial
  const visualDef = layer.foundation.visual;
  const visualTutorial = mathTutorials.find(t => t.id === visualDef.tutorialId);

  const renderCheckAssessment = (isQuickMode: boolean) => (
    <div className={`foundation-check ${isQuickMode ? 'math-quick-check' : ''}`}>
      <div className="foundation-check-header">
        <h4>Confirm your understanding</h4>
        {!checkResult?.correct && (
          <span className="math-check-badge">Required to advance</span>
        )}
      </div>
      <p>
        <FormattedText text={checkAssessment.prompt} />
      </p>

      {checkAssessment.kind === 'concept' && checkAssessment.options && (
        <div className="answer-options" role="group" aria-label={checkAssessment.prompt}>
          {checkAssessment.options.map((option, idx) => {
            const isSelected = checkSelectedOption === idx;
            return (
              <button
                key={idx}
                type="button"
                className={`answer-option ${isSelected ? 'selected' : ''}`}
                aria-pressed={isSelected}
                onClick={() => setCheckSelectedOption(idx)}
              >
                <span className="option-letter">{String.fromCharCode(65 + idx)}</span>
                <span className="option-text">
                  <FormattedText text={option} />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {checkAssessment.kind !== 'concept' && (
        <div className="numeric-answer">
          <label htmlFor={`check-input-${step.id}`} className="sr-only">
            Your answer
          </label>
          <input
            id={`check-input-${step.id}`}
            type="text"
            inputMode="decimal"
            placeholder="Your answer"
            value={checkInput}
            onChange={e => setCheckInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCheckSubmit();
            }}
            autoComplete="off"
          />
          {checkAssessment.unit && (
            <span className="unit-label">{checkAssessment.unit}</span>
          )}
        </div>
      )}

      <div className="assessment-actions">
        <button
          type="button"
          className="primary-button check-answer-button"
          onClick={handleCheckSubmit}
          disabled={
            checkAssessment.kind === 'concept'
              ? checkSelectedOption === null
              : checkInput.trim() === ''
          }
        >
          Check answer <ArrowRight size={14} aria-hidden="true" />
        </button>

        {checkAssessment.hints && checkAssessment.hints.length > 0 && (
          <button
            type="button"
            className="text-button hint-button"
            onClick={handleRequestCheckHint}
            disabled={checkHints >= checkAssessment.hints.length}
          >
            <Lightbulb size={14} aria-hidden="true" />
            {checkHints > 0 ? 'Another hint' : 'Give me a hint'}
          </button>
        )}
      </div>

      {checkHints > 0 && checkAssessment.hints && (
        <div className="assessment-hints">
          {checkAssessment.hints.slice(0, checkHints).map((hint, idx) => (
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
  );

  return (
    <article ref={articleRef} className="mission-step mission-step-math" aria-labelledby={`math-title-${step.id}`}>
      <header className="step-header">
        <span className="step-kind-badge">
          <Calculator size={14} aria-hidden="true" />
          Layered mathematics
        </span>
        <h2 id={`math-title-${step.id}`}>{step.title}</h2>
      </header>

      {/* Quick Mode */}
      <section className="math-quick-mode" aria-label="Concise math overview">
        <div className="equation-container">
          <Equation value={layer.quick.equation} />
        </div>
        <p className="math-quick-summary">
          <FormattedText text={layer.quick.summary} />
        </p>

        <div className="math-symbols">
          <h3>Symbol definitions</h3>
          <ul className="math-symbols-list">
            {layer.quick.symbols.map((sym, i) => (
              <li key={i} className="math-symbol-item">
                <span className="symbol-char">
                  <code>{sym.symbol}</code>
                </span>
                <span className="symbol-meaning">
                  <FormattedText text={sym.meaning} />
                </span>
                {sym.unit && <span className="symbol-unit">({sym.unit})</span>}
              </li>
            ))}
          </ul>
        </div>

        {!isExpanded && (
          <>
            <div className="math-expand-action">
              <button
                ref={teachButtonRef}
                type="button"
                className="secondary-button teach-math-button"
                onClick={handleOpenFoundation}
              >
                <Sparkles size={16} aria-hidden="true" />
                Teach me the math
              </button>
              <span className="math-expand-guidance">
                Need a deeper refresher? Open the foundation tutorial for concepts and worked examples, or verify your understanding directly below to advance.
              </span>
            </div>

            {renderCheckAssessment(true)}
          </>
        )}
      </section>

      {/* Expanded Foundation Mode */}
      {isExpanded && (
        <section className="math-foundation-mode" aria-label="Expanded math foundation">
          {activePrereqTutorial ? (
            /* Nested Prerequisite View */
            <div className="math-prereq-view">
              <div className="prereq-header">
                <button
                  type="button"
                  className="text-button return-prereq-button"
                  onClick={closePrereq}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Return to {layer.foundation.title}
                </button>
                <h3>{activePrereqTutorial.title}</h3>
              </div>
              <p>
                <FormattedText text={activePrereqTutorial.summary} />
              </p>
              <MathWidget tutorial={activePrereqTutorial} />
              {activePrereqTutorial.explanation.map((paragraph, idx) => (
                <FormattedText key={idx} text={paragraph} as="p" />
              ))}
              <div className="equation-container">
                <Equation value={activePrereqTutorial.equation} />
              </div>
            </div>
          ) : (
            /* Main Foundation View */
            <div className="foundation-content">
              <div className="foundation-header">
                <h3>{layer.foundation.title}</h3>
                <button
                  type="button"
                  className="icon-button close-foundation-button"
                  onClick={handleCloseFoundation}
                  aria-label="Close math foundation"
                >
                  <X size={18} aria-hidden="true" />
                </button>
              </div>

              {/* Concepts */}
              <div className="foundation-concepts">
                <h4>Core concepts</h4>
                <ul>
                  {layer.foundation.concepts.map((concept, idx) => (
                    <li key={idx}>
                      <FormattedText text={concept} />
                    </li>
                  ))}
                </ul>
              </div>

              {/* Explanation */}
              <div className="foundation-explanation">
                {layer.foundation.explanation.map((paragraph, idx) => (
                  <FormattedText key={idx} text={paragraph} as="p" />
                ))}
              </div>

              {/* Prerequisites list */}
              {layer.foundation.prerequisites && layer.foundation.prerequisites.length > 0 && (
                <div className="foundation-prerequisites">
                  <h4>Helpful first</h4>
                  <div className="prereq-chips">
                    {layer.foundation.prerequisites.map(prereq => {
                      const prereqTutorial = mathTutorials.find(t => t.id === prereq.id);
                      const prereqTitle = prereqTutorial?.title ?? prereq.id.replace('math-', '');
                      return (
                        <button
                          key={prereq.id}
                          type="button"
                          className="prereq-chip"
                          data-prereq-id={prereq.id}
                          onClick={() => openPrereq(prereq.id)}
                        >
                          {prereqTitle}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Interactive Visual */}
              <div className="foundation-visual">
                <h4>Interactive illustration</h4>
                {visualTutorial ? (
                  <MathWidget
                    tutorial={{
                      ...visualTutorial,
                      interactive: {
                        ...visualTutorial.interactive,
                        ...visualDef,
                        kind: visualDef.kind === 'ratio' ? 'number' : visualDef.kind,
                      },
                    }}
                  />
                ) : (
                  <div className="math-widget-fallback">
                    <label htmlFor={`slider-${step.id}`}>
                      {visualDef.label}: <strong>{visualDef.initial}</strong>
                    </label>
                    <input
                      id={`slider-${step.id}`}
                      type="range"
                      min={visualDef.min}
                      max={visualDef.max}
                      step={visualDef.step}
                      defaultValue={visualDef.initial}
                    />
                    <p>{visualDef.instruction}</p>
                  </div>
                )}
              </div>

              {/* Worked Example */}
              <div className="foundation-worked-example">
                <h4>Worked example</h4>
                <p className="example-question">
                  <FormattedText text={layer.foundation.workedExample.question} />
                </p>
                <ol className="worked-steps-list">
                  {layer.foundation.workedExample.steps.slice(0, revealedSteps).map((s, idx) => (
                    <li key={idx} className="worked-step-item">
                      <FormattedText text={s} />
                    </li>
                  ))}
                </ol>

                {revealedSteps < layer.foundation.workedExample.steps.length ? (
                  <button
                    type="button"
                    className="secondary-button reveal-step-button"
                    onClick={() => setRevealedSteps(prev => prev + 1)}
                  >
                    Reveal next step
                  </button>
                ) : (
                  <p className="example-answer">
                    <strong>Result:</strong> <FormattedText text={layer.foundation.workedExample.answer} />
                  </p>
                )}
              </div>

              {/* Check Assessment */}
              {renderCheckAssessment(false)}

              <div className="foundation-footer">
                <button
                  type="button"
                  className="secondary-button close-foundation-footer"
                  onClick={handleCloseFoundation}
                >
                  <ArrowLeft size={16} aria-hidden="true" />
                  Return to quick view
                </button>
                {checkResult?.correct && (
                  <span className="foundation-done-badge">
                    <CheckCircle2 size={16} aria-hidden="true" />
                    Math understanding verified
                  </span>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </article>
  );
}
