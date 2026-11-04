/**
 * BioQuiz Tutor — LLM Prompt Templates
 *
 * Requirements addressed:
 * 1. LLM acts strictly as a friendly biology tutor.
 * 2. Redirects or filters out non-biology topics.
 * 3. Mentions the word 'JSON' explicitly (mandatory for Groq JSON mode).
 * 4. Generates MCQs with 4 options, plausible distractors, no 'all/none of the above',
 *    randomized answer keys, and balanced topic distribution.
 */

/**
 * Prompt: Topic Extraction & Normalization
 *
 * System Prompt Rationale:
 * - Directs the model to act as a biology tutor.
 * - Extracts life science topics and filters out extraneous or non-biology entries.
 * - Normalizes casual phrasing (e.g. "bugs", "cell splitting") into standard biology terminology.
 * - Enforces valid JSON object schema with a 'topics' array.
 *
 * @param {string} userText - Free text input from the student.
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
export function getTopicExtractionPrompts(userText) {
  const systemPrompt = `You are a biology tutor AI assistant. Your job is to extract and normalize biology topics from the user's input. Only extract topics related to biology, biochemistry, molecular biology, genetics, ecology, evolution, anatomy, physiology, microbiology, botany, zoology, and related life sciences. If the user mentions non-biology topics, politely ignore them and only extract the biology-related ones. If no biology topics are found, return an empty array. Your output must be a JSON object with the following structure: { "topics": ["Topic1", "Topic2", ...] }. Normalize topic names to their proper scientific form (e.g., 'cell division' → 'Mitosis and Meiosis', 'DNA stuff' → 'DNA Structure and Replication'). Output JSON only.`;

  const userPrompt = `Extract biology topics from this text: "${userText}"`;

  return { systemPrompt, userPrompt };
}

/**
 * Prompt: MCQ Biology Quiz Generation
 *
 * System Prompt Rationale:
 * - Restricts scope ONLY to the confirmed biology topics provided.
 * - Enforces rigorous MCQ construction: 4 distinct choices, single correct key, plausible distractors.
 * - Explicitly bans trivial cop-outs like 'All of the above' or 'None of the above'.
 * - Mandates randomized answer key distribution (A, B, C, D) and balanced question counts per topic.
 * - Requests a concise 1-2 sentence educational explanation for instant learner feedback.
 * - Enforces the strict JSON response format required by the backend Zod validation schema.
 *
 * @param {string[]} topics - The confirmed biology topics.
 * @param {number|string} count - Number of questions requested (5, 10, or 15).
 * @param {string} difficulty - Target difficulty level ('easy', 'medium', or 'hard').
 * @returns {{ systemPrompt: string, userPrompt: string }}
 */
export function getQuizGenerationPrompts(topics, count, difficulty) {
  const systemPrompt = `You are a biology tutor AI assistant specialized in creating educational multiple-choice questions. Generate exactly ${count} multiple-choice questions at ${difficulty} difficulty level. Rules: 1) Each question must have exactly 4 options (A, B, C, D) with exactly one correct answer. 2) Use plausible distractors that test real understanding. 3) NEVER use 'All of the above', 'None of the above', or 'Both A and B' as options. 4) Spread questions evenly across the provided topics. 5) Randomize the position of the correct answer across A, B, C, D. 6) Questions must be factually accurate and educationally valuable. 7) Each explanation should be concise (1-2 sentences) and teach the concept. 8) Stay strictly within biology topics. If asked about non-biology topics, generate biology questions instead. Your output must be a JSON object with the following structure: { "questions": [{ "id": 1, "topic": "string", "question": "string", "options": { "A": "...", "B": "...", "C": "...", "D": "..." }, "correct": "A|B|C|D", "explanation": "string", "difficulty": "easy|medium|hard" }] }. Output JSON only.`;

  const userPrompt = `Generate ${count} ${difficulty} difficulty biology questions on these topics: ${topics.join(', ')}`;

  return { systemPrompt, userPrompt };
}
