# Version-one roadmap

Done in the foundation session: project setup, schema/RLS for content, editorial articles end to
end (sign-in → create/edit/schedule/publish → public pages, search and filters), responsible-
gambling notices, SEO basics, unit + RLS + E2E tests. Everything below is **not built yet**.

Priorities: P1 = needed before a public launch, P2 = version-one scope, P3 = can follow launch.

| # | Item | Priority | Notes |
| --- | --- | --- | --- |
| 1 | Compliance review of RG copy, disclaimer, age notice; privacy policy, terms, cookie notice (POPIA) | P1 | Blocks launch. Copy lives in `src/lib/site.ts` and `/disclaimer`. |
| 2 | Data handling, retention and access decisions (open decision in brief) | P1 | Needed before storing any real personal data (subscribers, accounts). |
| 3 | Staging + production Supabase projects, Hetzner deploy pipeline, HTTP-auth on staging, backups, rollback runbook | P1 | Needs server details and agreed process. |
| 4 | CI: lint, typecheck, unit tests, build, then `supabase start` + RLS + E2E | P1 | Workflow in `.github/workflows/ci.yml` — not yet run on GitHub. |
| 5 | Newsletter sign-up (double opt-in, unsubscribe, consent record, rate limiting/bot protection) | P1 | `newsletter_subscriptions` table + RLS; email provider to choose. |
| 6 | Admin settings: user/role management UI (uses `admin_set_role`), categories/sports/leagues CRUD, audit-log viewer | P2 | DB functions and policies already exist. |
| 7 | Media library (Supabase Storage, image upload, alt text required, image optimisation) | P2 | Storage policies: public read of published media, staff write. |
| 8 | Sports data integration: fixtures, betting markets, odds snapshots, results from a licensed provider (sandbox first) | P2 | Server-side fetch job with timeouts, retries with backoff, idempotent upserts; keys in env. Provider not yet chosen. |
| 9 | Signed provider webhooks for odds/results (HMAC verification, timestamp tolerance, replay/duplicate protection via delivery-id table) | P2 | Route handler using a server-only secret key; never exposes it. |
| 10 | Event & odds-analysis pages (fixture page with odds table: decimal odds, implied probability, SAST kick-off, last-updated) | P2 | `SportsEvent` JSON-LD only where valid. |
| 11 | Live updates for odds/results on event pages (Supabase Realtime or polling) | P2 | Calm presentation: no flashing, no urgency cues. |
| 12 | Casino games: `casino_games` + `game_categories`, game detail pages, filter by game | P2 | Guides link to game pages. |
| 13 | Promotions (informational only, clearly labelled, T&Cs, no affiliate tracking in v1) | P2 | Needs compliance rules for promotional content. |
| 14 | Reports dashboard: content counts, publishing cadence, top pages, search terms, newsletter growth | P2 | See `docs/METRICS.md`. |
| 15 | Internal webhooks on publish/update (search indexing ping, notifications, analytics), signed + retried | P2 | Outbox table written by trigger, processed server-side. |
| 16 | Registered reader accounts: preferences (sports/leagues), email sign-up/sign-in | P3 | Public sign-up currently disabled. |
| 17 | Caching: ISR / cache tags for public pages with revalidation on publish | P3 | Today every public page renders per request. |
| 18 | Rich text (markdown subset) + inline images in articles, preview before publish, revision history | P3 | |
| 19 | Accessibility audit (axe + manual screen-reader pass), Lighthouse/Core Web Vitals budget in CI | P1 before launch | Basics in place (labels, focus, contrast tokens, skip link). |
| 20 | Editor hardening: MFA for staff, session timeout policy, password reset flow | P1 | Supabase Auth supports TOTP MFA. |

Known limitations of the current slice

- Error responses on streamed listing pages (`/sports`, `/casino`, `/search`) return HTTP 200 with
  the error UI (streaming starts before the error); article/category 404s are real 404s.
- Admins cannot yet delete articles from the UI (archive instead); delete is allowed by RLS.
- No rate limiting on sign-in beyond Supabase Auth defaults.
