import React, { useState, useEffect } from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { TOP_WEEKLY_READERS, CURRENT_USER_LEADERBOARD_STATUS } from '../../data/mockData';
import { leaderboardService } from '../../services/leaderboardService';
import { useAuthStore } from '../../stores/authStore';
import { isSupabaseConfigured } from '../../lib/supabase';
import { LeaderboardEntry } from '../../types';

interface LeaderboardViewProps {
  onBack?: () => void;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ onBack }) => {
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'lifetime'>('weekly');
  const [remoteList, setRemoteList] = useState<LeaderboardEntry[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let isMounted = true;
    setIsLoading(true);

    leaderboardService
      .getLeaderboard(filter, user.id)
      .then((data) => {
        if (isMounted) {
          if (data && data.length > 0) {
            setRemoteList(data);
          } else {
            setRemoteList(null);
          }
        }
      })
      .catch((err) => {
        console.warn('Leaderboard fetch error, fallback to mock:', err);
        if (isMounted) setRemoteList(null);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [filter, user.id]);

  const multiplier = filter === 'daily' ? 0.15 : filter === 'weekly' ? 1 : 4.5;

  const mockList = TOP_WEEKLY_READERS.map((entry) => ({
    ...entry,
    minutesRead: Math.round(entry.minutesRead * multiplier),
    formattedTime:
      filter === 'daily'
        ? `${Math.floor((entry.minutesRead * multiplier) / 60)}h ${Math.round((entry.minutesRead * multiplier) % 60)}m`
        : filter === 'lifetime'
        ? `${Math.round((entry.minutesRead * multiplier) / 60)} hrs`
        : entry.formattedTime,
  }));

  const currentList = remoteList && remoteList.length > 0 ? remoteList : mockList;

  const userStanding = {
    ...CURRENT_USER_LEADERBOARD_STATUS,
    minutesRead: Math.round(CURRENT_USER_LEADERBOARD_STATUS.minutesRead * multiplier),
    formattedTime:
      filter === 'daily'
        ? '42m'
        : filter === 'lifetime'
        ? '39 hrs'
        : CURRENT_USER_LEADERBOARD_STATUS.formattedTime,
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fade-in">
      
      {/* Top Back Button & Section Header */}
      <div className="space-y-4">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-vibe-card border border-vibe-border text-xs font-medium text-vibe-ink-secondary hover:text-vibe-ink hover:border-vibe-border transition-colors group shadow-soft"
            aria-label="Back to feed"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Feed</span>
          </button>
        )}

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-vibe-accent" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-vibe-ink-muted">
                Community Rankings
              </span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-normal text-vibe-ink tracking-tight">
              Readers Leaderboard
            </h1>
            <p className="text-sm mt-1 text-vibe-ink-secondary">
              Celebrate reading consistency and milestones with readers worldwide.
            </p>
          </div>

          {/* Segmented Pill Filter Tabs */}
          <div className="flex items-center gap-1 p-1 rounded-full border border-vibe-border bg-vibe-card-subtle">
            {(['daily', 'weekly', 'lifetime'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-all active:scale-95 ${
                  filter === tab
                    ? 'bg-vibe-card text-vibe-accent font-semibold shadow-xs border border-vibe-border'
                    : 'text-vibe-ink-muted hover:text-vibe-ink'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Top 3 Podium Highlights */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 items-end pt-2">
        
        {/* Rank 2 (Silver) */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between shadow-soft order-1 transition-all duration-300 hover:border-vibe-border">
          <div className="w-6 h-6 rounded-full bg-slate-500/15 text-slate-500 font-bold text-xs flex items-center justify-center mb-2">
            2
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full font-serif font-bold flex items-center justify-center text-sm sm:text-base my-2 border-2 border-vibe-border bg-vibe-card-subtle text-vibe-ink shadow-xs">
            {currentList[1]?.initials}
          </div>
          <p className="text-xs sm:text-sm font-semibold truncate w-full text-vibe-ink mt-1">
            {currentList[1]?.fullName}
          </p>
          <span className="font-mono text-xs text-vibe-ink-muted mt-0.5 truncate w-full">
            {currentList[1]?.formattedTime}
          </span>
        </div>

        {/* Rank 1 (Gold - Elevated) */}
        <div className="bg-vibe-card border-2 border-vibe-accent rounded-2xl p-4 sm:p-6 text-center flex flex-col items-center justify-between shadow-float order-2 relative -translate-y-2 sm:-translate-y-3 transition-all duration-300">
          <div className="absolute -top-3.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs flex items-center justify-center shadow-md bg-amber-500 text-white">
            <Trophy className="w-4 h-4 fill-current" />
          </div>
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full font-serif font-bold flex items-center justify-center text-base sm:text-lg mt-3 mb-2 shadow-sm bg-vibe-accent text-white ring-4 ring-vibe-accent/20">
            {currentList[0]?.initials}
          </div>
          <p className="text-xs sm:text-sm font-bold truncate w-full text-vibe-ink mt-1">
            {currentList[0]?.fullName}
          </p>
          <span className="font-mono text-xs sm:text-sm font-bold text-vibe-accent mt-0.5 truncate w-full">
            {currentList[0]?.formattedTime}
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-500 mt-1">
            1st Place
          </span>
        </div>

        {/* Rank 3 (Bronze) */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:p-5 text-center flex flex-col items-center justify-between shadow-soft order-3 transition-all duration-300 hover:border-vibe-border">
          <div className="w-6 h-6 rounded-full bg-amber-700/15 text-amber-700 font-bold text-xs flex items-center justify-center mb-2">
            3
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full font-serif font-bold flex items-center justify-center text-sm sm:text-base my-2 border-2 border-vibe-border bg-vibe-card-subtle text-vibe-ink shadow-xs">
            {currentList[2]?.initials}
          </div>
          <p className="text-xs sm:text-sm font-semibold truncate w-full text-vibe-ink mt-1">
            {currentList[2]?.fullName}
          </p>
          <span className="font-mono text-xs text-vibe-ink-muted mt-0.5 truncate w-full">
            {currentList[2]?.formattedTime}
          </span>
        </div>
      </div>

      {/* Full Leaderboard Table Card */}
      <div className="bg-vibe-card border border-vibe-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft space-y-3 transition-all duration-300">
        <div className="flex items-center justify-between px-3 pb-2 border-b border-vibe-border-subtle text-xs font-semibold uppercase tracking-wider text-vibe-ink-muted">
          <span>Rank & Reader</span>
          <span>Time Logged</span>
        </div>

        <div className="divide-y divide-vibe-border-subtle">
          {currentList.map((entry) => (
            <div 
              key={entry.userId} 
              className="flex items-center justify-between px-3 py-3 rounded-xl transition-colors hover:bg-vibe-card-subtle group"
            >
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <span className={`font-mono w-6 text-center text-xs sm:text-sm font-bold flex-shrink-0 ${
                  entry.rank === 1 ? 'text-amber-500' :
                  entry.rank === 2 ? 'text-slate-400' :
                  entry.rank === 3 ? 'text-amber-700' :
                  'text-vibe-ink-muted'
                }`}>
                  {entry.rank}
                </span>
                <div className="w-8 h-8 rounded-full font-semibold text-xs flex items-center justify-center flex-shrink-0 border border-vibe-border bg-vibe-card-subtle text-vibe-ink group-hover:border-vibe-accent/40 transition-colors">
                  {entry.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-semibold truncate max-w-[150px] sm:max-w-xs text-vibe-ink group-hover:text-vibe-accent transition-colors">
                    {entry.fullName}
                  </p>
                  <p className="text-[11px] truncate text-vibe-ink-muted">
                    @{entry.username}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0 pl-3">
                <span className="font-mono text-xs sm:text-sm font-semibold text-vibe-ink tabular-nums">
                  {entry.formattedTime}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Current User Standing Highlight */}
        <div className="mt-4 pt-3 border-t border-vibe-border-subtle">
          <div className="bg-vibe-accent-subtle/80 border border-vibe-accent/30 rounded-2xl p-3.5 sm:p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <span className="font-mono w-6 text-center text-xs sm:text-sm font-bold flex-shrink-0 text-vibe-accent">
                #{userStanding.rank}
              </span>
              <div className="w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center flex-shrink-0 bg-vibe-accent text-white shadow-xs">
                AM
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-semibold truncate text-vibe-ink">
                  {userStanding.fullName} <span className="text-[11px] font-normal text-vibe-accent">(You)</span>
                </p>
                <p className="text-[11px] truncate text-vibe-ink-muted">
                  Keep reading today to climb the ranks!
                </p>
              </div>
            </div>

            <div className="text-right flex-shrink-0 pl-3">
              <span className="font-mono text-xs sm:text-sm font-bold text-vibe-accent tabular-nums">
                {userStanding.formattedTime}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
