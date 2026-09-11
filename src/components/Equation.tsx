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
      className={inline ? 'equation-inline' : 'equation-display'}
      role="math"
      aria-label={label ?? value}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
