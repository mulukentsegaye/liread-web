import React, { useState, useEffect } from 'react';
import { Flame, Trophy, ChevronDown, ChevronUp, Check, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { leaderboardService } from '../../services/leaderboardService';
import { sessionsService } from '../../services/sessionsService';
import { LeaderboardEntry } from '../../types';

interface TabletSummaryBarProps {
  onViewLeaderboard?: () => void;
  onAdjustGoal?: () => void;
}

export const TabletSummaryBar: React.FC<TabletSummaryBarProps> = ({ 
  onViewLeaderboard,
  onAdjustGoal 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, todayMinutesRead, isGuest } = useAuthStore();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [streakDays, setStreakDays] = useState<{ day: string; completed: boolean; isToday?: boolean }[]>([]);

  useEffect(() => {
    let mounted = true;
    leaderboardService.getLeaderboard('weekly', user?.id, 5)
      .then((data) => { if (mounted) setLeaders(data || []); })
      .catch(() => { if (mounted) setLeaders([]); });
    return () => { mounted = false; };
  }, [user?.id, todayMinutesRead]);

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
      setStreakDays(days.map((day, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return { day, completed: dates.has(d.toISOString().split('T')[0]), isToday: i === 6 };
      }));
    }).catch(() => {});
    return () => { mounted = false; };
  }, [user?.id, isGuest, todayMinutesRead]);

  const goal = user?.dailyGoalMinutes || 60;
  const progressPercent = Math.min(100, Math.round((todayMinutesRead / goal) * 100));
  const userStanding = leaders.find((l) => l.userId === user?.id) || null;

  return (
    <div className="hidden md:block xl:hidden mb-6 rounded-2xl bg-vibe-card border border-vibe-border shadow-soft overflow-hidden transition-all duration-500">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 px-5 flex items-center justify-between cursor-pointer hover:bg-vibe-card-subtle/60 transition-colors"
      >
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Daily Goal Mini Stat */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg width="36" height="36" className="transform -rotate-90">
                <circle cx="18" cy="18" r="14" className="stroke-vibe-border" strokeWidth="3.5" fill="transparent" />
                <circle cx="18" cy="18" r="14" className="stroke-vibe-accent transition-all duration-700" strokeWidth="3.5" strokeDasharray={2 * Math.PI * 14} strokeDashoffset={2 * Math.PI * 14 * (1 - progressPercent / 100)} strokeLinecap="round" fill="transparent" />
              </svg>
              <span className="absolute font-mono text-[10px] font-medium text-vibe-ink">{todayMinutesRead}m</span>
            </div>
            <div>
              <p className="font-sans text-xs font-medium leading-tight text-vibe-ink">Daily Goal</p>
              <p className="font-mono text-[11px] text-vibe-ink-muted">{progressPercent}% of {goal}m</p>
            </div>
          </div>

          {/* Streak Mini Stat */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
              <Flame className="w-4 h-4 fill-current" />
            </div>
            <div>
              <p className="font-sans text-xs font-medium leading-tight text-vibe-ink">{user?.currentStreak ?? 0}-Day Streak</p>
              <p className="text-[11px] text-vibe-ink-muted">{(user?.currentStreak ?? 0) > 0 ? 'Active & running' : 'Log a session to begin'}</p>
            </div>
          </div>

          {/* Weekly Standing */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-vibe-card-subtle text-vibe-secondary flex items-center justify-center border border-vibe-border">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="font-sans text-xs font-medium leading-tight text-vibe-ink">
                {progressPercent >= 100 ? 'Circle Complete' : 'In Progress'}
              </p>
              <p className="text-[11px] font-mono text-vibe-ink-muted">
                {progressPercent}% of {goal}m goal
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-vibe-ink-muted">
          <span className="hidden sm:inline">{isExpanded ? 'Hide widgets' : 'View widgets'}</span>
          <div className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-vibe-card-subtle text-vibe-ink transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5 border-t border-vibe-border-subtle bg-vibe-card-subtle/40 grid grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
          {/* Left: 7-Day Streak Strip */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-semibold text-vibe-ink">7-Day Reading Streak</span>
              <button onClick={onAdjustGoal} className="text-xs text-vibe-accent hover:underline flex items-center gap-1 font-medium">
                <SlidersHorizontal className="w-3 h-3" /><span>Adjust Goal</span>
              </button>
            </div>
            <div className="flex items-center justify-between pt-1">
              {streakDays.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="font-mono text-[10px] font-medium text-vibe-ink-muted">{item.day}</span>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${item.isToday ? 'bg-vibe-accent text-white shadow-xs' : item.completed ? 'bg-vibe-accent-subtle text-vibe-accent' : 'bg-vibe-card text-vibe-ink-muted border border-vibe-border'}`}>
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Top Weekly Readers */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-semibold text-vibe-ink">Reading Sanctuary</span>
              <button onClick={onViewLeaderboard} className="text-xs font-semibold text-vibe-accent hover:underline flex items-center gap-1 cursor-pointer">
                <span>Enter Sanctuary</span><ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1.5 pt-0.5">
              {leaders.length === 0 ? (
                <p className="text-[11px] text-vibe-ink-muted py-2">No readers on the board yet.</p>
              ) : (
                leaders.slice(0, 3).map((entry) => (
                  <div key={entry.userId} className="flex items-center justify-between text-xs py-1 px-1.5 rounded-lg hover:bg-vibe-card-subtle transition-colors">
                    <div className="flex items-center gap-2 truncate">
                      <span className={`font-mono text-[11px] w-3 font-bold ${entry.rank === 1 ? 'text-amber-500' : entry.rank === 2 ? 'text-slate-400' : 'text-amber-700'}`}>{entry.rank}</span>
                      <div className="w-5 h-5 rounded-full bg-vibe-card-subtle text-vibe-ink border border-vibe-border text-[9px] font-bold flex items-center justify-center flex-shrink-0">{entry.initials}</div>
                      <span className="font-medium truncate text-vibe-ink">{entry.fullName}</span>
                    </div>
                    <span className="font-mono text-[11px] tabular-nums flex-shrink-0 text-vibe-ink-muted">{entry.formattedTime}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
