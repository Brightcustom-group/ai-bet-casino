import type { Metadata, Viewport } from 'next'
import { publicEnv } from '@/lib/env'
import { isIndexingEnabled } from '@/lib/seo'
import { site } from '@/lib/site'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const indexable = isIndexingEnabled()
  return {
    metadataBase: new URL(publicEnv.siteUrl),
    title: { default: `${site.name} — sports previews, odds analysis & casino guides`, template: `%s | ${site.name}` },
    description: site.description,
    applicationName: site.name,
    openGraph: { siteName: site.name, locale: 'en_ZA', type: 'website' },
    robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  }
}

export const viewport: Viewport = {
  themeColor: '#0b1310',
  colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA">
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        {children}
      </body>
    </html>
  )
}
