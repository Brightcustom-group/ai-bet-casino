import type { MetadataRoute } from 'next'
import { listPublishedSlugs } from '@/features/articles/queries'
import { getTaxonomy } from '@/features/taxonomy/queries'
import { publicEnv } from '@/lib/env'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = publicEnv.siteUrl
  const [articles, { categories }] = await Promise.all([listPublishedSlugs(), getTaxonomy()])
  const staticPages = ['', '/sports', '/casino', '/responsible-gambling', '/disclaimer'].map((path) => ({
    url: `${base}${path}`,
  }))
  return [
    ...staticPages,
    ...categories.map((c) => ({ url: `${base}/category/${c.slug}` })),
    ...articles.map((a) => ({ url: `${base}/articles/${a.slug}`, lastModified: a.updated_at })),
  ]
}
