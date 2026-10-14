import React from 'react';
import { SlidersHorizontal, Flame, Trophy, Check, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { TOP_WEEKLY_READERS, CURRENT_USER_LEADERBOARD_STATUS, STREAK_DAYS } from '../../data/mockData';

interface SidebarRightProps {
  onViewLeaderboard?: () => void;
  onAdjustGoal?: () => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({ 
  onViewLeaderboard,
  onAdjustGoal 
}) => {
  const { user, todayMinutesRead } = useAuthStore();

  const goal = user.dailyGoalMinutes || 60;
  const progressPercent = Math.min(100, Math.round((todayMinutesRead / goal) * 100));
  const minutesLeft = Math.max(0, goal - todayMinutesRead);

  // SVG Circular Gauge calculations
  const size = 130;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * (progressPercent / 100));

  return (
    <aside className="hidden xl:block w-72 xl:w-80 flex-shrink-0 space-y-6 py-6 pb-12 pl-4 pr-2 sticky top-[65px] h-[calc(100vh-65px)] self-start overflow-y-auto select-none transition-colors duration-500">
      
      {/* 1. Daily Reading Goal Widget */}
      <div className="bg-vibe-card rounded-2xl p-5 border border-vibe-border shadow-soft transition-all duration-500">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-vibe-ink">
            Daily Reading Goal
          </h2>
          <button 
            onClick={onAdjustGoal}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-vibe-ink-muted hover:text-vibe-ink transition-colors rounded-lg hover:bg-vibe-card-subtle"
            title="Adjust reading goal"
            aria-label="Adjust reading goal"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* Circular Progress Gauge */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg 
              width={size} 
              height={size} 
              className="transform -rotate-90"
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-vibe-border"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-vibe-accent transition-all duration-700 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Stats */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-serif text-3xl font-bold text-vibe-ink leading-none tracking-tight">
                {todayMinutesRead}
              </span>
              <span className="text-[11px] font-medium text-vibe-ink-muted mt-1">
                of {goal} minutes
              </span>
            </div>
          </div>

          {/* Subtext info */}
          <div className="text-center mt-3">
            <p className="text-xs font-semibold text-vibe-ink">
              {progressPercent >= 100 
                ? 'Goal achieved! Amazing reading!' 
                : 'A little more, a little closer.'}
            </p>
            <p className="text-[11px] text-vibe-ink-muted mt-0.5">
              {minutesLeft > 0 ? `${minutesLeft} minutes to your daily goal.` : 'Daily reading completed!'}
            </p>
          </div>
        </div>

        {/* Streak Strip */}
        <div className="mt-5 pt-4 border-t border-vibe-border-subtle">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 fill-current" />
            </div>
            <div>
              <p className="text-xs font-semibold text-vibe-ink leading-none">
                {user.currentStreak}-day reading streak
              </p>
              <p className="text-[10px] text-vibe-ink-muted mt-0.5 leading-none">
                Keep your story going.
              </p>
            </div>
          </div>

          {/* 7 Days Row */}
          <div className="flex items-center justify-between pt-1">
            {STREAK_DAYS.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] font-medium text-vibe-ink-muted">
                  {item.day}
                </span>
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    item.isToday 
                      ? 'bg-vibe-accent text-white shadow-xs' 
                      : item.completed 
                      ? 'bg-vibe-accent-subtle text-vibe-accent' 
                      : 'bg-vibe-card-subtle text-vibe-ink-muted'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Top 5 Weekly Readers Widget */}
      <div className="bg-vibe-card rounded-2xl p-5 border border-vibe-border shadow-soft transition-all duration-500">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-vibe-ink">
            Top 5 Weekly Readers
          </h2>
          <Trophy className="w-4 h-4 text-vibe-secondary" />
        </div>
        <p className="text-[11px] text-vibe-ink-muted mb-4">
          October 12 – 18 · Time well spent
        </p>

        {/* Ranked items */}
        <div className="space-y-3">
          {TOP_WEEKLY_READERS.map((entry) => (
            <div key={entry.userId} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-4 text-center font-mono text-[11px] text-vibe-ink-muted">
                  {entry.rank}
                </span>
                <div className="w-6 h-6 rounded-full bg-vibe-card-subtle text-vibe-ink font-medium flex items-center justify-center text-[10px] flex-shrink-0 border border-vibe-border">
                  {entry.initials}
                </div>
                <span className="font-medium text-vibe-ink-secondary truncate">
                  {entry.fullName}
                </span>
              </div>
              <span className="font-mono text-[11px] text-vibe-ink-muted flex-shrink-0">
                {entry.formattedTime}
              </span>
            </div>
          ))}

          {/* Current User Standing Highlight */}
          <div className="mt-3 pt-2">
            <div className="bg-vibe-accent-subtle border border-vibe-accent/25 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-medium text-vibe-ink">
              <span>#{CURRENT_USER_LEADERBOARD_STATUS.rank} · You</span>
              <span className="font-mono text-[11px] font-semibold text-vibe-accent">
                {CURRENT_USER_LEADERBOARD_STATUS.formattedTime}
              </span>
            </div>
          </div>
        </div>

        {/* View Full Leaderboard Link */}
        <div className="mt-4 pt-3 border-t border-vibe-border-subtle text-center">
          <button
            onClick={onViewLeaderboard}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-vibe-accent hover:text-vibe-accent-hover transition-colors group w-full"
          >
            <span>View full leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 3. Community Inspiring Banner */}
      <div className="p-5 rounded-2xl border border-dashed border-vibe-border bg-vibe-card-subtle/50 transition-all duration-500">
        <span className="text-[10px] font-bold tracking-widest uppercase text-vibe-ink-muted block mb-1">
          Better, Together
        </span>
        <h3 className="font-serif italic text-base leading-snug font-medium text-vibe-ink mb-1.5">
          Different books. The same love of reading.
        </h3>
        <p className="text-xs text-vibe-ink-secondary">
          Join 2,418 readers turning pages today.
        </p>
      </div>

    </aside>
  );
};
