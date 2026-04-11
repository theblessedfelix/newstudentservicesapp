import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasRemoteBackend = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = hasRemoteBackend
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

export function getBackendModeLabel(): 'remote' | 'temporary-local' {
  return hasRemoteBackend ? 'remote' : 'temporary-local';
}