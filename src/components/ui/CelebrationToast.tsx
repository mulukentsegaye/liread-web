import React from 'react';
import { Trophy, Sparkles, X, Flame } from 'lucide-react';
import { useCelebrationStore } from '../../stores/celebrationStore';

export const CelebrationToast: React.FC = () => {
  const { isOpen, minutes, bookTitle, closeCelebration } = useCelebrationStore();

  if (!isOpen) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[92%] sm:w-auto sm:min-w-[390px] max-w-lg pointer-events-auto"
    >
      <div className="relative overflow-hidden rounded-2xl bg-vibe-card/95 backdrop-blur-md border border-emerald-500/30 dark:border-emerald-500/40 shadow-2xl p-4 sm:p-4.5 transition-all duration-300 celebration-toast-enter">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600" />

        <div className="flex items-start gap-3.5">
          {/* Trophy / Celebration Icon with Pulse Rings */}
          <div className="relative flex-shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5 text-amber-200 fill-amber-200/40 animate-bounce-subtle" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow-xs">
              <Sparkles className="w-2.5 h-2.5 fill-current" />
            </div>
          </div>

          {/* Content details */}
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Flame className="w-3 h-3 fill-current text-amber-500" />
                Session Complete
              </span>
            </div>

            <h3 className="font-heading text-base sm:text-lg font-bold text-vibe-ink tracking-tight leading-snug">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold mr-1.5">
                +{minutes} {minutes === 1 ? 'Minute' : 'Minutes'}
              </span>
              Daily Goal Progress!
            </h3>

            <p className="text-xs text-vibe-ink-secondary truncate mt-0.5">
              Logged for <span className="font-medium text-vibe-ink">"{bookTitle}"</span> · Streak updated
            </p>
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={closeCelebration}
            aria-label="Dismiss notification"
            className="flex-shrink-0 w-7 h-7 rounded-lg text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subtle timer progress countdown bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-vibe-border overflow-hidden">
          <div className="h-full bg-emerald-500 celebration-progress-shrink" />
        </div>
      </div>
    </div>
  );
};
