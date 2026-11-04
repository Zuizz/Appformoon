/**
 * BioQuiz Tutor — API Helper
 * In local dev: requests use Vite proxy (/api → http://localhost:3001/api)
 * In production: requests use VITE_API_URL (e.g. https://your-backend.onrender.com)
 */

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();

// Format base URL to always point to /api cleanly
export const API_BASE = rawApiUrl
  ? (rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl.replace(/\/+$/, '')}/api`)
  : '/api';

/**
 * Generic fetch wrapper with error handling.
 * @param {string} endpoint - API endpoint path (e.g., '/extract-topics')
 * @param {object} options - fetch options
 * @returns {Promise<{data?: any, error?: string, isRateLimit?: boolean, isMissingKey?: boolean}>}
 */
async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });

    const body = await res.json().catch(() => ({}));

    if (!res.ok) {
      return {
        error: body.message || body.error || `Server returned error (${res.status})`,
        isRateLimit: res.status === 429,
        isMissingKey: body.error === 'missing_api_key',
      };
    }

    return { data: body };
  } catch (err) {
    return {
      error: rawApiUrl
        ? 'Unable to connect to the backend server. Please verify your backend is active and awake.'
        : 'Unable to connect to the backend server. Please verify the server is running on port 3001.',
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
