/** Indexing is opt-in per environment so staging can never be indexed by accident. */
export function isIndexingEnabled(): boolean {
  return process.env.SITE_INDEXING === 'enabled'
}
