# 🧬 BioQuiz Tutor

BioQuiz Tutor is an AI-powered biology learning assistant built with React, Express, SQLite (Prisma), and Groq LLMs. It greets students, extracts and normalizes biology topics from free text, generates customized multiple-choice quizzes, tracks weak topics, and persists progress trends.

---

## 🌟 Key Features

1. **Friendly Topic Intake**: Greeted by a tutor assistant, students provide topics in natural language (e.g., *"mitosis, enzymes, Mendelian genetics, photosynthesis"*).
2. **AI Topic Normalization**: The LLM extracts and normalizes biology topics into scientific forms, displayed as interactive, editable chips.
3. **Customizable Quizzes**: Students pick their question count (5, 10, or 15) and difficulty level (*Easy*, *Medium*, *Hard*).
4. **Structured MCQ Engine**:
   - Exactly 4 options (A, B, C, D) with 1 correct answer.
   - Factually accurate with plausible distractors (no "All of the above" or "None of the above").
   - Instant answer verification and 1-2 sentence educational explanations.
   - **"Report bad question"** button on each question.
5. **Smart Weak-Topic Tracking**:
   - Calculates per-topic accuracy.
   - Flags topics with accuracy below 60% as weak topics.
   - One-click **"Retry weak topics"** generates a targeted refresher quiz.
6. **Progress Dashboard**:
   - View historical quiz attempts, scores, and date stamps.
   - Cumulative topic mastery visualization to track learning over time.
7. **Robust LLM Backend**:
   - Powered by the official `groq-sdk` with JSON mode enabled (`response_format: { type: "json_object" }`).
   - Dynamic model selection via `GROQ_MODEL`.
   - Zod schema validation with automatic retries on malformed JSON.
   - Graceful HTTP 429 rate limit backoff and friendly error banners.
   - Clear and friendly warning if `GROQ_API_KEY` is missing.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS v4, Vite
- **Backend**: Node.js, Express
- **Database**: SQLite with Prisma ORM
- **LLM Provider**: Groq API (`groq-sdk`, default `llama-3.3-70b-versatile`)
- **Validation**: Zod

---

## 📋 Environment Variables

Create a `.env` file in the project root directory (you can copy `.env.example`):

```bash
cp .env.example .env
```

Set your configuration values:

```env
# Groq API Key (Get yours at https://console.groq.com)
GROQ_API_KEY=your_groq_api_key_here

# Groq Model Name (llama-3.3-70b-versatile, llama-3.1-8b-instant, etc.)
GROQ_MODEL=llama-3.3-70b-versatile

# SQLite Database URL
DATABASE_URL="file:./dev.db"

# Server Port
PORT=3001
```

> **Note**: If `GROQ_API_KEY` is not provided, the application will display a clear notification guiding you to set the key in `.env`.

---

## 🚀 Getting Started

### 1. Install Dependencies
Run the install command from the root directory:

```bash
npm run install:all
```

Or install separately:
```bash
# In root:
npm install

# In client:
cd client && npm install

# In server:
cd ../server && npm install
```

### 2. Prepare the Database
From the project root:
```bash
npm run db:migrate
```
*(Or in `server`: `npx prisma db push`)*

### 3. Start the Development Servers
From the project root, launch both the client and server concurrently:
```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend**: [http://localhost:3001](http://localhost:3001)

---

## 📡 API Endpoints

- `POST /api/extract-topics` — Extracts and normalizes biology topics from free text
- `POST /api/generate-quiz` — Generates MCQs based strictly on confirmed topics
- `POST /api/submit-results` — Persists quiz sessions, questions, user answers, and scores
- `GET /api/progress` — Retrieves historical sessions and per-topic cumulative accuracy
- `GET /api/quiz/:id` — Fetches a specific quiz session by ID
- `GET /api/health` — Checks backend status and Groq API key configuration

