import { EmptyState } from '@/components/EmptyState'
import { Pagination } from '@/components/Pagination'
import { getTaxonomy } from '@/features/taxonomy/queries'
import { listPublishedArticles, type ArticleFilters as Filters } from '../queries'
import type { ContentSection } from '../types'
import { ArticleFilters } from './ArticleFilters'
import { ArticleGrid } from './ArticleCard'

type SearchParams = Record<string, string | string[] | undefined>

/** Reads supported filter values from the URL, ignoring anything else. */
export function filtersFromSearchParams(params: SearchParams): Filters {
  const one = (key: string) => {
    const value = params[key]
    const v = Array.isArray(value) ? value[0] : value
    return v?.trim() ? v.trim() : undefined
  }
  const page = Number(one('page') ?? 1)
  return {
    q: one('q'),
    category: one('category'),
    sport: one('sport'),
    league: one('league'),
    page: Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1,
  }
}

export async function ArticleListing({
  basePath,
  filters,
  section,
}: {
  basePath: string
  filters: Filters
  section?: ContentSection
}) {
  const [taxonomy, result] = await Promise.all([
    getTaxonomy(),
    listPublishedArticles({ ...filters, section }),
  ])
  const isFiltered = Boolean(filters.q || filters.category || filters.sport || filters.league)
  return (
    <>
      <ArticleFilters action={basePath} taxonomy={taxonomy} values={filters} section={section} />
      <p className="visually-hidden" role="status">
        {result.total} {result.total === 1 ? 'article' : 'articles'} found
      </p>
      {result.articles.length === 0 ? (
        <EmptyState title={isFiltered ? 'No articles match these filters' : 'No articles published yet'}>
          <p>{isFiltered ? 'Try a different search term or clear the filters.' : 'Check back soon for new content.'}</p>
        </EmptyState>
      ) : (
        <ArticleGrid articles={result.articles} headingLevel={2} />
      )}
      <Pagination
        basePath={basePath}
        params={{ q: filters.q, category: filters.category, sport: filters.sport, league: filters.league }}
        page={result.page}
        pageCount={result.pageCount}
      />
    </>
  )
}
