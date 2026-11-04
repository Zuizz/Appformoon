import React from 'react';

/**
 * ReviewAnswers — Comprehensive review of all quiz questions, selections, and explanations.
 *
 * @param {{
 *   questions: Array<any>,
 *   answers: Record<string|number, string>,
 *   onBack: () => void
 * }} props
 */
export default function ReviewAnswers({ questions, answers, onBack }) {
  return (
    <div className="w-full max-w-2xl animate-slide-in-up flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>📖</span>
            Review Questions
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Examine your answers alongside explanations to solidify biological understanding.
          </p>
        </div>
        <button
          onClick={onBack}
          className="btn-secondary px-4 py-2 text-sm"
        >
          ← Back
        </button>
      </div>

      {/* Questions List */}
      <div className="flex flex-col gap-5">
        {questions.map((q, idx) => {
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correct;

          return (
            <div
              key={q.id || idx}
              className="glass-card p-6 flex flex-col gap-4 border"
              style={{
                borderColor: isCorrect ? 'rgba(34, 197, 94, 0.3)' : 'rgba(244, 63, 94, 0.3)'
              }}
            >
              {/* Question metadata */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2" style={{ color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
                  <span>{isCorrect ? '✅' : '❌'}</span>
                  Question {idx + 1}
                </span>
                <span
                  className="px-2.5 py-0.5 rounded-full"
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: 'var(--primary-start)',
                    border: '1px solid rgba(16, 185, 129, 0.2)'
                  }}
                >
                  {q.topic}
                </span>
              </div>

              {/* Question title */}
              <h4 className="text-base font-semibold leading-relaxed">
                {q.question}
              </h4>

              {/* Options */}
              <div className="flex flex-col gap-2 text-sm">
                {['A', 'B', 'C', 'D'].map((letter) => {
                  const isUserSelection = userAnswer === letter;
                  const isCorrectAnswer = q.correct === letter;

                  let optBorder = 'var(--border-subtle)';
                  let optBg = 'var(--bg-surface)';
                  let optColor = 'var(--text-primary)';

                  if (isCorrectAnswer) {
                    optBorder = 'var(--success)';
                    optBg = 'rgba(34, 197, 94, 0.1)';
                    optColor = 'var(--success)';
                  } else if (isUserSelection && !isCorrectAnswer) {
                    optBorder = 'var(--error)';
                    optBg = 'rgba(244, 63, 94, 0.1)';
                    optColor = 'var(--error)';
                  }

                  return (
                    <div
                      key={letter}
                      className="px-4 py-2.5 rounded-lg border flex items-center justify-between"
                      style={{
                        background: optBg,
                        borderColor: optBorder,
                        color: optColor,
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold w-5">{letter}.</span>
                        <span>{q.options[letter]}</span>
                      </div>
                      <div className="text-xs font-medium">
                        {isCorrectAnswer && <span>(Correct)</span>}
                        {isUserSelection && !isCorrectAnswer && <span>(Your answer)</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation note */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs flex flex-col gap-1">
                <span className="font-bold text-slate-300">💡 Explanation:</span>
                <p className="text-slate-400 leading-relaxed">{q.explanation}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Back Button */}
      <button
        onClick={onBack}
        className="btn-primary w-full py-3 text-base font-semibold"
      >
        ← Back to Results
      </button>
    </div>
  );
}

