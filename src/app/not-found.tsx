import Link from 'next/link'
import { EmptyState } from '@/components/EmptyState'
import { SiteFooter } from '@/components/SiteFooter'
import { SiteHeader } from '@/components/SiteHeader'

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="container section">
        <EmptyState title="Page not found">
          <p>This page doesn’t exist or is no longer published.</p>
          <p>
            <Link href="/">Go to the homepage</Link> or <Link href="/search">search articles</Link>.
          </p>
        </EmptyState>
      </main>
      <SiteFooter />
    </>
  )
}
