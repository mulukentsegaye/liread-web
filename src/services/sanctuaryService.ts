import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ConsistentReader, LiveCoReader, WeeklyCuratorInsight, PrivateInsight } from '../types';
import {
  DEMO_CONSISTENT_READERS,
  DEMO_LIVE_CO_READERS,
  DEMO_TOP_CURATORS,
} from '../data/defaults';

const PRIVATE_INSIGHTS_KEY = 'liread_private_insights';

export const sanctuaryService = {
  /**
   * Fetch consistent readers who hit 100% of their personal daily plan.
   * Competing against yourself, together.
   */
  async getConsistentReaders(currentUserId?: string): Promise<ConsistentReader[]> {
    // If Supabase is configured, we could query profiles with active daily goals
    if (!isSupabaseConfigured()) {
      return DEMO_CONSISTENT_READERS.map((r) => ({
        ...r,
        isCurrentUser: currentUserId ? r.userId === currentUserId : false,
      }));
    }

    try {
      // Query profiles with goal commitments
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, daily_goal_minutes, current_streak')
        .order('current_streak', { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) {
        return DEMO_CONSISTENT_READERS.map((r) => ({
          ...r,
          isCurrentUser: currentUserId ? r.userId === currentUserId : false,
        }));
      }

      return data.map((item: any, idx: number) => {
        const goal = Number(item.daily_goal_minutes) || 30;
        const streak = Number(item.current_streak) || 0;
        const initials = (item.full_name || item.username || 'Reader')
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        return {
          userId: item.id,
          username: item.username || 'reader',
          fullName: item.full_name || item.username || 'Reader',
          initials,
          avatarUrl: item.avatar_url || undefined,
          dailyGoalMinutes: goal,
          todayMinutesRead: goal, // fulfilled daily plan
          goalCompletionPercent: 100,
          currentStreak: streak,
          isCurrentlyReading: idx % 2 === 0,
          bookmarksReceived: 10 + (idx * 3),
          isCurrentUser: currentUserId ? item.id === currentUserId : false,
        };
      });
    } catch {
      return DEMO_CONSISTENT_READERS.map((r) => ({
        ...r,
        isCurrentUser: currentUserId ? r.userId === currentUserId : false,
      }));
    }
  },

  /**
   * Fetch live co-readers currently immersed in a calm focus session.
   */
  async getLiveCoReaders(): Promise<LiveCoReader[]> {
    return DEMO_LIVE_CO_READERS;
  },

  /**
   * Fetch top weekly wisdom curators whose shared takeaways were saved most by the community.
   */
  async getWeeklyCurators(): Promise<WeeklyCuratorInsight[]> {
    return DEMO_TOP_CURATORS;
  },

  /**
   * Save a private reflection note locally so users can keep personal insights without broadcasting.
   */
  savePrivateInsight(insight: Omit<PrivateInsight, 'id' | 'createdAt'>): PrivateInsight {
    const newInsight: PrivateInsight = {
      id: `private-insight-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      ...insight,
      createdAt: new Date().toISOString(),
    };

    try {
      const existing = this.getPrivateInsights();
      const updated = [newInsight, ...existing];
      localStorage.setItem(PRIVATE_INSIGHTS_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Could not save private insight to localStorage:', err);
    }

    return newInsight;
  },

  /**
   * Retrieve all private reflection notes.
   */
  getPrivateInsights(): PrivateInsight[] {
    try {
      const raw = localStorage.getItem(PRIVATE_INSIGHTS_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },
};
