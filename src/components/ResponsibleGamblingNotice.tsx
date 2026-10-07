import Link from 'next/link'
import { responsibleGambling } from '@/lib/site'

/** Inline notice shown on every article and listing page. */
export function ResponsibleGamblingNotice() {
  return (
    <aside className="notice" aria-label="Responsible gambling notice">
      <strong>{responsibleGambling.ageNotice}. Please gamble responsibly.</strong>
      {responsibleGambling.shortNotice} Free, confidential help: {responsibleGambling.helplineName}{' '}
      <a href={`tel:${responsibleGambling.helplinePhone.replace(/\s/g, '')}`}>{responsibleGambling.helplinePhone}</a>.{' '}
      <Link href="/responsible-gambling">Read our responsible-gambling guide</Link>.
    </aside>
  )
}
