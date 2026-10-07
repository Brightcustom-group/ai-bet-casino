'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createSessionClient } from '@/lib/supabase/server'
import { getSessionUser, isStaff } from '@/features/auth/session'
import { getTaxonomy } from '@/features/taxonomy/queries'
import { parseArticleForm } from './validation'
import { contentTypeSection } from './types'

export type ArticleFormState = {
  error?: string
  fieldErrors?: Partial<Record<string, string>>
}

/**
 * Creates (articleId = null) or updates an article. Bound per form:
 * `saveArticle.bind(null, id)`. RLS enforces editor/admin access in the database;
 * the checks here only produce friendly messages.
 */
export async function saveArticle(
  articleId: string | null,
  _prev: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const user = await getSessionUser()
  if (!isStaff(user)) return { error: 'Your session has expired or you do not have editor access.' }

  const parsed = parseArticleForm(formData)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      fieldErrors[key] ??= issue.message
    }
    return { error: 'Please fix the highlighted fields.', fieldErrors }
  }
  const input = parsed.data

  const { categories, leagues } = await getTaxonomy()
  const category = categories.find((c) => c.id === input.category_id)
  if (!category || category.section !== contentTypeSection[input.content_type]) {
    return { error: 'Please fix the highlighted fields.', fieldErrors: { category_id: 'Choose a category that matches the content type.' } }
  }
  if (input.league_id !== null && !leagues.some((l) => l.id === input.league_id && l.sport_id === input.sport_id)) {
    return { error: 'Please fix the highlighted fields.', fieldErrors: { league_id: 'This league does not belong to the selected sport.' } }
  }

  const supabase = await createSessionClient()
  const result = articleId
    ? await supabase.from('articles').update(input).eq('id', articleId).select('id, slug').maybeSingle()
    : await supabase.from('articles').insert(input).select('id, slug').single()

  if (result.error) {
    if (result.error.code === '23505') {
      return { error: 'Please fix the highlighted fields.', fieldErrors: { slug: 'Another article already uses this URL slug.' } }
    }
    if (result.error.code === '42501') return { error: 'You do not have permission to save this article.' }
    console.error('saveArticle failed', { code: result.error.code, articleId })
    return { error: 'The article could not be saved. Please try again.' }
  }
  if (!result.data) return { error: 'Article not found or you do not have access to it.' }

  // Public pages render per request today; this also clears any client router cache.
  revalidatePath('/', 'layout')
  redirect(`/editor/articles/${result.data.id}?saved=1`)
}
