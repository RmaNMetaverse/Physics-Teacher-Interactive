import type { FormulaReasoning as FormulaReasoningContent } from '../../learning/formula-reasoning';
import { FormattedText } from '../FormattedText';
import { useState } from 'react';

export function FormulaReasoning({ title, reasoning }: { title: string; reasoning: FormulaReasoningContent }) {
  const [openedProof, setOpenedProof] = useState<string | null>(null);
  const detailedOpen = openedProof === title;
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
      {reasoning.detailed && (
        <details className="formula-detailed-proof" open={detailedOpen} aria-label={`Detailed proof for ${title}`}>
          <summary onClick={event => { event.preventDefault(); setOpenedProof(open => open === title ? null : title); }}>
            <span>Detailed proof, step by step</span><small>Optional</small>
          </summary>
          {detailedOpen && <div className="formula-proof-content">
            <p><strong>Start from:</strong> <FormattedText text={reasoning.detailed.start} /></p>
            <ol className="formula-reasoning-steps">
              {reasoning.detailed.steps.map((step, index) => <li key={index}><FormattedText text={step} /></li>)}
            </ol>
            <p className="formula-proof-limits"><strong>What this proves—and its limits:</strong> <FormattedText text={reasoning.detailed.limits} /></p>
            {reasoning.detailed.sources && <ul className="formula-proof-sources">
              {reasoning.detailed.sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}
            </ul>}
          </div>}
        </details>
      )}
      <p className="formula-reasoning-result">Putting these steps together gives:</p>
    </section>
  );
}
