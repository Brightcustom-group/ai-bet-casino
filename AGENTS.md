<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project rules (AI Bet Casino)

- Read `README.md` (architecture, run/check commands) and `docs/ROADMAP.md` before changing things.
- Information site only: never add real-money betting, payments, deposits, withdrawals, automated
  bet placement, bookmaker-account connections or AI services without explicit approval.
- Content must never promise outcomes; keep the responsible-gambling notices on public pages.
- Authorization lives in `supabase/migrations` (grants + RLS). Add/adjust policies there and cover
  them in `tests/rls` with real sessions; UI checks are only for messages.
- Never use a Supabase secret/service key in app code or `NEXT_PUBLIC_*` variables.
- Use SAST (`src/lib/format.ts`) for displayed times and decimal odds.
- Keep modules small and feature-scoped (`src/features/<feature>`); public reads go through
  `createPublicClient`, editor reads/writes through `createSessionClient`.
- Run `npm run lint && npm run typecheck && npm test` before committing; run `test:rls` and
  `test:e2e` when touching data access or user flows.
