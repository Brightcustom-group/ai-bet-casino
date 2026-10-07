import 'server-only'
import { createSessionClient } from '@/lib/supabase/server'
import type { ContentStatus, EditorArticleRow } from './types'

// Editor reads run as the signed-in user; RLS returns drafts only to editors/admins.

export const EDITOR_LIST_LIMIT = 100

export async function listArticlesForEditor(status?: ContentStatus): Promise<EditorArticleRow[]> {
  const supabase = await createSessionClient()
  let query = supabase
    .from('articles')
    .select('id, slug, title, content_type, status, published_at, updated_at, author:profiles(display_name)')
    .order('updated_at', { ascending: false })
    .limit(EDITOR_LIST_LIMIT)
  if (status) query = query.eq('status', status)
  const { data, error } = await query.overrideTypes<EditorArticleRow[], { merge: false }>()
  if (error) throw new Error(`Failed to load articles: ${error.message}`)
  return data
}

export async function getArticleForEdit(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null
  const supabase = await createSessionClient()
  const { data, error } = await supabase
    .from('articles')
    .select(
      'id, slug, title, excerpt, body, content_type, category_id, sport_id, league_id, status, published_at, is_featured',
    )
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(`Failed to load article: ${error.message}`)
  return data
}

export type EditableArticle = NonNullable<Awaited<ReturnType<typeof getArticleForEdit>>>
