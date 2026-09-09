import { useState } from 'react';
import { Check, Lightbulb, ArrowRight } from 'lucide-react';
import type { Assessment } from '../types';
import { checkAnswer } from '../lib/assessment';
export function AssessmentCard({ assessment, index = 0, onCorrect, answered }: { assessment: Assessment; index?: number; onCorrect: (answer: number) => void; answered?: boolean }) {
  const [input, setInput] = useState<string | number>('');
  const [result, setResult] = useState<{ correct: boolean; message: string } | null>(null);
  const [hints, setHints] = useState(0);
  function submit() { const checked = checkAnswer(assessment, input); setResult(checked); if (checked.correct) onCorrect(assessment.answer); }
  return <section className="assessment">
    <div className="assessment-kind">{String(index + 1).padStart(2, '0')} / {assessment.kind === 'concept' ? 'Think it through' : assessment.kind === 'calculation' ? 'Work it out' : 'Put it to the test'} {answered && <Check size={12} aria-label="Previously answered correctly"/>}</div>
    <h3>{assessment.prompt}</h3>
    {assessment.options ? <div className="answer-options" role="group" aria-label={assessment.prompt}>{assessment.options.map((option, i) => <button key={option} className={'answer-option ' + (input === i ? 'selected' : '')} aria-pressed={input === i} onClick={() => { setInput(i); setResult(null); }}><span className="option-letter">{String.fromCharCode(65 + i)}</span>{option}</button>)}</div> :
      <div className="numeric-answer"><label className="sr-only" htmlFor={'answer-' + assessment.id}>Answer: {assessment.prompt}</label><input id={'answer-' + assessment.id} value={input} onChange={e => { setInput(e.target.value); setResult(null); }} inputMode="decimal" placeholder="Your answer" onKeyDown={e => { if (e.key === 'Enter') submit(); }} autoComplete="off"/>{assessment.unit && <span>{assessment.unit}</span>}</div>}
    <div className="assessment-actions"><button className="primary-button" onClick={submit} disabled={input === ''}>Check answer <ArrowRight size={14}/></button><button className="text-button" onClick={() => setHints(Math.min(hints + 1, assessment.hints.length))} disabled={hints >= assessment.hints.length}><Lightbulb size={14}/>{hints ? 'Another hint' : 'Give me a hint'}</button></div>
    {assessment.hints.slice(0, hints).map(h => <p className="hint" key={h}>{h}</p>)}
    {result && <div role="status" className={'feedback ' + (result.correct ? 'correct' : '')}><strong>{result.correct ? 'That’s right. ' : 'Keep exploring. '}</strong>{result.message}</div>}
  </section>;
}
