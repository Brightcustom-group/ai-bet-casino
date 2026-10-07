import Link from 'next/link'

type Props = {
  basePath: string
  params: Record<string, string | undefined>
  page: number
  pageCount: number
}

function hrefFor(basePath: string, params: Props['params'], page: number) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) if (value) search.set(key, value)
  if (page > 1) search.set('page', String(page))
  const qs = search.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function Pagination({ basePath, params, page, pageCount }: Props) {
  if (pageCount <= 1) return null
  return (
    <nav className="pagination" aria-label="Pagination">
      {page > 1 ? <Link href={hrefFor(basePath, params, page - 1)} rel="prev">← Newer</Link> : <span />}
      <span>
        Page {page} of {pageCount}
      </span>
      {page < pageCount ? <Link href={hrefFor(basePath, params, page + 1)} rel="next">Older →</Link> : <span />}
    </nav>
  )
}
