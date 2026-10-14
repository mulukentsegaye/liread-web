import React, { useState } from 'react';
import { Trophy } from 'lucide-react';
import { TOP_WEEKLY_READERS, CURRENT_USER_LEADERBOARD_STATUS } from '../../data/mockData';

export const LeaderboardView: React.FC = () => {
  const [filter, setFilter] = useState<'daily' | 'weekly' | 'lifetime'>('weekly');

  const multiplier = filter === 'daily' ? 0.15 : filter === 'weekly' ? 1 : 4.5;

  const currentList = TOP_WEEKLY_READERS.map((entry) => ({
    ...entry,
    minutesRead: Math.round(entry.minutesRead * multiplier),
    formattedTime:
      filter === 'daily'
        ? `${Math.floor((entry.minutesRead * multiplier) / 60)}h ${Math.round((entry.minutesRead * multiplier) % 60)}m`
        : filter === 'lifetime'
        ? `${Math.round((entry.minutesRead * multiplier) / 60)} hrs`
        : entry.formattedTime,
  }));

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
      
      {/* Header */}
      <div>
        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          COMMUNITY RANKINGS
        </span>
        <h1 
          className="text-2xl sm:text-3xl md:text-4xl font-bold break-words"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
          }}
        >
          Readers Leaderboard
        </h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Celebrate reading time with readers across the world.
        </p>
      </div>

      {/* Filter Tabs */}
      <div 
        className="flex items-center gap-2 border-b pb-3 overflow-x-auto"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        {(['daily', 'weekly', 'lifetime'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className="min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all whitespace-nowrap active:scale-95"
            style={{
              backgroundColor: filter === tab ? 'var(--accent-primary)' : 'transparent',
              color: filter === tab ? 'var(--accent-primary-fg)' : 'var(--text-muted)',
              border: filter === tab ? 'none' : '1px solid var(--border-subtle)',
              boxShadow: filter === tab ? 'var(--accent-glow)' : 'none',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top 3 Podium Highlights */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
        {/* Rank 2 */}
        <div 
          className="rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border text-center flex flex-col items-center justify-between shadow-soft order-1 transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-500/20 text-slate-300 font-bold text-[10px] sm:text-xs flex items-center justify-center mb-1">
            2
          </div>
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold flex items-center justify-center text-xs sm:text-sm my-1.5 sm:my-2 border"
            style={{
              backgroundColor: 'var(--bg-surface-accent)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            {currentList[1]?.initials}
          </div>
          <p className="text-[11px] sm:text-xs font-bold truncate w-full" style={{ color: 'var(--text-primary)' }}>
            {currentList[1]?.fullName}
          </p>
          <span className="text-[10px] sm:text-[11px] mt-0.5 sm:mt-1 truncate w-full" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {currentList[1]?.formattedTime}
          </span>
        </div>

        {/* Rank 1 (Gold) */}
        <div 
          className="rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border-2 text-center flex flex-col items-center justify-between shadow-md order-2 relative -translate-y-1 sm:-translate-y-2 transition-all"
          style={{
            backgroundColor: 'var(--bg-surface-active)',
            borderColor: 'var(--border-accent)',
            boxShadow: 'var(--accent-glow)',
          }}
        >
          <div 
            className="absolute -top-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full font-bold text-[10px] sm:text-xs flex items-center justify-center shadow-xs"
            style={{
              backgroundColor: 'var(--accent-secondary)',
              color: '#ffffff',
            }}
          >
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
          </div>
          <div 
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full font-bold flex items-center justify-center text-sm sm:text-base mt-2 mb-1 shadow-sm"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: 'var(--accent-primary-fg)',
            }}
          >
            {currentList[0]?.initials}
          </div>
          <p className="text-[11px] sm:text-xs font-bold truncate w-full" style={{ color: 'var(--text-primary)' }}>
            {currentList[0]?.fullName}
          </p>
          <span 
            className="text-[11px] sm:text-xs font-bold mt-0.5 sm:mt-1 truncate w-full"
            style={{
              fontFamily: 'var(--font-mono)',
              color: 'var(--accent-primary)',
            }}
          >
            {currentList[0]?.formattedTime}
          </span>
        </div>

        {/* Rank 3 */}
        <div 
          className="rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border text-center flex flex-col items-center justify-between shadow-soft order-3 transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px] sm:text-xs flex items-center justify-center mb-1">
            3
          </div>
          <div 
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full font-bold flex items-center justify-center text-xs sm:text-sm my-1.5 sm:my-2 border"
            style={{
              backgroundColor: 'var(--bg-surface-accent)',
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-primary)',
            }}
          >
            {currentList[2]?.initials}
          </div>
          <p className="text-[11px] sm:text-xs font-bold truncate w-full" style={{ color: 'var(--text-primary)' }}>
            {currentList[2]?.fullName}
          </p>
          <span className="text-[10px] sm:text-[11px] mt-0.5 sm:mt-1 truncate w-full" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            {currentList[2]?.formattedTime}
          </span>
        </div>
      </div>

      {/* Full Leaderboard Table */}
      <div 
        className="rounded-2xl sm:rounded-3xl p-3 sm:p-5 border shadow-soft space-y-2 sm:space-y-3 overflow-hidden transition-all"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider px-2" style={{ color: 'var(--text-muted)' }}>
          Leaderboard Rankings
        </h3>

        <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
          {currentList.map((entry) => (
            <div 
              key={entry.userId} 
              className="flex items-center justify-between px-2.5 py-2.5 sm:px-4 sm:py-3.5 rounded-xl transition-colors hover:opacity-90"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <span className="w-5 text-center text-xs sm:text-sm font-bold flex-shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  {entry.rank}
                </span>
                <div 
                  className="w-8 h-8 rounded-full font-semibold text-xs flex items-center justify-center flex-shrink-0 border"
                  style={{
                    backgroundColor: 'var(--bg-surface-accent)',
                    borderColor: 'var(--border-subtle)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {entry.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold truncate max-w-[130px] sm:max-w-xs" style={{ color: 'var(--text-primary)' }}>
                    {entry.fullName}
                  </p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--text-muted)' }}>
                    @{entry.username}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span 
                  className="text-xs sm:text-sm font-bold"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-primary)',
                  }}
                >
                  {entry.formattedTime}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Current User Standing Highlight */}
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
          <div 
            className="rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-center justify-between border"
            style={{
              backgroundColor: 'var(--bg-surface-active)',
              borderColor: 'var(--border-accent)',
            }}
          >
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="w-5 text-center text-xs font-bold flex-shrink-0" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)' }}>
                #{userStanding.rank}
              </span>
              <div 
                className="w-8 h-8 rounded-full font-semibold text-xs flex items-center justify-center flex-shrink-0"
                style={{
                  backgroundColor: 'var(--accent-primary)',
                  color: 'var(--accent-primary-fg)',
                }}
              >
                AM
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                  {userStanding.fullName} (You)
                </p>
                <p className="text-[10px] truncate" style={{ color: 'var(--accent-primary)' }}>
                  Keep going to break into top 10!
                </p>
              </div>
            </div>

            <span 
              className="text-xs sm:text-sm font-bold flex-shrink-0 pl-2"
              style={{
                fontFamily: 'var(--font-mono)',
                color: 'var(--accent-primary)',
              }}
            >
              {userStanding.formattedTime}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
