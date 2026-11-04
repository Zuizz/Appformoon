import { Router } from 'express';
import { ExtractTopicsRequestSchema, TopicExtractionSchema } from '../lib/schemas.js';
import { getTopicExtractionPrompts } from '../lib/prompts.js';
import { chatCompletion } from '../lib/groq.js';

const router = Router();

/**
 * Common handler for topic extraction.
 */
async function handleExtractTopics(req, res) {
  console.log('[Topic Extraction] Processing request...');
  try {
    const parseResult = ExtractTopicsRequestSchema.safeParse(req.body);
    if (!parseResult.success) {
      console.warn('[Topic Extraction] Validation failed:', parseResult.error.errors);
      return res.status(400).json({
        error: 'validation_error',
        message: 'Invalid request payload. Please provide a "text" field between 1 and 2000 characters.',
        details: parseResult.error.errors
      });
    }

    const { text } = parseResult.data;
    const { systemPrompt, userPrompt } = getTopicExtractionPrompts(text);
    const result = await chatCompletion(systemPrompt, userPrompt, TopicExtractionSchema);

    console.log(`[Topic Extraction] Successfully extracted ${result.topics.length} topics:`, result.topics);
    return res.json(result);
  } catch (error) {
    console.error('[Topic Extraction] Error:', error.message);

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
      message: error.message || 'An error occurred while extracting topics.'
    });
  }
}

// Support POST / (when mounted at /api/extract-topics or /api/topics) and POST /extract
router.post('/', handleExtractTopics);
router.post('/extract', handleExtractTopics);

export default router;
export { handleExtractTopics };
