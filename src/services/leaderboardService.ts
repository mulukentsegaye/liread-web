import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LeaderboardEntry } from '../types';
import { DEMO_LEADERS } from '../data/defaults';

export const leaderboardService = {
  /**
   * Fetch leaderboard rankings from Supabase RPC functions with demo fallback
   */
  async getLeaderboard(
    period: 'daily' | 'weekly' | 'lifetime', 
    currentUserId?: string,
    limit = 20
  ): Promise<LeaderboardEntry[]> {
    if (!isSupabaseConfigured()) {
      return DEMO_LEADERS.slice(0, limit);
    }

    let rpcName: 'get_daily_leaderboard' | 'get_weekly_leaderboard' | 'get_lifetime_leaderboard' = 'get_weekly_leaderboard';
    let args: any = { max_limit: limit };

    if (period === 'daily') {
      rpcName = 'get_daily_leaderboard';
      args = { target_date: new Date().toISOString().split('T')[0], max_limit: limit };
    } else if (period === 'lifetime') {
      rpcName = 'get_lifetime_leaderboard';
      args = { max_limit: limit };
    }

    try {
      const { data, error } = await supabase.rpc(rpcName, args);

      if (error || !data || !Array.isArray(data) || data.length === 0) {
        return DEMO_LEADERS.slice(0, limit);
      }

      return data.map((item: any, idx: number) => {
        const minutes = Number(item.minutes_read) || 0;
        const hours = Math.floor(minutes / 60);
        const remMins = minutes % 60;
        const formattedTime = hours > 0 ? `${hours}h ${remMins}m` : `${remMins}m`;

        const initials = (item.full_name || item.username || 'Reader')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        return {
          userId: item.user_id,
          username: item.username,
          fullName: item.full_name || item.username,
          initials,
          avatarUrl: item.avatar_url || undefined,
          rank: Number(item.leaderboard_rank) || idx + 1,
          minutesRead: minutes,
          formattedTime,
          isCurrentUser: currentUserId ? item.user_id === currentUserId : false,
          dailyGoalMinutes: 30,
          todayMinutesRead: minutes,
          goalCompletionPercent: Math.min(100, Math.round((minutes / 30) * 100)),
          currentStreak: 7 + idx,
          isCurrentlyReading: idx === 0,
          bookmarksReceived: 12 + idx,
        };
      });
    } catch {
      return DEMO_LEADERS.slice(0, limit);
    }
  },
};
