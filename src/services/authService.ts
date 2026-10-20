import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';
import { DEFAULT_USER_AVATAR } from '../data/defaults';

const getAppOrigin = (): string => {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}`;
};

export const authService = {
  /**
   * Register a new user with Supabase Auth
   */
  async signUp(email: string, password: string, username: string, fullName: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please enter your credentials in .env or the Supabase Settings.');
    }

    const cleanUsername = username.toLowerCase().replace(/^@/, '').trim();

    // Check if the username is already taken to avoid cryptic database trigger aborts
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('username', cleanUsername)
      .maybeSingle();

    if (existingProfile) {
      throw new Error(`The username "@${cleanUsername}" is already registered. If this is your account, please switch to the "Sign In" tab.`);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: cleanUsername,
          full_name: fullName.trim(),
        },
        // Send the confirmation link back to this app so the session is established here.
        emailRedirectTo: getAppOrigin(),
      },
    });

    if (error) throw error;
    return data;
  },

  /**
   * Exchange a confirmation token from the email link for a session.
   * Supabase's PKCE email templates deliver `?token_hash=...&type=signup`,
   * which `detectSessionInUrl` does NOT process on its own.
   */
  async verifyEmailToken(tokenHash: string, type: string) {
    if (!isSupabaseConfigured()) return null;

    const normalizedType = (type || 'signup').toUpperCase() as any;
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: normalizedType,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Log in an existing user with email and password
   */
  async signIn(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please enter your credentials in .env or the Supabase Settings.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get active Supabase session
   */
  async getSession() {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  /**
   * Fetch user profile from public.profiles
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Could not fetch user profile from Supabase:', error.message);
      return null;
    }

    return {
      id: data.id,
      username: data.username,
      fullName: data.full_name || data.username,
      avatarUrl: data.avatar_url || DEFAULT_USER_AVATAR,
      subtitle: data.bio || undefined,
      totalMinutesRead: data.total_minutes_read,
      currentStreak: data.current_streak,
      dailyGoalMinutes: data.daily_goal_minutes,
      rankTier: (data.rank_tier as UserProfile['rankTier']) || 'Novice Reader',
      bookshelfCount: 0,
      savedPassagesCount: 0,
    };
  },

  /**
   * Update profile metadata (e.g. dailyGoalMinutes, fullName, bio, avatar)
   */
  async updateProfile(userId: string, updates: Partial<{
    full_name: string;
    avatar_url: string;
    bio: string;
    daily_goal_minutes: number;
  }>) {
    if (!isSupabaseConfigured()) return;

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId);

    if (error) throw error;
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (session: any) => void) {
    if (!isSupabaseConfigured()) return { unsubscribe: () => {} };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  },
};
