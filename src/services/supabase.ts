import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Defensive check: Verify that variables are valid and not the default placeholders
export const isSupabaseConfigured = 
  !!supabaseUrl && 
  supabaseUrl !== "your_supabase_url_here" && 
  !!supabaseAnonKey && 
  supabaseAnonKey !== "your_supabase_anon_key_here";

if (!isSupabaseConfigured) {
  console.warn("⚠️ Supabase is not configured yet. App is running in LocalStorage fallback mode. Check your .env file!");
}

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (null as any);
