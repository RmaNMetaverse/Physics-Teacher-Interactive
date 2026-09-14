import { useReducer, useEffect, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import type { CourseDefinition, MissionDefinition } from '../../learning/types';
import type { LearnerProgressV2 } from '../../progress/types';
import { courseCatalog } from '../../learning/catalog';
import { completeMission, recordStep, saveProgressV2 } from '../../progress/progress';
import {
  createMissionCompletion,
  createMissionSession,
  missionReducer,
  type MissionSessionSaved,
} from '../../learning/mission-engine';
import { ObserveStep } from './ObserveStep';
import { AssessmentStep } from './AssessmentStep';
import { MathStep } from './MathStep';
import { ExplainStep } from './ExplainStep';
import { RecapStep } from './RecapStep';
import { SimulationStep } from '../simulation/SimulationStep';

interface JourneyStage {
  kind: 'observe' | 'predict' | 'simulate' | 'explain' | 'math' | 'check' | 'recap';
  label: string;
}

const JOURNEY_STAGES: readonly JourneyStage[] = [
  { kind: 'observe', label: 'Observe' },
  { kind: 'predict', label: 'Predict' },
  { kind: 'simulate', label: 'Simulate' },
  { kind: 'explain', label: 'Explain' },
  { kind: 'math', label: 'Math' },
  { kind: 'check', label: 'Check' },
  { kind: 'recap', label: 'Recap' },
] as const;

interface MissionPlayerProps {
  course: CourseDefinition;
  mission: MissionDefinition;
  progress: LearnerProgressV2;
  onProgressChange?: (next: LearnerProgressV2) => void;
  onClose?: () => void;
}

function storageKey(courseId: string, missionId: string): string {
  return `physics-mission-session-${courseId}-${missionId}`;
}

function loadSavedSession(courseId: string, missionId: string): MissionSessionSaved | undefined {
  if (typeof localStorage === 'undefined') return undefined;
  try {
    const raw = localStorage.getItem(storageKey(courseId, missionId));
    if (!raw) return undefined;
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function saveSession(courseId: string, missionId: string, saved: MissionSessionSaved): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKey(courseId, missionId), JSON.stringify(saved));
  } catch {
    // Ignore quota or private browsing errors gracefully
  }
}

