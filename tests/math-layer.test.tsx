// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { MathStep } from '../src/components/mission/MathStep';
import { createMissionSession } from '../src/learning/mission-engine';
import type { MissionDefinition, MissionStep } from '../src/learning/types';

const mathMission: MissionDefinition = {
  id: 'test-math-mission',
  kind: 'mission',
  title: 'Test Math Mission',
  summary: 'Testing math layer.',
  objectives: ['Learn math.'],
  minutes: 5,
  xp: 50,
  requiredMath: ['math-arithmetic'],
  modelId: 'motion',
  scienceStatus: 'established',
  equation: 'v = x / t',
  symbols: 'v: speed, x: position, t: time',
  workedExample: {
    question: 'What is 10 divided by 2?',
    steps: ['Divide 10 by 2.'],
    answer: '5 m/s',
  },
  reviewedAt: '2026-09-10',
  steps: [
    {
      id: 'step-math',
      kind: 'math',
      title: 'Speed equation',
      layer: {
        quick: {
          equation: 'v = \\frac{x}{t}',
          summary: 'Speed is distance divided by time.',
          symbols: [
            { symbol: 'v', meaning: 'speed', unit: 'm/s' },
            { symbol: 'x', meaning: 'distance', unit: 'm' },
            { symbol: 't', meaning: 'time', unit: 's' },
          ],
        },
        foundation: {
          title: 'Understanding Division and Rates',
          concepts: [
            'Division distributes a total into equal portions.',
            'A rate compares change over time.',
          ],
          explanation: [
            'To find how fast something moves, divide the distance traveled by the time taken.',
          ],
          prerequisites: [
            { id: 'math-arithmetic', returnTo: 'step-math' },
          ],
          returnTo: 'step-math',
          visual: {
            tutorialId: 'math-arithmetic',
            label: 'Distance control',
            kind: 'number',
            min: 0,
            max: 20,
            step: 1,
            initial: 10,
            instruction: 'Adjust the slider to observe how the value changes.',
          },
          workedExample: {
            question: 'If a runner covers 100 m in 20 s, what is their speed?',
            steps: [
              'Identify the given values: distance = 100 m, time = 20 s.',
              'Apply the formula: v = x / t.',
              'Calculate: 100 / 20 = 5.',
            ],
            answer: '5 m/s',
          },
          check: {
            id: 'check-speed',
            kind: 'calculation',
            prompt: 'Calculate the speed when distance is 50 m and time is 5 s.',
            answer: 10,
            tolerance: 0.1,
            unit: 'm/s',
            hints: ['Divide 50 by 5.'],
            explanation: '50 divided by 5 equals 10 m/s.',
          },
        },
      },
    },
    { id: 'step-recap', kind: 'recap', takeaways: ['Speed relates distance and time.'] },
  ],
  sources: [{ label: 'Physics Principles', url: 'https://example.com' }],
  limitations: ['One dimensional motion.'],
};

