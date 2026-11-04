import React, { useEffect, useState } from 'react';
import { getQuizHistory } from '../api';

/**
 * ProgressView — Displays past quizzes, score trends, and cumulative topic accuracy.
 *
 * @param {{ onBack: () => void, onRetryTopic?: (topic: string) => void }} props
 */
export default function ProgressView({ onBack, onRetryTopic }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchHistory() {
      setLoading(true);
      const res = await getQuizHistory();
      if (res.error) {
        setError(res.error);
      } else {
        setData(res.data);
      }
      setLoading(false);
    }
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-2xl py-12 flex flex-col items-center justify-center gap-4">
        <span className="w-8 h-8 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading your learning history...</p>
      </div>
    );
  }

  const sessions = data?.sessions || [];
  const topicAccuracies = data?.topicAccuracies || [];

  const totalQuizzes = sessions.length;
  const totalQuestions = sessions.reduce((acc, s) => acc + s.totalQuestions, 0);
  const totalCorrect = sessions.reduce((acc, s) => acc + s.score, 0);
  const overallPct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

  return (
    <div className="w-full max-w-2xl animate-slide-in-up flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <span>📈</span>
            Your Biology Learning Progress
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Review past quiz performance and long-term topic mastery.
          </p>
        </div>
        <button onClick={onBack} className="btn-secondary px-4 py-2 text-sm">
          ← Back
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{totalQuizzes}</div>
          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Quizzes Taken</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-black text-teal-400">{totalQuestions}</div>
          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Questions</div>
        </div>
        <div className="glass-card p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-black text-cyan-400">{overallPct}%</div>
          <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1">Accuracy</div>
        </div>
      </div>

      {/* Cumulative Topic Mastery */}
      <div className="glass-card p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <span>🧬</span>
          Cumulative Topic Mastery
        </h3>

        {topicAccuracies.length === 0 ? (
          <p className="text-xs sm:text-sm text-slate-400 py-3 text-center">
            Complete your first quiz to see topic accuracy trends!
          </p>
        ) : (
          <div className="flex flex-col gap-2.5 sm:gap-3">
            {topicAccuracies.map((item) => {
              const isWeak = item.accuracy < 60;
              return (
                <div key={item.topic} className="flex flex-col gap-1.5 p-2.5 sm:p-3 rounded-lg bg-slate-900/50 border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5 truncate max-w-[200px] sm:max-w-none">
                      <span>{isWeak ? '⚠️' : '✅'}</span>
                      {item.topic}
                      {isWeak && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300 whitespace-nowrap">
                          &lt;60%
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-slate-300 ml-2 shrink-0">
                      {item.correct}/{item.attempts} ({item.accuracy}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.accuracy}%`,
                        background: isWeak ? 'var(--error)' : 'var(--success)'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Sessions List */}
      <div className="glass-card p-4 sm:p-6 flex flex-col gap-3 sm:gap-4">
        <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
          <span>🕒</span>
          Recent Quiz Attempts
        </h3>

        {sessions.length === 0 ? (
          <p className="text-xs sm:text-sm text-slate-400 py-3 text-center">
            No quiz history yet. Take a quiz to start building your record!
          </p>
        ) : (
          <div className="flex flex-col gap-2.5 sm:gap-3 max-h-72 overflow-y-auto pr-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="p-3 sm:p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="capitalize px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {s.difficulty}
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-400">
                      {new Date(s.createdAt).toLocaleDateString()} at{' '}
                      {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span className="text-xs text-slate-300">
                    {Array.isArray(s.topics) ? s.topics.join(', ') : s.topics}
                  </span>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start border-t sm:border-t-0 pt-1.5 sm:pt-0 border-white/5">
                  <div className="font-bold text-sm sm:text-base text-slate-200">
                    {s.score} / {s.totalQuestions}
                  </div>
                  <div className="text-xs font-semibold text-emerald-400">
                    {s.percentage}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <button onClick={onBack} className="btn-primary w-full py-3">
        Back to Tutor
      </button>
    </div>
  );
}

