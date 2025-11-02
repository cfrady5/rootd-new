import { z } from 'zod';

export const QuizQuestionType = z.enum(['single','multiple','slider','ranked','text','multiNumber']);

export const QuizQuestion = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  type: QuizQuestionType,
  options: z.array(z.string()).optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  step: z.number().optional(),
});

export type QuizQuestion = z.infer<typeof QuizQuestion>;

export const Answers = z.record(z.any());
export type Answers = z.infer<typeof Answers>;