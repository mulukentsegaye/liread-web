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
        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          COMMUNITY RANKINGS
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#192b1e] break-words">
          Readers Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Celebrate reading time with readers across the world.
        </p>
      </div>

      {/* Filter Tabs (min 44px touch targets) */}
      <div className="flex items-center gap-2 border-b border-[#e8ece8] pb-3 overflow-x-auto">
        {(['daily', 'weekly', 'lifetime'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`min-h-[44px] px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all whitespace-nowrap active:scale-95 ${
              filter === tab
                ? 'bg-[#35523f] text-white shadow-xs'
                : 'text-gray-500 hover:text-gray-800 hover:bg-[#edf2ee]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top 3 Podium Highlights (Responsive: scales smoothly on mobile) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
        {/* Rank 2 */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#e8ece8] text-center flex flex-col items-center justify-between shadow-soft order-1">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px] sm:text-xs flex items-center justify-center mb-1">
            2
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#f0eee9] text-[#4d483f] font-bold flex items-center justify-center text-xs sm:text-sm my-1.5 sm:my-2">
            {currentList[1]?.initials}
          </div>
          <p className="text-[11px] sm:text-xs font-bold text-gray-800 truncate w-full">
            {currentList[1]?.fullName}
          </p>
          <span className="text-[10px] sm:text-[11px] font-mono text-gray-400 mt-0.5 sm:mt-1 truncate w-full">
            {currentList[1]?.formattedTime}
          </span>
        </div>

        {/* Rank 1 (Gold) */}
        <div className="bg-[#f7faf7] rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border-2 border-[#35523f]/30 text-center flex flex-col items-center justify-between shadow-md order-2 relative -translate-y-1 sm:-translate-y-2">
          <div className="absolute -top-3 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-amber-400 text-amber-950 font-bold text-[10px] sm:text-xs flex items-center justify-center shadow-xs">
            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-950" />
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#35523f] text-white font-bold flex items-center justify-center text-sm sm:text-base mt-2 mb-1 shadow-sm">
            {currentList[0]?.initials}
          </div>
          <p className="text-[11px] sm:text-xs font-bold text-[#1f2e22] truncate w-full">
            {currentList[0]?.fullName}
          </p>
          <span className="text-[11px] sm:text-xs font-mono font-bold text-[#35523f] mt-0.5 sm:mt-1 truncate w-full">
            {currentList[0]?.formattedTime}
          </span>
        </div>

        {/* Rank 3 */}
        <div className="bg-white rounded-xl sm:rounded-2xl p-2.5 sm:p-4 border border-[#e8ece8] text-center flex flex-col items-center justify-between shadow-soft order-3">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] sm:text-xs flex items-center justify-center mb-1">
            3
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#f0eee9] text-[#4d483f] font-bold flex items-center justify-center text-xs sm:text-sm my-1.5 sm:my-2">
            {currentList[2]?.initials}
          </div>
          <p className="text-[11px] sm:text-xs font-bold text-gray-800 truncate w-full">
            {currentList[2]?.fullName}
          </p>
          <span className="text-[10px] sm:text-[11px] font-mono text-gray-400 mt-0.5 sm:mt-1 truncate w-full">
            {currentList[2]?.formattedTime}
          </span>
        </div>
      </div>

      {/* Full Leaderboard Table (Responsive padding px-3 py-2 sm:px-6 sm:py-4) */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-[#e8ece8] shadow-soft space-y-2 sm:space-y-3 overflow-hidden">
        <h3 className="text-[11px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider px-2">
          Leaderboard Rankings
        </h3>

        <div className="divide-y divide-[#f0f4f0]">
          {currentList.map((entry) => (
            <div 
              key={entry.userId} 
              className="flex items-center justify-between px-2.5 py-2.5 sm:px-4 sm:py-3.5 hover:bg-[#f9faf9] rounded-xl transition-colors"
            >
              <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
                <span className="w-5 text-center font-mono text-xs sm:text-sm font-bold text-gray-400 flex-shrink-0">
                  {entry.rank}
                </span>
                <div className="w-8 h-8 rounded-full bg-[#f0eee9] text-[#4d483f] font-semibold text-xs flex items-center justify-center flex-shrink-0">
                  {entry.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-gray-800 truncate max-w-[130px] sm:max-w-xs">
                    {entry.fullName}
                  </p>
                  <p className="text-[10px] text-gray-400 truncate">
                    @{entry.username}
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="font-mono text-xs sm:text-sm font-bold text-[#233528]">
                  {entry.formattedTime}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Current User Standing Highlight */}
        <div className="mt-3 pt-3 border-t border-[#edf1ee]">
          <div className="bg-[#e7eee8] rounded-xl sm:rounded-2xl p-3 sm:p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <span className="w-5 text-center font-mono text-xs font-bold text-[#35523f] flex-shrink-0">
                #{userStanding.rank}
              </span>
              <div className="w-8 h-8 rounded-full bg-[#35523f] text-white font-semibold text-xs flex items-center justify-center flex-shrink-0">
                AM
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-[#1f2e22] truncate">
                  {userStanding.fullName} (You)
                </p>
                <p className="text-[10px] text-[#44634d] truncate">
                  Keep going to break into top 10!
                </p>
              </div>
            </div>

            <span className="font-mono text-xs sm:text-sm font-bold text-[#1f2e22] flex-shrink-0 pl-2">
              {userStanding.formattedTime}
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
