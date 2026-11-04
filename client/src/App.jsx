import { useReducer, useCallback } from 'react';
import GreetingScreen from './components/GreetingScreen';
import TopicChips from './components/TopicChips';
import QuizConfig from './components/QuizConfig';
import QuizPlayer from './components/QuizPlayer';
import ResultsDashboard from './components/ResultsDashboard';
import ReviewAnswers from './components/ReviewAnswers';
import ProgressView from './components/ProgressView';
import LoadingState from './components/LoadingState';
import ErrorBanner from './components/ErrorBanner';
import { extractTopics, generateQuiz, saveQuiz } from './api';

/* ============================================
   State Machine Reducer
   ============================================ */
const initialState = {
  step: 'greeting',       // greeting | topicConfirm | quizConfig | loading | quizActive | results | review | progress
  previousStep: 'greeting',
  topics: [],             // confirmed topics
  quizConfig: null,       // { count, difficulty }
  questions: [],          // from LLM
  answers: {},            // { questionId: 'A'|'B'|'C'|'D' }
  currentIndex: 0,        // active question index
  showExplanation: false,  // show explanation after answering
  error: null,            // error message string
  isRateLimit: false,     // is the error a rate limit
  isMissingKey: false,    // missing Groq API key
  loading: false,         // loading state
  savedSessionId: null,   // saved quiz session id
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step, error: null };

    case 'OPEN_PROGRESS':
      return { ...state, previousStep: state.step, step: 'progress' };

    case 'CLOSE_PROGRESS':
      return { ...state, step: state.previousStep === 'progress' ? 'greeting' : state.previousStep };

    case 'SET_LOADING':
      return { ...state, loading: action.loading };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.error,
        isRateLimit: Boolean(action.isRateLimit),
        isMissingKey: Boolean(action.isMissingKey),
        loading: false,
      };

    case 'CLEAR_ERROR':
      return { ...state, error: null, isRateLimit: false, isMissingKey: false };

    case 'SET_TOPICS':
      return { ...state, topics: action.topics, step: 'topicConfirm', loading: false, error: null };

    case 'CONFIRM_TOPICS':
      return { ...state, topics: action.topics, step: 'quizConfig' };

    case 'SET_QUIZ_CONFIG':
      return { ...state, quizConfig: action.config };

    case 'SET_QUESTIONS':
      return {
        ...state,
        questions: action.questions,
        step: 'quizActive',
        currentIndex: 0,
        answers: {},
        showExplanation: false,
        loading: false,
        error: null,
      };

    case 'ANSWER_QUESTION':
      return {
        ...state,
        answers: { ...state.answers, [action.questionId]: action.answer },
        showExplanation: true,
      };

    case 'NEXT_QUESTION': {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.questions.length) {
        return { ...state, step: 'results', showExplanation: false };
      }
      return { ...state, currentIndex: nextIndex, showExplanation: false };
    }

    case 'SET_SESSION_ID':
      return { ...state, savedSessionId: action.id };

    case 'SHOW_REVIEW':
      return { ...state, step: 'review' };

    case 'BACK_TO_RESULTS':
      return { ...state, step: 'results' };

    case 'RETRY_WEAK': {
      return {
        ...state,
        topics: action.weakTopics,
        step: 'quizConfig',
        questions: [],
        answers: {},
        currentIndex: 0,
        showExplanation: false,
        savedSessionId: null,
        error: null,
      };
    }

    case 'RESET':
      return { ...initialState };

    default:
      return state;
  }
}

/* ============================================
   App Component
   ============================================ */
