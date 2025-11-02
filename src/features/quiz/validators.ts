import { QuizQuestion, QuizQuestionType } from './quizSchema';

export type ValidationResult = { ok: boolean; message?: string };

export const validators: Record<string, (value: unknown, q: QuizQuestion) => ValidationResult> = {
  single: (v, q) => ({
    ok: typeof v === 'string' && v.length > 0 && (!q.options || q.options.includes(v)),
    message: 'Choose an option',
  }),
  multiple: (v, q) => {
    const arr = Array.isArray(v) ? v : [];
    const subset = q.options ? arr.every(x => q.options!.includes(x)) : true;
    return { ok: arr.length > 0 && subset, message: 'Select at least one' };
  },
  slider: (v, q) => {
    if (typeof v !== 'number') return { ok: false, message: 'Select a value' };
    const min = q.min ?? 0; const max = q.max ?? 100;
    return { ok: v >= min && v <= max, message: `Value must be ${min}-${max}` };
  },
  ranked: (v, q) => {
    const arr = Array.isArray(v) ? v : [];
    const max = q.max ?? (q.options?.length || 0);
    const within = q.options ? arr.every(x => q.options!.includes(x)) : true;
    const unique = new Set(arr).size === arr.length;
    return { ok: arr.length > 0 && arr.length <= max && within && unique, message: `Rank up to ${max}` };
  },
  text: (v) => ({ ok: typeof v === 'string' && v.trim().length > 0, message: 'Required' }),
  multiNumber: (v) => ({ ok: Array.isArray(v) && v.every(n => typeof n === 'number'), message: 'Enter valid numbers' }),
};

export function validate(value: unknown, q: QuizQuestion): ValidationResult {
  const fn = validators[q.type as unknown as keyof typeof validators];
  return fn ? fn(value, q) : { ok: true };
}