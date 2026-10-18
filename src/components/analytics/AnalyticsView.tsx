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
import { Flame, Trophy, Clock, Award, BookOpen, ArrowLeft } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../context/ThemeContext';

interface AnalyticsViewProps {
  onBack?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onBack }) => {
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

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-vibe-accent" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-vibe-ink-muted">
              Personal Analytics
            </span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-vibe-ink tracking-tight">
            Your Reading Journey
          </h1>
          <p className="text-sm mt-1 text-vibe-ink-secondary max-w-xl">
            Detailed insights into your reading consistency, streaks, and literary milestones.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Today */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:p-5 shadow-soft hover:border-vibe-border transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-vibe-ink-muted">Today</span>
            <div className="w-8 h-8 rounded-xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-semibold text-vibe-ink leading-tight">
              {todayMinutesRead} <span className="text-xs font-sans font-normal text-vibe-ink-muted">min</span>
            </div>
            <p className="text-xs text-vibe-ink-muted mt-1.5 flex items-center justify-between">
              <span>Goal: {user.dailyGoalMinutes}m</span>
              <span className="font-medium text-vibe-accent">
                {Math.round((todayMinutesRead / (user.dailyGoalMinutes || 60)) * 100)}%
              </span>
            </p>
          </div>
        </div>

        {/* Card 2: Streak */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:p-5 shadow-soft hover:border-vibe-border transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-vibe-ink-muted">Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-semibold text-vibe-ink leading-tight">
              {user.currentStreak} <span className="text-xs font-sans font-normal text-vibe-ink-muted">days</span>
            </div>
            <p className="text-xs font-medium text-vibe-accent mt-1.5 flex items-center gap-1">
              <span>Personal record 🔥</span>
            </p>
          </div>
        </div>

        {/* Card 3: Rank Tier */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:p-5 shadow-soft hover:border-vibe-border transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-vibe-ink-muted">Rank Tier</span>
            <div className="w-8 h-8 rounded-xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-xl sm:text-2xl font-semibold text-vibe-ink leading-tight truncate">
              {user.rankTier}
            </div>
            <p className="text-xs text-vibe-ink-muted mt-1.5">
              {user.totalMinutesRead.toLocaleString()} total logged mins
            </p>
          </div>
        </div>

        {/* Card 4: Bookshelf */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:p-5 shadow-soft hover:border-vibe-border transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-vibe-ink-muted">Library</span>
            <div className="w-8 h-8 rounded-xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-serif text-2xl sm:text-3xl font-semibold text-vibe-ink leading-tight">
              {user.bookshelfCount} <span className="text-xs font-sans font-normal text-vibe-ink-muted">books</span>
            </div>
            <p className="text-xs text-vibe-ink-muted mt-1.5">
              {user.savedPassagesCount} saved quotes
            </p>
          </div>
        </div>

      </div>

      {/* Main Chart Section */}
      <div className="bg-vibe-card border border-vibe-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-soft space-y-5 transition-all duration-300">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-normal text-vibe-ink">
              Reading Time
            </h2>
            <p className="text-xs sm:text-sm text-vibe-ink-muted mt-0.5">
              Daily average: <strong className="text-vibe-ink font-semibold">{avgMinutes} min / day</strong>
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-full border border-vibe-border bg-vibe-card-subtle">
            <button
              onClick={() => setTimeRange('7days')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all ${
                timeRange === '7days'
                  ? 'bg-vibe-card text-vibe-accent font-semibold shadow-xs border border-vibe-border'
                  : 'text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all ${
                timeRange === '30days'
                  ? 'bg-vibe-card text-vibe-accent font-semibold shadow-xs border border-vibe-border'
                  : 'text-vibe-ink-muted hover:text-vibe-ink'
              }`}
            >
              Past 30 Days
            </button>
          </div>
        </div>

        {/* Recharts Bar Chart wrapped with ResponsiveContainer */}
        <div className="w-full pt-2">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: vibeConfig.colors.inkMuted }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: vibeConfig.colors.inkMuted }} 
              />
              <Tooltip 
                cursor={{ fill: vibeConfig.colors.accentSubtle, opacity: 0.5 }}
                contentStyle={{ 
                  backgroundColor: vibeConfig.colors.card,
                  borderColor: vibeConfig.colors.border,
                  borderRadius: '12px', 
                  boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                  fontSize: '12px',
                  color: vibeConfig.colors.ink,
                  fontWeight: 500,
                  padding: '8px 12px'
                }}
                formatter={(val: number) => [`${val} minutes`, 'Reading Time']}
              />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]} maxBarSize={48}>
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
      <div className="bg-vibe-card border border-vibe-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-soft transition-all duration-300">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg sm:text-xl font-normal flex items-center gap-2 text-vibe-ink">
            <Trophy className="w-5 h-5 text-vibe-accent" />
            <span>Reader Rank Progression</span>
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-vibe-accent-subtle text-vibe-accent border border-vibe-accent/20">
            {user.rankTier}
          </span>
        </div>
        
        <p className="text-xs sm:text-sm text-vibe-ink-secondary">
          You are currently at <strong className="text-vibe-ink">{user.rankTier}</strong>. Log {Math.max(0, 1200 - user.totalMinutesRead)} more minutes to reach <strong className="text-vibe-accent">Avid Reader</strong> tier!
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full rounded-full h-3 overflow-hidden bg-vibe-card-subtle border border-vibe-border p-0.5">
            <div 
              className="h-full rounded-full transition-all duration-1000 bg-vibe-accent"
              style={{ 
                width: `${Math.min(100, (user.totalMinutesRead / 1200) * 100)}%`,
              }}
            />
          </div>
          <div className="flex justify-between text-[10px] sm:text-[11px] font-mono text-vibe-ink-muted">
            <span className="font-semibold text-vibe-ink">Novice (0m)</span>
            <span>Bookworm (300m)</span>
            <span className="text-vibe-accent font-semibold">Avid (1.2k)</span>
            <span>Scholar (3k)</span>
            <span>Master (6k)</span>
          </div>
        </div>
      </div>

    </div>
  );
};
