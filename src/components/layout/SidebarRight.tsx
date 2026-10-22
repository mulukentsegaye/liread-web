import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Flame, Check, ArrowRight, Sparkles, Bookmark, BookOpen, Quote } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTimerStore } from '../../stores/timerStore';
import { sanctuaryService } from '../../services/sanctuaryService';
import { sessionsService } from '../../services/sessionsService';
import { LiveCoReader, WeeklyCuratorInsight } from '../../types';

interface SidebarRightProps {
  onViewLeaderboard?: () => void;
  onAdjustGoal?: () => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({ 
  onViewLeaderboard,
  onAdjustGoal 
}) => {
  const { user, todayMinutesRead, isGuest } = useAuthStore();
  const { isRunning, bookTitle: activeTimerBook } = useTimerStore();

  const [liveCoReaders, setLiveCoReaders] = useState<LiveCoReader[]>([]);
  const [weeklyCurators, setWeeklyCurators] = useState<WeeklyCuratorInsight[]>([]);
  const [streakDays, setStreakDays] = useState<{ day: string; completed: boolean; isToday?: boolean }[]>([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      sanctuaryService.getLiveCoReaders(),
      sanctuaryService.getWeeklyCurators(),
    ])
      .then(([coReaders, curators]) => {
        if (!mounted) return;
        setLiveCoReaders(coReaders || []);
        setWeeklyCurators(curators || []);
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  // Build the 7-day streak strip from the user's actual logged sessions
  useEffect(() => {
    let mounted = true;
    if (!user || isGuest) {
      setStreakDays(['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => ({ day, completed: false, isToday: i === 6 })));
      return () => { mounted = false; };
    }
    sessionsService.getUserSessions(user.id, 60).then((rows) => {
      if (!mounted) return;
      const dates = new Set(rows.map((r) => r.sessionDate));
      const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
      const list = days.map((day, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const iso = d.toISOString().split('T')[0];
        return { day, completed: dates.has(iso), isToday: i === 6 };
      });
      setStreakDays(list);
    }).catch(() => {});
    return () => { mounted = false; };
  }, [user?.id, isGuest, todayMinutesRead]);

  const goal = user?.dailyGoalMinutes || 30;
  const progressPercent = Math.min(100, Math.round((todayMinutesRead / goal) * 100));
  const minutesLeft = Math.max(0, goal - todayMinutesRead);

  const size = 136;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * (progressPercent / 100));

  // Merge current user if timer is active
  const effectiveCoReaders = isRunning && activeTimerBook
    ? [
        {
          userId: user?.id || 'you',
          username: user?.username || 'you',
          fullName: user?.fullName || 'You',
          initials: 'YOU',
          avatarUrl: user?.avatarUrl,
          bookTitle: activeTimerBook,
          sessionStartedMinutesAgo: 1,
          isCurrentUser: true,
        },
        ...liveCoReaders.filter((r) => r.userId !== user?.id),
      ]
    : liveCoReaders;

  return (
    <aside className="hidden xl:block w-72 xl:w-80 2xl:w-88 flex-shrink-0 space-y-5 py-6 pb-32 pl-4 pr-1 h-full overflow-y-auto overscroll-contain select-none transition-colors duration-500">
      
      {/* 1. Daily Reading Goal Card (Personal rhythm & self-tracking) */}
      <div className="bg-vibe-card rounded-2xl p-5 border border-vibe-border shadow-soft transition-colors duration-150 hover:border-vibe-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-vibe-accent" />
            <h2 className="font-sans text-[11px] font-medium uppercase tracking-wider text-vibe-ink">
              Today's Commitment
            </h2>
          </div>
          <button 
            onClick={onAdjustGoal}
            className="w-7 h-7 flex items-center justify-center text-vibe-ink-muted hover:text-vibe-ink transition-colors rounded-lg hover:bg-vibe-card-subtle cursor-pointer"
            title="Adjust daily reading plan"
            aria-label="Adjust reading commitment"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center my-3">
          <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90 drop-shadow-xs">
              <circle cx={size / 2} cy={size / 2} r={radius} className="stroke-vibe-border" strokeWidth={strokeWidth} fill="transparent" />
              <circle cx={size / 2} cy={size / 2} r={radius} className="stroke-vibe-accent transition-all duration-1000 ease-out" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" fill="transparent" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-mono text-3xl font-semibold text-vibe-ink leading-none tracking-tight">{todayMinutesRead}</span>
              <span className="font-mono text-[11px] font-medium text-vibe-ink-muted mt-1">of {goal} min</span>
            </div>
          </div>

          <div className="text-center mt-2.5">
            <p className="text-xs font-medium text-vibe-ink">
              {progressPercent >= 100 ? 'Daily plan completed! ✨' : `${minutesLeft} min remaining today`}
            </p>
            <p className="text-[11px] text-vibe-ink-muted mt-0.5 font-mono tabular-nums">
              {progressPercent >= 100 ? 'In the Consistent Circle' : `${progressPercent}% of personal target`}
            </p>
          </div>
        </div>

        {/* Streak Strip */}
        <div className="mt-4 pt-4 border-t border-vibe-border-subtle">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
                <Flame className="w-3.5 h-3.5 fill-current text-amber-500" />
              </div>
              <span className="text-xs font-medium text-vibe-ink font-mono tabular-nums">
                {user?.currentStreak ?? 0}-day streak
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium text-vibe-accent bg-vibe-accent-subtle px-2 py-0.5 rounded-full">
              {(user?.currentStreak ?? 0) > 0 ? 'Active' : 'Start today'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-1 pt-0.5">
            {streakDays.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                <span className="text-[10px] font-medium text-vibe-ink-muted font-mono">{item.day}</span>
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                    item.isToday 
                      ? 'bg-vibe-accent text-white shadow-xs ring-2 ring-vibe-accent/20' 
                      : item.completed 
                      ? 'bg-vibe-accent-subtle text-vibe-accent' 
                      : 'bg-vibe-card-subtle text-vibe-ink-muted/50 border border-vibe-border-subtle'
                  }`}
                  title={`${item.day}: ${item.completed ? 'Completed' : 'Not read'}`}
                >
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Live Co-Reading Sanctuary Widget */}
      <div className="bg-vibe-card rounded-2xl p-5 border border-vibe-border shadow-soft transition-colors duration-150 hover:border-vibe-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <h2 className="font-sans text-[11px] font-medium uppercase tracking-wider text-vibe-ink">
              Live Co-Reading
            </h2>
          </div>
          <span className="font-mono text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
            {effectiveCoReaders.length} active
          </span>
        </div>
        <p className="text-[11px] text-vibe-ink-muted">Readers currently in quiet focus sessions</p>

        {/* Readers List */}
        <div className="space-y-2 pt-1">
          {effectiveCoReaders.slice(0, 4).map((reader) => (
            <div
              key={reader.userId}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-vibe-card-subtle transition-colors group"
            >
              {reader.avatarUrl ? (
                <img
                  src={reader.avatarUrl}
                  alt={reader.fullName}
                  className="w-6 h-6 rounded-full object-cover border border-vibe-border flex-shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-vibe-accent text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                  {reader.initials}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-vibe-ink truncate group-hover:text-vibe-accent transition-colors">
                  {reader.fullName}
                </p>
                <p className="text-[10px] text-vibe-ink-muted truncate">
                  reading <span className="font-medium text-vibe-ink">{reader.bookTitle}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Top Wisdom Shared (Weekly Curators) */}
      <div className="bg-vibe-card rounded-2xl p-5 border border-vibe-border shadow-soft transition-colors duration-150 hover:border-vibe-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-3.5 h-3.5 text-amber-500" />
            <h2 className="font-sans text-[11px] font-medium uppercase tracking-wider text-vibe-ink">
              Top Weekly Curators
            </h2>
          </div>
          <span className="text-[10px] font-mono text-vibe-ink-muted">Most Saved</span>
        </div>
        <p className="text-[11px] text-vibe-ink-muted">Insights & takeaways bookmarked by the community</p>

        <div className="space-y-2.5 pt-1">
          {weeklyCurators.slice(0, 2).map((curator) => (
            <div
              key={curator.id}
              className="p-3 rounded-xl bg-vibe-card-subtle border border-vibe-border-subtle space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-vibe-ink truncate">{curator.authorName}</span>
                <span className="font-mono text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Bookmark className="w-3 h-3 fill-current" />
                  {curator.savedCount}
                </span>
              </div>
              <p className="font-serif italic text-xs text-vibe-ink-secondary line-clamp-2 leading-relaxed">
                "{curator.quoteOrInsight}"
              </p>
              <p className="text-[10px] text-vibe-ink-muted truncate">
                — {curator.bookTitle}
              </p>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-vibe-border-subtle">
          <button
            type="button"
            onClick={onViewLeaderboard}
            className="w-full py-2 px-3 inline-flex items-center justify-center gap-1.5 text-xs font-medium text-vibe-accent hover:text-vibe-accent-hover hover:bg-vibe-accent-subtle/50 rounded-xl transition-all group cursor-pointer"
          >
            <span>Enter Sanctuary</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

    </aside>
  );
};
