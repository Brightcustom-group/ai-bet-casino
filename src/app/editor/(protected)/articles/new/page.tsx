import type { Metadata } from 'next'
import { ArticleForm } from '@/features/articles/components/ArticleForm'
import { getTaxonomy } from '@/features/taxonomy/queries'

export const metadata: Metadata = { title: 'New article' }

export default async function NewArticlePage() {
  const taxonomy = await getTaxonomy()
  return (
    <>
      <h1>New article</h1>
      <ArticleForm taxonomy={taxonomy} article={null} />
    </>
  )
}
