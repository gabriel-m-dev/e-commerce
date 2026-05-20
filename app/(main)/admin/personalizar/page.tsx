import Link from 'next/link'

const SECTIONS = [
  {
    href: '/admin/personalizar/hero',
    title: 'Hero',
    description: 'Imágenes del slider, título, subtítulo y botón CTA por slide.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="1.5" />
        <path d="M8 21h8M12 17v4" />
        <path d="M6 8h6M6 11h4" />
      </svg>
    ),
  },
  {
    href: '/admin/personalizar/producto-destacado',
    title: 'Producto Destacado',
    description: 'Elegí qué producto se muestra en la sección de producto único.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="9" height="9" rx="1" />
        <rect x="13" y="2" width="9" height="9" rx="1" />
        <rect x="2" y="13" width="9" height="9" rx="1" />
        <path d="M13 17.5h9M17.5 13v9" />
      </svg>
    ),
  },
  {
    href: '/admin/personalizar/categorias',
    title: 'Cards de Categorías',
    description: 'Imagen de fondo, etiqueta, título y subtítulo de las 3 cards finales.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="6" height="18" rx="1" />
        <rect x="9" y="3" width="6" height="18" rx="1" />
        <rect x="16" y="3" width="6" height="18" rx="1" />
      </svg>
    ),
  },
  {
    href: '/admin/personalizar/destacados',
    title: 'Orden de Destacados',
    description: 'Arrastrá los productos para cambiar el orden en que aparecen.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
        <path d="M8 4l-2 2 2 2" />
        <path d="M16 14l2 2-2 2" />
      </svg>
    ),
  },
  {
    href: '/admin/personalizar/brand-categorias',
    title: 'Hero de Marca',
    description: 'Doble panel hero editorial en las páginas de Jordan, Nike y Adidas. Dos imágenes side by side.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="9" height="18" rx="1" />
        <rect x="13" y="3" width="9" height="18" rx="1" />
        <path d="M7 12h0M17 12h0" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: '/admin/personalizar/nuestra-seleccion',
    title: 'Nuestra Selección',
    description: 'Elegí hasta 4 productos para destacar en la sección editorial de la homepage.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="9" height="11" rx="1" />
        <rect x="13" y="2" width="9" height="11" rx="1" />
        <rect x="2" y="15" width="9" height="7" rx="1" />
        <rect x="13" y="15" width="9" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: '/admin/personalizar/cards-beneficios',
    title: 'Cards de Beneficios',
    description: 'Elegí si cada card muestra el diseño predeterminado o una imagen custom que la ocupa completa.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="1.5" />
        <path d="M2 9h20M7 14h4M7 17h2" />
      </svg>
    ),
  },
  {
    href: '/admin/personalizar/zapatillas-nike',
    title: 'Zapatillas Nike',
    description: 'Seleccioná las zapatillas Nike que aparecen en la sección ZAPATILLAS de la brand page.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 17c0 0 4-3 8-3s8 3 8 3" />
        <path d="M3 17l1-5h12l1 5" />
        <path d="M7 12V9a2 2 0 0 1 2-2h6" />
      </svg>
    ),
  },
  {
    href: '/admin/personalizar/zapatillas-jordan',
    title: 'Zapatillas Jordan',
    description: 'Seleccioná las zapatillas Jordan que aparecen en la sección ZAPATILLAS de la brand page.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 17c0 0 4-3 8-3s8 3 8 3" />
        <path d="M3 17l1-5h12l1 5" />
        <path d="M7 12V9a2 2 0 0 1 2-2h6" />
      </svg>
    ),
  },
  {
    href: '/admin/personalizar/zapatillas-adidas',
    title: 'Zapatillas Adidas',
    description: 'Seleccioná las zapatillas Adidas que aparecen en la sección ZAPATILLAS de la brand page.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 17c0 0 4-3 8-3s8 3 8 3" />
        <path d="M3 17l1-5h12l1 5" />
        <path d="M7 12V9a2 2 0 0 1 2-2h6" />
      </svg>
    ),
  },
  {
    href: '/admin/personalizar/nuevos-ingresos-nike',
    title: 'Nuevos Ingresos Nike',
    description: 'Definí el orden de los nuevos ingresos Nike que aparecen en la brand page.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
        <path d="M8 4l-2 2 2 2" />
        <path d="M16 14l2 2-2 2" />
      </svg>
    ),
  },
  {
    href: '/admin/personalizar/nuevos-ingresos-jordan',
    title: 'Nuevos Ingresos Jordan',
    description: 'Definí el orden de los nuevos ingresos Jordan que aparecen en la brand page.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
        <path d="M8 4l-2 2 2 2" />
        <path d="M16 14l2 2-2 2" />
      </svg>
    ),
  },
  {
    href: '/admin/personalizar/nuevos-ingresos-adidas',
    title: 'Nuevos Ingresos Adidas',
    description: 'Definí el orden de los nuevos ingresos Adidas que aparecen en la brand page.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18M3 12h18M3 18h18" />
        <path d="M8 4l-2 2 2 2" />
        <path d="M16 14l2 2-2 2" />
      </svg>
    ),
  },
]

export default function PersonalizarPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Personalizar Web</h1>
        <p className="text-[11px] text-muted uppercase tracking-[0.15em]">Editá las secciones de la homepage</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex flex-col gap-4 border border-border bg-surface p-6 transition-colors hover:border-foreground"
          >
            <div className="text-muted transition-colors group-hover:text-foreground">
              {section.icon}
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-foreground">
                {section.title}
              </p>
              <p className="mt-1.5 text-[10px] leading-relaxed text-muted">
                {section.description}
              </p>
            </div>
            <div className="h-px w-6 bg-gold transition-all duration-300 group-hover:w-10" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  )
}
