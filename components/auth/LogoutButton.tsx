'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface LogoutButtonProps {
  className?: string
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      className={className ?? "text-[10px] uppercase tracking-[0.2em] text-muted hover:text-foreground transition-colors"}
    >
      Cerrar sesión
    </button>
  )
}
