'use client'

import { EmptyState } from '@/components/EmptyState'

export default function PublicError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="container section">
      <EmptyState title="We couldn’t load this page">
        <p>Something went wrong on our side. Please try again in a moment.</p>
        <button type="button" className="button" onClick={() => retry()}>
          Try again
        </button>
      </EmptyState>
    </div>
  )
}
