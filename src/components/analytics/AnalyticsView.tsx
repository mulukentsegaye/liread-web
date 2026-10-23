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
import { Flame, Trophy, Clock, Award, BookOpen, ArrowLeft, Hourglass } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useTheme } from '../../context/ThemeContext';
import { sessionsService } from '../../services/sessionsService';
import { useEffect } from 'react';

interface AnalyticsViewProps {
  onBack?: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onBack }) => {
  const { user, todayMinutesRead, isGuest } = useAuthStore();
  const { vibeConfig, isDark } = useTheme();
  const [timeRange, setTimeRange] = useState<'7days' | '30days'>('7days');
  const [sessions, setSessions] = useState<{ session_date: string; duration_minutes: number }[]>([]);

  useEffect(() => {
    if (!user || isGuest) { setSessions([]); return; }
    sessionsService.getUserSessions(user.id, 100).then((rows) => {
      setSessions(rows.map((r) => ({ session_date: r.sessionDate, duration_minutes: r.durationMinutes })));
    }).catch(() => setSessions([]));
  }, [user?.id, isGuest, todayMinutesRead]);

  // Build chart from real sessions; if no data, show empty/today only
  const build7DayData = () => {
    if (sessions.length === 0) {
      return isGuest
        ? [{ day: 'Today', minutes: 0 }]
        : [{ day: 'Today', minutes: todayMinutesRead }];
    }
    const map = new Map<string, number>();
    sessions.forEach((s) => map.set(s.session_date, (map.get(s.session_date) || 0) + s.duration_minutes));
    const days: { day: string; minutes: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const iso = d.toISOString().split('T')[0];
      const label = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
      days.push({ day: label, minutes: map.get(iso) || 0 });
    }
    return days;
  };

  const data7Days = build7DayData();

  const data30Days = (() => {
    if (sessions.length === 0) return [{ day: 'This Wk', minutes: todayMinutesRead }];
    // Simple weekly buckets for real data
    const weeks: { day: string; minutes: number }[] = [
      { day: 'Week 1', minutes: 0 },
      { day: 'Week 2', minutes: 0 },
      { day: 'Week 3', minutes: 0 },
      { day: 'This Wk', minutes: 0 },
    ];
    sessions.forEach((s) => {
      const d = new Date(s.session_date);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
      const bucket = diffDays < 7 ? 3 : diffDays < 14 ? 2 : diffDays < 21 ? 1 : 0;
      if (bucket >= 0) weeks[bucket].minutes += s.duration_minutes;
    });
    return weeks;
  })();

  const chartData = timeRange === '7days' ? data7Days : data30Days;
  const totalMinutesShown = chartData.reduce((acc, curr) => acc + curr.minutes, 0);
  const avgMinutes = Math.round(totalMinutesShown / chartData.length);

  if (!user) {
    return (
      <div className="p-8 text-center text-sm text-vibe-ink-muted">Sign in to view your analytics.</div>
    );
  }

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-fade-in">
      
      {isGuest && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-300 text-center">
          Guest analytics — create an account to persist reading stats. Timer sessions here are local only.
        </div>
      )}

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

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-vibe-accent" />
              <span className="font-sans text-[10.5px] font-medium tracking-wider uppercase text-vibe-ink-muted/80">
                Personal Analytics
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-normal tracking-tight text-vibe-ink leading-tight">
              Your Reading Journey
            </h1>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vibe-card border border-vibe-border shadow-soft self-start sm:self-auto">
            <Award className="w-4 h-4 text-vibe-accent flex-shrink-0" />
            <span className="text-xs font-medium text-vibe-ink">
              <span className="text-vibe-ink-muted font-normal mr-1">Rank:</span>
              {user.rankTier}
            </span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Today */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:px-4.5 sm:py-5 shadow-soft hover:border-vibe-border transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-vibe-ink-muted">Today</span>
            <div className="w-8 h-8 rounded-xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl sm:text-3xl font-semibold text-vibe-ink leading-tight">
              {todayMinutesRead} <span className="text-xs font-sans font-normal text-vibe-ink-muted">min</span>
            </div>
            <p className="text-xs text-vibe-ink-muted mt-1.5 flex items-center justify-between font-mono">
              <span>Goal: {user.dailyGoalMinutes}m</span>
              <span className="font-medium text-vibe-accent">
                {Math.round((todayMinutesRead / (user.dailyGoalMinutes || 60)) * 100)}%
              </span>
            </p>
          </div>
        </div>

        {/* Card 2: Streak */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:px-4.5 sm:py-5 shadow-soft hover:border-vibe-border transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-vibe-ink-muted">Streak</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Flame className="w-4 h-4 fill-current" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl sm:text-3xl font-semibold text-vibe-ink leading-tight">
              {user.currentStreak} <span className="text-xs font-sans font-normal text-vibe-ink-muted">days</span>
            </div>
            <p className="text-xs font-medium text-vibe-accent mt-1.5 flex items-center gap-1 font-mono">
              <span>Personal record 🔥</span>
            </p>
          </div>
        </div>

        {/* Card 3: Total Time */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:px-4.5 sm:py-5 shadow-soft hover:border-vibe-border transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-vibe-ink-muted">Total Time</span>
            <div className="w-8 h-8 rounded-xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl sm:text-3xl font-semibold text-vibe-ink leading-tight">
              {user.totalMinutesRead >= 60 ? (
                <>
                  {(user.totalMinutesRead / 60).toFixed(1)} <span className="text-xs font-sans font-normal text-vibe-ink-muted">hrs</span>
                </>
              ) : (
                <>
                  {user.totalMinutesRead} <span className="text-xs font-sans font-normal text-vibe-ink-muted">min</span>
                </>
              )}
            </div>
            <p className="font-mono text-xs text-vibe-ink-muted mt-1.5 truncate">
              {sessions.length > 0 ? `${sessions.length} logged ${sessions.length === 1 ? 'session' : 'sessions'}` : 'All-time reading'}
            </p>
          </div>
        </div>

        {/* Card 4: Bookshelf */}
        <div className="bg-vibe-card border border-vibe-border rounded-2xl p-4 sm:px-4.5 sm:py-5 shadow-soft hover:border-vibe-border transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="font-sans text-[11px] font-medium uppercase tracking-wider text-vibe-ink-muted">Library</span>
            <div className="w-8 h-8 rounded-xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="font-mono text-2xl sm:text-3xl font-semibold text-vibe-ink leading-tight">
              {user.bookshelfCount} <span className="text-xs font-sans font-normal text-vibe-ink-muted">books</span>
            </div>
            <p className="font-mono text-xs text-vibe-ink-muted mt-1.5">
              {user.savedPassagesCount} saved quotes
            </p>
          </div>
        </div>

      </div>

      {/* Main Chart Section */}
      <div className="bg-vibe-card border border-vibe-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-soft space-y-5 transition-all duration-300">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-vibe-ink">
              Reading Time
            </h2>
            <p className="text-xs sm:text-sm text-vibe-ink-muted mt-0.5">
              Daily average: <strong className="text-vibe-accent font-semibold">{avgMinutes} min / day</strong>
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
              <defs>
                {/* Active / Today Bar Gradient */}
                <linearGradient id="barGradientToday" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={vibeConfig.colors.accent} stopOpacity={1} />
                  <stop offset="100%" stopColor={isDark ? '#059669' : '#047857'} stopOpacity={0.92} />
                </linearGradient>

                {/* Past Reading Sessions Emerald Gradient - Replaces the old dull grey */}
                <linearGradient id="barGradientPast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isDark ? '#34D399' : '#10B981'} stopOpacity={0.88} />
                  <stop offset="100%" stopColor={isDark ? '#059669' : '#059669'} stopOpacity={0.65} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={({ x, y, payload }: any) => {
                  const isToday = payload.value === 'Today' || payload.value === 'This Wk';
                  return (
                    <text 
                      x={x} 
                      y={y + 14} 
                      textAnchor="middle" 
                      fontSize={12} 
                      fill={isToday ? vibeConfig.colors.accent : vibeConfig.colors.inkMuted}
                      fontWeight={isToday ? 700 : 500}
                    >
                      {payload.value}
                    </text>
                  );
                }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: vibeConfig.colors.inkMuted }} 
              />
              <Tooltip 
                cursor={{ fill: vibeConfig.colors.accentSubtle, opacity: 0.6 }}
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
                {chartData.map((entry, index) => {
                  const isToday = entry.day === 'Today' || entry.day === 'This Wk';
                  return (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={isToday ? "url(#barGradientToday)" : "url(#barGradientPast)"} 
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Rank Tier Roadmap */}
      <div className="bg-vibe-card border border-vibe-border rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-soft transition-all duration-300">
        <div className="flex items-center justify-between">
          <h3 className="font-heading text-lg sm:text-xl font-bold flex items-center gap-2 text-vibe-ink">
            <Trophy className="w-5 h-5 text-vibe-accent" />
            <span>Reader Rank Progression</span>
          </h3>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-vibe-accent-subtle text-vibe-accent border border-vibe-accent/20">
            {user!.rankTier}
          </span>
        </div>
        
        <p className="text-xs sm:text-sm text-vibe-ink-secondary">
          You are currently at <strong className="text-vibe-ink">{user!.rankTier}</strong>. Log {Math.max(0, 1200 - user!.totalMinutesRead)} more minutes to reach <strong className="text-vibe-accent">Avid Reader</strong> tier!
        </p>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full rounded-full h-3 overflow-hidden bg-vibe-card-subtle border border-vibe-border p-0.5">
            <div 
              className="h-full rounded-full transition-all duration-1000 bg-vibe-accent"
              style={{ 
                width: `${Math.min(100, (user!.totalMinutesRead / 1200) * 100)}%`,
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
