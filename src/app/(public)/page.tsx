import Link from 'next/link'
import { ResponsibleGamblingNotice } from '@/components/ResponsibleGamblingNotice'
import { EmptyState } from '@/components/EmptyState'
import { ArticleGrid } from '@/features/articles/components/ArticleCard'
import { listFeaturedArticles, listPublishedArticles } from '@/features/articles/queries'
import { site } from '@/lib/site'

export const metadata = {
  alternates: { canonical: '/' },
}

export default async function HomePage() {
  const [featured, sports, casino] = await Promise.all([
    listFeaturedArticles(3),
    listPublishedArticles({ section: 'sports' }),
    listPublishedArticles({ section: 'casino' }),
  ])
  return (
    <div className="container">
      <section className="hero">
        <h1>Clear sports and casino information, without the hype</h1>
        <p>
          Match previews, odds analysis and casino-game guides for adults in South Africa. {site.name} is an
          information site: we never take bets and nothing we publish is a guaranteed outcome.
        </p>
      </section>

      <section className="section" aria-labelledby="featured-heading">
        <h2 id="featured-heading">Featured</h2>
        {featured.length ? (
          <ArticleGrid articles={featured} />
        ) : (
          <EmptyState title="No featured articles yet" />
        )}
      </section>

      <section className="section" aria-labelledby="sports-heading">
        <div className="section-head">
          <h2 id="sports-heading">Latest sports previews & tips</h2>
          <Link href="/sports">All sports content</Link>
        </div>
        {sports.articles.length ? (
          <ArticleGrid articles={sports.articles.slice(0, 6)} />
        ) : (
          <EmptyState title="No sports articles yet" />
        )}
      </section>

      <section className="section" aria-labelledby="casino-heading">
        <div className="section-head">
          <h2 id="casino-heading">Casino game guides</h2>
          <Link href="/casino">All casino guides</Link>
        </div>
        {casino.articles.length ? (
          <ArticleGrid articles={casino.articles.slice(0, 3)} />
        ) : (
          <EmptyState title="No casino guides yet" />
        )}
      </section>

      <section className="section">
        <ResponsibleGamblingNotice />
      </section>
    </div>
  )
}
