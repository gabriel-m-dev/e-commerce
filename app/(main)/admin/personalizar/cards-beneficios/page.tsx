import Link from 'next/link'
import { getBenefitCardsConfig } from '@/lib/queries/site-config'
import BenefitCardsConfigEditor from '@/components/admin/BenefitCardsConfigEditor'

export const dynamic = 'force-dynamic'

export default async function BenefitCardsConfigPage() {
  const config = await getBenefitCardsConfig()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link href="/admin/personalizar" className="text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors">
          Personalizar web
        </Link>
        <span className="text-muted/40">/</span>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Cards de Beneficios</h1>
      </div>
      <p className="text-[11px] text-muted -mt-4">
        Por cada card podés mantener el diseño predeterminado (ícono + texto) o subir una imagen custom que la reemplaza por completo.
      </p>
      <BenefitCardsConfigEditor initialConfig={config} />
    </div>
  )
}
