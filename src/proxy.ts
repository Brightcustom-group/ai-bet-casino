import { NextResponse, type NextRequest } from 'next/server'
import { refreshSession } from '@/lib/supabase/proxy-session'

// Keeps the editor session fresh and sends signed-out visitors to sign-in.
// This is a convenience redirect only: data access is enforced by RLS.
export async function proxy(request: NextRequest) {
  const { response, isSignedIn } = await refreshSession(request)
  const { pathname } = request.nextUrl
  if (!isSignedIn && pathname !== '/editor/sign-in') {
    const url = request.nextUrl.clone()
    url.pathname = '/editor/sign-in'
    url.search = `?next=${encodeURIComponent(pathname)}`
    return NextResponse.redirect(url)
  }
  return response
}

export const config = {
  matcher: ['/editor/:path*'],
}
