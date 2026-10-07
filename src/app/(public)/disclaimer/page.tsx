import type { Metadata } from 'next'
import { site } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: `${site.name} publishes information only and does not guarantee any outcome.`,
  alternates: { canonical: '/disclaimer' },
}

// TODO(legal): replace with counsel-approved wording before production launch.
export default function DisclaimerPage() {
  return (
    <div className="container">
      <header className="page-intro">
        <h1>Disclaimer</h1>
      </header>
      <div className="prose">
        <p>
          {site.name} ({site.domain}) publishes sports previews, odds analysis, betting tips and casino-game
          information for adults aged 18 and over, for informational and entertainment purposes only.
        </p>
        <ul>
          <li>Nothing on this website guarantees any result, win or profit. Odds and outcomes can change at any time.</li>
          <li>We do not accept bets, deposits or payments, and we do not place bets on anyone’s behalf.</li>
          <li>Odds shown are indicative decimal odds at the time of writing and may be out of date.</li>
          <li>Gambling laws differ by region. Only gamble with licensed operators where it is legal for you to do so.</li>
          <li>Times are shown in South African Standard Time (SAST, UTC+2).</li>
        </ul>
        <p>If gambling is causing you harm, please see our responsible-gambling page for free, confidential support.</p>
      </div>
    </div>
  )
}
