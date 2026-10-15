import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ReadingSession } from '../types';

export interface LogSessionPayload {
  bookTitle: string;
  durationMinutes: number;
  durationSeconds: number;
  sessionDate?: string;
}

export const sessionsService = {
  /**
   * Log an active reading session in Supabase.
   * Trigger in database updates total minutes, streak, and rank automatically.
   */
  async logSession(payload: LogSessionPayload, userId: string): Promise<ReadingSession | null> {
    if (!isSupabaseConfigured()) {
      return null;
    }

    const todayDate = payload.sessionDate || new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('reading_sessions')
      .insert({
        user_id: userId,
        book_title: payload.bookTitle,
        duration_minutes: payload.durationMinutes,
        duration_seconds: payload.durationSeconds,
        session_date: todayDate,
      })
      .select('*')
      .single();

    if (error) {
      console.warn('Failed to log reading session to Supabase:', error.message);
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      bookTitle: data.book_title,
      durationMinutes: data.duration_minutes,
      durationSeconds: data.duration_seconds,
      sessionDate: data.session_date,
      createdAt: data.created_at,
    };
  },

  /**
   * Get user's recent reading sessions
   */
  async getUserSessions(userId: string, limit = 20): Promise<ReadingSession[]> {
    if (!isSupabaseConfigured()) return [];

    const { data, error } = await supabase
      .from('reading_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    if (!data) return [];

    return data.map((d) => ({
      id: d.id,
      userId: d.user_id,
      bookTitle: d.book_title,
      durationMinutes: d.duration_minutes,
      durationSeconds: d.duration_seconds,
      sessionDate: d.session_date,
      createdAt: d.created_at,
    }));
  },

  /**
   * Get today's total reading minutes for a user
   */
  async getTodayMinutes(userId: string): Promise<number> {
    if (!isSupabaseConfigured()) return 0;

    const todayStr = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('reading_sessions')
      .select('duration_minutes')
      .eq('user_id', userId)
      .eq('session_date', todayStr);

    if (error || !data) return 0;
    return data.reduce((acc, curr) => acc + curr.duration_minutes, 0);
  },
};
