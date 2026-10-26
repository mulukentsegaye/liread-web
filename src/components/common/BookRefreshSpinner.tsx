import React from 'react';
import { Check } from 'lucide-react';

interface BookRefreshSpinnerProps {
  pullProgress: number; // 0 to 1
  isRefreshing: boolean;
  isSuccess?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const BookRefreshSpinner: React.FC<BookRefreshSpinnerProps> = ({
  pullProgress,
  isRefreshing,
  isSuccess = false,
  size = 'md',
}) => {
  // Constrain progress between 0 and 1
  const progress = Math.min(1, Math.max(0, pullProgress));

  // Circular progress ring metrics
  const radius = 17;
  const circumference = 2 * Math.PI * radius; // ~106.8
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: 44, height: 44 }}>
      {/* Background Subtle Progress Track */}
      <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 44 44">
        {/* Track Circle */}
        <circle
          cx="22"
          cy="22"
          r={radius}
          className="stroke-vibe-border/60 fill-none"
          strokeWidth="2.5"
        />

        {/* Dynamic Progress Indicator Ring */}
        {!isRefreshing && !isSuccess && (
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-vibe-accent fill-none transition-all duration-75"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        )}

        {/* Continuous Rotating Ring when Refreshing */}
        {isRefreshing && (
          <circle
            cx="22"
            cy="22"
            r={radius}
            className="stroke-vibe-accent fill-none animate-spin origin-center"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={`${circumference * 0.45} ${circumference * 0.55}`}
            style={{ animationDuration: '900ms' }}
          />
        )}
      </svg>

      {/* Center Icon Stage */}
      <div className="relative z-10 flex items-center justify-center">
        {isSuccess ? (
          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center animate-in zoom-in duration-200 shadow-xs">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        ) : (
          /* 3D Flipping Miniature Book */
          <div
            className="relative w-6 h-5 flex items-center justify-center"
            style={{ perspective: '300px' }}
          >
            {/* Left Cover (Stationary Spread) */}
            <div className="absolute right-1/2 top-0.5 bottom-0.5 w-3 bg-vibe-card border-y border-l border-vibe-border rounded-l-[2px] shadow-2xs overflow-hidden flex flex-col justify-center gap-1 pl-0.5">
              <div className="h-[1.5px] w-1.5 bg-vibe-ink-muted/30 rounded-full" />
              <div className="h-[1.5px] w-2 bg-vibe-ink-muted/20 rounded-full" />
            </div>

            {/* Right Cover (Stationary Spread) */}
            <div className="absolute left-1/2 top-0.5 bottom-0.5 w-3 bg-vibe-card border-y border-r border-vibe-border rounded-r-[2px] shadow-2xs overflow-hidden flex flex-col justify-center gap-1 pl-0.5">
              <div className="h-[1.5px] w-2 bg-vibe-ink-muted/30 rounded-full" />
              <div className="h-[1.5px] w-1.5 bg-vibe-ink-muted/20 rounded-full" />
            </div>

            {/* Center Book Spine */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-[2px] bg-vibe-accent rounded-full z-20 shadow-xs" />

            {/* Animated Flipping Pages (3 leaves turn sequentially in 3D) */}
            {isRefreshing ? (
              <>
                <div
                  className="absolute left-1/2 top-0.5 bottom-0.5 w-3 bg-vibe-card-subtle border-y border-r border-vibe-accent/70 rounded-r-[2px] origin-left animate-book-page-turn-1"
                  style={{ backfaceVisibility: 'visible' }}
                />
                <div
                  className="absolute left-1/2 top-0.5 bottom-0.5 w-3 bg-vibe-card-subtle border-y border-r border-vibe-accent/70 rounded-r-[2px] origin-left animate-book-page-turn-2"
                  style={{ backfaceVisibility: 'visible' }}
                />
                <div
                  className="absolute left-1/2 top-0.5 bottom-0.5 w-3 bg-vibe-card-subtle border-y border-r border-vibe-accent/70 rounded-r-[2px] origin-left animate-book-page-turn-3"
                  style={{ backfaceVisibility: 'visible' }}
                />
              </>
            ) : (
              /* Dynamic Page Lift during Pull gesture */
              <div
                className="absolute left-1/2 top-0.5 bottom-0.5 w-3 bg-vibe-card border-y border-r border-vibe-accent/60 rounded-r-[2px] origin-left transition-transform duration-75 shadow-xs"
                style={{
                  transform: `rotateY(-${progress * 90}deg)`,
                  backfaceVisibility: 'visible',
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
