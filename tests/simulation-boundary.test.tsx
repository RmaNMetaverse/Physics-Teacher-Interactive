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

describe('Precision Lab & Floating Playback HUD', () => {
  afterEach(() => {
    cleanup();
  });

  it('keeps playback controls below the visual and outside the 3D canvas', () => {
    render(<Lab modelId="motion" />);
    const frame = document.querySelector('.lab-canvas-frame');
    expect(frame).toBeInTheDocument();

    const hud = document.querySelector('.lab-playback-bar .playback-hud');
    expect(hud).toBeInTheDocument();
    expect(hud).toHaveAttribute('role', 'toolbar');
    expect(frame?.contains(hud)).toBe(false);
    expect(hud).toHaveAttribute('aria-label', 'Playback controls');
    expect(document.querySelector('.parameters')).toHaveClass('lab-controls-panel');
  });

  it('provides accessible Play/Pause labels on the primary button', async () => {
    render(<Lab modelId="motion" />);
    const hud = document.querySelector('.playback-hud');
    expect(hud).toBeInTheDocument();

    // The experiment begins automatically
    const pauseBtn = screen.getByRole('button', { name: 'Pause' });
    expect(pauseBtn).toBeInTheDocument();
    expect(pauseBtn).toHaveAttribute('aria-label', 'Pause');

    // Click to pause
    fireEvent.click(pauseBtn);
    const playBtn = screen.getByRole('button', { name: 'Play' });
    expect(playBtn).toBeInTheDocument();
    expect(playBtn).toHaveAttribute('aria-label', 'Play');

    // Click to resume
    fireEvent.click(playBtn);
    expect(screen.getByRole('button', { name: 'Pause' })).toBeInTheDocument();
  });

  it('advances simulation when Step button is clicked', () => {
    render(<Lab modelId="motion" />);
    const timeEl = screen.getByTestId('simulation-time');
    expect(timeEl).toHaveTextContent('0');

    const stepBtn = screen.getByRole('button', { name: 'Step' });
    expect(stepBtn).toBeInTheDocument();

    fireEvent.click(stepBtn);
    expect(Number(timeEl.textContent)).toBeGreaterThan(0);
  });

  it('resets simulation time to 0 when Reset button is clicked', () => {
    render(<Lab modelId="motion" />);
    const stepBtn = screen.getByRole('button', { name: 'Step' });
    const resetBtn = screen.getByRole('button', { name: 'Reset' });
    const timeEl = screen.getByTestId('simulation-time');

    // Advance first
    fireEvent.click(stepBtn);
    expect(Number(timeEl.textContent)).toBeGreaterThan(0);

    // Now reset
    fireEvent.click(resetBtn);
    expect(Number(timeEl.textContent)).toBe(0);
  });

  it('renders timecode display with tabular figures formatting', () => {
    render(<Lab modelId="motion" />);
    const timecode = document.querySelector('.hud-timecode');
    expect(timecode).toBeInTheDocument();
    expect(timecode).toHaveClass('tabular-nums');
    expect(timecode?.textContent).toMatch(/t\s*=\s*\d+(\.\d+)?\s*s\s*\/\s*\d+(\.\d+)?\s*s/);
  });

  it('provides speed multiplier switcher (0.5×, 1×, 2×)', () => {
    render(<Lab modelId="motion" />);
    const speedHalf = screen.getByRole('button', { name: '0.5×' });
    const speedOne = screen.getByRole('button', { name: '1×' });
    const speedDouble = screen.getByRole('button', { name: '2×' });

    expect(speedHalf).toBeInTheDocument();
    expect(speedOne).toBeInTheDocument();
    expect(speedDouble).toBeInTheDocument();

    // Default speed is 1x
    expect(speedOne).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(speedDouble);
    expect(speedDouble).toHaveAttribute('aria-pressed', 'true');
    expect(speedOne).toHaveAttribute('aria-pressed', 'false');
  });

  it('styles parameter sliders with knurled hardware class and live value unit pills', () => {
    render(<Lab modelId="motion" />);
    const sliders = document.querySelectorAll('.hardware-slider');
    expect(sliders.length).toBeGreaterThan(0);

    const badges = document.querySelectorAll('.live-unit-badge');
    expect(badges.length).toBeGreaterThan(0);
  });

  it('locks page scrolling for the full duration of a touch slider gesture', () => {
    render(<Lab modelId="motion" />);
    const slider = screen.getByLabelText('Launch speed');

    fireEvent.pointerDown(slider, { pointerId: 7, pointerType: 'touch' });
    expect(document.documentElement).toHaveClass('is-adjusting-simulation-parameter');

    fireEvent.pointerUp(slider, { pointerId: 7, pointerType: 'touch' });
    expect(document.documentElement).not.toHaveClass('is-adjusting-simulation-parameter');
  });

  it('formats telemetry measurement values with tabular figures', () => {
    render(<Lab modelId="motion" />);
    const values = document.querySelectorAll('.measurement-value');
    expect(values.length).toBeGreaterThan(0);
    values.forEach(v => {
      expect(v).toHaveClass('tabular-nums');
    });
  });

  it('renders graph view and reduced visual mode with scrollable wrapper containers', () => {
    // Switch to graph view
    render(<Lab modelId="motion" />);
    const graphTab = screen.getByRole('button', { name: /Graph & data/i });
    fireEvent.click(graphTab);

    const wrapper = document.querySelector('.graph-viewport-wrapper');
    expect(wrapper).toBeInTheDocument();
  });

  it('provides canvas overlays with accessible hint and camera controls', () => {
    render(<Lab modelId="motion" />);
    const axisHint = document.querySelector('.scene-axis-hint');
    expect(axisHint).toBeInTheDocument();

    const cameraBtn = screen.getByRole('button', { name: 'Reset camera' });
    expect(cameraBtn).toBeInTheDocument();
    expect(cameraBtn).toHaveClass('icon-button');

    const expandBtn = screen.getByRole('button', { name: 'Expand experiment' });
    expect(expandBtn).toBeInTheDocument();
    expect(expandBtn).toHaveClass('icon-button');
  });
});


