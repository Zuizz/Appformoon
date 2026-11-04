import Groq from 'groq-sdk';

/**
 * Lazily-instantiated Groq client instance.
 * Reads GROQ_API_KEY from environment variables.
 */
let groqClient = null;

function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    const error = new Error('GROQ_API_KEY is not configured. Please add your Groq API key to the .env file.');
    error.code = 'MISSING_API_KEY';
    throw error;
  }
  if (!groqClient || groqClient.apiKey !== apiKey) {
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

/**
 * Retry wrapper for HTTP 429 rate limit errors with exponential backoff.
 *
 * @param {Function} fn - Async operation to execute.
 * @param {number} [retries=3] - Number of retries remaining.
 * @param {number} [baseDelayMs=1500] - Base delay before retrying.
 * @returns {Promise<any>} Result of the executed function.
 */
async function callGroqWithBackoff(fn, retries = 3, baseDelayMs = 1500) {
  try {
    return await fn();
  } catch (err) {
    if (err?.status === 429 && retries > 0) {
      const retryAfter = err?.headers?.['retry-after'];
      const delay = retryAfter ? parseFloat(retryAfter) * 1000 : baseDelayMs;
      const jitter = Math.random() * 200 + 50;
      const totalWait = delay + jitter;
      console.warn(`[429 Rate Limit] Groq rate limited. Retrying in ${Math.round(totalWait)}ms... (${retries} attempts left)`);
      await new Promise((r) => setTimeout(r, totalWait));
      return callGroqWithBackoff(fn, retries - 1, baseDelayMs * 2);
    }
    throw err;
  }
}

/**
 * Call Groq chat completion with JSON mode and validate against a Zod schema.
 * Retries up to 2 times on JSON parsing or schema validation failure.
 *
 * @param {string} systemPrompt - Prompt providing instructions and JSON output expectations.
 * @param {string} userPrompt - Prompt containing the user payload.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate and parse the response against.
 * @param {number} [maxRetries=2] - Max retries for parsing/validation failures.
 * @returns {Promise<object>} Parsed and validated response object.
 */
export async function chatCompletion(systemPrompt, userPrompt, schema, maxRetries = 2) {
  const client = getGroqClient();
  let model = process.env.GROQ_MODEL?.trim();

  if (!model) {
    const error = new Error('GROQ_MODEL is not configured. Please set GROQ_MODEL in your .env file.');
    error.code = 'MISSING_MODEL';
    throw error;
  }

  // Normalize model name for Groq if provider prefix was omitted
  if (model.toLowerCase() === 'gpt-oss-120b' || model.toLowerCase() === 'gpt-oss120b') {
    model = 'openai/gpt-oss-120b';
  }

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[Groq] Executing completion request using model "${model}" (attempt ${attempt + 1}/${maxRetries + 1})...`);
      const completion = await callGroqWithBackoff(async () => {
        return client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.3,
          max_tokens: 4096
        });
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response received from Groq');
      }

      const parsed = JSON.parse(content);
      const validated = schema.parse(parsed);
      return validated;
    } catch (error) {
      lastError = error;
      console.error(`[Groq] Attempt ${attempt + 1} failed:`, error.message);
      if (error?.status === 429 || error?.code === 'MISSING_API_KEY' || error?.code === 'MISSING_MODEL') {
        throw error; // Don't retry auth/config/rate errors in parse-retry loop
      }
    }
  }

  throw lastError;
}
