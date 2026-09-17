import katex from 'katex';

export function Equation({ value = '', inline = false, label }: { value: string; inline?: boolean; label?: string }) {
  const html = katex.renderToString(value, {
    displayMode: !inline,
    throwOnError: false,
    output: 'htmlAndMathml',
    trust: false,
  });
  return (
    <div
      className={inline ? 'equation-inline' : 'equation-display equation-scroll-region'}
      role="math"
      aria-label={label ?? value}
      tabIndex={inline ? undefined : 0}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
