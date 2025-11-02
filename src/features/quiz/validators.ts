import { QuizQuestion, QuizQuestionType } from './quizSchema';

export type ValidationResult = { ok: boolean; message?: string };

export const validators: Record<string, (value: unknown, q: QuizQuestion) => ValidationResult> = {
  single: (v) => ({ ok: typeof v === 'string' && v.length > 0, message: 'Choose an option' }),
  multiple: (v) => ({ ok: Array.isArray(v) && v.length > 0, message: 'Select at least one' }),
  slider: (v, q) => {
    if (typeof v !== 'number') return { ok: false, message: 'Select a value' };
    const min = q.min ?? 0; const max = q.max ?? 100;
    return { ok: v >= min && v <= max, message: `Value must be ${min}-${max}` };
  },
  ranked: (v, q) => ({ ok: Array.isArray(v) && (q.options ? v.length === q.options.length : v.length>0), message: 'Rank all options' }),
  text: (v) => ({ ok: typeof v === 'string' && v.trim().length > 0, message: 'Required' }),
  multiNumber: (v) => ({ ok: Array.isArray(v) && v.every(n => typeof n === 'number'), message: 'Enter valid numbers' }),
};

export function validate(value: unknown, q: QuizQuestion): ValidationResult {
  const fn = validators[q.type as unknown as keyof typeof validators];
  return fn ? fn(value, q) : { ok: true };
}