export type HeroSlide = {
  image: string
  label: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
}

export type CategoryCard = {
  image: string
  label: string
  title: string
  subtitle: string
  link: string
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  { image: '/hero/1.webp', label: 'Nueva Colección', title: 'Diseño que se siente.', subtitle: 'Calidad que se nota.', ctaText: 'Comprar ahora', ctaLink: '/products' },
  { image: '/hero/2.webp', label: 'Nueva Colección', title: 'Diseño que se siente.', subtitle: 'Calidad que se nota.', ctaText: 'Comprar ahora', ctaLink: '/products' },
  { image: '/hero/3.webp', label: 'Nueva Colección', title: 'Diseño que se siente.', subtitle: 'Calidad que se nota.', ctaText: 'Comprar ahora', ctaLink: '/products' },
  { image: '/hero/4.webp', label: 'Nueva Colección', title: 'Diseño que se siente.', subtitle: 'Calidad que se nota.', ctaText: 'Comprar ahora', ctaLink: '/products' },
]

export type BrandHeroPanel = {
  image: string
  overlay?: boolean
  text?: string
  textBorder?: 'full' | 'bottom' | 'none'
  textPosition?: 'center' | 'bottom-center' | 'bottom-left'
  fontSize?: 'small' | 'medium' | 'large'
}

export type BrandCategorySplitConfig = {
  ropa: BrandHeroPanel
  zapatillas: BrandHeroPanel
}

export const DEFAULT_BRAND_CATEGORY_SPLIT: BrandCategorySplitConfig = {
  ropa: { image: '', overlay: false, text: '', textBorder: 'none', textPosition: 'center' },
  zapatillas: { image: '', overlay: false, text: '', textBorder: 'none', textPosition: 'center' },
}

export type NuestraSeleccionConfig = {
  productIds: string[]
}

export const DEFAULT_NUESTRA_SELECCION: NuestraSeleccionConfig = {
  productIds: [],
}

export type BrandSneakersConfig = {
  productIds: string[]
}

export const DEFAULT_BRAND_SNEAKERS: BrandSneakersConfig = {
  productIds: [],
}

export type NewArrivalsConfig = {
  productIds: string[]
}

export const DEFAULT_NEW_ARRIVALS: NewArrivalsConfig = {
  productIds: [],
}

export type BenefitCardConfig = {
  imageUrl?: string | null
}

export type BenefitCardsConfig = {
  payment: BenefitCardConfig
  shipping: BenefitCardConfig
  security: BenefitCardConfig
}

export const DEFAULT_BENEFIT_CARDS: BenefitCardsConfig = {
  payment:  { imageUrl: null },
  shipping: { imageUrl: null },
  security: { imageUrl: null },
}

export type AnnouncementBarConfig = {
  text: string
  enabled: boolean
}

export const DEFAULT_ANNOUNCEMENT_BAR: AnnouncementBarConfig = {
  text: 'ENVÍOS A TODO EL PAÍS · PAGÁ EN CUOTAS · NUEVOS INGRESOS DISPONIBLES',
  enabled: false,
}

export type MasPedidoConfig = {
  productId: string
}

export const DEFAULT_MAS_PEDIDO: MasPedidoConfig = {
  productId: '',
}

export type BrandHeroSlide = {
  image: string
  text: string
}

export type BrandHeroConfig = {
  slides: BrandHeroSlide[]
}

export const DEFAULT_JORDAN_HERO: BrandHeroConfig = {
  slides: [
    { image: '/brands/jordan/hero-1.webp', text: 'Listo para volar' },
    { image: '/brands/jordan/hero-2.webp', text: 'Elevá tu juego' },
  ],
}

export const DEFAULT_NIKE_HERO: BrandHeroConfig = {
  slides: [
    { image: '/brands/nike/hero_nike_1.jpg', text: 'Just Do It' },
    { image: '/brands/nike/hero_nike_2.jpg', text: 'Built to Move' },
  ],
}

export const DEFAULT_ADIDAS_HERO: BrandHeroConfig = {
  slides: [
    { image: '', text: '' },
  ],
}

export const DEFAULT_CATEGORY_CARDS: CategoryCard[] = [
  {
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=85',
    label: 'Nueva colección',
    title: 'Zapatillas',
    subtitle: '5 modelos',
    link: '/products?category=Zapatillas',
  },
  {
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=900&auto=format&fit=crop&q=85',
    label: 'Temporada actual',
    title: 'Ropa',
    subtitle: 'Buzos · Remeras · Pantalones',
    link: '/products?category=Buzos,Pantalones,Remeras',
  },
  {
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=900&auto=format&fit=crop&q=85',
    label: 'Esenciales',
    title: 'Accesorios',
    subtitle: 'Gorras · Mochilas',
    link: '/products?category=Gorras,Mochilas',
  },
]
