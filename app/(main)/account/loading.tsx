export default function AccountLoading() {
  return (
    <div className="pt-24 pb-24 px-6 max-w-2xl mx-auto">
      {/* Page label */}
      <div className="h-2.5 w-20 animate-pulse bg-surface mb-8" />

      {/* Profile header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:gap-8 pb-8 border-b border-border">
        <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-full animate-pulse bg-surface" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-36 animate-pulse bg-surface" />
          <div className="h-3 w-52 animate-pulse bg-surface" />
        </div>
      </div>

      {/* Orders section */}
      <div className="mt-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-6 h-px bg-surface" />
          <div className="h-2.5 w-24 animate-pulse bg-surface" />
        </div>

        <div className="divide-y divide-border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="py-6 flex gap-4">
              <div className="w-16 h-16 md:w-20 md:h-20 shrink-0 animate-pulse bg-surface" />
              <div className="flex flex-col gap-2 flex-1">
                <div className="h-3 w-32 animate-pulse bg-surface" />
                <div className="h-3 w-full animate-pulse bg-surface" />
                <div className="h-3 w-24 animate-pulse bg-surface" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-10 pt-8 border-t border-border">
        <div className="h-3 w-24 animate-pulse bg-surface" />
      </div>
    </div>
  )
}
