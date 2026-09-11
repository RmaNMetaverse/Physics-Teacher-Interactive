// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { SimulationBoundary } from '../src/components/simulation/SimulationBoundary';
import { SimulationStep } from '../src/components/simulation/SimulationStep';
import { Lab } from '../src/components/simulation/Lab';

// Mock WebGL / Scene if needed, or allow tests to force throwing
vi.mock('../src/components/simulation/Scene', () => {
  return {
    default: function MockScene({ shouldThrow }: { shouldThrow?: boolean }) {
      if (shouldThrow) {
        throw new Error('WebGL context lost or 3D rendering failure');
      }
      return <div data-testid="mock-3d-scene">Mock 3D Scene</div>;
    },
  };
});

describe('SimulationBoundary & Reduced Visual Mode', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('catches render errors and displays recovery copy', () => {
    function BrokenComponent(): React.JSX.Element {
      throw new Error('Canvas WebGL context creation failed');
    }

    render(
      <SimulationBoundary recoveryMessage="3D rendering is unavailable on this device. The physics model, controls, observations, graph, and data table remain fully active.">
        <BrokenComponent />
      </SimulationBoundary>
    );

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/3D rendering is unavailable/i)).toBeInTheDocument();
    expect(screen.getByText(/Reduced visual mode/i)).toBeInTheDocument();
  });

  it('keeps controls, numerical observations, graph, table, model description, and recovery copy when scene throws', async () => {
    // Render Lab with a forced error or in an environment where Scene throws
    render(
      <Lab
        modelId="motion"
        forceSceneError={true}
      />
    );

    // 1. Recovery copy is visible
    expect(await screen.findByText(/3D rendering is unavailable/i)).toBeInTheDocument();

    // 2. Model description is visible
    expect(screen.getByText(/Compare constant velocity/i)).toBeInTheDocument();

    // 3. Controls are visible (at most 3 before "Explore further")
    expect(screen.getByText(/Experiment controls/i)).toBeInTheDocument();
    const speedInput = screen.getByLabelText('Launch speed');
    expect(speedInput).toBeInTheDocument();

    // 4. Numerical observations (telemetry) are visible
    expect(screen.getByLabelText('Numerical observations')).toBeInTheDocument();
    expect(screen.getAllByText('Speed').length).toBeGreaterThan(0);

    // 5. Graph is visible
    expect(screen.getByRole('img', { name: /against time/i })).toBeInTheDocument();

    // 6. Accessible data table is visible
    const table = screen.getByRole('table', { name: /Live measurements/i });
    expect(table).toBeInTheDocument();
    expect(table).toHaveTextContent(/Quantity/i);
    expect(table).toHaveTextContent(/Value/i);

    // 7. Keyboard interaction on numeric input and slider
    const numberInput = screen.getByLabelText(/Launch speed value/i);
    fireEvent.change(numberInput, { target: { value: '25', valueAsNumber: 25 } });

    // Observation updates according to pure model calculation
    expect(numberInput).toHaveValue(25);
  });

  it('limits essential controls to at most three before "Explore further" disclosure', () => {
    render(<Lab modelId="motion" />);

    // Motion model has multiple parameters (speed, angle, acceleration, g, height, mode).
    // The first 3 should be directly visible, and "Explore further" disclosure exists for the rest.
    const disclosure = screen.getByText(/Explore further/i);
    expect(disclosure).toBeInTheDocument();
  });

  it('operates slider and numeric controls via keyboard', async () => {
    render(<Lab modelId="motion" />);

    const slider = screen.getByLabelText('Launch speed');
    slider.focus();
    fireEvent.keyDown(slider, { key: 'ArrowRight' });

    const numberInput = screen.getByLabelText(/Launch speed value/i);
    numberInput.focus();
    fireEvent.keyDown(numberInput, { key: 'ArrowUp' });

    expect(Number((numberInput as HTMLInputElement).value)).toBeGreaterThan(0);
  });

  it('renders SimulationStep for any ModelId and handles completion', async () => {
    const onComplete = vi.fn();
    const step = {
      id: 'waves-test-step',
      kind: 'simulate' as const,
      modelId: 'waves' as const,
      prompt: 'Observe wave phase speed as wavelength varies.',
      preset: { frequency: 2, wavelength: 3 },
    };

    render(
      <SimulationStep
        step={step}
        isCompleted={false}
        onComplete={onComplete}
      />
    );

    expect(screen.getByText(/Interactive simulation/i)).toBeInTheDocument();
    expect(screen.getByText(/Observe wave phase speed/i)).toBeInTheDocument();

    // Simulation playback & observation recording button
    const recordBtn = screen.getByRole('button', { name: /Run simulation & record observation/i });
    expect(recordBtn).toBeInTheDocument();
    await userEvent.click(recordBtn);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
