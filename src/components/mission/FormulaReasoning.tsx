import type { FormulaReasoning as FormulaReasoningContent } from '../../learning/formula-reasoning';
import { FormattedText } from '../FormattedText';

export function FormulaReasoning({ title, reasoning }: { title: string; reasoning: FormulaReasoningContent }) {
  return (
    <section className="formula-reasoning" role="region" aria-label={`Where the ${title} formula comes from`}>
      <h3>Where the formula comes from</h3>
      <p className="formula-reasoning-basis"><strong>Starting point:</strong> <FormattedText text={reasoning.basis} /></p>
      <ol className="formula-reasoning-steps">
        {reasoning.steps.map((step, index) => <li key={index}><FormattedText text={step} /></li>)}
      </ol>
      {reasoning.help && (
        <details className="formula-reasoning-help">
          <summary>Explain the harder math</summary>
          <FormattedText text={reasoning.help} as="p" />
        </details>
      )}
      <p className="formula-reasoning-result">Putting these steps together gives:</p>
    </section>
  );
}
