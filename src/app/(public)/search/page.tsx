import type { Metadata } from 'next'
import { ArticleListing, filtersFromSearchParams } from '@/features/articles/components/ArticleListing'

// Internal search results are thin/duplicate content: keep them out of the index.
export const metadata: Metadata = {
  title: 'Search',
  robots: { index: false, follow: true },
}

export default async function SearchPage({ searchParams }: PageProps<'/search'>) {
  const filters = filtersFromSearchParams(await searchParams)
  return (
    <div className="container">
      <header className="page-intro">
        <h1>{filters.q ? `Results for “${filters.q}”` : 'Search articles'}</h1>
        <p>Search previews, tips, odds analysis and casino guides. Filter by category, sport or league.</p>
      </header>
      <ArticleListing basePath="/search" filters={filters} />
    </div>
  )
}
