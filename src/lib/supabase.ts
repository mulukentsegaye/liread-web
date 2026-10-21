import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Retrieve credentials with priority: 
// 1. localStorage runtime override (for in-browser configuration without restarting dev server)
// 2. Vite environment variables (.env / .env.local)
// 3. Fallback placeholder
export const getSupabaseConfig = () => {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('liread_supabase_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('liread_supabase_anon_key') : null;

  const url = localUrl || import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const anonKey = localKey || import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  return { url, anonKey };
};

const initialConfig = getSupabaseConfig();

export let supabase: SupabaseClient = createClient(
  initialConfig.url, 
  initialConfig.anonKey, 
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/**
 * Re-initialize client if user provides credentials dynamically in UI
 */
export const reconfigureSupabase = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    if (url && anonKey) {
      localStorage.setItem('liread_supabase_url', url);
      localStorage.setItem('liread_supabase_anon_key', anonKey);
    } else {
      localStorage.removeItem('liread_supabase_url');
      localStorage.removeItem('liread_supabase_anon_key');
    }
  }

  const activeUrl = url || import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
  const activeKey = anonKey || import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

  supabase = createClient(activeUrl, activeKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return supabase;
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return (
    !!url &&
    url !== 'https://placeholder.supabase.co' &&
    !url.includes('placeholder') &&
    !!anonKey &&
    anonKey !== 'placeholder-anon-key' &&
    !anonKey.includes('placeholder')
  );
};

export const testSupabaseConnection = async (): Promise<{ ok: boolean; message: string }> => {
  if (!isSupabaseConfigured()) {
    return { 
      ok: false, 
      message: 'Supabase URL or Anon Key is missing. Configure them in .env or via the Connection Settings.' 
    };
  }

  try {
    const { error } = await supabase.from('posts').select('id').limit(1);
    if (error) {
      // If table exists but empty or RLS, that's still an active connection response
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
