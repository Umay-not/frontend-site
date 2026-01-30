import { createClient } from '@supabase/supabase-js';

// Environment variables with production fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bwsfgmmbyybtpqdwmbsw.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3c2ZnbW1ieXlidHBxZHdtYnN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1NDQwMDcsImV4cCI6MjA4NDEyMDAwN30.TYJmR9p2pkKcxqyilI0GR312isCW2lT9pxvFdqXj-GQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
