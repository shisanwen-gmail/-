import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Please set up your Supabase environment variables in .env file');
  console.warn('1. Click "Connect to Supabase" in the top right');
  console.warn('2. Copy the URL and anon key to .env file');
  console.warn('3. Create a new storage bucket named "files"');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
