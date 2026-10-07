import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import { getTaxonomy } from '@/features/taxonomy/queries'
import type { ArticleDetail, ArticleSummary, ContentSection } from './types'

// Public reads use the anonymous client, so RLS only returns live published articles.

const summaryColumns =
  'id, slug, title, excerpt, content_type, published_at, is_featured, ' +
  'category:categories(slug, name, section), sport:sports(slug, name), league:leagues(slug, name)'

export const PAGE_SIZE = 12
const MAX_QUERY_LENGTH = 100

export type ArticleFilters = {
  section?: ContentSection
  category?: string
  sport?: string
  league?: string
  q?: string
  page?: number
}

export type ArticlePage = {
  articles: ArticleSummary[]
  total: number
  page: number
  pageCount: number
}

export async function listPublishedArticles(filters: ArticleFilters = {}): Promise<ArticlePage> {
  const { categories, sports, leagues } = await getTaxonomy()
  const page = Math.max(1, Math.floor(filters.page ?? 1))
  const empty: ArticlePage = { articles: [], total: 0, page, pageCount: 0 }

  const supabase = await createPublicClient()
  let query = supabase
    .from('articles')
    .select(summaryColumns, { count: 'exact' })
    .order('published_at', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (filters.section) {
    const ids = categories.filter((c) => c.section === filters.section).map((c) => c.id)
    query = query.in('category_id', ids)
  }
  // Unknown slugs mean "no results" rather than silently ignoring the filter.
  if (filters.category) {
    const category = categories.find((c) => c.slug === filters.category)
    if (!category) return empty
    query = query.eq('category_id', category.id)
  }
  if (filters.sport) {
    const sport = sports.find((s) => s.slug === filters.sport)
    if (!sport) return empty
    query = query.eq('sport_id', sport.id)
  }
  if (filters.league) {
    const league = leagues.find((l) => l.slug === filters.league)
    if (!league) return empty
    query = query.eq('league_id', league.id)
  }
  const q = filters.q?.trim().slice(0, MAX_QUERY_LENGTH)
  if (q) query = query.textSearch('search', q, { type: 'websearch', config: 'english' })

  const { data, count, error } = await query.overrideTypes<ArticleSummary[], { merge: false }>()
  if (error) throw new Error(`Failed to load articles: ${error.message}`)
  const total = count ?? 0
  return { articles: data, total, page, pageCount: Math.ceil(total / PAGE_SIZE) }
}

export async function listFeaturedArticles(limit = 4): Promise<ArticleSummary[]> {
  const supabase = await createPublicClient()
  const { data, error } = await supabase
    .from('articles')
    .select(summaryColumns)
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)
    .overrideTypes<ArticleSummary[], { merge: false }>()
  if (error) throw new Error(`Failed to load featured articles: ${error.message}`)
  return data
}

export const getPublishedArticle = cache(async (slug: string): Promise<ArticleDetail | null> => {
  const supabase = await createPublicClient()
  const { data, error } = await supabase
    .from('articles')
    .select(`${summaryColumns}, body, updated_at, author:profiles(display_name)`)
    .eq('slug', slug)
    .maybeSingle()
    .overrideTypes<ArticleDetail | null, { merge: false }>()
  if (error) throw new Error(`Failed to load article: ${error.message}`)
  return data
})

/** For the sitemap; bounded so it stays a single sitemap file (< 50k URLs). */
export async function listPublishedSlugs(): Promise<{ slug: string; updated_at: string }[]> {
  const supabase = await createPublicClient()
  const { data, error } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .order('published_at', { ascending: false })
    .limit(10000)
  if (error) throw new Error(`Failed to load sitemap entries: ${error.message}`)
  return data
}
