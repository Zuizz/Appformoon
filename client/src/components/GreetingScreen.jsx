import { useState } from 'react';

/**
 * GreetingScreen — Welcome screen with topic input
 * @param {{ onSubmit: (text: string) => void, loading: boolean }} props
 */
export default function GreetingScreen({ onSubmit, loading }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      onSubmit(text.trim());
    }
  };

  return (
    <div className="w-full max-w-2xl animate-fade-in flex flex-col items-center gap-8 py-8">
      {/* Hero Section */}
      <div className="flex flex-col items-center gap-4 text-center">
        {/* Biology-themed decorative elements */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-2">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed animate-[dna-spin_8s_linear_infinite]"
               style={{ borderColor: 'var(--primary-start)' }} />
          {/* Inner glow */}
          <div className="absolute inset-2 rounded-full"
               style={{ background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)' }} />
          {/* Icon */}
          <span className="text-5xl relative z-10" style={{ animation: 'float 4s ease-in-out infinite' }}>🧬</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
          <span className="bg-gradient-to-r from-[var(--primary-start)] via-[var(--accent)] to-[var(--primary-end)] bg-clip-text text-transparent">
            Your Biology Tutor
          </span>
        </h1>

        <p className="text-lg max-w-md" style={{ color: 'var(--text-secondary)' }}>
          I'll create a personalized quiz to test your knowledge. Let's start with what you've been studying!
        </p>
      </div>

      {/* Topic Input Card */}
      <form onSubmit={handleSubmit} className="w-full glass-card p-5 sm:p-8 flex flex-col gap-4 sm:gap-5">
        <label className="text-base sm:text-lg font-semibold flex items-center gap-2">
          <span>🌿</span>
          What biology topics have you learned recently?
        </label>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="e.g., mitosis, enzymes, Mendelian genetics, photosynthesis..."
          rows={4}
          className="w-full px-3.5 sm:px-4 py-3 rounded-xl text-sm sm:text-base resize-none outline-none transition-all duration-300 placeholder:text-[var(--text-muted)]"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
          onFocus={(e) => e.target.style.borderColor = 'var(--primary-start)'}
          onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
          disabled={loading}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="submit"
            disabled={!text.trim() || loading}
            className="btn-primary w-full sm:w-auto py-3 px-6 flex items-center justify-center gap-2 text-sm sm:text-base font-semibold"
          >
            {loading ? (
              <>
                <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                Extract Topics
                <span>→</span>
              </>
            )}
          </button>

          <span className="text-xs sm:text-sm text-center sm:text-right" style={{ color: 'var(--text-muted)' }}>
            Type any biology topics you know
          </span>
        </div>
      </form>

      {/* Suggestion pills */}
      <div className="flex flex-wrap justify-center gap-2">
        {['Mitosis & Meiosis', 'DNA Replication', 'Photosynthesis', 'Evolution', 'Ecology'].map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setText((prev) => prev ? `${prev}, ${suggestion}` : suggestion)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 cursor-pointer"
            style={{
              background: 'var(--bg-glass-light)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'var(--accent)';
              e.target.style.color = 'var(--accent)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'var(--border-subtle)';
              e.target.style.color = 'var(--text-secondary)';
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
