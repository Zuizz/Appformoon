import { useState } from 'react';

/**
 * TopicChips — Display extracted topics as editable chips
 * @param {{ topics: string[], onConfirm: (topics: string[]) => void, onBack: () => void }} props
 */
export default function TopicChips({ topics: initialTopics, onConfirm, onBack }) {
  const [topics, setTopics] = useState(initialTopics);
  const [newTopic, setNewTopic] = useState('');

  const removeTopic = (index) => {
    setTopics((prev) => prev.filter((_, i) => i !== index));
  };

  const addTopic = () => {
    const trimmed = newTopic.trim();
    if (trimmed && !topics.includes(trimmed)) {
      setTopics((prev) => [...prev, trimmed]);
      setNewTopic('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTopic();
    }
  };

  return (
    <div className="w-full max-w-2xl animate-slide-in-up flex flex-col gap-6">
      {/* Header */}
      <div className="text-center flex flex-col gap-2">
        <h2 className="text-2xl font-bold">
          <span className="mr-2">🔬</span>
          We found these biology topics
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Review and edit the topics below. Remove any you don't want, or add new ones.
        </p>
      </div>

      {/* Topics Card */}
      <div className="glass-card p-4 sm:p-6 flex flex-col gap-4 sm:gap-5">
        {/* Chip grid */}
        <div className="flex flex-wrap gap-2 sm:gap-2.5">
          {topics.map((topic, index) => (
            <div
              key={`${topic}-${index}`}
              className="animate-chip-pop flex items-center gap-2 pl-3.5 pr-2 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(20,184,166,0.1))',
                border: '1px solid rgba(16,185,129,0.3)',
                color: 'var(--primary-start)',
                animationDelay: `${index * 60}ms`,
              }}
            >
              <span>🧬</span>
              <span className="truncate max-w-[200px] sm:max-w-none">{topic}</span>
              <button
                onClick={() => removeTopic(index)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-500/20 hover:text-red-400 active:scale-95 transition-all cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
                title={`Remove ${topic}`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Add topic input */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add another topic..."
            className="flex-1 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm outline-none transition-all duration-300"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-subtle)'}
          />
          <button
            onClick={addTopic}
            disabled={!newTopic.trim()}
            className="btn-secondary px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm whitespace-nowrap"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={onBack} className="btn-secondary flex-1 sm:flex-none text-xs sm:text-sm py-2.5 px-4">
          ← Back
        </button>
        <button
          onClick={() => onConfirm(topics)}
          disabled={topics.length === 0}
          className="btn-primary flex-1 sm:flex-none text-xs sm:text-sm py-2.5 px-5"
        >
          Confirm Topics ({topics.length})
          <span className="ml-1">→</span>
        </button>
      </div>

      {topics.length === 0 && (
        <p className="text-center text-sm" style={{ color: 'var(--error)' }}>
          Please add at least one topic to continue.
        </p>
      )}
    </div>
  );
}
