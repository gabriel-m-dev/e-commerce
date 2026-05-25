'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type OrdersPaginationProps = {
  prevCursor: string | null
  nextCursor: string | null
}

export default function OrdersPagination({ nextCursor }: OrdersPaginationProps) {
  const searchParams = useSearchParams()

  if (!nextCursor) return null

  // Build next URL — preserve ?q= and ?status=, update ?cursor=
  const nextParams = new URLSearchParams(searchParams.toString())
  nextParams.set('cursor', nextCursor)

  return (
    <div className="flex items-center justify-end gap-4 border-t border-border px-6 py-3">
      <Link
        href={`?${nextParams.toString()}`}
        className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors border border-border px-4 py-2 hover:border-foreground"
      >
        Siguiente
      </Link>
    </div>
  )
}
