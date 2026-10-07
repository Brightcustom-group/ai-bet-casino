import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArticleForm } from '@/features/articles/components/ArticleForm'
import { getArticleForEdit } from '@/features/articles/editor-queries'
import { displayStatus } from '@/features/articles/types'
import { getTaxonomy } from '@/features/taxonomy/queries'

export const metadata: Metadata = { title: 'Edit article' }

export default async function EditArticlePage({ params, searchParams }: PageProps<'/editor/articles/[id]'>) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams])
  const [article, taxonomy] = await Promise.all([getArticleForEdit(id), getTaxonomy()])
  if (!article) notFound()
  const status = displayStatus(article.status, article.published_at)
  return (
    <>
      <div className="section-head">
        <h1>Edit article</h1>
        {status === 'published' && <Link href={`/articles/${article.slug}`}>View live article</Link>}
      </div>
      {saved && (
        <p className="alert alert-success" role="status">
          Saved. Status: {status}
          {status === 'scheduled' && ' — it will appear on the site at the publish time.'}
        </p>
      )}
      <ArticleForm taxonomy={taxonomy} article={article} />
    </>
  )
}
