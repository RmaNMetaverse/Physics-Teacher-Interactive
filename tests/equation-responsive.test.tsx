// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { Equation } from '../src/components/Equation';

afterEach(cleanup);

describe('Equation', () => {
  it('exposes long display math as a keyboard and touch scroll region', () => {
    render(<Equation value={'E^2 = (pc)^2 + (mc^2)^2 + \\frac{p^4c^4}{M^2}'} label="Long energy equation" />);

    const equation = document.querySelector('[role="math"]');
    expect(equation).toBeInTheDocument();
    expect(equation).toHaveClass('equation-scroll-region');
    expect(equation).toHaveAttribute('tabindex', '0');
  });
});