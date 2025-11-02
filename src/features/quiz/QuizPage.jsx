import React, { useMemo } from 'react';
import RootLayout from '../../app/RootLayout.jsx';
import { QuizProvider, useQuiz } from './QuizProvider';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import QuestionRenderer from './QuestionRenderer.jsx';
import { validate } from './validators';

const QUESTIONS = [
  { id:'q1', title:'What is your sport?', type:'single', options:['Basketball','Football','Soccer'] },
  { id:'q2', title:'How many hours/week do you train?', type:'slider', min:0, max:40, step:1 },
];

function QuizInner(){
  const { state, dispatch } = useQuiz();
  const q = QUESTIONS[state.step] || null;

  const { error } = useMemo(() => {
    if (!q) return { error: null };
    const res = validate(state.answers[q.id], q);
    return { error: res.ok ? null : res.message };
  }, [state.answers, q]);

  return (
    <RootLayout>
      <PageHeader title="Quiz" description="Answer a few questions to get matched." />

      {q ? (
        <div style={{display:'grid',gap:16}}>
          <h3 style={{margin:'0 0 4px'}}>{q.title}</h3>
          <QuestionRenderer question={q} value={state.answers[q.id]} onChange={(v)=>dispatch({ type:'setAnswer', id:q.id, value:v })} error={error} />
          <div style={{display:'flex',gap:12,marginTop:8}}>
            <Button variant="secondary" onClick={()=>dispatch({ type:'prev' })}>Back</Button>
            <Button onClick={()=>dispatch({ type:'next' })} disabled={!!error}>Next</Button>
          </div>
        </div>
      ) : (
        <div>
          <h3>Review</h3>
          <pre style={{background:'#fff',padding:16,border:'1px solid var(--color-border)',borderRadius:12}}>{JSON.stringify(state.answers,null,2)}</pre>
          <Button onClick={()=>alert('Submit stub')}>Submit</Button>
        </div>
      )}
    </RootLayout>
  );
}

export default function QuizPage(){
  return (
    <QuizProvider>
      <QuizInner/>
    </QuizProvider>
  );
}