describe('MathStep component', () => {
  afterEach(() => {
    cleanup();
  });

  const mathStep = mathMission.steps[0] as Extract<MissionStep, { kind: 'math' }>;

  it('renders quick mode with summary and symbols, expanding to foundation on request', async () => {
    const user = userEvent.setup();
    const state = createMissionSession(mathMission);
    const dispatch = vi.fn();

    render(<MathStep step={mathStep} state={state} dispatch={dispatch} />);

    // Quick mode summary is visible, foundation title is not
    expect(screen.getByText(mathStep.layer.quick.summary)).toBeVisible();
    expect(screen.queryByText(mathStep.layer.foundation.title)).not.toBeInTheDocument();

    // Symbols are displayed
    expect(screen.getByText('speed')).toBeVisible();
    expect(screen.getByText('distance')).toBeVisible();
    expect(screen.getByText('time')).toBeVisible();

    // Click "Teach me the math"
    const teachButton = screen.getByRole('button', { name: /teach me the math/i });
    await user.click(teachButton);

    // Foundation title and concepts are now visible
    expect(screen.getByText(mathStep.layer.foundation.title)).toBeVisible();
    expect(screen.getByText(/Division distributes a total into equal portions/i)).toBeVisible();
    expect(dispatch).toHaveBeenCalledWith({ type: 'toggle-math-foundation', stepId: 'step-math' });
  });

  it('reveals worked steps sequentially and presents the check assessment', async () => {
    const user = userEvent.setup();
    const state = createMissionSession(mathMission, {
      currentStepIndex: 0,
      answers: {},
      hintedStepIds: [],
      expandedMathStepIds: ['step-math'],
      completedSimulationStepIds: [],
      recapCompleted: false,
    });
    const dispatch = vi.fn();

    render(<MathStep step={mathStep} state={state} dispatch={dispatch} />);

    expect(screen.getByText(mathStep.layer.foundation.title)).toBeVisible();
    expect(screen.getByText(mathStep.layer.foundation.workedExample.question)).toBeVisible();

    // Step 1 should be visible
    expect(screen.getByText(mathStep.layer.foundation.workedExample.steps[0])).toBeVisible();

    // Next step button reveals step 2
    const nextStepBtn = screen.getByRole('button', { name: /next step|reveal step/i });
    await user.click(nextStepBtn);
    expect(screen.getByText(mathStep.layer.foundation.workedExample.steps[1])).toBeVisible();

    // Next step button reveals step 3 and answer
    await user.click(nextStepBtn);
    expect(screen.getByText(mathStep.layer.foundation.workedExample.steps[2])).toBeVisible();
    expect(screen.getByText(/5 m\/s/)).toBeVisible();

    // Interactive visual slider
    expect(screen.getByLabelText(/Distance control/i)).toBeVisible();
    expect(screen.getByText(/Adjust the slider to observe/i)).toBeVisible();

    // Assessment check prompt is visible
    expect(screen.getByText(mathStep.layer.foundation.check.prompt)).toBeVisible();

    // Enter answer and check
    const input = screen.getByPlaceholderText(/your answer/i);
    await user.type(input, '10');
    await user.click(screen.getByRole('button', { name: /check answer/i }));
    expect(dispatch).toHaveBeenCalledWith({ type: 'answer', stepId: 'step-math', value: 10 });
  });

  it('handles nested prerequisite navigation and restores focus', async () => {
    const user = userEvent.setup();
    const state = createMissionSession(mathMission, {
      currentStepIndex: 0,
      answers: {},
      hintedStepIds: [],
      expandedMathStepIds: ['step-math'],
      completedSimulationStepIds: [],
      recapCompleted: false,
    });
    const dispatch = vi.fn();

    render(<MathStep step={mathStep} state={state} dispatch={dispatch} />);

    // Click prerequisite button
    const prereqButton = screen.getByRole('button', { name: /arithmetic/i });
    prereqButton.focus();
    await user.click(prereqButton);

    // Prerequisite tutorial details visible
    expect(screen.getByRole('heading', { name: /arithmetic/i })).toBeVisible();

    // Return from prerequisite
    const returnPrereqBtn = screen.getByRole('button', { name: /return to understanding division|back to understanding division/i });
    await user.click(returnPrereqBtn);

    // Focus restored to the prerequisite button
    expect(screen.getByRole('button', { name: /arithmetic/i })).toHaveFocus();
  });

  it('restores focus when closing the math foundation view', async () => {
    const user = userEvent.setup();
    const state = createMissionSession(mathMission);
    const dispatch = vi.fn();

    render(<MathStep step={mathStep} state={state} dispatch={dispatch} />);

    const teachButton = screen.getByRole('button', { name: /teach me the math/i });
    teachButton.focus();
    await user.click(teachButton);

    expect(screen.getByText(mathStep.layer.foundation.title)).toBeVisible();

    const closeButton = screen.getByRole('button', { name: /close math foundation/i });
    await user.click(closeButton);

    expect(screen.queryByText(mathStep.layer.foundation.title)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /teach me the math/i })).toHaveFocus();
  });
});
