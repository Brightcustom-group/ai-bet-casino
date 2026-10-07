import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { publicEnv } from '@/lib/env'

/** Refreshes the auth session cookie and returns whether a user is signed in. */
export async function refreshSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const supabase = createServerClient(publicEnv.supabaseUrl, publicEnv.supabasePublishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value))
      },
    },
  })
  const { data } = await supabase.auth.getClaims()
  return { response, isSignedIn: Boolean(data?.claims?.sub) }
}
