import type { Database } from '@/lib/supabase/database.types'

export type ContentType = Database['public']['Enums']['content_type']
export type ContentStatus = Database['public']['Enums']['content_status']
export type ContentSection = Database['public']['Enums']['content_section']

export const contentTypeLabels: Record<ContentType, string> = {
  preview: 'Match preview',
  tip: 'Betting tip',
  odds_analysis: 'Odds analysis',
  casino_guide: 'Casino guide',
  responsible_gambling: 'Responsible gambling',
}

/** Which site section (and therefore which categories) each content type belongs to. */
export const contentTypeSection: Record<ContentType, ContentSection> = {
  preview: 'sports',
  tip: 'sports',
  odds_analysis: 'sports',
  casino_guide: 'casino',
  responsible_gambling: 'responsible_gambling',
}

type Ref = { slug: string; name: string }

/** Shape used by listing cards. */
export type ArticleSummary = {
  id: string
  slug: string
  title: string
  excerpt: string
  content_type: ContentType
  published_at: string | null
  is_featured: boolean
  category: (Ref & { section: ContentSection }) | null
  sport: Ref | null
  league: Ref | null
}

export type ArticleDetail = ArticleSummary & {
  body: string
  updated_at: string
  author: { display_name: string } | null
}

/** Editor dashboard row. */
export type EditorArticleRow = {
  id: string
  slug: string
  title: string
  content_type: ContentType
  status: ContentStatus
  published_at: string | null
  updated_at: string
  author: { display_name: string } | null
}

/** Display state derived from status + publication time ("scheduled" is not stored). */
export function displayStatus(
  status: ContentStatus,
  publishedAt: string | null,
  now = new Date(),
): 'draft' | 'scheduled' | 'published' | 'archived' {
  if (status === 'published' && publishedAt && new Date(publishedAt) > now) return 'scheduled'
  return status
}
