
import { createClient } from '@supabase/supabase-js';

// User's provided Supabase Project URL
const supabaseUrl = process.env.SUPABASE_URL;

// Provided Supabase Anon Key
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// Create client
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
