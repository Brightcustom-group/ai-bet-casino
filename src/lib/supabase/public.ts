import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { connection } from 'next/server'
import { publicEnv } from '@/lib/env'
import type { Database } from './database.types'

/**
 * Anonymous client for public pages: no cookies, so it only ever sees public rows.
 * Rendering is per request so newly published articles appear on refresh.
 * (Caching/ISR with tag revalidation is a planned optimisation.)
 */
export async function createPublicClient() {
  await connection()
  return createClient<Database>(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
