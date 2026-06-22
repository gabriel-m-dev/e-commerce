export const dynamic = 'force-dynamic'

import { getAllShippingMethods } from '@/lib/queries/shipping-methods'
import ShippingMethodsManager from '@/components/admin/ShippingMethodsManager'

export default async function AdminShippingPage() {
  const methods = await getAllShippingMethods()

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em] text-foreground">
          Métodos de envío
        </h1>
        <p className="mt-1 text-[11px] text-muted uppercase tracking-[0.12em]">
          Gestioná los costos y métodos de envío disponibles en el checkout.
        </p>
      </div>
      <ShippingMethodsManager methods={methods} />
    </div>
  )
}
