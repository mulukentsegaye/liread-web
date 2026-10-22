import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

/**
 * Supabase client for Liread.
 *
 * Connected directly to production project zlrrnnoqektzirwrgftj.
 * Environment variables override these if provided.
 */

const PRODUCTION_SUPABASE_URL = 'https://zlrrnnoqektzirwrgftj.supabase.co';
const PRODUCTION_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpscnJubm9xZWt0emlyd3JnZnRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwOTU5MDEsImV4cCI6MjEwNzY3MTkwMX0.qfu9KYzq91Ya3l8taGcjinSGZos0NSPDa_oTJjwGECs';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL ?? '').trim() || PRODUCTION_SUPABASE_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim() || PRODUCTION_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = (): boolean => true;

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

/**
 * Quick connectivity check — tries a lightweight read from the `posts` table.
 */
export const testSupabaseConnection = async (): Promise<{ ok: boolean; message: string }> => {
  try {
    const { error } = await supabase.from('posts').select('id').limit(1);
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('0 rows')) {
        return { ok: true, message: 'Connected to Supabase successfully!' };
      }
      return { ok: false, message: `Database error: ${error.message} (code ${error.code})` };
    }
    return { ok: true, message: 'Connected to Supabase successfully!' };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown connection error';
    return { ok: false, message: `Connection failed: ${errorMsg}` };
  }
};
