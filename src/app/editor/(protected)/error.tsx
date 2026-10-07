'use client'

export default function EditorError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="panel" role="alert">
      <h1>Something went wrong</h1>
      <p>The editor could not load this data. Your unsaved changes may need to be re-entered.</p>
      <button type="button" className="button" onClick={() => retry()}>Try again</button>
    </div>
  )
}
