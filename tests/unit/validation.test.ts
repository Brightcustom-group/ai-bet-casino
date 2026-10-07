import { describe, expect, it } from 'vitest'
import { findProhibitedClaim, parseArticleForm, slugify } from '@/features/articles/validation'

function form(overrides: Record<string, string> = {}) {
  const data = new FormData()
  const values: Record<string, string> = {
    title: 'Highveld derby preview',
    slug: 'highveld-derby-preview',
    excerpt: 'Form, injuries and what the odds imply before the derby.',
    body: 'Paragraph one.\n\nParagraph two.',
    content_type: 'preview',
    category_id: '1',
    sport_id: '1',
    league_id: '',
    intent: 'draft',
    publish_at: '',
    ...overrides,
  }
  for (const [k, v] of Object.entries(values)) data.set(k, v)
  return data
}

describe('article form validation', () => {
  it('saves a draft without a publish date', () => {
    const result = parseArticleForm(form())
    expect(result.success).toBe(true)
    expect(result.data).toMatchObject({ status: 'draft', published_at: null, league_id: null, is_featured: false })
  })

  it('publishing without a date publishes now', () => {
    const before = Date.now()
    const result = parseArticleForm(form({ intent: 'publish' }))
    expect(result.data?.status).toBe('published')
    expect(Date.parse(result.data!.published_at!)).toBeGreaterThanOrEqual(before)
  })

  it('interprets the publish time as SAST (UTC+2)', () => {
    const result = parseArticleForm(form({ intent: 'publish', publish_at: '2026-12-01T15:30' }))
    expect(result.data?.published_at).toBe('2026-12-01T13:30:00.000Z')
  })

  it('requires a sport when a league is chosen', () => {
    const result = parseArticleForm(form({ sport_id: '', league_id: '3' }))
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['sport_id'])
  })

  it('rejects invalid slugs', () => {
    expect(parseArticleForm(form({ slug: 'Bad Slug!' })).success).toBe(false)
  })

  it.each([
    'This is a guaranteed win',
    'A sure bet this weekend',
    'Totally risk-free betting',
    "You can't lose with this tip",
    '100% guaranteed returns',
  ])('rejects outcome promises: %s', (text) => {
    const result = parseArticleForm(form({ body: text }))
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toMatch(/must not promise wins/)
  })

  it('allows responsible phrasing', () => {
    expect(findProhibitedClaim('No outcome is guaranteed. Only stake what you can afford to lose.')).toBeNull()
  })
})

describe('slugify', () => {
  it('creates URL-safe slugs', () => {
    expect(slugify('Highveld Rovers v Cape Coast: Préview!')).toBe('highveld-rovers-v-cape-coast-preview')
  })
})
