// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Equation } from '../src/components/Equation';
import { FormattedText } from '../src/components/FormattedText';

afterEach(cleanup);

describe('Equation', () => {
  it('exposes long display math as a keyboard and touch scroll region', () => {
    render(<Equation value={'E^2 = (pc)^2 + (mc^2)^2 + \\frac{p^4c^4}{M^2}'} label="Long energy equation" />);

    const equation = document.querySelector('[role="math"]');
    expect(equation).toBeInTheDocument();
    expect(equation).toHaveClass('equation-scroll-region');
    expect(equation).toHaveAttribute('tabindex', '0');
  });

  it('gives formulas in prose and worked examples the same accessible viewport as standalone equations', () => {
    const { container } = render(<FormattedText as="p" text={String.raw`Range: \(R=(v_0\cos\theta)(2v_0\sin\theta/g)=2v_0^2\sin\theta\cos\theta/g\). Also $$y=h+v_0\sin\theta\,t-\tfrac12gt^2.$$`} />);
    const equations = container.querySelectorAll('[role="math"]');
    expect(equations).toHaveLength(2);
    for (const equation of equations) {
      expect(equation).toHaveClass('equation-scroll-region');
      expect(equation).toHaveAttribute('aria-label');
      expect(equation.querySelector('math')).not.toBeNull();
    }
    expect(container.querySelector('p div')).not.toBeInTheDocument();
  });
});
