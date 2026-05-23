import Link from 'next/link'
import { getAnnouncementBarConfig } from '@/lib/queries/site-config'
import AnnouncementBarEditor from '@/components/admin/AnnouncementBarEditor'

export const dynamic = 'force-dynamic'

export default async function AnnouncementBarPage() {
  const config = await getAnnouncementBarConfig()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/personalizar"
          className="text-[10px] uppercase tracking-[0.18em] text-muted hover:text-foreground transition-colors"
        >
          Personalizar web
        </Link>
        <span className="text-muted/40">/</span>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Barra de Anuncio</h1>
      </div>
      <p className="text-[11px] text-muted -mt-4">
        Texto que se desplaza en bucle sobre la barra de navegación. Se puede activar o desactivar en cualquier momento.
      </p>
      <AnnouncementBarEditor initialConfig={config} />
    </div>
  )
}
