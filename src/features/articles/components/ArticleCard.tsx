import Link from 'next/link'
import { formatSastDate } from '@/lib/format'
import { contentTypeLabels, type ArticleSummary } from '../types'

export function ArticleCard({ article, headingLevel = 3 }: { article: ArticleSummary; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as const
  return (
    <article className="card">
      <div className="meta">
        <span className="pill">{contentTypeLabels[article.content_type]}</span>
        {article.sport && <span className="pill pill-muted">{article.sport.name}</span>}
        {article.league && <span>{article.league.name}</span>}
      </div>
      <Heading>
        <Link href={`/articles/${article.slug}`}>{article.title}</Link>
      </Heading>
      <p>{article.excerpt}</p>
      {article.published_at && (
        <time dateTime={article.published_at}>{formatSastDate(article.published_at)}</time>
      )}
    </article>
  )
}

export function ArticleGrid({ articles, headingLevel }: { articles: ArticleSummary[]; headingLevel?: 2 | 3 }) {
  return (
    <ul className="card-grid">
      {articles.map((article) => (
        <li key={article.id}>
          <ArticleCard article={article} headingLevel={headingLevel} />
        </li>
      ))}
    </ul>
  )
}
