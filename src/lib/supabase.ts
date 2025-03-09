import { createClient } from '@supabase/supabase-js';

const supabaseUrl = https://pxfpwuhkivrfmmcfhqwf.supabase.co
const supabaseAnonKey = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4ZnB3dWhraXZyZm1tY2ZocXdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE0ODg3NzIsImV4cCI6MjA1NzA2NDc3Mn0.Xra53n3AjoHIJX5RrbQ6UfzrSzkaXwzEhG7CBbvHY34

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Please set up your Supabase environment variables in .env file');
  console.warn('1. Click "Connect to Supabase" in the top right');
  console.warn('2. Copy the URL and anon key to .env file');
  console.warn('3. Create a new storage bucket named "files"');
}

export const supabase = createClient(
  supabaseUrl || 'https://pxfpwuhkivrfmmcfhqwf.supabase.co',
  supabaseAnonKey || 'placeholder'
);
