// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Physics2D } from '../src/components/simulation/Physics2D';
import { evaluateModel, modelDefaults } from '../src/physics';
import { sampleTrajectory } from '../src/physics/scene';
import type { ModelId } from '../src/types';

const models: ModelId[] = ['measurement','vectors','motion','forces','energy','collisions','gravity','oscillations','waves','thermal','electromagnetism','optics','relativity','quantum','atomic','nuclear','particle','condensed','astrophysics','cosmology'];

afterEach(cleanup);

describe('interactive 2D physics renderer', () => {
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