export function MissionPlayer({ course, mission, progress, onProgressChange }: MissionPlayerProps) {
  const initialSession = useMemo(() => {
    const saved = loadSavedSession(course.id, mission.id);
    try {
      return createMissionSession(mission, saved);
    } catch {
      return createMissionSession(mission);
    }
  }, [course.id, mission]);

  const [state, dispatch] = useReducer(missionReducer, initialSession);
  const completedSessionRef = useRef<string | null>(null);

  // Persist session state outside the reducer
  useEffect(() => {
    const saved: MissionSessionSaved = {
      currentStepIndex: state.currentStepIndex,
      answers: state.answers,
      hintedStepIds: state.hintedStepIds,
      expandedMathStepIds: state.expandedMathStepIds,
      completedSimulationStepIds: state.completedSimulationStepIds,
      recapCompleted: state.recapCompleted,
    };
    saveSession(course.id, mission.id, saved);
  }, [course.id, mission.id, state]);

  // Handle mission completion and award XP / stars
  useEffect(() => {
    if (state.isComplete) {
      const sessionKey = `${course.id}:${mission.id}:${state.recapCompleted}`;
      if (completedSessionRef.current === sessionKey) {
        return;
      }
      completedSessionRef.current = sessionKey;

      try {
        const completion = createMissionCompletion(state, course.id);
        const updatedProgress = completeMission(progress, completion, courseCatalog, new Date());
        onProgressChange?.(updatedProgress);
        saveProgressV2(updatedProgress, courseCatalog);
      } catch {
        // Already recorded or validation caught
      }
    }
  }, [state.isComplete, state, course.id, mission.id, progress, onProgressChange]);

  const handleAnswered = useCallback(
    (stepId: string, answer: number | string) => {
      try {
        const updatedProgress = recordStep(
          progress,
          { courseId: course.id, missionId: mission.id, stepId, answer },
          courseCatalog,
          new Date()
        );
        onProgressChange?.(updatedProgress);
        saveProgressV2(updatedProgress, courseCatalog);
      } catch {
        // Non-fatal if step was already recorded
      }
    },
    [progress, course.id, mission.id, onProgressChange]
  );

  const currentStep = mission.steps[state.currentStepIndex];
  const stepCount = mission.steps.length;

  const getStageStatus = (stageKind: string, stageIdx: number): 'completed' | 'active' | 'upcoming' => {
    if (state.isComplete) {
      return 'completed';
    }
    if (currentStep.kind === stageKind) {
      return 'active';
    }

    const matchingIndices = mission.steps
      .map((step, idx) => (step.kind === stageKind ? idx : -1))
      .filter(idx => idx !== -1);

    if (matchingIndices.length > 0) {
      if (matchingIndices.every(idx => idx < state.currentStepIndex)) {
        return 'completed';
      }
      if (matchingIndices.every(idx => idx > state.currentStepIndex)) {
        return 'upcoming';
      }
      if (matchingIndices.includes(state.currentStepIndex)) {
        return 'active';
      }
    }

    const currentStageIndex = JOURNEY_STAGES.findIndex(s => s.kind === currentStep.kind);
    if (currentStageIndex !== -1) {
      if (stageIdx < currentStageIndex) return 'completed';
      if (stageIdx > currentStageIndex) return 'upcoming';
      return 'active';
    }

    return stageIdx <= Math.floor((state.currentStepIndex / mission.steps.length) * 7)
      ? 'completed'
      : 'upcoming';
  };

  const handleContinue = useCallback(() => {
    // Navigate to next mission in course, or back to course path
    const missionIndex = course.missions.findIndex(m => m.id === mission.id);
    const nextMission = course.missions[missionIndex + 1];
    if (nextMission) {
      window.location.hash = `#/mission/${course.id}/${nextMission.id}`;
    } else {
      window.location.hash = `#/course/${course.id}`;
    }
  }, [course, mission.id]);

  const handleReplay = useCallback(() => {
    completedSessionRef.current = null;
    const initial: MissionSessionSaved = {
      currentStepIndex: 0,
      answers: {},
      hintedStepIds: [],
      expandedMathStepIds: [],
      completedSimulationStepIds: [],
      recapCompleted: false,
    };
    dispatch({ type: 'restore', saved: initial });
  }, []);

  return (
    <section className="mission-player" aria-label={`Mission: ${mission.title}`}>
      {/* Navigation Header */}
      <header className="mission-player-header">
        <a
          className="contextual-back mission-close-link"
          href={`#/course/${course.id}`}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span>Back to {course.title} path</span>
        </a>

        <div className="mission-player-title">
          <span className="eyebrow">{course.title}</span>
          <h1>{mission.title}</h1>
        </div>

        <a
          className="icon-button mission-close-icon"
          href={`#/course/${course.id}`}
          aria-label="Close mission"
        >
          <X size={20} aria-hidden="true" />
        </a>
      </header>

      {/* 7-Segment Apple-Style Journey Progress Bar */}
      <nav className="mission-journey-bar" aria-label="Mission journey progress">
        {JOURNEY_STAGES.map((stage, idx) => {
          const status = getStageStatus(stage.kind, idx);
          return (
            <div
              key={stage.kind}
              className={`journey-segment is-${status}`}
              data-stage={stage.kind}
              data-status={status}
              aria-current={status === 'active' ? 'step' : undefined}
            >
              <div className="journey-segment-pill" aria-hidden="true" />
              <span className="journey-segment-label">
                {`${idx + 1} · ${stage.label}`}
              </span>
            </div>
          );
        })}
      </nav>
      <div className="sr-only" aria-live="polite">
        Step {state.currentStepIndex + 1} of {stepCount}: {currentStep.kind}
      </div>

      {/* Step View Area */}
      <main className="mission-step-view">
        {currentStep.kind === 'observe' && <ObserveStep step={currentStep} />}

        {(currentStep.kind === 'predict' || currentStep.kind === 'check') && (
          <AssessmentStep
            step={currentStep}
            state={state}
            dispatch={dispatch}
            onAnswered={handleAnswered}
          />
        )}

        {currentStep.kind === 'simulate' && (
          <SimulationStep
            step={currentStep}
            isCompleted={state.completedSimulationStepIds.includes(currentStep.id)}
            onComplete={() =>
              dispatch({ type: 'complete-simulation', stepId: currentStep.id })
            }
          />
        )}

        {currentStep.kind === 'math' && (
          <MathStep
            step={currentStep}
            state={state}
            dispatch={dispatch}
            onAnswered={handleAnswered}
          />
        )}

        {currentStep.kind === 'explain' && <ExplainStep step={currentStep} />}

        {currentStep.kind === 'recap' && (
          <RecapStep
            step={currentStep}
            state={state}
            mission={mission}
            courseId={course.id}
            settings={progress.settings}
            onContinue={handleContinue}
            onReplay={handleReplay}
          />
        )}
      </main>

      {/* Primary Action Footer (One prominent action per screen) */}
      <footer className="mission-player-footer">
        {state.currentStepIndex > 0 && currentStep.kind !== 'recap' && (
          <button
            type="button"
            className="secondary-button mission-back-btn"
            onClick={() => dispatch({ type: 'back' })}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back
          </button>
        )}

        {currentStep.kind !== 'recap' && (
          <div className="mission-next-wrapper">
            {!state.canAdvance && (
              <span className="mission-advance-hint" role="status">
                {currentStep.kind === 'predict' || currentStep.kind === 'check'
                  ? 'Answer the question above to continue'
                  : currentStep.kind === 'math'
                  ? 'Complete the math check above to continue'
                  : currentStep.kind === 'simulate'
                  ? 'Run the simulation to continue'
                  : 'Complete this step to continue'}
              </span>
            )}
            <button
              type="button"
              className="primary-button mission-next-btn"
              disabled={!state.canAdvance}
              onClick={() => dispatch({ type: 'next' })}
            >
              Next step
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        )}

        {currentStep.kind === 'recap' && !state.isComplete && (
          <button
            type="button"
            className="primary-button mission-complete-btn"
            disabled={!state.canAdvance}
            onClick={() => dispatch({ type: 'next' })}
          >
            Finish mission
            <Check size={16} aria-hidden="true" />
          </button>
        )}
      </footer>
    </section>
  );
}
