import React, { useMemo } from 'react';
import RootLayout from '../../app/RootLayout.jsx';
import { QuizProvider, useQuiz } from './QuizProvider';
import PageHeader from '../../components/ui/PageHeader.jsx';
import Button from '../../components/ui/Button.jsx';
import QuestionRenderer from './QuestionRenderer.jsx';
import { validate } from './validators';
import quizQuestions from '../../data/quizQuestions.js';

function QuizInner(){
  const { state, dispatch } = useQuiz();
  const QUESTIONS = quizQuestions.map(q => ({
    id: String(q.id),
    title: q.question,
    description: q.category,
    type: q.type,
    options: q.options,
    min: q.min, max: q.max, step: q.step,
    fields: q.fields, maxRank: q.max
  }));
  const q = QUESTIONS[state.step] || null;

  const { error } = useMemo(() => {
    if (!q) return { error: null };
    const res = validate(state.answers[q.id], q);
    return { error: res.ok ? null : res.message };
  }, [state.answers, q]);

  return (
    <RootLayout>
      <PageHeader title="Quiz" description={`Question ${Math.min(state.step+1, QUESTIONS.length)} of ${QUESTIONS.length}`} />

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
