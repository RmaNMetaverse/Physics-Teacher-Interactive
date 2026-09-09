import katex from 'katex';
export function Equation({ value }: { value: string }) {
  return <div className="equation-display" dangerouslySetInnerHTML={{ __html: katex.renderToString(value, { displayMode: true, throwOnError: false, output: 'htmlAndMathml', trust: false }) }}/>;
}
