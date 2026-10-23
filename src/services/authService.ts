import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { DEFAULT_USER_AVATAR } from '../data/defaults';

const getAppOrigin = (): string => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
};

export const authService = {
  /**
   * Register a new user with Supabase Auth.
   * Checks username availability first to surface a clear message instead of
   * a cryptic database-trigger abort.
   */
  async signUp(email: string, password: string, username: string, fullName: string) {
    const cleanUsername = username.toLowerCase().replace(/^@/, '').trim();

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existingProfile) {
      throw new Error(`The username "@${cleanUsername}" is already taken. Please choose a different one, or sign in if this is your account.`);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
          full_name: fullName.trim(),
        },
        emailRedirectTo: getAppOrigin(),
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Resend the signup confirmation email for an unconfirmed user.
   */
  async resendConfirmationEmail(email: string) {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: {
        emailRedirectTo: getAppOrigin(),
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Exchange a PKCE confirmation token from the email link for a session.
   * Supabase's `detectSessionInUrl` does NOT handle `?token_hash=...&type=signup`.
   */
  async verifyEmailToken(tokenHash: string, type: string) {
    const normalizedType = (type || 'signup') as any;
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: normalizedType,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Log in an existing user with email and password.
   */
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out current user.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get active Supabase session.
   */
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Fetch user profile from public.profiles.
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Could not fetch user profile from Supabase:', error.message);
      return null;
    }

    // Query dynamic counts for bookshelf and saved passages
    let bookshelfCount = 0;
    let savedPassagesCount = 0;

    try {
      const { count } = await supabase
        .from('bookshelf')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (typeof count === 'number') {
        bookshelfCount = count;
      }
    } catch {
      // Fallback to local storage cache if network fails
      try {
        const raw = localStorage.getItem(`liread_bookshelf_${userId}`);
        if (raw) bookshelfCount = JSON.parse(raw).length;
      } catch {}
    }

    try {
      const { count } = await supabase
        .from('saved_posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      if (typeof count === 'number') {
        savedPassagesCount = count;
      }
    } catch {}

    return {
      id: data.id,
      username: data.username,
      fullName: data.full_name || data.username,
      avatarUrl: data.avatar_url || DEFAULT_USER_AVATAR,
      subtitle: data.bio || undefined,
      bio: data.bio || undefined,
      location: data.location || undefined,
      favoriteGenres: Array.isArray(data.favorite_genres) ? data.favorite_genres : undefined,
      currentlyReadingBook: data.currently_reading_book || undefined,
      currentlyReadingAuthor: data.currently_reading_author || undefined,
      currentlyReadingProgress: typeof data.currently_reading_progress === 'number' ? data.currently_reading_progress : undefined,
      followersCount: typeof data.followers_count === 'number' ? data.followers_count : 128,
      followingCount: typeof data.following_count === 'number' ? data.following_count : 84,
      joinedDate: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'October 2026',
      totalMinutesRead: data.total_minutes_read,
      currentStreak: data.current_streak,
      dailyGoalMinutes: data.daily_goal_minutes,
      rankTier: (data.rank_tier as UserProfile['rankTier']) || 'Novice Reader',
      bookshelfCount,
      savedPassagesCount,
    };
  },

  /**
   * Update profile metadata (e.g. dailyGoalMinutes, fullName, bio, avatar).
   */
  async updateProfile(userId: string, updates: Partial<{
    full_name: string;
    avatar_url: string;
    bio: string;
    daily_goal_minutes: number;
  }>) {
    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  },

  /**
   * Subscribe to auth state changes.
   */
  onAuthStateChange(callback: (session: any) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  },
};
