import type { Metadata } from 'next'
import { ResponsibleGamblingNotice } from '@/components/ResponsibleGamblingNotice'
import { ArticleListing, filtersFromSearchParams } from '@/features/articles/components/ArticleListing'

export const metadata: Metadata = {
  title: 'Casino game guides: rules, RTP and house edge',
  description:
    'Plain-English guides to slots, blackjack, roulette and other casino games — how they work, RTP, volatility and house edge.',
  alternates: { canonical: '/casino' },
}

export default async function CasinoPage({ searchParams }: PageProps<'/casino'>) {
  const filters = filtersFromSearchParams(await searchParams)
  return (
    <div className="container">
      <header className="page-intro">
        <h1>Casino game guides</h1>
        <p>How casino games work, explained honestly. The house always keeps an edge — play for entertainment only.</p>
      </header>
      <ArticleListing basePath="/casino" filters={filters} section="casino" />
      <div className="section">
        <ResponsibleGamblingNotice />
      </div>
    </div>
  )
}
