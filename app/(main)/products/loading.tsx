export default function ProductsLoading() {
  return (
    <main>
      <section className="bg-background">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">
          {/* Section label skeleton */}
          <div className="mb-10 flex items-center gap-4">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <div className="h-3 w-32 animate-pulse rounded bg-surface" />
          </div>

          {/* Tabs skeleton */}
          <div className="mb-8 flex gap-3 overflow-x-auto">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 w-20 shrink-0 animate-pulse rounded bg-surface" />
            ))}
          </div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-square w-full animate-pulse bg-surface" />
                <div className="mt-3.5 space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-surface" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-surface" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
