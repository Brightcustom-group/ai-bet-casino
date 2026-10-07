import 'server-only'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { publicEnv } from '@/lib/env'
import type { Database } from './database.types'

/**
 * Per-request client acting as the signed-in user (publishable key + session cookie).
 * All authorization is enforced by Postgres RLS for that user.
 */
export async function createSessionClient() {
  const cookieStore = await cookies()
  return createServerClient<Database>(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // Called from a Server Component, where cookies are read-only; the proxy refreshes them.
        }
      },
    },
  })
}
