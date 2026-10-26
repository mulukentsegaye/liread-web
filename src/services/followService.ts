import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface FollowCounts {
  followersCount: number;
  followingCount: number;
}

export const followService = {
  /**
   * Check if current user follows a target user
   */
  async isFollowing(followerId?: string | null, followingId?: string | null): Promise<boolean> {
    if (!followerId || !followingId || followerId === followingId) return false;
    if (!isSupabaseConfigured()) return false;

    try {
      const { data, error } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', followerId)
        .eq('following_id', followingId)
        .maybeSingle();

      if (error) {
        console.warn('isFollowing check error:', error.message);
        return false;
      }

      return Boolean(data);
    } catch (err) {
      console.warn('isFollowing error:', err);
      return false;
    }
  },

  /**
   * Follow a user
   */
  async follow(followerId: string, followingId: string): Promise<void> {
    if (!followerId || !followingId || followerId === followingId) {
      throw new Error('Invalid follow operation.');
    }
    if (!isSupabaseConfigured()) {
      return;
    }

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: followerId,
        following_id: followingId,
      });

    if (error && error.code !== '23505') {
      // 23505 is unique violation (already following)
      throw error;
    }
  },

  /**
   * Unfollow a user
   */
  async unfollow(followerId: string, followingId: string): Promise<void> {
    if (!followerId || !followingId) return;
    if (!isSupabaseConfigured()) return;

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  },

  /**
   * Get accurate real-time followers and following counts for any user
   */
  async getFollowCounts(userId: string): Promise<FollowCounts> {
    if (!userId || !isSupabaseConfigured()) {
      return { followersCount: 0, followingCount: 0 };
    }

    try {
      const [followersRes, followingRes] = await Promise.all([
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId),
      ]);

      return {
        followersCount: typeof followersRes.count === 'number' ? followersRes.count : 0,
        followingCount: typeof followingRes.count === 'number' ? followingRes.count : 0,
      };
    } catch (err) {
      console.warn('getFollowCounts error:', err);
      return { followersCount: 0, followingCount: 0 };
    }
  },
};
