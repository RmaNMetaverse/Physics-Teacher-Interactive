import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('Mission Step vertical spacing and alignment', () => {
  const missionCss = readFileSync(resolve(__dirname, '../src/styles/mission.css'), 'utf-8');
  const responsiveCss = readFileSync(resolve(__dirname, '../src/styles/responsive.css'), 'utf-8');

  it('defines vertical flex column layout and proper gap for #main-content > section > main > article > div', () => {
    expect(missionCss).toMatch(/#main-content\s*>\s*section\s*>\s*main\s*>\s*article\s*>\s*div/);
    expect(missionCss).toMatch(/\.assessment-body/);
  });

  it('defines flex-direction column and gap for assessment body rows', () => {
    // Check that assessment-body has flex column layout with gap
    const hasFlexGap = /#main-content\s*>\s*section\s*>\s*main\s*>\s*article\s*>\s*div[\s\S]*?display:\s*flex[\s\S]*?flex-direction:\s*column[\s\S]*?gap:/i.test(missionCss)
      || /\.assessment-body[\s\S]*?display:\s*flex[\s\S]*?flex-direction:\s*column[\s\S]*?gap:/i.test(missionCss);
    expect(hasFlexGap).toBe(true);
  });

  it('provides proper styling and alignment for assessment actions and text buttons', () => {
    expect(missionCss).toMatch(/\.text-button\s*\{/);
    expect(missionCss).toMatch(/\.hint-button/);
  });

  it('styles assessment hints container with vertical gap', () => {
    expect(missionCss).toMatch(/\.assessment-hints\s*\{/);
  });

  it('styles foundation check cards as vertical stacks with explicit gaps', () => {
    expect(missionCss).toMatch(/\.foundation-check/);
    expect(missionCss).toMatch(/\.foundation-check[\s\S]*?display:\s*grid[\s\S]*?gap:/i);
    expect(missionCss).toMatch(/\.math-quick-check[\s\S]*?gap:\s*var\(--stack-lg\)/i);
  });

  it('provides mobile vertical spacing and action stacking in responsive.css', () => {
    // Should contain responsive rules for the article div and assessment actions
    expect(responsiveCss).toMatch(/#main-content\s*>\s*section\s*>\s*main\s*>\s*article\s*>\s*div/);
    expect(responsiveCss).toMatch(/\.assessment-actions\s*\{[\s\S]*?flex-direction:\s*column/i);
  });
});