export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Handle topic extraction from free text
  const handleTopicSubmit = useCallback(async (text) => {
    dispatch({ type: 'SET_LOADING', loading: true });
    dispatch({ type: 'CLEAR_ERROR' });

    const result = await extractTopics(text);

    if (result.error) {
      dispatch({
        type: 'SET_ERROR',
        error: result.error,
        isRateLimit: result.isRateLimit,
        isMissingKey: result.isMissingKey,
      });
      return;
    }

    if (!result.data?.topics || result.data.topics.length === 0) {
      dispatch({
        type: 'SET_ERROR',
        error: 'No biology topics were recognized. Please mention biology topics like photosynthesis, mitosis, or cellular respiration.',
      });
      return;
    }

    dispatch({ type: 'SET_TOPICS', topics: result.data.topics });
  }, []);

  // Handle quiz generation
  const handleStartQuiz = useCallback(async (config) => {
    dispatch({ type: 'SET_QUIZ_CONFIG', config });
    dispatch({ type: 'SET_LOADING', loading: true });
    dispatch({ type: 'SET_STEP', step: 'loading' });

    const result = await generateQuiz(state.topics, config.count, config.difficulty);

    if (result.error) {
      dispatch({
        type: 'SET_ERROR',
        error: result.error,
        isRateLimit: result.isRateLimit,
        isMissingKey: result.isMissingKey,
      });
      dispatch({ type: 'SET_STEP', step: 'quizConfig' });
      return;
    }

    dispatch({ type: 'SET_QUESTIONS', questions: result.data.questions });
  }, [state.topics]);

  // Handle answering a question
  const handleAnswer = useCallback((questionId, answer) => {
    dispatch({ type: 'ANSWER_QUESTION', questionId, answer });
  }, []);

  // Handle moving to next question
  const handleNext = useCallback(() => {
    dispatch({ type: 'NEXT_QUESTION' });
  }, []);

  // Save quiz session when results are shown
  const handleSaveQuiz = useCallback(async () => {
    if (state.savedSessionId || state.questions.length === 0) return;

    const questionsData = state.questions.map((q) => ({
      topic: q.topic,
      questionText: q.question,
      options: q.options,
      correctAnswer: q.correct,
      explanation: q.explanation,
      userAnswer: state.answers[q.id] || null,
      isCorrect: state.answers[q.id] === q.correct,
    }));

    const result = await saveQuiz({
      topics: state.topics,
      difficulty: state.quizConfig?.difficulty || 'medium',
      questions: questionsData,
    });

    if (result.data) {
      dispatch({ type: 'SET_SESSION_ID', id: result.data.id });
    }
  }, [state.questions, state.answers, state.topics, state.quizConfig, state.savedSessionId]);

  // Compute score and topic breakdown for results (weak topics: accuracy < 60%)
  const getResults = useCallback(() => {
    const topicMap = {};
    let totalCorrect = 0;

    state.questions.forEach((q) => {
      const isCorrect = state.answers[q.id] === q.correct;
      if (isCorrect) totalCorrect++;

      if (!topicMap[q.topic]) {
        topicMap[q.topic] = { correct: 0, total: 0 };
      }
      topicMap[q.topic].total++;
      if (isCorrect) topicMap[q.topic].correct++;
    });

    // Accuracy < 60% is classified as weak topic
    const weakTopics = Object.entries(topicMap)
      .filter(([, data]) => (data.correct / data.total) < 0.6)
      .map(([topic]) => topic);

    return {
      score: totalCorrect,
      total: state.questions.length,
      topicBreakdown: topicMap,
      weakTopics,
    };
  }, [state.questions, state.answers]);

  // Render current step
  const renderStep = () => {
    switch (state.step) {
      case 'greeting':
        return <GreetingScreen onSubmit={handleTopicSubmit} loading={state.loading} />;

      case 'topicConfirm':
        return (
          <TopicChips
            topics={state.topics}
            onConfirm={(topics) => dispatch({ type: 'CONFIRM_TOPICS', topics })}
            onBack={() => dispatch({ type: 'RESET' })}
          />
        );

      case 'quizConfig':
        return (
          <QuizConfig
            topics={state.topics}
            onStart={handleStartQuiz}
            loading={state.loading}
          />
        );

      case 'loading':
        return <LoadingState />;

      case 'quizActive':
        return (
          <QuizPlayer
            question={state.questions[state.currentIndex]}
            currentIndex={state.currentIndex}
            totalQuestions={state.questions.length}
            selectedAnswer={state.answers[state.questions[state.currentIndex]?.id]}
            showExplanation={state.showExplanation}
            onAnswer={handleAnswer}
            onNext={handleNext}
          />
        );

      case 'results': {
        const results = getResults();
        return (
          <ResultsDashboard
            results={results}
            onRetryWeak={() => dispatch({ type: 'RETRY_WEAK', weakTopics: results.weakTopics })}
            onNewTopics={() => dispatch({ type: 'RESET' })}
            onReview={() => dispatch({ type: 'SHOW_REVIEW' })}
            onSave={handleSaveQuiz}
            hasWeakTopics={results.weakTopics.length > 0}
          />
        );
      }

      case 'review':
        return (
          <ReviewAnswers
            questions={state.questions}
            answers={state.answers}
            onBack={() => dispatch({ type: 'BACK_TO_RESULTS' })}
          />
        );

      case 'progress':
        return (
          <ProgressView
            onBack={() => dispatch({ type: 'CLOSE_PROGRESS' })}
          />
        );

      default:
        return <GreetingScreen onSubmit={handleTopicSubmit} loading={state.loading} />;
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Navbar */}
      <nav
        className="w-full glass-card rounded-none border-x-0 border-t-0 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between sticky top-0 z-30"
        style={{ borderRadius: 0 }}
      >
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer select-none"
          onClick={() => dispatch({ type: 'RESET' })}
        >
          <span className="text-xl sm:text-2xl">🧬</span>
          <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[var(--primary-start)] to-[var(--accent)] bg-clip-text text-transparent">
            BioQuiz Tutor
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {state.step !== 'progress' ? (
            <button
              onClick={() => dispatch({ type: 'OPEN_PROGRESS' })}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/10 cursor-pointer flex items-center gap-1.5"
            >
              <span>📈</span>
              <span>Progress</span>
            </button>
          ) : (
            <button
              onClick={() => dispatch({ type: 'CLOSE_PROGRESS' })}
              className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border border-slate-700 text-slate-300 hover:bg-slate-800 cursor-pointer"
            >
              Back
            </button>
          )}

          {state.step !== 'greeting' && state.step !== 'progress' && (
            <button
              onClick={() => dispatch({ type: 'RESET' })}
              className="btn-secondary text-xs sm:text-sm px-3 py-1.5"
            >
              Start Over
            </button>
          )}
        </div>
      </nav>

      {/* Error Banner */}
      {state.error && (
        <ErrorBanner
          message={state.error}
          isRateLimit={state.isRateLimit}
          isMissingKey={state.isMissingKey}
          onDismiss={() => dispatch({ type: 'CLEAR_ERROR' })}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 py-5 sm:py-8 flex flex-col items-center justify-center">
        {renderStep()}
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs md:text-sm border-t border-white/5" style={{ color: 'var(--text-muted)' }}>
        Powered by Groq AI • Biology Learning Assistant 🌿
      </footer>
    </div>
  );
}
