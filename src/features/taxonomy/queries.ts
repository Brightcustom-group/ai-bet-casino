import 'server-only'
import { cache } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import type { ContentSection } from '@/features/articles/types'

export type Sport = { id: number; slug: string; name: string }
export type League = { id: number; slug: string; name: string; sport_id: number }
export type Category = {
  id: number
  slug: string
  name: string
  description: string
  section: ContentSection
}
export type Taxonomy = { sports: Sport[]; leagues: League[]; categories: Category[] }

/** Small, public reference tables, loaded once per request. */
export const getTaxonomy = cache(async (): Promise<Taxonomy> => {
  const supabase = await createPublicClient()
  const [sports, leagues, categories] = await Promise.all([
    supabase.from('sports').select('id, slug, name').order('name').limit(100),
    supabase.from('leagues').select('id, slug, name, sport_id').order('name').limit(500),
    supabase.from('categories').select('id, slug, name, description, section').order('name').limit(200),
  ])
  if (sports.error || leagues.error || categories.error) {
    const error = sports.error ?? leagues.error ?? categories.error
    throw new Error(`Failed to load taxonomy: ${error?.message}`)
  }
  return { sports: sports.data, leagues: leagues.data, categories: categories.data }
})
