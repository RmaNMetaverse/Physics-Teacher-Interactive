// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Physics2D } from '../src/components/simulation/Physics2D';
import { evaluateModel, modelDefaults } from '../src/physics';
import { sampleTrajectory } from '../src/physics/scene';
import type { ModelId } from '../src/types';

const models: ModelId[] = ['vectors','motion','forces','energy','collisions','gravity','oscillations'];

afterEach(cleanup);

describe('interactive 2D physics renderer', () => {
  it('does not render decorative scenes for data-first models', () => {
    const parameters = modelDefaults('quantum');
    const { container } = render(<Physics2D modelId="quantum" parameters={parameters} state={evaluateModel('quantum', parameters, 0)} trajectory={sampleTrajectory('quantum', parameters)}/>);
    expect(container).toBeEmptyDOMElement();
  });
  it('uses the calculated pendulum position rather than a generic wave', () => {
    const parameters = { ...modelDefaults('oscillations'), mode: 1 };
    const { container, rerender } = render(<Physics2D modelId="oscillations" parameters={parameters} state={evaluateModel('oscillations', parameters, 0)} trajectory={sampleTrajectory('oscillations', parameters)}/>);
    const x = container.querySelector('[data-body="bob"] circle')?.getAttribute('cx');
    expect(container.querySelector('[data-pendulum-string]')).not.toBeNull();
    rerender(<Physics2D modelId="oscillations" parameters={parameters} state={evaluateModel('oscillations', parameters, .5)} trajectory={sampleTrajectory('oscillations', parameters)}/>);
    expect(container.querySelector('[data-body="bob"] circle')?.getAttribute('cx')).not.toBe(x);
  });
  for (const modelId of models) {
    it(`renders a finite, accessible live ${modelId} scene`, () => {
      const parameters = modelDefaults(modelId);
      const state = evaluateModel(modelId, parameters, .75);
      const trajectory = sampleTrajectory(modelId, parameters);
      const { container } = render(<Physics2D modelId={modelId} parameters={parameters} state={state} trajectory={trajectory}/>);
      expect(screen.getByRole('img', { name: `Live interactive ${modelId} simulation` })).toBeInTheDocument();
      expect(container.innerHTML).not.toMatch(/NaN|Infinity/);
    });
  }
});
