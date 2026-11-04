/**
 * BioQuiz Tutor — API Helper
 * In local dev: requests use Vite proxy (/api → http://localhost:3001/api)
 * In production: requests use BACK_API_URL or VITE_API_URL
 */

const rawApiUrl = (
  import.meta.env.BACK_API_URL ||
  import.meta.env.VITE_API_URL ||
  ''
).trim();

// Normalize URL: auto-prepend https:// if missing, strip trailing slashes & ensure clean /api suffix
function computeApiBase() {
  if (!rawApiUrl) return '/api';
  let base = rawApiUrl.replace(/\/+$/, '');

  // If user pasted a domain without protocol (e.g. "app.up.railway.app")
  if (!base.startsWith('http://') && !base.startsWith('https://')) {
    base = `https://${base}`;
  }

  // Strip accidental endpoint suffixes if user pasted a full route
  base = base.replace(/\/extract-topics$/, '');
  base = base.replace(/\/generate-quiz$/, '');
  base = base.replace(/\/submit-results$/, '');
  if (base.endsWith('/api')) {
    base = base.slice(0, -4);
  }

  return `${base}/api`;
}

export const API_BASE = computeApiBase();
console.log('[BioQuiz Tutor] Configured API_BASE:', API_BASE);

/**
 * Generic fetch wrapper with error handling.
 * @param {string} endpoint - API endpoint path (e.g., '/extract-topics')
 * @param {object} options - fetch options
 * @returns {Promise<{data?: any, error?: string, isRateLimit?: boolean, isMissingKey?: boolean}>}
 */
async function request(endpoint, options = {}) {
  const targetUrl = `${API_BASE}${endpoint}`;

  try {
    const res = await fetch(targetUrl, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      console.error(`[BioQuiz API Error] Status ${res.status} from ${targetUrl}`, body);
      return {
        error: body.message || body.error || `Server returned error (${res.status}) while requesting ${targetUrl}`,
        isRateLimit: res.status === 429,
        isMissingKey: body.error === 'missing_api_key',
      };
    }

    return { data: body };
  } catch (err) {
    console.error(`[BioQuiz Network Error] Failed to connect to ${targetUrl}:`, err);
    return {
      error: `Unable to connect to ${targetUrl}. Please verify the backend is active.`,
      isRateLimit: false,
      isMissingKey: false,
    };
  }
}

/**
 * Check backend health & key configuration status.
 */
export async function checkHealth() {
  return request('/health', { method: 'GET' });
}

/**
 * Extract biology topics from free text.
 * @param {string} text - User's free text input
 */
export async function extractTopics(text) {
  return request('/extract-topics', {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

/**
 * Generate a quiz based on confirmed topics.
 * @param {string[]} topics - Confirmed topic list
 * @param {number} count - Number of questions (5, 10, or 15)
 * @param {string} difficulty - 'easy' | 'medium' | 'hard'
 */
export async function generateQuiz(topics, count, difficulty) {
  return request('/generate-quiz', {
    method: 'POST',
    body: JSON.stringify({ topics, count, difficulty }),
  });
}

/**
 * Save a completed quiz session.
 * @param {object} sessionData - Quiz session with answers
 */
export async function saveQuiz(sessionData) {
  return request('/submit-results', {
    method: 'POST',
    body: JSON.stringify(sessionData),
  });
}

/**
 * Retrieve a saved quiz session by ID.
 * @param {number} id - Quiz session ID
 */
export async function getQuiz(id) {
  return request(`/quiz/${id}`, { method: 'GET' });
}

/**
 * Retrieve user's quiz attempt history and topic accuracy trends.
 */
export async function getQuizHistory() {
  return request('/progress', { method: 'GET' });
}
