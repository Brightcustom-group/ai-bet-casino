import Link from 'next/link'
import { redirect } from 'next/navigation'
import { signOut } from '@/features/auth/actions'
import { getSessionUser, isStaff } from '@/features/auth/session'

export default async function ProtectedEditorLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser()
  if (!user) redirect('/editor/sign-in')

  const bar = (
    <header className="editor-bar">
      <div className="container">
        <nav aria-label="Editor">
          <Link href="/editor" className="brand">
            AI Bet <span>Casino</span> · Editor
          </Link>
          {isStaff(user) && <Link href="/editor/articles/new">New article</Link>}
          <Link href="/">View site</Link>
        </nav>
        <form action={signOut}>
          <span>
            {user.displayName} ({user.role}){' '}
          </span>
          <button type="submit" className="link-button">Sign out</button>
        </form>
      </div>
    </header>
  )

  if (!isStaff(user)) {
    return (
      <>
        {bar}
        <main id="main" className="container editor-main">
          <div className="panel" role="alert">
            <h1>No editor access</h1>
            <p>Your account can’t manage content. Ask an administrator to grant the editor role.</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      {bar}
      <main id="main" className="container editor-main">{children}</main>
    </>
  )
}
