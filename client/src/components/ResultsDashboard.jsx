import React, { useEffect, useState } from 'react';

/**
 * ResultsDashboard — Displays overall score, per-topic breakdown, and action triggers.
 *
 * @param {{
 *   results: {
 *     score: number,
 *     total: number,
 *     topicBreakdown: Record<string, { correct: number, total: number }>,
 *     weakTopics: string[]
 *   },
 *   onRetryWeak: () => void,
 *   onNewTopics: () => void,
 *   onReview: () => void,
 *   onSave: () => Promise<void> | void,
 *   hasWeakTopics: boolean
 * }} props
 */
export default function ResultsDashboard({
  results,
  onRetryWeak,
  onNewTopics,
  onReview,
  onSave,
  hasWeakTopics
}) {
  const { score, total, topicBreakdown, weakTopics } = results;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (onSave && !saved) {
      onSave();
      setSaved(true);
    }
  }, [onSave, saved]);

  const getScoreColor = () => {
    if (percentage >= 80) return 'var(--success)';
    if (percentage >= 60) return 'var(--warning)';
    return 'var(--error)';
  };

  const getScoreBadge = () => {
    if (percentage >= 80) return { emoji: '🏆', text: 'Mastery Demonstrated!' };
    if (percentage >= 60) return { emoji: '🌿', text: 'Good Effort — Keep Growing!' };
    return { emoji: '🔬', text: 'Needs Focused Revision' };
  };

  const badge = getScoreBadge();

  return (
    <div className="w-full max-w-2xl animate-slide-in-up flex flex-col gap-6">
      {/* Score Card */}
      <div className="glass-card p-8 flex flex-col items-center gap-4 text-center">
        <span className="text-5xl">{badge.emoji}</span>
        <h2 className="text-3xl font-extrabold">{badge.text}</h2>

        <div className="flex items-baseline gap-2 mt-2">
          <span
            className="text-6xl font-black"
            style={{ color: getScoreColor() }}
          >
            {score}
          </span>
          <span className="text-2xl" style={{ color: 'var(--text-muted)' }}>
            / {total} ({percentage}%)
          </span>
        </div>

        <p className="text-sm max-w-md" style={{ color: 'var(--text-secondary)' }}>
          {percentage >= 60
            ? 'Great job navigating biological concepts and systems!'
            : 'Biology can be intricate. Use the review and weak topic retry to strengthen retention!'}
        </p>
      </div>

      {/* Per-Topic Breakdown Card */}
      <div className="glass-card p-6 flex flex-col gap-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span>📊</span>
          Per-Topic Breakdown
        </h3>

        <div className="flex flex-col gap-3">
          {Object.entries(topicBreakdown).map(([topic, stats]) => {
            const topicPct = Math.round((stats.correct / stats.total) * 100);
            const isWeak = topicPct < 60;

            return (
              <div
                key={topic}
                className="p-3.5 rounded-xl border flex flex-col gap-2"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: isWeak ? 'rgba(244, 63, 94, 0.3)' : 'var(--border-subtle)',
                }}
              >
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>{isWeak ? '⚠️' : '✅'}</span>
                    <span className="font-semibold">{topic}</span>
                    {isWeak && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-medium">
                        &lt;60% accuracy
                      </span>
                    )}
                  </div>
                  <span className="font-bold text-sm" style={{ color: isWeak ? 'var(--error)' : 'var(--success)' }}>
                    {stats.correct}/{stats.total} ({topicPct}%)
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full overflow-hidden bg-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${topicPct}%`,
                      background: isWeak ? 'var(--error)' : 'var(--success)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {hasWeakTopics && (
          <button
            onClick={onRetryWeak}
            className="btn-primary py-3 flex items-center justify-center gap-2 text-sm md:text-base font-semibold shadow-lg"
          >
            <span>🎯</span>
            Retry Weak Topics ({weakTopics.length})
          </button>
        )}

        <button
          onClick={onReview}
          className="btn-secondary py-3 flex items-center justify-center gap-2 text-sm md:text-base font-semibold"
        >
          <span>📝</span>
          Review Answers
        </button>

        <button
          onClick={onNewTopics}
          className="btn-secondary py-3 flex items-center justify-center gap-2 text-sm md:text-base font-semibold"
          style={{
            gridColumn: hasWeakTopics ? 'auto' : 'span 2'
          }}
        >
          <span>🌱</span>
          New Topics
        </button>
      </div>
    </div>
  );
}

