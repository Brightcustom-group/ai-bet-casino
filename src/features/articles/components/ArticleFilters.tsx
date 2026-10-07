import Link from 'next/link'
import type { Taxonomy } from '@/features/taxonomy/queries'
import type { ContentSection } from '../types'
import type { ArticleFilters as QueryFilters } from '../queries'

type Props = {
  action: string
  taxonomy: Taxonomy
  values: QueryFilters
  section?: ContentSection
}

/** Plain GET form: works without JavaScript and produces shareable URLs. */
export function ArticleFilters({ action, taxonomy, values, section }: Props) {
  const categories = section ? taxonomy.categories.filter((c) => c.section === section) : taxonomy.categories
  const showSports = section === undefined || section === 'sports'
  return (
    <form className="filters" action={action} method="get" role="search" aria-label="Filter articles">
      <div className="field">
        <label htmlFor="filter-q">Search</label>
        <input id="filter-q" type="search" name="q" defaultValue={values.q} maxLength={100} placeholder="e.g. derby, cricket, RTP" />
      </div>
      <div className="field">
        <label htmlFor="filter-category">Category</label>
        <select id="filter-category" name="category" defaultValue={values.category ?? ''}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
      </div>
      {showSports && (
        <>
          <div className="field">
            <label htmlFor="filter-sport">Sport</label>
            <select id="filter-sport" name="sport" defaultValue={values.sport ?? ''}>
              <option value="">All sports</option>
              {taxonomy.sports.map((s) => (
                <option key={s.id} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="filter-league">League</label>
            <select id="filter-league" name="league" defaultValue={values.league ?? ''}>
              <option value="">All leagues</option>
              {taxonomy.sports.map((s) => (
                <optgroup key={s.id} label={s.name}>
                  {taxonomy.leagues.filter((l) => l.sport_id === s.id).map((l) => (
                    <option key={l.id} value={l.slug}>{l.name}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </>
      )}
      <div className="actions">
        <button type="submit" className="button">Apply</button>
        <Link href={action}>Clear</Link>
      </div>
    </form>
  )
}

