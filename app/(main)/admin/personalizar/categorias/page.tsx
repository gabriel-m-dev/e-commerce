import Link from 'next/link'
import { getSiteConfig, DEFAULT_CATEGORY_CARDS } from '@/lib/queries/site-config'
import CategoryCardsConfigEditor from '@/components/admin/CategoryCardsConfigEditor'

export const dynamic = 'force-dynamic'

export default async function CategoriasConfigPage() {
  const config = await getSiteConfig('categoryCards')
  const cards = config?.cards ?? DEFAULT_CATEGORY_CARDS

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/personalizar" className="text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors">
          Personalizar web
        </Link>
        <span className="text-muted/40">/</span>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Cards de Categorías</h1>
      </div>
      <p className="text-[11px] text-muted -mt-4">
        Las 3 cards que aparecen al final de la homepage. Podés cambiar imagen, texto y el link de cada una.
      </p>
      <CategoryCardsConfigEditor initialCards={cards} />
    </div>
  )
}
