import React from 'react';
import { SlidersHorizontal, Flame, Trophy, Check, ArrowRight, Sparkles } from 'lucide-react';
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
  const size = 136;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * (progressPercent / 100));

  return (
    <aside className="hidden xl:block w-72 xl:w-80 2xl:w-88 flex-shrink-0 space-y-5 py-6 pb-32 pl-4 pr-1 h-full overflow-y-auto overscroll-contain select-none transition-colors duration-500">
      
      {/* 1. Daily Reading Goal Card */}
      <div className="bg-vibe-card rounded-2xl p-5 border border-vibe-border shadow-soft transition-all duration-300 hover:border-vibe-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-vibe-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-vibe-ink-muted">
              Today's Goal
            </h2>
          </div>
          <button 
            onClick={onAdjustGoal}
            className="w-7 h-7 flex items-center justify-center text-vibe-ink-muted hover:text-vibe-ink transition-colors rounded-lg hover:bg-vibe-card-subtle"
            title="Adjust reading goal"
            aria-label="Adjust reading goal"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Circular Progress Gauge */}
        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg 
              width={size} 
              height={size} 
              className="transform -rotate-90 drop-shadow-xs"
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
                className="stroke-vibe-accent transition-all duration-1000 ease-out"
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
                of {goal} min
              </span>
            </div>
          </div>

          {/* Subtext info */}
          <div className="text-center mt-2.5">
            <p className="text-xs font-semibold text-vibe-ink">
              {progressPercent >= 100 
                ? 'Daily goal completed! 🎉' 
                : `${minutesLeft} min remaining today`}
            </p>
            <p className="text-[11px] text-vibe-ink-muted mt-0.5">
              {progressPercent >= 100 
                ? 'Keep reading to increase streak.'
                : `${progressPercent}% of target reached`}
            </p>
          </div>
        </div>

        {/* Streak Strip */}
        <div className="mt-4 pt-4 border-t border-vibe-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 fill-current" />
              </div>
              <span className="text-xs font-semibold text-vibe-ink">
                {user.currentStreak}-day streak
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium text-vibe-accent bg-vibe-accent-subtle px-2 py-0.5 rounded-full">
              Active
            </span>
          </div>

          {/* 7 Days Row */}
          <div className="flex items-center justify-between gap-1 pt-0.5">
            {STREAK_DAYS.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[10px] font-medium text-vibe-ink-muted">
                  {item.day}
                </span>
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    item.isToday 
                      ? 'bg-vibe-accent text-white shadow-xs ring-2 ring-vibe-accent/20' 
                      : item.completed 
                      ? 'bg-vibe-accent-subtle text-vibe-accent' 
                      : 'bg-vibe-card-subtle text-vibe-ink-muted/50 border border-vibe-border-subtle'
                  }`}
                  title={`${item.day}: ${item.completed ? 'Completed' : 'Missed'}`}
                >
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Top Weekly Readers Widget */}
      <div className="bg-vibe-card rounded-2xl p-5 border border-vibe-border shadow-soft transition-all duration-300 hover:border-vibe-border">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <Trophy className="w-3.5 h-3.5 text-vibe-secondary" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-vibe-ink-muted">
              Weekly Leaders
            </h2>
          </div>
          <span className="text-[10px] font-medium text-vibe-ink-muted">
            Oct 12–18
          </span>
        </div>
        <p className="text-[11px] text-vibe-ink-muted mb-3.5">
          Readers logging the most active time
        </p>

        {/* Ranked items */}
        <div className="space-y-2">
          {TOP_WEEKLY_READERS.map((entry) => {
            const isTop3 = entry.rank <= 3;
            return (
              <div 
                key={entry.userId} 
                className="flex items-center justify-between text-xs py-1.5 px-2 rounded-xl hover:bg-vibe-card-subtle transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`w-4 text-center font-mono text-[11px] font-bold ${
                    entry.rank === 1 ? 'text-amber-500' :
                    entry.rank === 2 ? 'text-slate-400' :
                    entry.rank === 3 ? 'text-amber-700' :
                    'text-vibe-ink-muted'
                  }`}>
                    {entry.rank}
                  </span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                    entry.rank === 1 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' :
                    'bg-vibe-card-subtle text-vibe-ink border border-vibe-border'
                  }`}>
                    {entry.initials}
                  </div>
                  <span className="font-medium text-vibe-ink truncate group-hover:text-vibe-accent transition-colors">
                    {entry.fullName}
                  </span>
                </div>
                <span className="font-mono text-[11px] tabular-nums text-vibe-ink-muted flex-shrink-0 ml-2">
                  {entry.formattedTime}
                </span>
              </div>
            );
          })}

          {/* Current User Standing Highlight */}
          <div className="mt-3 pt-2">
            <div className="bg-vibe-accent-subtle/70 border border-vibe-accent/25 rounded-xl px-3 py-2 flex items-center justify-between text-xs font-medium text-vibe-ink">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono font-bold text-[11px] text-vibe-accent">
                  #{CURRENT_USER_LEADERBOARD_STATUS.rank}
                </span>
                <span className="truncate font-semibold text-vibe-ink">You</span>
              </div>
              <span className="font-mono text-[11px] font-bold text-vibe-accent flex-shrink-0">
                {CURRENT_USER_LEADERBOARD_STATUS.formattedTime}
              </span>
            </div>
          </div>
        </div>

        {/* View Full Leaderboard Link */}
        <div className="mt-3.5 pt-3 border-t border-vibe-border-subtle">
          <button
            onClick={onViewLeaderboard}
            className="w-full py-2 px-3 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-vibe-accent hover:text-vibe-accent-hover hover:bg-vibe-accent-subtle/50 rounded-xl transition-all group"
          >
            <span>View full leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 3. Community Inspiring Card (Solid border, clean aesthetic) */}
      <div className="p-4 rounded-2xl border border-vibe-border bg-vibe-card transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-lg bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-vibe-ink-muted">
            Community Note
          </span>
        </div>
        <h3 className="font-serif italic text-sm leading-snug font-medium text-vibe-ink mb-1.5">
          "A reader lives a thousand lives before he dies."
        </h3>
        <p className="text-[11px] text-vibe-ink-muted">
          — George R.R. Martin
        </p>
        <div className="mt-3 pt-2.5 border-t border-vibe-border-subtle flex items-center gap-2 text-[11px] text-vibe-ink-secondary">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>2,418 readers active today</span>
        </div>
      </div>

    </aside>
  );
};
