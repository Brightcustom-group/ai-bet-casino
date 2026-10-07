'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSessionClient } from '@/lib/supabase/server'

export type SignInState = { error?: string; email?: string }

const credentials = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

/** Only allow redirects back into the editor area. */
function safeNext(value: FormDataEntryValue | null): string {
  return typeof value === 'string' && /^\/editor(\/[\w\-/]*)?$/.test(value) ? value : '/editor'
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get('email') ?? '').trim()
  const parsed = credentials.safeParse({ email, password: formData.get('password') })
  if (!parsed.success) return { error: parsed.error.issues[0].message, email }

  const supabase = await createSessionClient()
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data)
  if (error || !data.user) return { error: 'Email or password is incorrect.', email }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .maybeSingle()
  if (profile?.role !== 'editor' && profile?.role !== 'admin') {
    await supabase.auth.signOut()
    return { error: 'This account does not have editor access.', email }
  }
  redirect(safeNext(formData.get('next')))
}

export async function signOut() {
  const supabase = await createSessionClient()
  await supabase.auth.signOut()
  redirect('/editor/sign-in')
}
