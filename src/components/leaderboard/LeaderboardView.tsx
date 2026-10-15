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
    <div className="w-full space-y-4 sm:space-y-6">
      
      {/* Top Back Button */}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-vibe-accent hover:text-vibe-accent-hover transition-colors group mb-1"
          aria-label="Back to feed"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Feed</span>
        </button>
      )}

      {/* Header */}
      <div>
        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-vibe-ink-muted">
          COMMUNITY RANKINGS
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-vibe-ink break-words">
          Readers Leaderboard
        </h1>
        <p className="text-xs sm:text-sm mt-0.5 text-vibe-ink-secondary">
          Celebrate reading time with readers across the world.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-vibe-border pb-3 overflow-x-auto">
        {(['daily', 'weekly', 'lifetime'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`min-h-[40px] px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold capitalize transition-all whitespace-nowrap active:scale-95 ${
              filter === tab
                ? 'bg-vibe-accent text-white shadow-xs'
                : 'bg-vibe-card text-vibe-ink-muted border border-vibe-border hover:text-vibe-ink'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top 3 Podium Highlights */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
        {/* Rank 2 */}
        <div className="bg-vibe-card border border-vibe-border rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center flex flex-col items-center justify-between shadow-soft order-1 transition-all duration-500">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-500/20 text-slate-400 font-bold text-[10px] sm:text-xs flex items-center justify-center mb-1">
            2
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold flex items-center justify-center text-xs sm:text-sm my-1.5 sm:my-2 border border-vibe-border bg-vibe-card-subtle text-vibe-ink">
            {currentList[1]?.initials}
          </div>
          <p className="text-[11px] sm:text-xs font-bold truncate w-full text-vibe-ink">
            {currentList[1]?.fullName}
          </p>
          <span className="font-mono text-[10px] sm:text-[11px] text-vibe-ink-muted mt-0.5 sm:mt-1 truncate w-full">
            {currentList[1]?.formattedTime}
          </span>
        </div>

        {/* Rank 1 (Gold) */}
        <div className="bg-vibe-card-subtle border-2 border-vibe-accent rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center flex flex-col items-center justify-between shadow-vibe order-2 relative -translate-y-1 sm:-translate-y-2 transition-all duration-500">
          <div className="absolute -top-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full font-bold text-[10px] sm:text-xs flex items-center justify-center shadow-xs bg-vibe-secondary text-white">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full font-bold flex items-center justify-center text-sm sm:text-base mt-2 mb-1 shadow-sm bg-vibe-accent text-white">
            {currentList[0]?.initials}
          </div>
          <p className="text-[11px] sm:text-xs font-bold truncate w-full text-vibe-ink">
            {currentList[0]?.fullName}
          </p>
          <span className="font-mono text-[11px] sm:text-xs font-bold text-vibe-accent mt-0.5 sm:mt-1 truncate w-full">
            {currentList[0]?.formattedTime}
          </span>
        </div>

        {/* Rank 3 */}
        <div className="bg-vibe-card border border-vibe-border rounded-xl sm:rounded-2xl p-2.5 sm:p-4 text-center flex flex-col items-center justify-between shadow-soft order-3 transition-all duration-500">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500/20 text-amber-500 font-bold text-[10px] sm:text-xs flex items-center justify-center mb-1">
            3
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold flex items-center justify-center text-xs sm:text-sm my-1.5 sm:my-2 border border-vibe-border bg-vibe-card-subtle text-vibe-ink">
            {currentList[2]?.initials}
          </div>
          <p className="text-[11px] sm:text-xs font-bold truncate w-full text-vibe-ink">
            {currentList[2]?.fullName}
          </p>
          <span className="font-mono text-[10px] sm:text-[11px] text-vibe-ink-muted mt-0.5 sm:mt-1 truncate w-full">
            {currentList[2]?.formattedTime}
          </span>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div className="bg-vibe-card border border-vibe-border rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-soft space-y-2 sm:space-y-3 overflow-hidden transition-all duration-500">
        <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider px-2 text-vibe-ink-muted">
          Leaderboard Rankings
        </h3>

        <div className="divide-y divide-vibe-border-subtle">
          {currentList.map((entry) => (
            <div 
              key={entry.userId} 
              className="flex items-center justify-between px-2.5 py-2.5 sm:px-4 sm:py-3.5 rounded-xl transition-colors hover:bg-vibe-card-subtle"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <span className="font-mono w-5 text-center text-xs sm:text-sm font-bold flex-shrink-0 text-vibe-ink-muted">
                  {entry.rank}
                </span>
                <div className="w-8 h-8 rounded-full font-semibold text-xs flex items-center justify-center flex-shrink-0 border border-vibe-border bg-vibe-card-subtle text-vibe-ink">
                  {entry.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold truncate max-w-[130px] sm:max-w-xs text-vibe-ink">
                    {entry.fullName}
                  </p>
                  <p className="text-[10px] truncate text-vibe-ink-muted">
                    @{entry.username}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-mono text-xs sm:text-sm font-bold text-vibe-ink">
                  {entry.formattedTime}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Current User Standing Highlight */}
        <div className="mt-3 pt-3 border-t border-vibe-border-subtle">
          <div className="bg-vibe-accent-subtle border border-vibe-accent/30 rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="font-mono w-5 text-center text-xs font-bold flex-shrink-0 text-vibe-accent">
                #{userStanding.rank}
              </span>
              <div className="w-8 h-8 rounded-full font-semibold text-xs flex items-center justify-center flex-shrink-0 bg-vibe-accent text-white">
                AM
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold truncate text-vibe-ink">
                  {userStanding.fullName} (You)
                </p>
                <p className="text-[10px] truncate text-vibe-accent">
                  Keep going to break into top 10!
                </p>
              </div>
            </div>

            <span className="font-mono text-xs sm:text-sm font-bold flex-shrink-0 pl-2 text-vibe-accent">
              {userStanding.formattedTime}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
