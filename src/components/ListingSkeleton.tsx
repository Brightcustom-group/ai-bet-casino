export function ListingSkeleton() {
  return (
    <div className="container" aria-busy="true">
      <p className="visually-hidden" role="status">Loading content…</p>
      <div className="page-intro">
        <div className="skeleton" style={{ minHeight: 48, maxWidth: 420 }} />
      </div>
      <div className="card-grid">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton" />
        ))}
      </div>
    </div>
  )
}
