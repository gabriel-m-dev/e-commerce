export default function ProductsLoading() {
  return (
    <main>
      <section className="bg-[#f5f5f7]">
        <div className="mx-auto max-w-screen-xl px-6 py-16 lg:px-10">

          {/* Brand editorial header skeleton */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[53px] w-[53px] animate-pulse rounded-sm bg-[#e0e0e0]" />
              <div className="h-7 w-36 animate-pulse bg-[#e0e0e0]" />
            </div>
            <div className="flex items-center gap-3 mt-4">
              <div className="h-px w-8 bg-gold" aria-hidden />
              <div className="h-9 w-56 animate-pulse bg-[#e0e0e0]" />
            </div>
          </div>

          {/* Nav tabs skeleton */}
          <div className="flex gap-3 pb-2 mb-6">
            {[50, 90, 70, 80].map((w, i) => (
              <div
                key={i}
                className="h-3 animate-pulse rounded bg-[#e0e0e0] shrink-0"
                style={{ width: w }}
              />
            ))}
          </div>

          {/* Search bar skeleton */}
          <div className="mt-24 h-10 w-full animate-pulse bg-[#e0e0e0] rounded-md mb-6" />

          {/* Grid */}
          <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}>
                <div className="aspect-square w-full animate-pulse bg-[#e0e0e0]" />
                <div className="mt-3.5 space-y-2">
                  <div className="h-2.5 w-2/3 animate-pulse rounded bg-[#e0e0e0]" />
                  <div className="h-3.5 w-1/2 animate-pulse rounded bg-[#e0e0e0]" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>
    </main>
  )
}
