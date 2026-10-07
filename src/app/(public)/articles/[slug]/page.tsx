import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ResponsibleGamblingNotice } from '@/components/ResponsibleGamblingNotice'
import { ArticleBody } from '@/features/articles/components/ArticleBody'
import { getPublishedArticle } from '@/features/articles/queries'
import { contentTypeLabels } from '@/features/articles/types'
import { publicEnv } from '@/lib/env'
import { formatSastDateTime } from '@/lib/format'
import { site } from '@/lib/site'

export async function generateMetadata({ params }: PageProps<'/articles/[slug]'>): Promise<Metadata> {
  const article = await getPublishedArticle((await params).slug)
  if (!article) return { title: 'Article not found', robots: { index: false } }
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/articles/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      url: `/articles/${article.slug}`,
      publishedTime: article.published_at ?? undefined,
      modifiedTime: article.updated_at,
    },
  }
}

export default async function ArticlePage({ params }: PageProps<'/articles/[slug]'>) {
  const article = await getPublishedArticle((await params).slug)
  if (!article) notFound()

  const url = `${publicEnv.siteUrl}/articles/${article.slug}`
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    mainEntityOfPage: url,
    author: article.author ? { '@type': 'Person', name: article.author.display_name } : undefined,
    publisher: { '@type': 'Organization', name: site.name, url: publicEnv.siteUrl },
    inLanguage: 'en-ZA',
  }
  const section = article.category?.section === 'casino' ? { href: '/casino', label: 'Casino guides' }
    : article.category?.section === 'responsible_gambling' ? { href: '/responsible-gambling', label: 'Responsible gambling' }
    : { href: '/sports', label: 'Sports tips & previews' }

  return (
    <div className="container">
      <nav className="breadcrumbs" aria-label="Breadcrumb">
        <ol>
          <li><Link href="/">Home</Link></li>
          <li><Link href={section.href}>{section.label}</Link></li>
          {article.category && (
            <li><Link href={`/category/${article.category.slug}`}>{article.category.name}</Link></li>
          )}
        </ol>
      </nav>
      <article className="article">
        <div className="meta">
          <span className="pill">{contentTypeLabels[article.content_type]}</span>
          {article.sport && <span className="pill pill-muted">{article.sport.name}</span>}
          {article.league && <span>{article.league.name}</span>}
        </div>
        <h1>{article.title}</h1>
        <p className="lede">{article.excerpt}</p>
        <div className="article-meta">
          {article.author && <span>By {article.author.display_name}</span>}
          {article.published_at && (
            <span>
              Published <time dateTime={article.published_at}>{formatSastDateTime(article.published_at)}</time>
            </span>
          )}
          {article.published_at && article.updated_at > article.published_at && (
            <span>
              Updated <time dateTime={article.updated_at}>{formatSastDateTime(article.updated_at)}</time>
            </span>
          )}
        </div>
        <ResponsibleGamblingNotice />
        <ArticleBody body={article.body} />
      </article>
      <script
        type="application/ld+json"
        // JSON.stringify output with "<" escaped cannot break out of the script element.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
    </div>
  )
}
