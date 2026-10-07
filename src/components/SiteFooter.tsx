import Link from 'next/link'
import { responsibleGambling, site } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <ul className="footer-links">
          <li><Link href="/sports">Sports tips & previews</Link></li>
          <li><Link href="/casino">Casino guides</Link></li>
          <li><Link href="/responsible-gambling">Responsible gambling</Link></li>
          <li><Link href="/disclaimer">Disclaimer</Link></li>
        </ul>
        <p>
          <span className="age-badge">{responsibleGambling.ageNotice}</span> {responsibleGambling.shortNotice}{' '}
          {site.name} publishes information only. We do not accept bets, deposits or payments.
        </p>
        <p>© {new Date().getFullYear()} {site.name} · {site.domain}</p>
      </div>
    </footer>
  )
}
