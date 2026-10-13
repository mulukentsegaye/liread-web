import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';
import { Flame, Trophy, Clock, Award, Target, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

export const AnalyticsView: React.FC = () => {
  const { user, todayMinutesRead } = useAuthStore();
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');

  // Past 7 Days reading mock data
  const data7Days = [
    { day: 'Wed', minutes: 45 },
    { day: 'Thu', minutes: 60 },
    { day: 'Fri', minutes: 35 },
    { day: 'Sat', minutes: 75 },
    { day: 'Sun', minutes: 90 },
    { day: 'Mon', minutes: 50 },
    { day: 'Today', minutes: todayMinutesRead },
  ];

  // Past 30 Days sample aggregate data
  const data30Days = [
    { day: 'Week 1', minutes: 320 },
    { day: 'Week 2', minutes: 410 },
    { day: 'Week 3', minutes: 380 },
    { day: 'This Week', minutes: todayMinutesRead + 355 },
  ];

  const chartData = timeRange === '7days' ? data7Days : data30Days;
  const totalMinutesShown = chartData.reduce((acc, curr) => acc + curr.minutes, 0);
  const avgMinutes = Math.round(totalMinutesShown / chartData.length);

  return (
    <div className="flex-1 max-w-3xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">
          READING ANALYTICS
        </span>
        <h1 className="font-serif text-3xl font-bold text-[#192b1e]">
          Your Reading Journey
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Detailed metrics of your habits, streaks, and milestones.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: Today */}
        <div className="bg-white rounded-2xl p-4 border border-[#e8ece8] shadow-soft">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-semibold uppercase">Today</span>
            <Clock className="w-4 h-4 text-[#38523f]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#1f2e22]">
            {todayMinutesRead} <span className="text-xs font-sans text-gray-500 font-normal">min</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            Goal: {user.dailyGoalMinutes} min
          </p>
        </div>

        {/* Card 2: Streak */}
        <div className="bg-white rounded-2xl p-4 border border-[#e8ece8] shadow-soft">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-semibold uppercase">Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#1f2e22]">
            {user.currentStreak} <span className="text-xs font-sans text-gray-500 font-normal">days</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            Active streak 🔥
          </p>
        </div>

        {/* Card 3: Rank Tier */}
        <div className="bg-white rounded-2xl p-4 border border-[#e8ece8] shadow-soft">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-semibold uppercase">Rank Tier</span>
            <Award className="w-4 h-4 text-[#38523f]" />
          </div>
          <div className="text-base font-bold text-[#1f2e22] truncate">
            {user.rankTier}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {user.totalMinutesRead} total mins
          </p>
        </div>

        {/* Card 4: Bookshelf */}
        <div className="bg-white rounded-2xl p-4 border border-[#e8ece8] shadow-soft">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-semibold uppercase">Library</span>
            <BookOpen className="w-4 h-4 text-[#38523f]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#1f2e22]">
            {user.bookshelfCount} <span className="text-xs font-sans text-gray-500 font-normal">books</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">
            {user.savedPassagesCount} saved quotes
          </p>
        </div>

      </div>

      {/* Main Chart Section */}
      <div className="bg-white rounded-3xl p-6 border border-[#e8ece8] shadow-soft space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-800">
              Minutes Read
            </h2>
            <p className="text-xs text-gray-400">
              Daily average: <strong className="text-gray-700">{avgMinutes} min</strong>
            </p>
          </div>

          <div className="flex items-center gap-1 bg-[#f0f4f0] p-1 rounded-xl">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeRange === '7days'
                  ? 'bg-white text-[#253d2d] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timeRange === '30days'
                  ? 'bg-white text-[#253d2d] shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Past 30 Days
            </button>
          </div>
        </div>

        {/* Recharts Bar Chart */}
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#8c9c90' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#8c9c90' }} 
              />
              <Tooltip 
                cursor={{ fill: '#f2f7f3' }}
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e1e9e2', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  fontSize: '12px',
                  fontFamily: 'Inter, sans-serif'
                }}
                formatter={(val: number) => [`${val} minutes`, 'Time Read']}
              />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.day === 'Today' || entry.day === 'This Week' ? '#35523f' : '#8fa996'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rank Tier Roadmap */}
      <div className="bg-[#f5f8f5] rounded-3xl p-6 border border-[#e1eae2] space-y-3">
        <h3 className="text-sm font-bold text-[#203425] flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#35523f]" />
          <span>Reader Rank Progression</span>
        </h3>
        <p className="text-xs text-gray-500">
          You are currently a <strong className="text-gray-800">{user.rankTier}</strong>. Log 678 more minutes to reach <strong className="text-[#35523f]">Avid Reader</strong> tier!
        </p>

        <div className="w-full bg-[#e3ebe4] rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-[#35523f] h-2.5 rounded-full transition-all duration-1000"
            style={{ width: `${Math.min(100, (user.totalMinutesRead / 1200) * 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-gray-400 font-mono">
          <span>Novice (0m)</span>
          <span>Bookworm (300m)</span>
          <span>Avid (1,200m)</span>
          <span>Scholar (3,000m)</span>
          <span>Master (6,000m)</span>
        </div>
      </div>

    </div>
  );
};
