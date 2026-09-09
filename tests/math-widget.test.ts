import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { MathWidget } from '../src/components/MathWidget';
import { mathTutorials } from '../src/content';
const render = (id: string, initial?: number) => {
  const source = mathTutorials.find(t => t.id === `math-${id}`)!;
  const tutorial = initial === undefined ? source : {...source, interactive:{...source.interactive,initial}};
  return renderToStaticMarkup(createElement(MathWidget,{tutorial}));
};
describe('instructional mathematics diagrams', () => {
  it('shows both ends of signed addition including a zero crossing', () => {
    const markup = render('signed-numbers',-2);
    expect(markup).toContain('Start −2');
    expect(markup).toContain('Result 1');
    expect(markup).toContain('+3');
  });
  it('represents multiplication with groups and algebra with reversible steps', () => {
    expect(render('ratios',4)).toContain('4 groups of 3');
    const algebra = render('algebra',17);
    expect(algebra).toContain('17 − 3 = 14');
    expect(algebra).toContain('14 ÷ 2 = 7');
  });
  it('renders the full function graph and labels a rate rise for a unit run', () => {
    expect(render('functions',-2)).toContain('data-diagram="function-line"');
    const rates = render('rates',-3);
    expect(rates).toContain('run = 1');
    expect(rates).toContain('rise = −3');
  });
  it('uses a fixed square scale so doubling a side quadruples depicted area', () => {
    const square = (n:number) => {
      const tag=render('geometry',n).match(/<rect[^>]*data-diagram="square"[^>]*>/)![0];
      return {width:Number(tag.match(/width="([^"]+)"/)![1]),height:Number(tag.match(/height="([^"]+)"/)![1])};
    };
    const a=square(2),b=square(4);
    expect(a.width).toBe(a.height);
    expect(b.width*b.height/(a.width*a.height)).toBeCloseTo(4);
  });
  it('keeps every supported slider endpoint finite and visible in the SVG view box', () => {
    for (const tutorial of mathTutorials) for (const value of [tutorial.interactive.min,tutorial.interactive.max]) {
      const markup=render(tutorial.id.replace('math-',''),value);
      expect(markup,tutorial.id).not.toMatch(/NaN|Infinity/);
      expect(markup,tutorial.id).toContain('role="img"');
      for (const match of markup.matchAll(/\b(?:cx|x1|x2)="(-?[\d.]+)"/g)) {
        expect(Number(match[1]),tutorial.id).toBeGreaterThanOrEqual(0);
        expect(Number(match[1]),tutorial.id).toBeLessThanOrEqual(420);
      }
      for (const match of markup.matchAll(/\b(?:cy|y1|y2)="(-?[\d.]+)"/g)) {
        expect(Number(match[1]),tutorial.id).toBeGreaterThanOrEqual(0);
        expect(Number(match[1]),tutorial.id).toBeLessThanOrEqual(180);
      }
    }
  });
});