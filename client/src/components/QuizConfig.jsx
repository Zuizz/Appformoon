import { useState } from 'react';

/**
 * QuizConfig — Select question count and difficulty
 * @param {{ topics: string[], onStart: (config: {count: number, difficulty: string}) => void, loading: boolean }} props
 */
export default function QuizConfig({ topics, onStart, loading }) {
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');

  const counts = [5, 10, 15];
  const difficulties = [
    { value: 'easy', label: 'Easy', emoji: '🌱', color: '#22c55e', desc: 'Foundational concepts' },
    { value: 'medium', label: 'Medium', emoji: '🧬', color: '#f59e0b', desc: 'Applied understanding' },
    { value: 'hard', label: 'Hard', emoji: '🔬', color: '#f43f5e', desc: 'Advanced analysis' },
  ];

  const handleStart = () => {
    onStart({ count, difficulty });
  };

  return (
    <div className="w-full max-w-2xl animate-slide-in-up flex flex-col gap-8">
      {/* Header */}
      <div className="text-center flex flex-col gap-2">
        <h2 className="text-2xl font-bold">
          <span className="mr-2">⚙️</span>
          Configure Your Quiz
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Topics: {topics.join(', ')}
        </p>
      </div>

      {/* Question Count */}
      <div className="glass-card p-5 sm:p-6 flex flex-col gap-3 sm:gap-4">
        <h3 className="text-base sm:text-lg font-semibold">How many questions?</h3>
        <div className="flex gap-2.5 sm:gap-3">
          {counts.map((n) => (
            <button
              key={n}
              onClick={() => setCount(n)}
              className="flex-1 py-2.5 sm:py-3 rounded-xl font-bold text-base sm:text-lg transition-all duration-300 cursor-pointer"
              style={{
                background: count === n
                  ? 'linear-gradient(135deg, var(--primary-start), var(--primary-end))'
                  : 'var(--bg-surface)',
                border: count === n
                  ? '1px solid var(--primary-start)'
                  : '1px solid var(--border-subtle)',
                color: count === n ? 'white' : 'var(--text-secondary)',
                boxShadow: count === n ? '0 0 20px rgba(16,185,129,0.25)' : 'none',
                transform: count === n ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulty */}
      <div className="glass-card p-5 sm:p-6 flex flex-col gap-3 sm:gap-4">
        <h3 className="text-base sm:text-lg font-semibold">Difficulty Level</h3>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {difficulties.map((d) => (
            <button
              key={d.value}
              onClick={() => setDifficulty(d.value)}
              className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-xl transition-all duration-300 cursor-pointer text-center"
              style={{
                background: difficulty === d.value
                  ? `linear-gradient(135deg, ${d.color}15, ${d.color}08)`
                  : 'var(--bg-surface)',
                border: difficulty === d.value
                  ? `2px solid ${d.color}60`
                  : '1px solid var(--border-subtle)',
                boxShadow: difficulty === d.value
                  ? `0 0 25px ${d.color}20`
                  : 'none',
                transform: difficulty === d.value ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              <span className="text-2xl sm:text-3xl">{d.emoji}</span>
              <span className="font-semibold text-xs sm:text-sm" style={{ color: difficulty === d.value ? d.color : 'var(--text-primary)' }}>
                {d.label}
              </span>
              <span className="text-[10px] sm:text-xs leading-tight line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                {d.desc}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Start Button */}
      <button
        onClick={handleStart}
        disabled={loading}
        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating Quiz...
          </>
        ) : (
          <>
            🚀 Start Quiz
          </>
        )}
      </button>
    </div>
  );
}
