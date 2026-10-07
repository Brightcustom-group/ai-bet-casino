import type { Metadata } from 'next'
import { ResponsibleGamblingNotice } from '@/components/ResponsibleGamblingNotice'
import { ArticleListing, filtersFromSearchParams } from '@/features/articles/components/ArticleListing'

export const metadata: Metadata = {
  title: 'Sports betting tips, match previews & odds analysis',
  description:
    'Football, cricket and rugby match previews, betting tips and decimal-odds analysis for South African sports fans. Informational only.',
  alternates: { canonical: '/sports' },
}

export default async function SportsPage({ searchParams }: PageProps<'/sports'>) {
  const filters = filtersFromSearchParams(await searchParams)
  return (
    <div className="container">
      <header className="page-intro">
        <h1>Sports tips & previews</h1>
        <p>Previews, betting tips and odds analysis. Times are shown in SAST and odds in decimal format.</p>
      </header>
      <ArticleListing basePath="/sports" filters={filters} section="sports" />
      <div className="section">
        <ResponsibleGamblingNotice />
      </div>
    </div>
  )
}
