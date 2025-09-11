import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedClient: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (cachedClient) return cachedClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // Avoid throwing during server-side prerender/build by deferring client creation to runtime
    // Client components call this at runtime where envs should be present
    throw new Error('Supabase env vars are not configured')
  }

  cachedClient = createClient(supabaseUrl, supabaseAnonKey)
  return cachedClient
}