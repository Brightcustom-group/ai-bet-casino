import { defineConfig } from 'vitest/config'

// Load NEXT_PUBLIC_SUPABASE_* from .env.local when present.
try {
  process.loadEnvFile('.env.local')
} catch {}

// Runs against a live local Supabase stack (see README). Not part of `npm test`.
export default defineConfig({
  test: { include: ['tests/rls/**/*.test.ts'], fileParallelism: false, testTimeout: 20000 },
})
