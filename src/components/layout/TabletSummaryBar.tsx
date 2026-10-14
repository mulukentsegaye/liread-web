import React, { useState } from 'react';
import { Flame, Trophy, ChevronDown, ChevronUp, Check, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { TOP_WEEKLY_READERS, CURRENT_USER_LEADERBOARD_STATUS, STREAK_DAYS } from '../../data/mockData';

interface TabletSummaryBarProps {
  onViewLeaderboard?: () => void;
  onAdjustGoal?: () => void;
}

export const TabletSummaryBar: React.FC<TabletSummaryBarProps> = ({ 
  onViewLeaderboard,
  onAdjustGoal 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { user, todayMinutesRead } = useAuthStore();

  const goal = user.dailyGoalMinutes || 60;
  const progressPercent = Math.min(100, Math.round((todayMinutesRead / goal) * 100));

  return (
    <div className="hidden md:block xl:hidden mb-6 bg-white rounded-2xl border border-[#e8ece8] shadow-soft overflow-hidden transition-all">
      {/* Compact Top Summary Strip */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 px-5 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition-colors"
      >
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Daily Goal Mini Stat */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg width="36" height="36" className="transform -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-[#edf1ee]"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  className="stroke-[#35523f] transition-all duration-700"
                  strokeWidth="3.5"
                  strokeDasharray={2 * Math.PI * 14}
                  strokeDashoffset={2 * Math.PI * 14 * (1 - progressPercent / 100)}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-gray-800">
                {todayMinutesRead}m
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                Daily Goal
              </p>
              <p className="text-[11px] text-gray-400">
                {progressPercent}% of {goal}m
              </p>
            </div>
          </div>

          {/* Streak Mini Stat */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#e8efe9] flex items-center justify-center text-[#35523f]">
              <Flame className="w-4 h-4 fill-[#35523f]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                {user.currentStreak}-Day Streak
              </p>
              <p className="text-[11px] text-gray-400">
                Active & running
              </p>
            </div>
          </div>

          {/* Weekly Standing */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-tight">
                #{CURRENT_USER_LEADERBOARD_STATUS.rank} This Week
              </p>
              <p className="text-[11px] text-gray-400 font-mono">
                {CURRENT_USER_LEADERBOARD_STATUS.formattedTime} read
              </p>
            </div>
          </div>
        </div>

        {/* Expand / Collapse Button */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span className="hidden sm:inline">{isExpanded ? 'Hide widgets' : 'View widgets'}</span>
          <div className="min-w-[36px] min-h-[36px] flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Tablet Panel */}
      {isExpanded && (
        <div className="p-5 border-t border-[#edf1ee] bg-[#fafbfa] grid grid-cols-2 gap-6 animate-in slide-in-from-top-2 duration-200">
          
          {/* Left: 7-Day Streak Strip */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">7-Day Reading Streak</span>
              <button
                onClick={onAdjustGoal}
                className="text-xs text-[#35523f] hover:underline flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>Adjust Goal</span>
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              {STREAK_DAYS.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400 font-medium">{item.day}</span>
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      item.isToday
                        ? 'bg-[#35523f] text-white shadow-xs'
                        : item.completed
                        ? 'bg-[#e7eee8] text-[#35523f]'
                        : 'bg-gray-100 text-gray-300'
                    }`}
                  >
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Top 3 Weekly Readers */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Top Weekly Readers</span>
              <button
                onClick={onViewLeaderboard}
                className="text-xs font-semibold text-[#35523f] hover:underline flex items-center gap-1"
              >
                <span>Full Leaderboard</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              {TOP_WEEKLY_READERS.slice(0, 3).map((entry) => (
                <div key={entry.userId} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="font-mono text-gray-400 text-[11px] w-3">{entry.rank}</span>
                    <span className="font-medium text-gray-700 truncate">{entry.fullName}</span>
                  </div>
                  <span className="font-mono text-gray-500 text-[11px] flex-shrink-0">{entry.formattedTime}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
