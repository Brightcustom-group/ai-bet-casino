import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ResponsibleGamblingNotice } from '@/components/ResponsibleGamblingNotice'
import { ArticleListing, filtersFromSearchParams } from '@/features/articles/components/ArticleListing'
import { getTaxonomy } from '@/features/taxonomy/queries'

async function findCategory(slug: string) {
  const { categories } = await getTaxonomy()
  return categories.find((c) => c.slug === slug) ?? null
}

export async function generateMetadata({ params }: PageProps<'/category/[slug]'>): Promise<Metadata> {
  const category = await findCategory((await params).slug)
  if (!category) return { title: 'Category not found', robots: { index: false } }
  return {
    title: category.name,
    description: category.description || undefined,
    alternates: { canonical: `/category/${category.slug}` },
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps<'/category/[slug]'>) {
  const category = await findCategory((await params).slug)
  if (!category) notFound()
  const filters = { ...filtersFromSearchParams(await searchParams), category: category.slug }
  return (
    <div className="container">
      <header className="page-intro">
        <h1>{category.name}</h1>
        {category.description && <p>{category.description}</p>}
      </header>
      <ArticleListing basePath={`/category/${category.slug}`} filters={filters} section={category.section} />
      <div className="section">
        <ResponsibleGamblingNotice />
      </div>
    </div>
  )
}
