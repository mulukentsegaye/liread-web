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
import { Flame, Trophy, Clock, Award, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../context/ThemeContext';

export const AnalyticsView: React.FC = () => {
  const { user, todayMinutesRead } = useAuthStore();
  const { vibeConfig } = useTheme();
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');

  const data7Days = [
    { day: 'Wed', minutes: 45 },
    { day: 'Thu', minutes: 60 },
    { day: 'Fri', minutes: 35 },
    { day: 'Sat', minutes: 75 },
    { day: 'Sun', minutes: 90 },
    { day: 'Mon', minutes: 50 },
    { day: 'Today', minutes: todayMinutesRead },
  ];

  const data30Days = [
    { day: 'Week 1', minutes: 320 },
    { day: 'Week 2', minutes: 410 },
    { day: 'Week 3', minutes: 380 },
    { day: 'This Wk', minutes: todayMinutesRead + 355 },
  ];

  const chartData = timeRange === '7days' ? data7Days : data30Days;
  const totalMinutesShown = chartData.reduce((acc, curr) => acc + curr.minutes, 0);
  const avgMinutes = Math.round(totalMinutesShown / chartData.length);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-vibe-ink-muted">
          READING ANALYTICS
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-vibe-ink break-words">
          Your Reading Journey
        </h1>
        <p className="text-xs sm:text-sm mt-0.5 text-vibe-ink-secondary">
          Detailed metrics of your habits, streaks, and milestones.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Today */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-3 sm:p-4 shadow-soft transition-all duration-500">
          <div className="flex items-center justify-between mb-1.5 text-vibe-ink-muted">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase">Today</span>
            <Clock className="w-4 h-4 text-vibe-accent" />
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-vibe-ink">
            {todayMinutesRead} <span className="text-xs font-sans font-normal opacity-70">min</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-vibe-ink-muted mt-1 truncate">
            Goal: {user.dailyGoalMinutes} min
          </p>
        </div>

        {/* Card 2: Streak */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-3 sm:p-4 shadow-soft transition-all duration-500">
          <div className="flex items-center justify-between mb-1.5 text-vibe-ink-muted">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase">Streak</span>
            <Flame className="w-4 h-4 text-vibe-secondary" />
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-vibe-ink">
            {user.currentStreak} <span className="text-xs font-sans font-normal opacity-70">days</span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-medium text-vibe-accent mt-1 truncate">
            Active streak 🔥
          </p>
        </div>

        {/* Card 3: Rank Tier */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-3 sm:p-4 shadow-soft transition-all duration-500">
          <div className="flex items-center justify-between mb-1.5 text-vibe-ink-muted">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase">Rank</span>
            <Award className="w-4 h-4 text-vibe-accent" />
          </div>
          <div className="text-sm sm:text-base font-bold text-vibe-ink truncate">
            {user.rankTier}
          </div>
          <p className="text-[10px] sm:text-[11px] text-vibe-ink-muted mt-1 truncate">
            {user.totalMinutesRead} total mins
          </p>
        </div>

        {/* Card 4: Bookshelf */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-3 sm:p-4 shadow-soft transition-all duration-500">
          <div className="flex items-center justify-between mb-1.5 text-vibe-ink-muted">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase">Library</span>
            <BookOpen className="w-4 h-4 text-vibe-accent" />
          </div>
          <div className="font-serif text-xl sm:text-2xl font-bold text-vibe-ink">
            {user.bookshelfCount} <span className="text-xs font-sans font-normal opacity-70">books</span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-vibe-ink-muted mt-1 truncate">
            {user.savedPassagesCount} saved quotes
          </p>
        </div>

      </div>

      {/* Main Chart Section */}
      <div className="bg-vibe-card border border-vibe-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-soft space-y-4 transition-all duration-500">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-vibe-ink">
              Minutes Read
            </h2>
            <p className="text-xs text-vibe-ink-muted">
              Daily average: <strong className="text-vibe-ink-secondary">{avgMinutes} min</strong>
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-full border border-vibe-border bg-vibe-card-subtle">
            <button
              onClick={() => setTimeRange('7days')}
              className={`min-h-[40px] px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                timeRange === '7days'
                  ? 'bg-vibe-card text-vibe-accent shadow-xs border border-vibe-border'
                  : 'text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`min-h-[40px] px-3.5 py-1.5 text-xs font-semibold rounded-full transition-all ${
                timeRange === '30days'
                  ? 'bg-vibe-card text-vibe-accent shadow-xs border border-vibe-border'
                  : 'text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              Past 30 Days
            </button>
          </div>
        </div>

        {/* Recharts Bar Chart wrapped with ResponsiveContainer */}
        <div className="w-full pt-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: vibeConfig.colors.inkMuted }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: vibeConfig.colors.inkMuted }} 
              />
              <Tooltip 
                cursor={{ fill: vibeConfig.colors.accentSubtle }}
                contentStyle={{ 
                  backgroundColor: vibeConfig.colors.card,
                  borderColor: vibeConfig.colors.border,
                  borderRadius: '12px', 
                  boxShadow: 'var(--vibe-shadow)',
                  fontSize: '12px',
                  color: vibeConfig.colors.ink,
                  fontFamily: 'var(--font-quote)',
                }}
                formatter={(val: number) => [`${val} minutes`, 'Time Read']}
              />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.day === 'Today' || entry.day === 'This Wk' ? vibeConfig.colors.accent : vibeConfig.colors.border} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rank Tier Roadmap */}
      <div className="bg-vibe-card-subtle border border-vibe-border rounded-2xl sm:rounded-3xl p-4 sm:p-6 space-y-3 transition-all duration-500">
        <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2 text-vibe-ink">
          <Trophy className="w-4 h-4 text-vibe-accent" />
          <span>Reader Rank Progression</span>
        </h3>
        <p className="text-xs text-vibe-ink-muted">
          You are currently a <strong className="text-vibe-ink">{user.rankTier}</strong>. Log 678 more minutes to reach <strong className="text-vibe-accent">Avid Reader</strong> tier!
        </p>

        <div className="w-full rounded-full h-2.5 overflow-hidden bg-vibe-card border border-vibe-border">
          <div 
            className="h-2.5 rounded-full transition-all duration-1000 bg-vibe-accent"
            style={{ 
              width: `${Math.min(100, (user.totalMinutesRead / 1200) * 100)}%`,
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] sm:text-[10px] font-mono text-vibe-ink-muted">
          <span>Novice (0m)</span>
          <span>Bookworm (300m)</span>
          <span>Avid (1.2k)</span>
          <span>Scholar (3k)</span>
          <span>Master (6k)</span>
        </div>
      </div>

    </div>
  );
};
