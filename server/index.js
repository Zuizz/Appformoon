import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import topicsRouter, { handleExtractTopics } from './routes/topics.js';
import quizRouter, { handleGenerateQuiz, handleSubmitResults, handleGetHistory } from './routes/quiz.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from both root .env and local server .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration: Allow local development and any deployed frontend (e.g. Vercel)
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Modular route endpoints specified in requirements
app.post('/api/extract-topics', handleExtractTopics);
app.post('/api/generate-quiz', handleGenerateQuiz);
app.post('/api/submit-results', handleSubmitResults);
app.get('/api/progress', handleGetHistory);
app.get('/api/history', handleGetHistory);

// Router aliases for compatibility
app.use('/api/topics', topicsRouter);
app.use('/api/quiz', quizRouter);

// Root health check endpoint (for Railway / browser verification)
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'BioQuiz Server',
    hasApiKey: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()),
    model: process.env.GROQ_MODEL || 'not set'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim()),
    model: process.env.GROQ_MODEL || 'not set'
  });
});

// Start HTTP server on 0.0.0.0 for containerized / cloud hosting
app.listen(PORT, '0.0.0.0', () => {
  console.log(`BioQuiz server running on port ${PORT}`);
  if (!process.env.GROQ_API_KEY) {
    console.warn(`[WARNING] GROQ_API_KEY is not set. Please add it to your environment variables.`);
  } else {
    console.log(`[INFO] GROQ_API_KEY detected. Model: ${process.env.GROQ_MODEL || 'default'}`);
  }
});

export default app;
