import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://xhnmjokqxwfhxkrjuidh.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhobm1qb2txeHdmaHhrcmp1aWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMDM4MzgsImV4cCI6MjEwMDg3OTgzOH0.6aN0Hm32Tzqzejm4olpcwv-SOvm5EEBW7APlJR9MZ2Y';

export const isSupabaseConfigured = true;
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
