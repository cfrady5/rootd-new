import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';

const KEY = 'rootd_quiz_v3';

type State = {
  answers: Record<string, unknown>;
  step: number;
  draftSavedAt: number | null;
};

type Action =
  | { type: 'setAnswer'; id: string; value: unknown }
  | { type: 'next' }
  | { type: 'prev' }
  | { type: 'jump'; step: number }
  | { type: 'load'; state: Partial<State> }
  | { type: 'saved'; at: number }
  | { type: 'clear' };

const initial: State = { answers: {}, step: 0, draftSavedAt: null };

function reducer(state: State, action: Action): State {
  switch (action.type){
    case 'setAnswer': return { ...state, answers: { ...state.answers, [action.id]: action.value } };
    case 'next': return { ...state, step: state.step + 1 };
    case 'prev': return { ...state, step: Math.max(0, state.step - 1) };
    case 'jump': return { ...state, step: Math.max(0, action.step) };
    case 'load': return { ...state, ...action.state } as State;
    case 'saved': return { ...state, draftSavedAt: action.at };
    case 'clear': return initial;
    default: return state;
  }
}

const Ctx = createContext<{state: State; dispatch: React.Dispatch<Action>} | null>(null);

export function QuizProvider({ children }: { children: React.ReactNode }){
  const [state, dispatch] = useReducer(reducer, initial);
  const t = useRef<number | null>(null);

  // load draft
  useEffect(() => {
    try { const raw = localStorage.getItem(KEY); if (raw) dispatch({ type:'load', state: JSON.parse(raw) }); } catch {}
  }, []);

  // save draft debounced
  useEffect(() => {
    if (t.current) clearTimeout(t.current);
    t.current = window.setTimeout(() => {
      try { localStorage.setItem(KEY, JSON.stringify(state)); dispatch({ type:'saved', at: Date.now() }); } catch {}
    }, 500);
    return () => { if (t.current) clearTimeout(t.current); };
  }, [state.answers, state.step]);

  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useQuiz(){
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
