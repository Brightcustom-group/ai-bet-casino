import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { SignInForm } from '@/features/auth/components/SignInForm'
import { getSessionUser, isStaff } from '@/features/auth/session'

export const metadata: Metadata = { title: 'Sign in' }

export default async function SignInPage({ searchParams }: PageProps<'/editor/sign-in'>) {
  if (isStaff(await getSessionUser())) redirect('/editor')
  const next = (await searchParams).next
  return (
    <main id="main" className="container">
      <div className="panel auth-card">
        <p><Link href="/">← Back to AI Bet Casino</Link></p>
        <h1>Editor sign-in</h1>
        <p>For AI Bet Casino editors and administrators.</p>
        <SignInForm next={typeof next === 'string' ? next : '/editor'} />
      </div>
    </main>
  )
}
