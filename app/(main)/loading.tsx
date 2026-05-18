export default function HomeLoading() {
  return (
    <>
      {/* Hero skeleton */}
      <div className="relative overflow-hidden bg-[#0a0a0a]" style={{ minHeight: '85vh' }}>
        <div className="absolute inset-0 bg-[#111] animate-pulse" aria-hidden />
      </div>

      {/* Featured products skeleton */}
      <section className="bg-[#f5f5f7]">
        <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px w-6 bg-gold" aria-hidden />
            <div className="h-2.5 w-20 animate-pulse rounded bg-[#e0e0e0]" />
          </div>
          <div className="h-7 w-48 animate-pulse rounded bg-[#e0e0e0] mt-3 mb-10" />

          {/* Grid — mobile: stack, md: hero + 2 secundarias */}
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="w-full md:w-3/5 aspect-[4/5] md:aspect-auto animate-pulse bg-[#e0e0e0]" />
            <div className="flex-1 flex flex-col gap-4">
              <div className="aspect-[5/4] animate-pulse bg-[#e0e0e0]" />
              <div className="aspect-[5/4] animate-pulse bg-[#e0e0e0]" />
            </div>
          </div>
        </div>
      </section>

      {/* Brand callout skeleton */}
      <div className="bg-foreground py-20" aria-hidden />

      {/* Products grid skeleton */}
      <section className="bg-[#f5f5f7]">
        <div className="mx-auto max-w-screen-xl px-6 py-20 lg:px-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px w-8 bg-gold" aria-hidden />
            <div className="h-3 w-28 animate-pulse rounded bg-[#e0e0e0]" />
          </div>
          <div className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
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
    </>
  )
}
