import { useEffect, useRef } from 'react';
import { ArrowLeft, X } from 'lucide-react';
import type { MathTutorialDefinition } from '../types';
import { Equation } from './Equation';
import { MathWidget } from './MathWidget';
import { AssessmentCard } from './AssessmentCard';
export function MathModal({ tutorial, onClose, onComplete, completed, prerequisites, onOpen }: { tutorial: MathTutorialDefinition; onClose: () => void; onComplete: () => void; completed: boolean; prerequisites: MathTutorialDefinition[]; onOpen: (id: string) => void }) {
  const container=useRef<HTMLDivElement>(null), closeRef=useRef(onClose); closeRef.current=onClose;
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null, overflow=document.body.style.overflow;
    document.body.style.overflow='hidden'; container.current?.querySelector<HTMLButtonElement>('button')?.focus();
    function key(e:KeyboardEvent){
      if(e.key==='Escape')closeRef.current();
      if(e.key!=='Tab')return;
      const all=container.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, a[href], select, [tabindex="0"]');
      if(!all?.length)return; const first=all[0],last=all[all.length-1];
      if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
      else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
    }
    window.addEventListener('keydown',key);
    return()=>{window.removeEventListener('keydown',key);document.body.style.overflow=overflow;previous?.focus();};
  },[]);
  useEffect(()=>{container.current?.scrollTo(0,0);},[tutorial.id]);
  return <div className="modal-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className="math-modal" role="dialog" aria-modal="true" aria-label={'Math tutorial: '+tutorial.title} ref={container}>
    <div className="modal-heading"><div><p className="eyebrow">Math, made tangible</p><h2>{tutorial.title}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close math tutorial"><X size={18}/></button></div>
    <div className="lesson-reading"><p>{tutorial.summary}</p>{prerequisites.length>0&&<div><span className="panel-label">Helpful first</span>{prerequisites.map(m=><button key={m.id} className="math-trigger" onClick={()=>onOpen(m.id)}>{m.title}</button>)}</div>}
      <MathWidget key={tutorial.id} tutorial={tutorial}/>{tutorial.explanation.map(p=><p key={p}>{p}</p>)}<div className="equation-card"><Equation value={tutorial.equation}/></div>
      <h3>A worked example</h3><p>{tutorial.workedExample.question}</p><ol className="step-list">{tutorial.workedExample.steps.map(s=><li key={s}>{s}</li>)}</ol><p className="answer-line">{tutorial.workedExample.answer}</p>
      <h3>Your turn</h3><AssessmentCard key={tutorial.id} assessment={tutorial.assessment} onCorrect={onComplete} answered={completed}/>
    </div><div className="math-modal-footer"><button className="primary-button" onClick={onClose}><ArrowLeft size={15}/>Return to experiment</button><span>{completed?'Understanding checked':'Your experiment stays where you left it.'}</span></div>
  </div></div>;
}
