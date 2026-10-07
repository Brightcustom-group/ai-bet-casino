# AI Bet Casino (aibetcasino.com)

Public, indexable sports-betting and casino **information** website for adults in South Africa,
with an authenticated editor area. Version one is an information/content platform only: **no
real-money betting, payments, deposits, withdrawals, automated bets or bookmaker connections.**

Status: foundation + first end-to-end feature (editorial articles). See
[docs/ROADMAP.md](docs/ROADMAP.md) for the remaining version-one work.

## What works today

- Public site: homepage (featured, latest sports, casino guides), sports listing, casino listing,
  category pages, article pages, search with filters (category, sport, league, full-text),
  responsible-gambling page, disclaimer, 404s.
- Responsible-gambling messaging on every public page (18+ bar, inline notice, footer), SAST
  dates, decimal odds wording.
- Editor area: sign-in, dashboard (draft / scheduled / published / archived), create and edit
  articles, publish now, schedule for later, unpublish, archive, feature on homepage.
- Compliance guard: saving content containing outcome promises ("guaranteed win", "sure bet",
  "risk-free", …) is rejected with a field error.
- SEO: server-rendered pages, per-page titles/descriptions, canonical URLs, `Article` JSON-LD,
  `sitemap.xml`, `robots.txt`, `noindex` + `X-Robots-Tag` on the editor, `noindex` on internal
  search, real 404s for drafts/scheduled/unknown articles, indexing opt-in per environment.
- Security: Postgres RLS + explicit grants for every table, admin-only role changes,
  trigger-written audit log, no service key used by the app.

## Stack and what runs where

| Layer | Technology | Runs |
| --- | --- | --- |
| Web app | Next.js 16 (App Router, React Server Components), TypeScript, plain CSS | Node server (Hetzner, later) |
| Data + auth | Supabase (Postgres 17, Auth, Data API/PostgREST) | Supabase project per environment |
| Authorization | Grants + Row Level Security in `supabase/migrations` | Database |

- **Public pages** are server-rendered per request with an anonymous client (publishable key, no
  cookies), so they can only ever read live published content.
- **Editor pages and server actions** use the signed-in user's session cookie with the
  publishable key; Postgres RLS decides what they can read and write. `src/proxy.ts` only
  refreshes the session and redirects signed-out users — it is not the security boundary.
- **No browser-side Supabase client** exists yet; nothing secret is shipped to the browser.

```
src/
  app/(public)/…            public routes (home, sports, casino, category, articles, search, legal)
  app/editor/…              sign-in + auth-gated (protected) editor routes, noindex
  app/api/health            health check (DB reachability)
  app/sitemap.ts, robots.ts
  features/articles/        types, validation, public queries, editor queries, actions, components
  features/taxonomy/        sports, leagues, categories (cached per request)
  features/auth/            session helpers, sign-in/out actions, sign-in form
  components/               site header/footer, notices, empty state, pagination, skeleton
  lib/                      env, site + responsible-gambling copy, SAST/odds formatting, Supabase clients
supabase/migrations/        schema, grants, RLS (source of truth for authorization)
supabase/seed.sql           synthetic development data and dev accounts
tests/unit | rls | e2e      Vitest unit tests, RLS tests with real sessions, Playwright E2E
```

## Run locally

Requirements: Node 22+, and Docker for the standard Supabase CLI stack.

```bash
npm install
cp .env.example .env.local

# 1. Start Supabase (applies migrations + seed)
npm run db:start            # = npx supabase start
#    Copy "API URL" and the publishable (or anon) key it prints into .env.local:
#    NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

# 2. Start the site
npm run dev                 # http://localhost:3000, editor at http://localhost:3000/editor
```

Development accounts (seed data, local only — password `dev-password-123`):

| Email | Role |
| --- | --- |
| `admin@aibetcasino.test` | admin |
| `editor@aibetcasino.test` | editor |
| `reader@aibetcasino.test` | reader (no editor access) |

Reset the database to migrations + seed: `npm run db:reset`. Regenerate DB types after schema
changes: `npm run db:types`.

### Fallback stack (no Supabase Docker images)

If `supabase start` cannot pull its images (e.g. registry rate limits), `npm run stack:fallback
-- start|reset|stop` runs an equivalent dev stack: native Postgres 16 + PostgREST binary + the
Supabase Auth (GoTrue) container + a small gateway on the same ports (API `54321`, DB `54322`).
It needs root (to run Postgres as the `postgres` user), `postgrest` on `PATH` and Docker for Auth.
It prints the dev publishable (anon) key to put in `.env.local`. The initial build was verified
on this fallback stack (Postgres 16); the standard `supabase start` path (Postgres 17) has not
yet been run against these migrations.

## Checks

```bash
npm run lint          # ESLint
npm run typecheck     # route types + tsc
npm test              # unit tests (validation, SAST/odds formatting)
npm run test:rls      # RLS tests against the running local stack (real sessions, no service key)
npm run test:e2e      # Playwright, desktop + mobile; needs the stack + seed (starts `npm run dev`)
npm run build
```

`test:rls` and `test:e2e` create rows prefixed `rls-test-`/`E2E`; `npm run db:reset` clears them.

## Environments and configuration

| Variable | Where | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | build + runtime | Supabase API URL for the environment |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | build + runtime | Publishable/anon key only. Never a secret key. |
| `NEXT_PUBLIC_SITE_URL` | build + runtime | Canonical origin, e.g. `https://aibetcasino.com` |
| `SITE_INDEXING` | build + runtime | `enabled` **only** in production; otherwise everything is `noindex` and robots disallows all |

`NEXT_PUBLIC_*` values and `SITE_INDEXING` are baked into static pages at build time, so build
once per environment (local, staging, production), each with its own Supabase project, keys and
dev/sandbox data. Staging must also sit behind access protection (e.g. HTTP auth at the reverse
proxy) — `noindex` is not access control. Real secrets go only in the server environment / secret
store, never in Git (`.env*` is ignored except `.env.example`).

Deployment to Hetzner is not set up in this session. Planned shape: build in CI → run
`next start` behind a reverse proxy (TLS, compression) → `GET /api/health` for health checks →
roll back by redeploying the previous build; apply migrations with `supabase db push` per
environment before switching traffic.

## Decisions and assumptions (reversible)

- Single `articles` table covers previews, tips, odds analysis, casino guides and
  responsible-gambling guides (`content_type`); "scheduled" = `published` with a future
  `published_at` (no cron needed for go-live).
- Article bodies are plain text (blank line = paragraph), rendered as text nodes — no HTML
  injection risk. Rich text/markdown and images come with the media library.
- Public sign-up is disabled; editors/admins are created by an administrator. Reader accounts
  (preferences/newsletter) are a later slice.
- Responsible-gambling helpline (NRGP 0800 006 008) and disclaimer copy are in `src/lib/site.ts`
  and `src/app/(public)/disclaimer` and **must be confirmed by compliance/legal** before launch.
- Teams, leagues and odds in the seed data are fictional.
- English (`en-ZA`), SAST (`Africa/Johannesburg`, UTC+2, no DST) and decimal odds throughout.
