import { supabase } from '../lib/supabase';
import { UserProfile } from '../types';
import { DEFAULT_USER_AVATAR } from '../data/defaults';
import { emailValidationService } from './emailValidationService';

const getAppOrigin = (): string => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
};

export const authService = {
  /**
   * Register a new user with Supabase Auth.
   * Checks email validity, domain existence, and username availability first
   * to avoid wasting hourly auth email quotas on misspelled or nonexistent addresses.
   */
  async signUp(email: string, password: string, username: string, fullName: string) {
    const cleanEmail = email.trim();
    const cleanUsername = username.toLowerCase().replace(/^@/, '').trim();

    // 1. Rigorous email verification & domain existence check before calling Supabase
    const validation = await emailValidationService.validateForRegistration(cleanEmail);
    if (!validation.valid) {
      throw new Error(validation.error || 'Please enter a valid, active email address.');
    }

    // 2. Check if username is already claimed
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existingProfile) {
      throw new Error(`The username "@${cleanUsername}" is already taken. Please choose a different one, or sign in if this is your account.`);
    }

    // 3. Initiate signup with Supabase
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
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

    // 4. Supabase returns an empty identities array if an account with this email ALREADY exists
    // (when email confirmation / user enumeration protection is enabled)
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
      throw new Error(`An account with the email "${cleanEmail}" already exists. Please sign in instead.`);
    }

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
   * Send a password reset email to a user with a secure recovery link.
   */
  async resetPasswordForEmail(email: string) {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      throw new Error('Please enter your email address.');
    }

    const { data, error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${getAppOrigin()}#reset-password`,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Update the password for the current user (e.g. during a recovery session).
   */
  async updatePassword(newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
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

    let followersCount = 0;
    let followingCount = 0;
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
      followersCount = typeof followersRes.count === 'number' ? followersRes.count : 0;
      followingCount = typeof followingRes.count === 'number' ? followingRes.count : 0;
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
      followersCount,
      followingCount,
      isPrivate: Boolean(data.is_private),
      joinedDate: data.created_at ? new Date(data.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      totalMinutesRead: data.total_minutes_read,
      currentStreak: data.current_streak,
      dailyGoalMinutes: data.daily_goal_minutes,
      rankTier: (data.rank_tier as UserProfile['rankTier']) || 'Novice Reader',
      bookshelfCount,
      savedPassagesCount,
    };
  },

  /**
   * Ensures a profile exists in public.profiles for an authenticated user.
   * Acts as a resilient fallback if the database trigger experienced a race condition.
   */
  async ensureProfileExists(user: any): Promise<UserProfile | null> {
    if (!user?.id) return null;

    // 1. Check if profile already exists
    const existing = await this.getUserProfile(user.id);
    if (existing) return existing;

    // 2. Prepare profile metadata
    const rawUsername = (user.user_metadata?.username as string) || `reader_${user.id.slice(0, 8)}`;
    const cleanUsername = rawUsername.toLowerCase().replace(/^@/, '').trim() || `reader_${user.id.slice(0, 8)}`;
    const fullName = (user.user_metadata?.full_name as string) || (user.email ? user.email.split('@')[0] : 'Avid Reader');

    try {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        username: cleanUsername,
        full_name: fullName,
        avatar_url: DEFAULT_USER_AVATAR,
        daily_goal_minutes: 60,
        rank_tier: 'Novice Reader',
      });

      if (insertError) {
        // Disambiguate with user id slice if another user took the username in the interim
        if (insertError.code === '23505' || insertError.message.includes('unique') || insertError.message.includes('duplicate')) {
          await supabase.from('profiles').insert({
            id: user.id,
            username: `${cleanUsername}_${user.id.slice(0, 4)}`,
            full_name: fullName,
            avatar_url: DEFAULT_USER_AVATAR,
            daily_goal_minutes: 60,
            rank_tier: 'Novice Reader',
          });
        }
      }
    } catch (err) {
      console.warn('Fallback profile creation attempt:', err);
    }

    return await this.getUserProfile(user.id);
  },

  /**
   * Update profile metadata (e.g. dailyGoalMinutes, fullName, bio, avatar).
   */
  async updateProfile(userId: string, updates: Partial<{
    full_name: string;
    avatar_url: string;
    bio: string;
    daily_goal_minutes: number;
    is_private: boolean;
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
  onAuthStateChange(callback: (session: any, event?: string) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      callback(session, event);
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  },
};
