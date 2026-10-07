import type { Metadata } from 'next'
import { ArticleGrid } from '@/features/articles/components/ArticleCard'
import { listPublishedArticles } from '@/features/articles/queries'
import { responsibleGambling } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Responsible gambling: limits, warning signs and free help',
  description:
    'How to keep gambling safe: set limits, recognise warning signs and get free, confidential help in South Africa.',
  alternates: { canonical: '/responsible-gambling' },
}

export default async function ResponsibleGamblingPage() {
  const { articles } = await listPublishedArticles({ section: 'responsible_gambling' })
  return (
    <div className="container">
      <header className="page-intro">
        <h1>Responsible gambling</h1>
        <p>Gambling should only ever be entertainment you can afford. Here is how to stay in control.</p>
      </header>
      <div className="prose">
        <h2>Get help now</h2>
        <p>
          The {responsibleGambling.helplineName} offers free, confidential counselling. Call{' '}
          <a href={`tel:${responsibleGambling.helplinePhone.replace(/\s/g, '')}`}>{responsibleGambling.helplinePhone}</a>{' '}
          or visit <a href={responsibleGambling.helplineUrl} rel="noopener">{responsibleGambling.helplineUrl.replace('https://', '')}</a>.
        </p>
        <h2>Stay in control</h2>
        <ul>
          <li>Gambling is for adults aged 18 and over only.</li>
          <li>Set a budget before you start and never chase losses.</li>
          <li>Use deposit, loss and time limits offered by licensed operators.</li>
          <li>Never borrow money or use money meant for bills to gamble.</li>
          <li>Take regular breaks, and don’t gamble when stressed, upset or under the influence.</li>
        </ul>
        <h2>Warning signs</h2>
        <ul>
          <li>Spending more time or money than you planned.</li>
          <li>Hiding gambling from family or friends.</li>
          <li>Feeling anxious or irritable when not gambling.</li>
          <li>Gambling to win back losses or to escape problems.</li>
        </ul>
        <p>
          Our content is informational. Predictions and analysis can be wrong, and no outcome is ever guaranteed.
        </p>
      </div>
      {articles.length > 0 && (
        <section className="section" aria-labelledby="rg-articles">
          <h2 id="rg-articles">Guides</h2>
          <ArticleGrid articles={articles} />
        </section>
      )}
    </div>
  )
}
