/**
 * Authorization tests against a real local Supabase stack, using real sessions for
 * seeded users (see supabase/seed.sql). Uses only the publishable key — never a
 * service/secret key — so every request goes through grants + RLS.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://127.0.0.1:54321'
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
if (!key) throw new Error('Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (see .env.example)')
const PASSWORD = 'dev-password-123'
const runId = Date.now()

function client() {
  return createClient(url, key!, { auth: { persistSession: false, autoRefreshToken: false } })
}

async function signedIn(email: string) {
  const c = client()
  const { data, error } = await c.auth.signInWithPassword({ email, password: PASSWORD })
  if (error) throw error
  return { c, userId: data.user.id }
}

let anon: SupabaseClient
let reader: SupabaseClient
let editor: SupabaseClient
let admin: SupabaseClient
let readerId: string
let editorId: string
let categoryId: number

const draft = () => ({
  slug: `rls-test-${runId}-${Math.random().toString(36).slice(2, 8)}`,
  title: 'RLS test article',
  excerpt: 'Synthetic article created by the RLS test-suite.',
  body: 'Body.',
  content_type: 'preview' as const,
  category_id: categoryId,
})

beforeAll(async () => {
  anon = client()
  ;({ c: reader, userId: readerId } = await signedIn('reader@aibetcasino.test'))
  ;({ c: editor, userId: editorId } = await signedIn('editor@aibetcasino.test'))
  ;({ c: admin } = await signedIn('admin@aibetcasino.test'))
  const { data } = await anon.from('categories').select('id').eq('slug', 'match-previews').single()
  categoryId = data!.id
})

afterAll(async () => {
  await admin.from('articles').delete().like('slug', `rls-test-${runId}-%`)
})

describe('public visibility', () => {
  it.each([
    ['signed-out', () => anon],
    ['reader', () => reader],
  ])('%s users see only live published articles', async (_, get) => {
    const { data, error } = await get().from('articles').select('slug, status, published_at').limit(100)
    expect(error).toBeNull()
    expect(data!.length).toBeGreaterThan(0)
    for (const a of data!) {
      expect(a.status).toBe('published')
      expect(new Date(a.published_at!).getTime()).toBeLessThanOrEqual(Date.now())
    }
  })

  it('editors see drafts and scheduled articles', async () => {
    const { data } = await editor.from('articles').select('status, published_at').limit(100)
    expect(data!.some((a) => a.status === 'draft')).toBe(true)
    expect(data!.some((a) => a.status === 'published' && new Date(a.published_at!) > new Date())).toBe(true)
  })

  it('signed-out users can read staff bylines but not roles', async () => {
    const names = await anon.from('profiles').select('display_name')
    expect(names.error).toBeNull()
    expect(names.data!.map((p) => p.display_name)).not.toContain('Riaan Reader')
    const roles = await anon.from('profiles').select('role')
    expect(roles.error?.code).toBe('42501')
  })
})

describe('writes', () => {
  it('signed-out users cannot create articles', async () => {
    const { error } = await anon.from('articles').insert(draft())
    expect(error?.code).toBe('42501')
  })

  it('readers cannot create articles', async () => {
    const { error } = await reader.from('articles').insert(draft())
    expect(error?.code).toBe('42501')
  })

  it('readers cannot edit published articles', async () => {
    const { data } = await reader
      .from('articles')
      .update({ title: 'Hijacked title' })
      .eq('slug', 'reading-decimal-odds')
      .select('id')
    expect(data).toEqual([])
  })

  it('editors can create, publish and see it appear publicly', async () => {
    const row = draft()
    const created = await editor.from('articles').insert(row).select('id, author_id, status').single()
    expect(created.error).toBeNull()
    expect(created.data).toMatchObject({ author_id: editorId, status: 'draft' })

    expect((await anon.from('articles').select('id').eq('slug', row.slug)).data).toEqual([])

    const published = await editor
      .from('articles')
      .update({ status: 'published', published_at: new Date(Date.now() - 1000).toISOString() })
      .eq('id', created.data!.id)
      .select('status')
      .single()
    expect(published.error).toBeNull()

    expect((await anon.from('articles').select('id').eq('slug', row.slug)).data).toHaveLength(1)
  })

  it('editors cannot spoof or change the author', async () => {
    const spoof = await editor.from('articles').insert({ ...draft(), author_id: readerId })
    expect(spoof.error?.code).toBe('42501')
    const change = await editor.from('articles').update({ author_id: readerId }).eq('slug', 'reading-decimal-odds')
    expect(change.error?.code).toBe('42501')
  })

  it('editors cannot delete articles; admins can', async () => {
    const row = draft()
    const { data } = await editor.from('articles').insert(row).select('id').single()
    const byEditor = await editor.from('articles').delete().eq('id', data!.id).select('id')
    expect(byEditor.data).toEqual([])
    const byAdmin = await admin.from('articles').delete().eq('id', data!.id).select('id')
    expect(byAdmin.data).toHaveLength(1)
  })

  it('only admins manage taxonomy', async () => {
    const byEditor = await editor.from('sports').insert({ slug: `rls-${runId}`, name: 'RLS sport' })
    expect(byEditor.error?.code).toBe('42501')
    const byAdmin = await admin.from('sports').insert({ slug: `rls-${runId}`, name: 'RLS sport' }).select('id').single()
    expect(byAdmin.error).toBeNull()
    await admin.from('sports').delete().eq('id', byAdmin.data!.id)
  })
})

describe('roles and audit log', () => {
  it('users cannot raise their own role', async () => {
    const direct = await reader.from('profiles').update({ role: 'admin' }).eq('id', readerId)
    expect(direct.error?.code).toBe('42501')
    const rpc = await reader.rpc('admin_set_role', { target_user: readerId, new_role: 'editor' })
    expect(rpc.error?.code).toBe('42501')
    const viaEditor = await editor.rpc('admin_set_role', { target_user: editorId, new_role: 'admin' })
    expect(viaEditor.error?.code).toBe('42501')
  })

  it('article changes are audited and visible to admins only', async () => {
    const row = draft()
    await editor.from('articles').insert(row)
    const forAdmin = await admin
      .from('audit_logs')
      .select('action, actor_id, details')
      .eq('entity', 'article')
      .contains('details', { slug: row.slug })
    expect(forAdmin.data).toEqual([expect.objectContaining({ action: 'insert', actor_id: editorId })])
    expect((await editor.from('audit_logs').select('id').limit(5)).data).toEqual([])
    expect((await anon.from('audit_logs').select('id').limit(5)).error?.code).toBe('42501')
  })
})
