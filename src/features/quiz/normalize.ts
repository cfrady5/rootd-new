import type { Answers } from './quizSchema';

export function normalizeForScorer(answers: Answers){
  const out: Record<string, unknown> = {};
  for (const [k,v] of Object.entries(answers)){
    if (Array.isArray(v)) out[k] = v.map(x => typeof x === 'string' ? x : String(x));
    else if (typeof v === 'number' || typeof v === 'string') out[k] = v;
    else out[k] = JSON.stringify(v);
  }
  return out;
}