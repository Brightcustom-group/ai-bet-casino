import { createPublicClient } from '@/lib/supabase/public'

// Liveness + database reachability for load balancers and deploy checks.
export async function GET() {
  const supabase = await createPublicClient()
  const { error } = await supabase.from('sports').select('id').limit(1)
  const ok = !error
  return Response.json(
    { status: ok ? 'ok' : 'degraded', database: ok ? 'ok' : 'unreachable' },
    { status: ok ? 200 : 503, headers: { 'Cache-Control': 'no-store' } },
  )
}
