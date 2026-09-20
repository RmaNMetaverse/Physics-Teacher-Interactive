import { BookMarked, Compass, ExternalLink, FileText, FlaskConical, Layers, ShieldAlert } from 'lucide-react';
import type { MissionDefinition } from '../../learning/types';
import { mathTutorials } from '../../content/math';
import { Equation } from '../Equation';
import { FormulaReasoning } from './FormulaReasoning';
import { formulaReasoning } from '../../learning/formula-reasoning';

interface DeepDiveProps {
  mission: MissionDefinition;
  courseId?: string;
}

export function DeepDive({ mission }: DeepDiveProps) {
  const isNormal = mission.kind === 'mission';
  const explainSteps = mission.steps.filter(
    (step): step is Extract<typeof step, { kind: 'explain' }> => step.kind === 'explain'
  );
  const observeSteps = mission.steps.filter(
    (step): step is Extract<typeof step, { kind: 'observe' }> => step.kind === 'observe'
  );

  return (
    <article className="deep-dive-section" aria-label={`Deep dive: ${mission.title}`}>
      <header className="deep-dive-header">
        <span className="deep-dive-badge">
          <Layers size={16} aria-hidden="true" />
          Deep dive
        </span>
        <h2>Complete physical and mathematical treatment</h2>
        <p className="deep-dive-intro">
          Mathematical deductions from stated physical models, scientific assumptions,
          and authoritative references for {mission.title}.
        </p>
      </header>

      {/* 1. Derivation and Mathematics */}
      <section className="deep-dive-block" aria-labelledby="deep-dive-math">
        <h3 id="deep-dive-math">
          <BookMarked size={18} aria-hidden="true" />
          Derivation & mathematical formulation
        </h3>
        {isNormal && mission.equation && (
          <div className="deep-dive-equation-card">
            <FormulaReasoning title={mission.title} reasoning={formulaReasoning[mission.id]} />
            <Equation value={mission.equation} />
            {mission.symbols && <p className="equation-symbols"><strong>Symbols:</strong> {mission.symbols}</p>}
          </div>
        )}

        {isNormal && mission.workedExample && (
          <div className="deep-dive-example">
            <h4>Detailed worked calculation</h4>
            <p className="example-q"><strong>Problem:</strong> {mission.workedExample.question}</p>
            <ol className="example-steps">
              {mission.workedExample.steps.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
            <p className="example-ans"><strong>Solution:</strong> {mission.workedExample.answer}</p>
          </div>
        )}

        {mission.requiredMath.length > 0 && (
          <div className="deep-dive-prereqs">
            <h4>Required mathematical foundations</h4>
            <ul>
              {mission.requiredMath.map(mathId => {
                const tutorial = mathTutorials.find(t => t.id === mathId);
                return (
                  <li key={mathId}>
                    <strong>{tutorial?.title ?? mathId}:</strong> {tutorial?.summary ?? 'Mathematical concept'}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </section>

      {/* 2. Comprehensive Physical Explanation */}
      <section className="deep-dive-block" aria-labelledby="deep-dive-explanation">
        <h3 id="deep-dive-explanation">
          <FileText size={18} aria-hidden="true" />
          Full physical explanation & scientific status
        </h3>
        <div className="science-status-banner" data-status={mission.scienceStatus}>
          <strong>Scientific status:</strong>{' '}
          {mission.scienceStatus === 'established'
            ? 'Established consensus physics rigorously validated by reproducible empirical observation.'
            : mission.scienceStatus === 'active-research'
              ? 'Active research area with ongoing theoretical refinement and experimental testing.'
              : mission.scienceStatus === 'interpretation'
                ? 'Standard theoretical interpretation supported by current quantum/relativistic frameworks.'
                : 'Speculative proposal exploring potential physical frontiers.'}
        </div>

        <div className="deep-dive-text">
          <h4>Core objectives</h4>
          <ul>
            {mission.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>

          {observeSteps.length > 0 && (
            <>
              <h4>Phenomenological observations</h4>
              {observeSteps.map(step => (
                <div key={step.id} className="deep-dive-subtext">
                  <h5>{step.title}</h5>
                  {step.body.map((p, idx) => (
                    <p key={idx}>{p}</p>
                  ))}
                </div>
              ))}
            </>
          )}

          {(isNormal && mission.detailedExplanation?.length) || explainSteps.length > 0 ? (
            <>
              <h4>Theoretical mechanism</h4>
              <div className="deep-dive-subtext">
                {isNormal && mission.detailedExplanation?.length ? (
                  mission.detailedExplanation.map((paragraph, index) => <p key={index}>{paragraph}</p>)
                ) : (
                  explainSteps.flatMap(step => step.body).map((paragraph, index) => <p key={index}>{paragraph}</p>)
                )}
              </div>
            </>
          ) : null}
        </div>
      </section>

      {/* 3. Model Assumptions and Limitations */}
      <section className="deep-dive-block" aria-labelledby="deep-dive-limitations">
        <h3 id="deep-dive-limitations">
          <ShieldAlert size={18} aria-hidden="true" />
          Model assumptions & physical limitations
        </h3>
        <p className="limitations-intro">
          Every scientific model represents an abstraction with defined domain boundaries. The model in this mission applies under the following constraints:
        </p>
        <ul className="limitations-list">
          {mission.limitations.map((limitation, idx) => (
            <li key={idx}>{limitation}</li>
          ))}
        </ul>
      </section>

      {/* 4. Experiments & Exploration Ideas */}
      <section className="deep-dive-block" aria-labelledby="deep-dive-experiments">
        <h3 id="deep-dive-experiments">
          <FlaskConical size={18} aria-hidden="true" />
          Suggested experimental investigations
        </h3>
        <p>
          Investigate how the system responds to parameter variations in the interactive model
          {mission.modelId ? ` (${mission.modelId})` : ''}:
        </p>
        <ul>
          <li><strong>Extreme values:</strong> Test asymptotic limits (e.g. tending toward zero or extreme magnitudes) to check conservation laws.</li>
          <li><strong>Symmetry checks:</strong> Observe whether time reversal, spatial inversion, or parameter scaling preserve the expected invariants.</li>
          <li><strong>Physical sensitivity:</strong> Evaluate which parameter dominates system evolution over extended integration times.</li>
        </ul>
      </section>

      {/* 5. Sources and References */}
      <section className="deep-dive-block" aria-labelledby="deep-dive-sources">
        <h3 id="deep-dive-sources">
          <Compass size={18} aria-hidden="true" />
          Authoritative sources & literature
        </h3>
        <ul className="sources-list">
          {mission.sources.map(source => (
            <li key={source.url}>
              <a href={source.url} target="_blank" rel="noopener noreferrer">
                {source.label} <ExternalLink size={14} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
