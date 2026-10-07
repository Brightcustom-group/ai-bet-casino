import Link from 'next/link'
import { responsibleGambling } from '@/lib/site'
import { MainNav } from './MainNav'

export function SiteHeader() {
  return (
    <>
      <div className="rg-bar" role="note" aria-label="Responsible gambling">
        <div className="container">
          <span>
            <span className="age-badge">{responsibleGambling.ageNotice}</span> Information only — we do not take bets.
          </span>
          <span>
            Need help? {responsibleGambling.helplineName}:{' '}
            <a href={`tel:${responsibleGambling.helplinePhone.replace(/\s/g, '')}`}>
              {responsibleGambling.helplinePhone}
            </a>
          </span>
        </div>
      </div>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand">
            AI Bet <span>Casino</span>
          </Link>
          <MainNav />
        </div>
      </header>
    </>
  )
}
