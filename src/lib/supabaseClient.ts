import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('CRITICAL ERROR: Supabase environment variables are missing. Please check your .env.local file.');
}

export const supabase = createBrowserClient(supabaseUrl || '', supabaseKey || '')