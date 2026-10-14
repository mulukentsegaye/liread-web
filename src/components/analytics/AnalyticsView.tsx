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
import { useThemeStore } from '../../stores/themeStore';

export const AnalyticsView: React.FC = () => {
  const { user, todayMinutesRead } = useAuthStore();
  const { theme } = useThemeStore();
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

  // Dynamic theme colors for Recharts SVG
  const getThemeChartColors = () => {
    switch (theme) {
      case 'dark-academia':
        return { primary: '#8C7D6E', today: '#D4AF37', text: '#C2B5A5', bg: '#1C1611' };
      case 'deep-orbit':
        return { primary: '#7B2CBF', today: '#00F5D4', text: '#94A3B8', bg: '#0F172A' };
      case 'lofi-cafe':
        return { primary: '#FF9F1C', today: '#80ED99', text: '#C4CAD8', bg: '#212536' };
      case 'botanical-zen':
      default:
        return { primary: '#40916C', today: '#1B3B2B', text: '#496253', bg: '#FFFFFF' };
    }
  };

  const chartColors = getThemeChartColors();

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div>
        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>
          READING ANALYTICS
        </span>
        <h1 
          className="text-2xl sm:text-3xl md:text-4xl font-bold break-words"
          style={{
            fontFamily: 'var(--font-heading)',
            color: 'var(--text-primary)',
          }}
        >
          Your Reading Journey
        </h1>
        <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
          Detailed metrics of your habits, streaks, and milestones.
        </p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Today */}
        <div 
          className="rounded-2xl p-3 sm:p-4 border shadow-soft transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between mb-1.5" style={{ color: 'var(--text-muted)' }}>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase">Today</span>
            <Clock className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div 
            className="text-xl sm:text-2xl font-bold"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
            }}
          >
            {todayMinutesRead} <span className="text-xs font-sans font-normal opacity-70">min</span>
          </div>
          <p className="text-[10px] sm:text-[11px] mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
            Goal: {user.dailyGoalMinutes} min
          </p>
        </div>

        {/* Card 2: Streak */}
        <div 
          className="rounded-2xl p-3 sm:p-4 border shadow-soft transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between mb-1.5" style={{ color: 'var(--text-muted)' }}>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase">Streak</span>
            <Flame className="w-4 h-4" style={{ color: 'var(--accent-secondary)' }} />
          </div>
          <div 
            className="text-xl sm:text-2xl font-bold"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
            }}
          >
            {user.currentStreak} <span className="text-xs font-sans font-normal opacity-70">days</span>
          </div>
          <p className="text-[10px] sm:text-[11px] font-medium mt-1 truncate" style={{ color: 'var(--accent-primary)' }}>
            Active streak 🔥
          </p>
        </div>

        {/* Card 3: Rank Tier */}
        <div 
          className="rounded-2xl p-3 sm:p-4 border shadow-soft transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between mb-1.5" style={{ color: 'var(--text-muted)' }}>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase">Rank</span>
            <Award className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div className="text-sm sm:text-base font-bold truncate" style={{ color: 'var(--text-primary)' }}>
            {user.rankTier}
          </div>
          <p className="text-[10px] sm:text-[11px] mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
            {user.totalMinutesRead} total mins
          </p>
        </div>

        {/* Card 4: Bookshelf */}
        <div 
          className="rounded-2xl p-3 sm:p-4 border shadow-soft transition-all"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div className="flex items-center justify-between mb-1.5" style={{ color: 'var(--text-muted)' }}>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase">Library</span>
            <BookOpen className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          </div>
          <div 
            className="text-xl sm:text-2xl font-bold"
            style={{
              fontFamily: 'var(--font-heading)',
              color: 'var(--text-primary)',
            }}
          >
            {user.bookshelfCount} <span className="text-xs font-sans font-normal opacity-70">books</span>
          </div>
          <p className="text-[10px] sm:text-[11px] mt-1 truncate" style={{ color: 'var(--text-muted)' }}>
            {user.savedPassagesCount} saved quotes
          </p>
        </div>

      </div>

      {/* Main Chart Section */}
      <div 
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 border shadow-soft space-y-4 transition-all"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Minutes Read
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Daily average: <strong style={{ color: 'var(--text-secondary)' }}>{avgMinutes} min</strong>
            </p>
          </div>

          <div 
            className="flex items-center gap-1 p-1 rounded-xl border"
            style={{
              backgroundColor: 'var(--bg-surface-accent)',
              borderColor: 'var(--border-subtle)',
            }}
          >
            <button
              onClick={() => setTimeRange('7days')}
              className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg transition-all"
              style={{
                backgroundColor: timeRange === '7days' ? 'var(--bg-surface)' : 'transparent',
                color: timeRange === '7days' ? 'var(--accent-primary)' : 'var(--text-muted)',
                boxShadow: timeRange === '7days' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setTimeRange('30days')}
              className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg transition-all"
              style={{
                backgroundColor: timeRange === '30days' ? 'var(--bg-surface)' : 'transparent',
                color: timeRange === '30days' ? 'var(--accent-primary)' : 'var(--text-muted)',
                boxShadow: timeRange === '30days' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              }}
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
                tick={{ fontSize: 11, fill: chartColors.text }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: chartColors.text }} 
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                contentStyle={{ 
                  backgroundColor: chartColors.bg,
                  borderRadius: '12px', 
                  border: '1px solid var(--border-subtle)', 
                  boxShadow: 'var(--accent-glow)',
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-heading)',
                }}
                formatter={(val: number) => [`${val} minutes`, 'Time Read']}
              />
              <Bar dataKey="minutes" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.day === 'Today' || entry.day === 'This Wk' ? chartColors.today : chartColors.primary} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rank Tier Roadmap */}
      <div 
        className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 border space-y-3 transition-all"
        style={{
          backgroundColor: 'var(--bg-surface-accent)',
          borderColor: 'var(--border-subtle)',
        }}
      >
        <h3 className="text-xs sm:text-sm font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <Trophy className="w-4 h-4" style={{ color: 'var(--accent-primary)' }} />
          <span>Reader Rank Progression</span>
        </h3>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          You are currently a <strong style={{ color: 'var(--text-primary)' }}>{user.rankTier}</strong>. Log 678 more minutes to reach <strong style={{ color: 'var(--accent-primary)' }}>Avid Reader</strong> tier!
        </p>

        <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div 
            className="h-2.5 rounded-full transition-all duration-1000"
            style={{ 
              width: `${Math.min(100, (user.totalMinutesRead / 1200) * 100)}%`,
              backgroundColor: 'var(--accent-primary)',
              boxShadow: 'var(--accent-glow)',
            }}
          />
        </div>
        <div className="flex justify-between text-[9px] sm:text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
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
