// Web: no URL polyfill (browser has built-in URL)
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** True when both URL and anon key are set (client will work for API calls). */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (__DEV__ && !isSupabaseConfigured) {
  console.warn(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY missing. Copy .env.example to .env and set values.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
