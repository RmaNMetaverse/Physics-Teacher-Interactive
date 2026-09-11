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
  const progressPercent = Math.round(((state.currentStepIndex + 1) / stepCount) * 100);

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

      {/* Progress Bar */}
      <div className="mission-progress-container">
        <progress
          className="mission-step-progress"
          value={state.currentStepIndex + 1}
          max={stepCount}
          aria-label={`Mission progress: Step ${state.currentStepIndex + 1} of ${stepCount}`}
        >
          {progressPercent}%
        </progress>
        <span className="mission-progress-text">
          Step {state.currentStepIndex + 1} of {stepCount}
        </span>
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
