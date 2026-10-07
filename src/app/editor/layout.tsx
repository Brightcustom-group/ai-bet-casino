import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Editor', template: '%s | AI Bet Casino Editor' },
  robots: { index: false, follow: false },
}

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <div className="editor-shell">{children}</div>
}
