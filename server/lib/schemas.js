import { z } from 'zod';

/**
 * Schema for Groq topic extraction response.
 */
export const TopicExtractionSchema = z.object({
  topics: z.array(z.string().min(1)).min(1).max(20)
});

/**
 * Schema for a single generated multiple-choice quiz question.
 */
export const QuizQuestionSchema = z.object({
  id: z.number(),
  topic: z.string(),
  question: z.string(),
  options: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string()
  }),
  correct: z.enum(['A', 'B', 'C', 'D']),
  explanation: z.string(),
  difficulty: z.enum(['easy', 'medium', 'hard'])
});

/**
 * Schema for Groq quiz generation response.
 */
export const QuizResponseSchema = z.object({
  questions: z.array(QuizQuestionSchema).min(1)
});

/**
 * Request validation schema for POST /api/topics.
 */
export const ExtractTopicsRequestSchema = z.object({
  text: z.string().min(1).max(2000)
});

/**
 * Request validation schema for POST /api/quiz/generate.
 */
export const GenerateQuizRequestSchema = z.object({
  topics: z.array(z.string().min(1)).min(1).max(20),
  count: z.enum(['5', '10', '15']).or(z.number().refine(n => [5, 10, 15].includes(n))),
  difficulty: z.enum(['easy', 'medium', 'hard'])
});

/**
 * Request validation schema for POST /api/quiz/save.
 */
export const SaveQuizRequestSchema = z.object({
  topics: z.array(z.string()),
  difficulty: z.string(),
  questions: z.array(
    z.object({
      topic: z.string(),
      questionText: z.string(),
      options: z.record(z.string()),
      correctAnswer: z.string(),
      explanation: z.string(),
      userAnswer: z.string().optional(),
      isCorrect: z.boolean()
    })
  )
});
