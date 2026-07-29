import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key, fallback) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {
    // Ignore env error
  }
  return fallback;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL', 'https://xhnmjokqxwfhxkrjuidh.supabase.co');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhobm1qb2txeHdmaHhrcmp1aWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDM4MzgsImV4cCI6MjEwMDg3OTgzOH0.6aN0Hm32Tzqzejm4olpcwv-SOvm5EEBW7APlJR9MZ2Y');

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null;
