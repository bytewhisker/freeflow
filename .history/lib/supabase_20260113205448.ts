
import { createClient } from '@supabase/supabase-js';

// User's provided Supabase Project URL
const supabaseUrl = process.env.SUPABASE_URL || 'https://cfyerzipldbieaszjskt.supabase.co';

// Provided Supabase Anon Key
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmeWVyemlwbGRiaWVhc3pqc2t0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwMzQzNTIsImV4cCI6MjA4MTYxMDM1Mn0.fk2Ot17SKKqNVhr9LyxObjsbRpjS-Hwxfoe8Mo6y1Bg';

// Create client
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
