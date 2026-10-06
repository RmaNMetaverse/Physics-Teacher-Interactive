// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { courseCatalog } from '../src/learning/catalog';
import { mathTutorials } from '../src/content/math';
import { formulaReasoning } from '../src/learning/formula-reasoning';
import { ExplainStep } from '../src/components/mission/ExplainStep';
import { fireEvent } from '@testing-library/react';
import { detailedFormulaProofs } from '../src/learning/detailed-formula-proofs';
import katex from 'katex';

describe('formula reasoning coverage', () => {
  it('provides a detailed starting-point derivation for every mission and math tutorial', () => {
    expect(Object.keys(detailedFormulaProofs).sort()).toEqual(Object.keys(formulaReasoning).sort());
    for (const [id, proof] of Object.entries(detailedFormulaProofs)) {
      expect(proof.steps.length, id).toBeGreaterThanOrEqual(3);
      expect(proof.start.length, id).toBeGreaterThan(25);
      expect(proof.limits.length, id).toBeGreaterThan(25);
      expect(proof.steps.every(step => step.length > 25), id).toBe(true);
      for (const text of [proof.start, ...proof.steps, proof.limits]) {
        for (const match of text.matchAll(/\\\((.*?)\\\)/g)) {
          expect(() => katex.renderToString(match[1], { throwOnError: true, trust: false }), id).not.toThrow();
        }
      }
    }
  });

  it('keeps detailed proofs optional and lets learners open and close them', () => {
    const mission = courseCatalog.getMission('foundations', 'projectile-motion');
    const step = mission.steps.find(step => step.kind === 'explain');
    if (!step || step.kind !== 'explain') throw new Error('Missing step');
    const { container } = render(<ExplainStep step={step} mission={mission} />);
    const details = container.querySelector<HTMLDetailsElement>('.formula-detailed-proof')!;
    expect(details).toBeInTheDocument();
    expect(details.open).toBe(false);
    fireEvent.click(details.querySelector('summary')!);
    expect(details.open).toBe(true);
    expect(details).toHaveTextContent(/integrat/i);
    fireEvent.click(details.querySelector('summary')!);
    expect(details.open).toBe(false);
  });
  it('gives every published mission and math tutorial a model basis and mathematical steps', () => {
    const missions = [...courseCatalog.missions.values()].filter(mission => mission.kind === 'mission');
    for (const mission of missions) {
      const reasoning = formulaReasoning[mission.id];
      expect(reasoning, mission.id).toBeDefined();
      expect(reasoning.basis.length, mission.id).toBeGreaterThan(30);
      expect(reasoning.steps.length, mission.id).toBeGreaterThanOrEqual(2);
      expect(reasoning.steps.every(step => step.length > 20), mission.id).toBe(true);
    }
    for (const tutorial of mathTutorials) {
      const reasoning = formulaReasoning[tutorial.id];
      expect(reasoning, tutorial.id).toBeDefined();
      expect(reasoning.steps.length, tutorial.id).toBeGreaterThanOrEqual(2);
    }
    expect(Object.keys(formulaReasoning).sort()).toEqual([
      ...missions.map(mission => mission.id),
      ...mathTutorials.map(tutorial => tutorial.id),
    ].sort());
  });

  it('teaches projectile components and flight time before displaying the range equation', () => {
    const mission = courseCatalog.getMission('foundations', 'projectile-motion');
    const step = mission.steps.find(step => step.kind === 'explain');
    if (!step || step.kind !== 'explain') throw new Error('Projectile explanation missing');
    const { container } = render(<ExplainStep step={step} mission={mission} />);
    const proof = container.querySelector('.formula-reasoning');
    const equation = container.querySelector('.explain-math-card .equation-container');
    expect(proof).toHaveAttribute('aria-label', 'Where the Projectile motion formula comes from');
    expect(equation).toBeInTheDocument();
    expect(proof!.compareDocumentPosition(equation!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(proof).toHaveTextContent(/horizontal velocity/i);
    expect(proof).toHaveTextContent(/flight time/i);
    expect(proof!.querySelector('details')).toBeInTheDocument();
  });
});
