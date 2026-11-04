import React from 'react';

/**
 * ErrorBanner — Displays user-friendly error alerts and instructions.
 *
 * @param {{
 *   message: string,
 *   isRateLimit?: boolean,
 *   isMissingKey?: boolean,
 *   onDismiss: () => void
 * }} props
 */
export default function ErrorBanner({ message, isRateLimit, isMissingKey, onDismiss }) {
  const isKeyError = isMissingKey || message?.toLowerCase().includes('groq_api_key');

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 px-4 animate-slide-in-up">
      <div
        className="glass-card p-4 md:p-5 flex items-start gap-4 border"
        style={{
          background: isRateLimit
            ? 'rgba(245, 158, 11, 0.12)'
            : isKeyError
            ? 'rgba(99, 102, 241, 0.12)'
            : 'rgba(244, 63, 94, 0.12)',
          borderColor: isRateLimit
            ? 'rgba(245, 158, 11, 0.4)'
            : isKeyError
            ? 'rgba(99, 102, 241, 0.4)'
            : 'rgba(244, 63, 94, 0.4)',
        }}
      >
        <span className="text-2xl shrink-0">
          {isRateLimit ? '⏳' : isKeyError ? '🔑' : '⚠️'}
        </span>

        <div className="flex-1 flex flex-col gap-1 text-sm">
          <div className="font-semibold flex items-center justify-between">
            <span style={{
              color: isRateLimit
                ? 'var(--warning)'
                : isKeyError
                ? '#818cf8'
                : 'var(--error)'
            }}>
              {isRateLimit
                ? 'Rate Limit Exceeded'
                : isKeyError
                ? 'Groq API Key Required'
                : 'Notice'}
            </span>
            <button
              onClick={onDismiss}
              className="text-xs px-2 py-0.5 rounded opacity-70 hover:opacity-100 cursor-pointer"
              style={{ color: 'var(--text-secondary)' }}
            >
              ✕
            </button>
          </div>

          <p className="leading-relaxed" style={{ color: 'var(--text-primary)' }}>
            {message}
          </p>

          {isKeyError && (
            <div className="mt-2 text-xs p-2 rounded-lg bg-black/30 border border-white/10 font-mono text-emerald-400">
              Add GROQ_API_KEY=your_key to your .env file
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

