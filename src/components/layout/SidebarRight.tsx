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
    <aside className="w-72 xl:w-80 flex-shrink-0 space-y-6 py-6 pl-4 pr-2 overflow-y-auto select-none">
      
      {/* 1. Daily Reading Goal Widget */}
      <div className="bg-white rounded-2xl p-5 border border-[#e8ece8] shadow-soft">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-800">
            Daily Reading Goal
          </h2>
          <button 
            onClick={onAdjustGoal}
            className="min-w-[36px] min-h-[36px] flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
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
                className="stroke-[#edf1ee]"
                strokeWidth={strokeWidth}
                fill="transparent"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                className="stroke-[#35523f] transition-all duration-700 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Inner Stats */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-[#1f3024] font-serif leading-none tracking-tight">
                {todayMinutesRead}
              </span>
              <span className="text-[11px] text-gray-400 font-medium mt-1">
                of {goal} minutes
              </span>
            </div>
          </div>

          {/* Subtext info */}
          <div className="text-center mt-3">
            <p className="text-xs font-semibold text-[#273d2f]">
              {progressPercent >= 100 
                ? 'Goal achieved! Amazing reading!' 
                : 'A little more, a little closer.'}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {minutesLeft > 0 ? `${minutesLeft} minutes to your daily goal.` : 'Daily reading completed!'}
            </p>
          </div>
        </div>

        {/* Streak Strip */}
        <div className="mt-5 pt-4 border-t border-[#edf1ee]">
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-5 h-5 rounded-full bg-[#e8efe9] flex items-center justify-center text-[#35523f]">
              <Flame className="w-3.5 h-3.5 fill-[#35523f]" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-none">
                {user.currentStreak}-day reading streak
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-none">
                Keep your story going.
              </p>
            </div>
          </div>

          {/* 7 Days Row */}
          <div className="flex items-center justify-between pt-1">
            {STREAK_DAYS.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-gray-400 font-medium">
                  {item.day}
                </span>
                <div 
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
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
      </div>

      {/* 2. Top 5 Weekly Readers Widget */}
      <div className="bg-white rounded-2xl p-5 border border-[#e8ece8] shadow-soft">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-sm font-semibold text-gray-800">
            Top 5 Weekly Readers
          </h2>
          <Trophy className="w-4 h-4 text-[#35523f]" />
        </div>
        <p className="text-[11px] text-gray-400 mb-4">
          October 12 – 18 · Time well spent
        </p>

        {/* Ranked items */}
        <div className="space-y-3">
          {TOP_WEEKLY_READERS.map((entry) => (
            <div key={entry.userId} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 truncate">
                <span className="w-4 text-center font-mono text-[11px] text-gray-400">
                  {entry.rank}
                </span>
                <div className="w-6 h-6 rounded-full bg-[#f0eee9] text-[#4d483f] font-medium flex items-center justify-center text-[10px] flex-shrink-0">
                  {entry.initials}
                </div>
                <span className="font-medium text-gray-700 truncate">
                  {entry.fullName}
                </span>
              </div>
              <span className="text-gray-400 font-mono text-[11px] flex-shrink-0">
                {entry.formattedTime}
              </span>
            </div>
          ))}

          {/* Current User Standing Highlight */}
          <div className="mt-3 pt-2">
            <div className="bg-[#e7eee8] rounded-xl px-3 py-2 flex items-center justify-between text-xs text-[#24392b] font-medium">
              <span>#{CURRENT_USER_LEADERBOARD_STATUS.rank} · You</span>
              <span className="font-mono text-[11px] font-semibold">
                {CURRENT_USER_LEADERBOARD_STATUS.formattedTime}
              </span>
            </div>
          </div>
        </div>

        {/* View Full Leaderboard Link */}
        <div className="mt-4 pt-3 border-t border-[#edf1ee] text-center">
          <button
            onClick={onViewLeaderboard}
            className="min-h-[44px] inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-[#35523f] hover:text-[#213528] transition-colors group w-full"
          >
            <span>View full leaderboard</span>
            <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 3. Community Inspiring Banner */}
      <div className="p-5 rounded-2xl bg-transparent border border-dashed border-[#d8e0d9]">
        <span className="text-[10px] font-bold tracking-widest text-gray-400 uppercase block mb-1">
          Better, Together
        </span>
        <h3 className="font-serif italic text-base text-[#25392b] leading-snug font-medium mb-1.5">
          Different books. The same love of reading.
        </h3>
        <p className="text-xs text-gray-500">
          Join 2,418 readers turning pages today.
        </p>
      </div>

    </aside>
  );
};
