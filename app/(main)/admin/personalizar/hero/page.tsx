import Link from 'next/link'
import { getSiteConfig, DEFAULT_HERO_SLIDES } from '@/lib/queries/site-config'
import HeroConfigEditor from '@/components/admin/HeroConfigEditor'

export const dynamic = 'force-dynamic'

export default async function HeroConfigPage() {
  const config = await getSiteConfig('hero')
  const slides = config?.slides ?? DEFAULT_HERO_SLIDES

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/personalizar" className="text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors">
          Personalizar web
        </Link>
        <span className="text-muted/40">/</span>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Hero</h1>
      </div>
      <p className="text-[11px] text-muted -mt-4">
        Cada slide tiene su propia imagen, texto y botón. Los cambios se aplican en la homepage inmediatamente.
      </p>
      <HeroConfigEditor initialSlides={slides} />
    </div>
  )
}
