# Traffic, engagement and content plan

Visitor numbers are goals, not promises. Indexing is enabled only in production
(`SITE_INDEXING=enabled`); staging and local are always `noindex`.

## Measurements (definitions shared by reports and dashboards)

| Metric | Definition | Source |
| --- | --- | --- |
| Organic sessions | Sessions whose landing page came from a search engine | Analytics (to choose; privacy-friendly, POPIA-compliant, consent where required) |
| Indexed pages | Valid indexed URLs / URLs in sitemap | Google Search Console, Bing Webmaster Tools |
| Search impressions & CTR | Per page and per query cluster (e.g. "football match previews") | Search Console |
| Returning visitors (28-day) | Visitors with ≥2 sessions in 28 days / all visitors | Analytics |
| Engaged reading | Article views with ≥30s visible time or ≥50% scroll | Analytics event |
| Search usage | On-site searches, zero-result rate, top terms | Server log / analytics event on `/search` |
| Newsletter conversion | Confirmed subscriptions / unique article readers | DB (`newsletter_subscriptions`, once built) |
| Publishing cadence | Articles published per week by type and section | DB (`articles`) |
| Freshness | % of previews published ≥24h before kick-off | DB (once fixtures exist) |
| RG notice reach | Share of article views with the RG notice rendered (target 100%) | Built into every article template |
| Core Web Vitals | LCP < 2.5s, INP < 200ms, CLS < 0.1 at p75 on mobile | CrUX / Search Console |

Guardrails: no metric may be optimised with urgency tricks, misleading odds framing or
outcome promises.

## Initial content plan (first 8 weeks)

| Stream | Cadence | Target searches |
| --- | --- | --- |
| Football match previews (PSL-level fixtures, major European leagues) | 4–6 / week | "<team> vs <team> preview", "soccer odds analysis" |
| Cricket previews and tips (domestic T20 and internationals in season) | 2–3 / week in season | "cricket betting tips", "<series> preview" |
| Rugby previews (URC, internationals) | 1–2 / week in season | "rugby match preview" |
| Odds education evergreen guides | 1 / week | "how decimal odds work", "implied probability" |
| Casino game guides (rules, RTP, volatility, house edge) | 1–2 / week | "how to play blackjack", "slot RTP explained" |
| Responsible gambling guides | 2 / month | "responsible gambling South Africa", "gambling help" |

Every article: unique title and summary, SAST times, decimal odds, author byline, RG notice, and
internal links to the relevant category and evergreen guides.
