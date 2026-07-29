import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xhnmjokqxwfhxkrjuidh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhobm1qb2txeHdmaHhrcmp1aWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDM4MzgsImV4cCI6MjEwMDg3OTgzOH0.6aN0Hm32Tzqzejm4olpcwv-SOvm5EEBW7APlJR9MZ2Y';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
