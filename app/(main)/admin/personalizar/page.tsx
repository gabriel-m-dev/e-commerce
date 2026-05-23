import PersonalizarTabs, { type SectionItem } from './_components/PersonalizarTabs'

// ─── Icons ───────────────────────────────────────────────────────────────────

const AnnouncementIcon = (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="5" rx="1" />
    <path d="M6 6.5h12" />
    <path d="M2 13h20M2 17h14" />
  </svg>
)

const HeroIcon = (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="1.5" />
    <path d="M8 21h8M12 17v4" />
    <path d="M6 8h6M6 11h4" />
  </svg>
)

const CategoryIcon = (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="6" height="18" rx="1" />
    <rect x="9" y="3" width="6" height="18" rx="1" />
    <rect x="16" y="3" width="6" height="18" rx="1" />
  </svg>
)

const OrderIcon = (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M3 12h18M3 18h18" />
    <path d="M8 4l-2 2 2 2" />
    <path d="M16 14l2 2-2 2" />
  </svg>
)

const ProductFeatureIcon = (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="9" height="9" rx="1" />
    <rect x="13" y="2" width="9" height="9" rx="1" />
    <rect x="2" y="13" width="9" height="9" rx="1" />
    <path d="M13 17.5h9M17.5 13v9" />
  </svg>
)

const BenefitIcon = (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="1.5" />
    <path d="M2 9h20M7 14h4M7 17h2" />
  </svg>
)

const SelectionIcon = (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="9" height="11" rx="1" />
    <rect x="13" y="2" width="9" height="11" rx="1" />
    <rect x="2" y="15" width="9" height="7" rx="1" />
    <rect x="13" y="15" width="9" height="7" rx="1" />
  </svg>
)

const BrandHeroIcon = (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="1" />
    <path d="M8 12h8M14 9l3 3-3 3" />
  </svg>
)

const DoublePanelIcon = (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="9" height="18" rx="1" />
    <rect x="13" y="3" width="9" height="18" rx="1" />
    <path d="M7 12h0M17 12h0" strokeWidth="2" strokeLinecap="round" />
  </svg>
)

const SneakerIcon = (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 17c0 0 4-3 8-3s8 3 8 3" />
    <path d="M3 17l1-5h12l1 5" />
    <path d="M7 12V9a2 2 0 0 1 2-2h6" />
  </svg>
)

const StarIcon = (
  <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

// ─── Section lists ─────────────────────────────────────────────────────────

const HOMEPAGE_SECTIONS: SectionItem[] = [
  {
    href: '/admin/personalizar/announcement-bar',
    title: 'Barra de Anuncio',
    description: 'Texto que se desplaza en bucle sobre el nav. Activá o desactivá la barra y editá el mensaje.',
    icon: AnnouncementIcon,
  },
  {
    href: '/admin/personalizar/hero',
    title: 'Hero',
    description: 'Imágenes del slider, título, subtítulo y botón CTA por slide.',
    icon: HeroIcon,
  },
  {
    href: '/admin/personalizar/categorias',
    title: 'Cards de Categorías',
    description: 'Imagen de fondo, etiqueta, título y subtítulo de las 3 cards de categorías.',
    icon: CategoryIcon,
  },
  {
    href: '/admin/personalizar/destacados',
    title: 'Orden de Destacados',
    description: 'Arrastrá los productos para cambiar el orden en que aparecen en la grilla de destacados.',
    icon: OrderIcon,
  },
  {
    href: '/admin/personalizar/producto-destacado',
    title: 'Producto Destacado',
    description: 'Elegí qué producto se muestra en la sección de producto único.',
    icon: ProductFeatureIcon,
  },
  {
    href: '/admin/personalizar/cards-beneficios',
    title: 'Cards de Beneficios',
    description: 'Elegí si cada card muestra el diseño predeterminado o una imagen custom que la ocupa completa.',
    icon: BenefitIcon,
  },
  {
    href: '/admin/personalizar/nuestra-seleccion',
    title: 'Nuestra Selección',
    description: 'Elegí hasta 4 productos para destacar en la sección editorial de la homepage.',
    icon: SelectionIcon,
  },
]

const BRAND_SHARED_SECTIONS: SectionItem[] = [
  {
    href: '/admin/personalizar/brand-hero',
    title: 'Slider Hero de Marcas',
    description: 'Imágenes y texto del slider hero en las brand pages de Jordan, Nike y Adidas.',
    icon: BrandHeroIcon,
  },
  {
    href: '/admin/personalizar/brand-categorias',
    title: 'Hero de Marca',
    description: 'Doble panel hero editorial en las páginas de Jordan, Nike y Adidas. Dos imágenes side by side.',
    icon: DoublePanelIcon,
  },
  {
    href: '/admin/personalizar/mas-pedido',
    title: 'Mas Pedido',
    description: 'Elegí un producto por marca para destacar como el más pedido en la brand page de Jordan, Nike y Adidas.',
    icon: StarIcon,
  },
]

const BRAND_NIKE_SECTIONS: SectionItem[] = [
  {
    href: '/admin/personalizar/nuevos-ingresos-nike',
    title: 'Nuevos Ingresos Nike',
    description: 'Definí el orden de los nuevos ingresos Nike que aparecen en la brand page.',
    icon: OrderIcon,
  },
  {
    href: '/admin/personalizar/zapatillas-nike',
    title: 'Zapatillas Nike',
    description: 'Seleccioná las zapatillas Nike que aparecen en la sección ZAPATILLAS de la brand page.',
    icon: SneakerIcon,
  },
]

const BRAND_JORDAN_SECTIONS: SectionItem[] = [
  {
    href: '/admin/personalizar/nuevos-ingresos-jordan',
    title: 'Nuevos Ingresos Jordan',
    description: 'Definí el orden de los nuevos ingresos Jordan que aparecen en la brand page.',
    icon: OrderIcon,
  },
  {
    href: '/admin/personalizar/zapatillas-jordan',
    title: 'Zapatillas Jordan',
    description: 'Seleccioná las zapatillas Jordan que aparecen en la sección ZAPATILLAS de la brand page.',
    icon: SneakerIcon,
  },
]

const BRAND_ADIDAS_SECTIONS: SectionItem[] = [
  {
    href: '/admin/personalizar/nuevos-ingresos-adidas',
    title: 'Nuevos Ingresos Adidas',
    description: 'Definí el orden de los nuevos ingresos Adidas que aparecen en la brand page.',
    icon: OrderIcon,
  },
  {
    href: '/admin/personalizar/zapatillas-adidas',
    title: 'Zapatillas Adidas',
    description: 'Seleccioná las zapatillas Adidas que aparecen en la sección ZAPATILLAS de la brand page.',
    icon: SneakerIcon,
  },
]

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PersonalizarPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-[13px] font-black uppercase tracking-[0.22em]">Personalizar Web</h1>
        <p className="text-[11px] text-muted uppercase tracking-[0.15em]">Editá las secciones del sitio</p>
      </div>

      <PersonalizarTabs
        homepage={HOMEPAGE_SECTIONS}
        shared={BRAND_SHARED_SECTIONS}
        nike={BRAND_NIKE_SECTIONS}
        jordan={BRAND_JORDAN_SECTIONS}
        adidas={BRAND_ADIDAS_SECTIONS}
      />
    </div>
  )
}
