export default function AccountLoading() {
  return (
    <div className="pt-24 pb-20 px-6 max-w-2xl mx-auto">
      <div className="h-3 w-16 animate-pulse rounded bg-surface" />
      <hr className="border-border my-8" />

      <div className="space-y-4">
        <div className="h-3 w-12 animate-pulse rounded bg-surface" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 w-16 animate-pulse rounded bg-surface" />
            <div className="h-4 w-40 animate-pulse rounded bg-surface" />
          </div>
        ))}
      </div>

      <hr className="border-border my-8" />

      <div className="space-y-6">
        <div className="h-3 w-24 animate-pulse rounded bg-surface" />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-2 border-t border-gold pt-4">
            <div className="h-3 w-48 animate-pulse rounded bg-surface" />
            <div className="h-3 w-full animate-pulse rounded bg-surface" />
            <div className="h-3 w-24 animate-pulse rounded bg-surface" />
          </div>
        ))}
      </div>
    </div>
  )
}
