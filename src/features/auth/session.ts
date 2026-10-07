import 'server-only'
import { cache } from 'react'
import { createSessionClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type AppRole = Database['public']['Enums']['app_role']
export type SessionUser = { id: string; displayName: string; role: AppRole }

/** The verified signed-in user and their role, or null. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const supabase = await createSessionClient()
  const { data: auth } = await supabase.auth.getClaims()
  const userId = auth?.claims?.sub
  if (!userId) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, role')
    .eq('id', userId)
    .maybeSingle()
  if (!profile) return null
  return { id: userId, displayName: profile.display_name, role: profile.role }
})

export function isStaff(user: SessionUser | null): user is SessionUser {
  return user?.role === 'editor' || user?.role === 'admin'
}
