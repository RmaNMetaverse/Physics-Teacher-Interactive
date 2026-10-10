import { foundationEnrichment } from '../../learning/foundation-enrichment';
import { FormattedText } from '../FormattedText';

export function FoundationEnrichment({ missionId }: { missionId: string }) {
  const content = foundationEnrichment[missionId];
  if (!content) return null;
  return <div className="foundation-enrichment" data-objective-id={content.objectiveId}>
    <details className="formula-reasoning-help"><summary>Another worked example: test the limits</summary><FormattedText as="p" text={content.example.question} /><ol>{content.example.steps.map((step,index) => <li key={index}><FormattedText text={step} /></li>)}</ol><FormattedText as="p" text={content.example.answer} /></details>
    <details className="formula-reasoning-help"><summary>{content.misconception.question}</summary><FormattedText as="p" text={content.misconception.explanation} /></details>
  </div>;
}
