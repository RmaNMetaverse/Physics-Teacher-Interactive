import { useEffect, useRef } from 'react';
import { MathfieldElement } from 'mathlive';
import 'mathlive/fonts.css';

MathfieldElement.soundsDirectory = null;
MathfieldElement.fontsDirectory = null; // Fonts are bundled by the CSS import above.

export function MathInput({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) {
  const host = useRef<HTMLDivElement>(null), field = useRef<MathfieldElement | null>(null);
  const change = useRef(onChange); change.current = onChange;
  useEffect(() => {
    const input = new MathfieldElement();
    input.setAttribute('aria-label', label);
    input.tabIndex = 0;
    input.addEventListener('pointerdown', () => input.focus());
    input.mathVirtualKeyboardPolicy = 'auto';
    input.addEventListener('input', () => change.current(input.value));
    host.current?.append(input); field.current = input;
    return () => { input.remove(); field.current = null; };
  }, [label]);
  useEffect(() => { if (field.current && field.current.value !== value) field.current.value = value; }, [value, label]);
  return <div className="workspace-math-input" ref={host} />;
}
