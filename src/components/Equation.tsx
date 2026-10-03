import katex from 'katex';
import { useEffect, useMemo, useRef, useState } from 'react';

export function Equation({ value = '', inline = false, label, className = '' }: { value: string; inline?: boolean; label?: string; className?: string }) {
  const viewport = useRef<HTMLSpanElement>(null);
  const [overflowing, setOverflowing] = useState(false);
  const html = useMemo(() => katex.renderToString(value, {
    displayMode: !inline,
    throwOnError: false,
    output: 'htmlAndMathml',
    trust: false,
  }), [value, inline]);
  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const measure = () => setOverflowing(element.scrollWidth > element.clientWidth + 1);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    // Observe both the available space and the typeset width (including font loading).
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    if (element.firstElementChild) observer.observe(element.firstElementChild);
    return () => observer.disconnect();
  }, [html]);
  return (
    <span className={`math-expression ${inline ? 'math-expression-inline' : 'math-expression-display'} ${className}`}>
      <span
        ref={viewport}
        className={`${inline ? 'equation-inline equation-inline-span' : 'equation-display'} equation-scroll-region`}
        role="math"
        aria-label={label ?? value}
        tabIndex={!inline || overflowing ? 0 : undefined}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {overflowing && <span className="equation-scroll-hint" aria-hidden="true">Scroll horizontally to see the full formula ↔</span>}
    </span>
  );
}
