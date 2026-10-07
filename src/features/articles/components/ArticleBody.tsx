/**
 * Renders plain-text article bodies: blank lines separate paragraphs.
 * Text is rendered as React text nodes, so editor input can never inject HTML.
 */
export function ArticleBody({ body }: { body: string }) {
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return (
    <div className="article-body">
      {paragraphs.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
    </div>
  )
}
