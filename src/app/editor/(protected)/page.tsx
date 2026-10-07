import type { Metadata } from 'next'
import Link from 'next/link'
import { EDITOR_LIST_LIMIT, listArticlesForEditor } from '@/features/articles/editor-queries'
import { contentTypeLabels, displayStatus } from '@/features/articles/types'
import { formatSastDateTime } from '@/lib/format'

export const metadata: Metadata = { title: 'Dashboard' }

const statuses = ['draft', 'scheduled', 'published', 'archived'] as const

export default async function EditorDashboard({ searchParams }: PageProps<'/editor'>) {
  const filter = (await searchParams).status
  const all = await listArticlesForEditor()
  const now = new Date()
  const rows = all.map((a) => ({ ...a, display: displayStatus(a.status, a.published_at, now) }))
  const counts = Object.fromEntries(statuses.map((s) => [s, rows.filter((r) => r.display === s).length]))
  const visible = statuses.includes(filter as (typeof statuses)[number]) ? rows.filter((r) => r.display === filter) : rows

  return (
    <>
      <div className="section-head">
        <h1>Content</h1>
        <Link href="/editor/articles/new" className="button">New article</Link>
      </div>
      <nav className="stat-row" aria-label="Filter by status">
        {statuses.map((s) => (
          <Link key={s} href={filter === s ? '/editor' : `/editor?status=${s}`} className="stat" aria-current={filter === s ? 'true' : undefined}>
            <strong>{counts[s]}</strong>
            <span className={`status status-${s}`}>{s[0].toUpperCase() + s.slice(1)}</span>
          </Link>
        ))}
      </nav>
      {all.length >= EDITOR_LIST_LIMIT && (
        <p className="hint" role="note">
          Showing the {EDITOR_LIST_LIMIT} most recently updated articles; counts cover these only.
        </p>
      )}
      <div className="panel">
        {visible.length === 0 ? (
          <p role="status">No articles {filter ? `with status “${filter}”` : 'yet'}. <Link href="/editor/articles/new">Create one</Link>.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <caption className="visually-hidden">Articles, most recently updated first</caption>
              <thead>
                <tr>
                  <th scope="col">Title</th>
                  <th scope="col">Type</th>
                  <th scope="col">Status</th>
                  <th scope="col">Publish time (SAST)</th>
                  <th scope="col">Author</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((a) => (
                  <tr key={a.id}>
                    <td><Link href={`/editor/articles/${a.id}`}>{a.title}</Link></td>
                    <td>{contentTypeLabels[a.content_type]}</td>
                    <td><span className={`status status-${a.display}`}>{a.display}</span></td>
                    <td>{a.published_at ? formatSastDateTime(a.published_at) : '—'}</td>
                    <td>{a.author?.display_name ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
