import type { MetadataRoute } from 'next'
import { publicEnv } from '@/lib/env'
import { isIndexingEnabled } from '@/lib/seo'

// robots.txt is a crawl hint, not access control: /editor is protected by auth + RLS.
export default function robots(): MetadataRoute.Robots {
  if (!isIndexingEnabled()) return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/editor', '/search'] },
    sitemap: `${publicEnv.siteUrl}/sitemap.xml`,
  }
}
