export default function ProductDetailLoading() {
  return (
    <main>
      {/* Breadcrumb skeleton */}
      <div className="border-b border-border bg-[#f5f5f7]">
        <div className="mx-auto flex max-w-screen-xl items-center gap-2 px-6 py-3 lg:px-10">
          <div className="h-3 w-12 animate-pulse rounded bg-[#e0e0e0]" />
          <span className="text-[10px] text-border">/</span>
          <div className="h-3 w-20 animate-pulse rounded bg-[#e0e0e0]" />
          <span className="text-[10px] text-border">/</span>
          <div className="h-3 w-28 animate-pulse rounded bg-[#e0e0e0]" />
        </div>
      </div>

      {/* Product detail skeleton */}
      <section className="bg-[#f5f5f7]">
        <div className="mx-auto max-w-screen-xl px-6 py-12 lg:px-10 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">

            {/* Gallery */}
            <div className="space-y-3">
              <div className="aspect-square w-full animate-pulse bg-[#e0e0e0]" />
              <div className="grid grid-cols-4 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-square animate-pulse bg-[#e0e0e0]" />
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <div className="h-3 w-24 animate-pulse rounded bg-[#e0e0e0]" />
                <div className="h-8 w-3/4 animate-pulse rounded bg-[#e0e0e0]" />
                <div className="h-6 w-32 animate-pulse rounded bg-[#e0e0e0]" />
              </div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-3 w-full animate-pulse rounded bg-[#e0e0e0]" />
                ))}
              </div>
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-9 w-14 animate-pulse bg-[#e0e0e0]" />
                ))}
              </div>
              <div className="h-12 w-full animate-pulse bg-[#e0e0e0]" />
            </div>

          </div>
        </div>
      </section>
    </main>
  )
}
