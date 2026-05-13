export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      {/* ─── Page header ─── */}
      <div>
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em] text-foreground">
          Órdenes
        </h1>
        <p className="mt-1 text-[11px] text-muted">
          Historial de pedidos de la tienda
        </p>
      </div>

      {/* ─── Orders table ─── */}
      <div className="border border-border bg-background">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  N° Orden
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Estado
                </th>
                <th className="hidden sm:table-cell px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-[10px] uppercase tracking-[0.18em] text-muted">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6}>
                  {/* ─── Empty state ─── */}
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center border border-border">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-muted"
                        aria-hidden
                      >
                        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
                        <rect x="9" y="3" width="6" height="4" rx="1" />
                        <line x1="9" y1="12" x2="15" y2="12" />
                        <line x1="9" y1="16" x2="13" y2="16" />
                      </svg>
                    </div>
                    <p className="text-[12px] font-black uppercase tracking-[0.18em] text-foreground">
                      Sin órdenes aún
                    </p>
                    <p className="mt-2 max-w-xs text-[11px] leading-relaxed text-muted">
                      Los pedidos de tus clientes aparecerán aquí para que puedas
                      gestionarlos fácilmente.
                    </p>
                    <p className="mt-6 border border-border px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-muted">
                      Las órdenes aparecerán aquí una vez integrado Mercado Pago
                    </p>
                  </div>
                </td>
              </tr>
          </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
