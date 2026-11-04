import React from 'react';

/**
 * LoadingState — Animated loading view for quiz generation and topic processing.
 *
 * @param {{ message?: string, subtext?: string }} props
 */
export default function LoadingState({
  message = 'Crafting your personalized biology quiz...',
  subtext = 'Consulting cellular biology, genetics, and ecology principles'
}) {
  return (
    <div className="w-full max-w-md mx-auto text-center py-16 flex flex-col items-center justify-center gap-6 animate-fade-in">
      <div className="relative w-24 h-24 flex items-center justify-center">
        {/* Pulsing ring */}
        <div
          className="absolute inset-0 rounded-full border-4 border-dashed animate-[spin_6s_linear_infinite]"
          style={{ borderColor: 'var(--primary-start)' }}
        />
        {/* Glow backdrop */}
        <div
          className="absolute inset-2 rounded-full animate-pulse"
          style={{ background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 70%)' }}
        />
        {/* Biology Icon */}
        <span className="text-4xl relative z-10 animate-bounce">🔬</span>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xl font-bold bg-gradient-to-r from-[var(--primary-start)] to-[var(--accent)] bg-clip-text text-transparent">
          {message}
        </h3>
        <p className="text-sm max-w-xs mx-auto" style={{ color: 'var(--text-secondary)' }}>
          {subtext}
        </p>
      </div>

      {/* Animated shimmer bar */}
      <div className="w-48 h-1.5 rounded-full overflow-hidden bg-slate-800 relative">
        <div
          className="h-full rounded-full w-24 animate-[pulse_1.5s_ease-in-out_infinite]"
          style={{
            background: 'linear-gradient(90deg, var(--primary-start), var(--accent))',
          }}
        />
      </div>
    </div>
  );
}

