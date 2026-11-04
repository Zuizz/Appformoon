import { Router } from 'express';
import prisma from '../lib/prisma.js';
import {
  GenerateQuizRequestSchema,
  QuizResponseSchema,
  SaveQuizRequestSchema
} from '../lib/schemas.js';
import { getQuizGenerationPrompts } from '../lib/prompts.js';
import { chatCompletion } from '../lib/groq.js';

const router = Router();

/**
 * Common handler for quiz generation.
 */
export async function handleGenerateQuiz(req, res) {
  console.log('[Quiz Generate] Generating questions with params:', req.body);
  try {
    const parseResult = GenerateQuizRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.warn('[Quiz Generate] Validation error:', parseResult.error.errors);
      return res.status(400).json({
        error: 'validation_error',
        message: 'Invalid quiz generation parameters. Must provide topics array, count (5, 10, or 15), and difficulty (easy, medium, hard).',
        details: parseResult.error.errors
      });
    }

    const { topics, count, difficulty } = parseResult.data;
    const numericCount = typeof count === 'string' ? parseInt(count, 10) : count;
    const { systemPrompt, userPrompt } = getQuizGenerationPrompts(topics, numericCount, difficulty);

    const result = await chatCompletion(systemPrompt, userPrompt, QuizResponseSchema);
    console.log(`[Quiz Generate] Successfully generated ${result.questions.length} questions`);
    return res.json(result);
  } catch (error) {
    console.error('[Quiz Generate] Error generating quiz:', error.message);

    if (error?.code === 'MISSING_API_KEY') {
      return res.status(400).json({
        error: 'missing_api_key',
        message: 'GROQ_API_KEY is not configured in the backend .env file. Please provide your Groq API key to continue.'
      });
    }

    if (error?.status === 429 || error?.message?.includes('429')) {
      return res.status(429).json({
        error: 'rate_limit',
        message: 'Groq rate limit reached. Please wait a moment before trying again.'
      });
    }

    return res.status(500).json({
      error: 'server_error',
      message: error.message || 'An error occurred while generating the quiz.'
    });
  }
}

/**
 * Common handler for saving quiz results.
 */
export async function handleSubmitResults(req, res) {
  console.log('[Quiz Submit] Saving quiz session...');
  try {
    const parseResult = SaveQuizRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.warn('[Quiz Submit] Validation error:', parseResult.error.errors);
      return res.status(400).json({
        error: 'validation_error',
        message: 'Invalid quiz submit payload',
        details: parseResult.error.errors
      });
    }

    const { topics, difficulty, questions } = parseResult.data;
    const calculatedScore = questions.filter((q) => q.isCorrect).length;
    const totalQuestions = questions.length;

    const session = await prisma.quizSession.create({
      data: {
        topics: JSON.stringify(topics),
        difficulty,
        questionCount: totalQuestions,
        totalQuestions,
        score: calculatedScore,
        questions: {
          create: questions.map((q) => ({
            topic: q.topic,
            questionText: q.questionText,
            options: JSON.stringify(q.options),
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            userAnswer: q.userAnswer || null,
            isCorrect: Boolean(q.isCorrect)
          }))
        }
      }
    });

    console.log(`[Quiz Submit] Session saved (id: ${session.id}, score: ${session.score}/${session.totalQuestions})`);
    return res.status(201).json({
      id: session.id,
      score: session.score,
      totalQuestions: session.totalQuestions,
      createdAt: session.createdAt
    });
  } catch (error) {
    console.error('[Quiz Submit] Error saving session:', error);
    return res.status(500).json({
      error: 'server_error',
      message: error.message || 'An error occurred while saving the quiz session.'
    });
  }
}

/**
 * Common handler for retrieving past quiz history and per-topic statistics.
 */
export async function handleGetHistory(req, res) {
  try {
    const sessions = await prisma.quizSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: { questions: true }
    });

    // Compute aggregated per-topic accuracy across all attempts
    const topicStats = {};
    for (const session of sessions) {
      for (const q of session.questions) {
        if (!topicStats[q.topic]) {
          topicStats[q.topic] = { attempts: 0, correct: 0 };
        }
        topicStats[q.topic].attempts += 1;
        if (q.isCorrect) {
          topicStats[q.topic].correct += 1;
        }
      }
    }

    const formattedSessions = sessions.map(s => {
      let parsedTopics = [];
      try { parsedTopics = JSON.parse(s.topics); } catch { parsedTopics = [s.topics]; }
      return {
        id: s.id,
        difficulty: s.difficulty,
        score: s.score,
        totalQuestions: s.totalQuestions,
        percentage: Math.round((s.score / s.totalQuestions) * 100),
        topics: parsedTopics,
        createdAt: s.createdAt
      };
    });

    const topicAccuracies = Object.entries(topicStats).map(([topic, stats]) => ({
      topic,
      attempts: stats.attempts,
      correct: stats.correct,
      accuracy: Math.round((stats.correct / stats.attempts) * 100)
    }));

    return res.json({
      sessions: formattedSessions,
      topicAccuracies
    });
  } catch (error) {
    console.error('[Quiz History] Error fetching history:', error);
    return res.status(500).json({
      error: 'server_error',
      message: 'Failed to fetch quiz history'
    });
  }
}

// Routes
router.post('/generate', handleGenerateQuiz);
router.post('/save', handleSubmitResults);
router.get('/history', handleGetHistory);

// Session by ID
router.get('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'invalid_id', message: 'Session ID must be a number' });
  }

  try {
    const session = await prisma.quizSession.findUnique({
      where: { id },
      include: { questions: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'not_found', message: `Session ${id} not found` });
    }

    return res.json({
      ...session,
      topics: JSON.parse(session.topics),
      questions: session.questions.map(q => ({
        ...q,
        options: JSON.parse(q.options)
      }))
    });
  } catch (error) {
    return res.status(500).json({ error: 'server_error', message: error.message });
  }
});

export default router;
