'use client'

import { usePathname } from 'next/navigation'

export default function PageTransition({ children, id }: { children: React.ReactNode; id?: string }) {
  const pathname = usePathname()
  return (
    <main id={id} key={pathname} className="flex-1 animate-page-in">
      {children}
    </main>
  )
}
