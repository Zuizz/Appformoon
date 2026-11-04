import { useState } from 'react';

/**
 * QuizPlayer — Single question display with answer feedback and question reporting
 * @param {{
 *   question: object,
 *   currentIndex: number,
 *   totalQuestions: number,
 *   selectedAnswer: string|undefined,
 *   showExplanation: boolean,
 *   onAnswer: (id: number, answer: string) => void,
 *   onNext: () => void,
 * }} props
 */
export default function QuizPlayer({
  question,
  currentIndex,
  totalQuestions,
  selectedAnswer,
  showExplanation,
  onAnswer,
  onNext,
}) {
  const [reported, setReported] = useState(false);
  const isAnswered = !selectedAnswer;
  const isCorrect = selectedAnswer === question.correct;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const isLast = currentIndex === totalQuestions - 1;

  const optionLetters = ['A', 'B', 'C', 'D'];

  const getOptionStyle = (letter) => {
    if (!selectedAnswer) {
      return {
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        color: 'var(--text-primary)',
      };
    }

    if (letter === question.correct) {
      return {
        background: 'rgba(34, 197, 94, 0.12)',
        border: '2px solid var(--success)',
        color: 'var(--success)',
      };
    }

    if (letter === selectedAnswer && letter !== question.correct) {
      return {
        background: 'rgba(244, 63, 94, 0.12)',
        border: '2px solid var(--error)',
        color: 'var(--error)',
      };
    }

    return {
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      color: 'var(--text-muted)',
      opacity: 0.5,
    };
  };

  const getOptionAnimation = (letter) => {
    if (!selectedAnswer) return '';
    if (letter === question.correct) return 'animate-correct';
    if (letter === selectedAnswer && letter !== question.correct) return 'animate-incorrect';
    return '';
  };

  const handleReport = () => {
    setReported(true);
    setTimeout(() => {
      // Auto clear feedback after 3 seconds
      setReported(false);
    }, 3000);
  };

  return (
    <div className="w-full max-w-2xl animate-slide-in-up flex flex-col gap-6">
      {/* Progress & Header */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>
            Question {currentIndex + 1} of {totalQuestions}
          </span>
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-medium truncate max-w-[180px] sm:max-w-xs"
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--primary-start)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}
            >
              {question.topic}
            </span>
            <button
              onClick={handleReport}
              disabled={reported}
              className="text-[11px] sm:text-xs px-2.5 py-1 rounded-full flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity border border-white/10 cursor-pointer"
              style={{
                color: reported ? 'var(--warning)' : 'var(--text-muted)',
                background: reported ? 'rgba(245, 158, 11, 0.1)' : 'transparent'
              }}
              title="Report an issue with this question"
            >
              <span>{reported ? '✓ Flagged' : '🚩 Report'}</span>
            </button>
          </div>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, var(--primary-start), var(--accent))',
            }}
          />
        </div>
      </div>

      {/* Reported Toast if active */}
      {reported && (
        <div className="px-3.5 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between animate-fade-in">
          <span>Thank you! This question has been reported for factual verification.</span>
          <span className="opacity-70 text-[10px]">biology review</span>
        </div>
      )}

      {/* Question Card */}
      <div className="glass-card p-5 sm:p-8">
        <h3 className="text-lg sm:text-2xl font-semibold leading-relaxed mb-5 sm:mb-6">
          {question.question}
        </h3>

        {/* Options */}
        <div className="flex flex-col gap-2.5 sm:gap-3 stagger-children">
          {optionLetters.map((letter) => (
            <button
              key={letter}
              onClick={() => !selectedAnswer && onAnswer(question.id, letter)}
              disabled={Boolean(selectedAnswer)}
              className={`w-full text-left px-4 sm:px-5 py-3 sm:py-4 rounded-xl flex items-center gap-3 sm:gap-4 transition-all duration-300 ${getOptionAnimation(letter)} ${!selectedAnswer ? 'hover:translate-x-1 cursor-pointer' : ''}`}
              style={getOptionStyle(letter)}
              onMouseEnter={(e) => {
                if (!selectedAnswer) {
                  e.currentTarget.style.borderColor = 'var(--accent)';
                  e.currentTarget.style.boxShadow = '0 0 15px var(--accent-glow)';
                }
              }}
              onMouseLeave={(e) => {
                if (!selectedAnswer) {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Letter badge */}
              <span
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold shrink-0"
                style={{
                  background: selectedAnswer && letter === question.correct
                    ? 'var(--success)'
                    : selectedAnswer && letter === selectedAnswer && letter !== question.correct
                      ? 'var(--error)'
                      : 'rgba(148, 163, 184, 0.1)',
                  color: selectedAnswer && (letter === question.correct || letter === selectedAnswer)
                    ? 'white'
                    : 'var(--text-secondary)',
                }}
              >
                {selectedAnswer && letter === question.correct ? '✓' : selectedAnswer && letter === selectedAnswer && letter !== question.correct ? '✗' : letter}
              </span>

              {/* Option text */}
              <span className="text-sm sm:text-base leading-snug">{question.options[letter]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Explanation Panel */}
      {showExplanation && (
        <div
          className="glass-card p-5 animate-slide-in-up flex items-start gap-3"
          style={{
            borderColor: isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(244,63,94,0.3)',
          }}
        >
          <span className="text-xl shrink-0">{isCorrect ? '✅' : '❌'}</span>
          <div className="flex flex-col gap-1.5">
            <span className="font-semibold" style={{ color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </span>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              {question.explanation}
            </p>
            {!isCorrect && (
              <p className="text-sm mt-1">
                <span style={{ color: 'var(--text-muted)' }}>Correct answer: </span>
                <span className="font-semibold" style={{ color: 'var(--success)' }}>
                  {question.correct}. {question.options[question.correct]}
                </span>
              </p>
            )}
          </div>
        </div>
      )}

      {/* Next Button */}
      {selectedAnswer && (
        <button
          onClick={onNext}
          className="btn-primary w-full py-3 text-lg animate-fade-in cursor-pointer"
        >
          {isLast ? '📊 See Results' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}
