import { z } from 'zod'
import { sastLocalInputToIso } from '@/lib/format'
import type { ContentType } from './types'

const contentTypes = [
  'preview',
  'tip',
  'odds_analysis',
  'casino_guide',
  'responsible_gambling',
] as const satisfies readonly ContentType[]

/**
 * Phrases that promise outcomes. Content must stay informational, so these are
 * rejected at save time (the editor sees which phrase triggered it).
 */
const prohibitedClaims: RegExp[] = [
  /guaranteed?\s+(win|wins|winner|profit|returns?|payout)/i,
  /\b(sure|certain|safe)\s+(bet|win|thing)\b/i,
  /\brisk[-\s]?free\b/i,
  /\bcan(?:'|’)?t\s+lose\b/i,
  /\bcannot\s+lose\b/i,
  /\b100%\s+(win|guaranteed|certain)/i,
  /\bget\s+rich\b/i,
]

export function findProhibitedClaim(text: string): string | null {
  for (const pattern of prohibitedClaims) {
    const match = text.match(pattern)
    if (match) return match[0]
  }
  return null
}

const optionalId = z
  .string()
  .trim()
  .transform((v) => (v === '' ? null : Number(v)))
  .pipe(z.number().int().positive().nullable())

export const articleFormSchema = z
  .object({
    title: z.string().trim().min(5, 'Title must be at least 5 characters.').max(160),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .max(120)
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens.'),
    excerpt: z
      .string()
      .trim()
      .min(20, 'Summary must be at least 20 characters.')
      .max(300, 'Summary must be 300 characters or fewer.'),
    body: z.string().trim().min(1, 'Body is required.').max(50000),
    content_type: z.enum(contentTypes, { message: 'Choose a content type.' }),
    category_id: z.coerce.number({ message: 'Choose a category.' }).int().positive('Choose a category.'),
    sport_id: optionalId,
    league_id: optionalId,
    intent: z.enum(['draft', 'publish', 'archive']),
    publish_at: z.string().trim(),
    is_featured: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (value.league_id !== null && value.sport_id === null) {
      ctx.addIssue({ code: 'custom', path: ['sport_id'], message: 'Choose the sport for this league.' })
    }
    if (value.publish_at !== '' && sastLocalInputToIso(value.publish_at) === null) {
      ctx.addIssue({ code: 'custom', path: ['publish_at'], message: 'Enter a valid date and time.' })
    }
    for (const field of ['title', 'excerpt', 'body'] as const) {
      const claim = findProhibitedClaim(value[field])
      if (claim) {
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: `Remove “${claim}”: content must not promise wins or guaranteed outcomes.`,
        })
      }
    }
  })
  .transform(({ intent, publish_at, ...rest }) => {
    const status = intent === 'publish' ? 'published' : intent === 'archive' ? 'archived' : 'draft'
    // Publishing with no date means "now"; a future date schedules the article.
    const published_at =
      publish_at !== '' ? sastLocalInputToIso(publish_at) : status === 'published' ? new Date().toISOString() : null
    return { ...rest, status, published_at } as const
  })

export type ArticleInput = z.output<typeof articleFormSchema>

export function parseArticleForm(formData: FormData) {
  return articleFormSchema.safeParse({
    title: formData.get('title') ?? '',
    slug: formData.get('slug') ?? '',
    excerpt: formData.get('excerpt') ?? '',
    body: formData.get('body') ?? '',
    content_type: formData.get('content_type') ?? '',
    category_id: formData.get('category_id') ?? '',
    sport_id: formData.get('sport_id') ?? '',
    league_id: formData.get('league_id') ?? '',
    intent: formData.get('intent') ?? 'draft',
    publish_at: formData.get('publish_at') ?? '',
    is_featured: formData.get('is_featured') === 'on',
  })
}

/** "Highveld Rovers v Cape Coast: Preview!" → "highveld-rovers-v-cape-coast-preview" */
export function slugify(text: string): string {
  return text
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/g, '')
}
