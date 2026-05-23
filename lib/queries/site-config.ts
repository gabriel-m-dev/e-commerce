import { prisma } from '@/lib/prisma'
import { type HeroSlide, type CategoryCard, type BrandCategorySplitConfig, type NuestraSeleccionConfig, type BrandSneakersConfig, type BenefitCardsConfig, type NewArrivalsConfig, type AnnouncementBarConfig, type MasPedidoConfig, DEFAULT_HERO_SLIDES, DEFAULT_CATEGORY_CARDS, DEFAULT_BRAND_CATEGORY_SPLIT, DEFAULT_BENEFIT_CARDS, DEFAULT_NEW_ARRIVALS, DEFAULT_ANNOUNCEMENT_BAR, DEFAULT_MAS_PEDIDO } from '@/lib/data/site-config-defaults'
import { getProductById } from '@/lib/queries/products'

export type { HeroSlide, CategoryCard, BrandCategorySplitConfig, NuestraSeleccionConfig, BrandSneakersConfig, BenefitCardsConfig, NewArrivalsConfig, AnnouncementBarConfig, MasPedidoConfig }
export { DEFAULT_HERO_SLIDES, DEFAULT_CATEGORY_CARDS, DEFAULT_BRAND_CATEGORY_SPLIT, DEFAULT_BENEFIT_CARDS, DEFAULT_NEW_ARRIVALS, DEFAULT_ANNOUNCEMENT_BAR, DEFAULT_MAS_PEDIDO }

export type SiteConfigKey =
  | 'hero'
  | 'productFeature'
  | 'categoryCards'
  | 'jordanCategorySplit'
  | 'nikeCategorySplit'
  | 'adidasCategorySplit'
  | 'nuestraSeleccion'
  | 'brandSneakersNike'
  | 'brandSneakersJordan'
  | 'brandSneakersAdidas'
  | 'benefitCards'
  | 'newArrivalsNike'
  | 'newArrivalsJordan'
  | 'newArrivalsAdidas'
  | 'announcementBar'
  | 'jordanMasPedido'
  | 'nikeMasPedido'
  | 'adidasMasPedido'

export type SiteConfigValues = {
  hero: { slides: HeroSlide[] }
  productFeature: { productId: string }
  categoryCards: { cards: CategoryCard[] }
  jordanCategorySplit: BrandCategorySplitConfig
  nikeCategorySplit: BrandCategorySplitConfig
  adidasCategorySplit: BrandCategorySplitConfig
  nuestraSeleccion: NuestraSeleccionConfig
  brandSneakersNike: BrandSneakersConfig
  brandSneakersJordan: BrandSneakersConfig
  brandSneakersAdidas: BrandSneakersConfig
  benefitCards: BenefitCardsConfig
  newArrivalsNike: NewArrivalsConfig
  newArrivalsJordan: NewArrivalsConfig
  newArrivalsAdidas: NewArrivalsConfig
  announcementBar: AnnouncementBarConfig
  jordanMasPedido: MasPedidoConfig
  nikeMasPedido: MasPedidoConfig
  adidasMasPedido: MasPedidoConfig
}

export async function getSiteConfig<K extends SiteConfigKey>(key: K): Promise<SiteConfigValues[K] | null> {
  try {
    const config = await prisma.siteConfig.findUnique({ where: { key } })
    if (!config) return null
    return config.value as SiteConfigValues[K]
  } catch {
    return null
  }
}

export async function getAllSiteConfigs(): Promise<Partial<SiteConfigValues>> {
  try {
    const configs = await prisma.siteConfig.findMany()
    return Object.fromEntries(configs.map((c) => [c.key, c.value])) as Partial<SiteConfigValues>
  } catch {
    return {}
  }
}

export async function upsertSiteConfig<K extends SiteConfigKey>(key: K, value: SiteConfigValues[K]) {
  return prisma.siteConfig.upsert({
    where: { key },
    update: { value: value as object },
    create: { key, value: value as object },
  })
}

export async function getAnnouncementBarConfig(): Promise<AnnouncementBarConfig> {
  try {
    const config = await prisma.siteConfig.findUnique({ where: { key: 'announcementBar' } })
    if (!config) return DEFAULT_ANNOUNCEMENT_BAR
    const parsed = config.value as Partial<AnnouncementBarConfig>
    return {
      text: typeof parsed.text === 'string' ? parsed.text : DEFAULT_ANNOUNCEMENT_BAR.text,
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : DEFAULT_ANNOUNCEMENT_BAR.enabled,
    }
  } catch {
    return DEFAULT_ANNOUNCEMENT_BAR
  }
}

export async function getBenefitCardsConfig(): Promise<BenefitCardsConfig> {
  try {
    const config = await prisma.siteConfig.findUnique({ where: { key: 'benefitCards' } })
    if (!config) return DEFAULT_BENEFIT_CARDS
    const parsed = config.value as Partial<BenefitCardsConfig>
    return {
      payment:  { imageUrl: parsed.payment?.imageUrl  ?? null },
      shipping: { imageUrl: parsed.shipping?.imageUrl ?? null },
      security: { imageUrl: parsed.security?.imageUrl ?? null },
    }
  } catch {
    return DEFAULT_BENEFIT_CARDS
  }
}

export async function getMasPedidoProduct(brand: 'JORDAN' | 'NIKE' | 'ADIDAS') {
  try {
    const configKey = brand === 'JORDAN'
      ? 'jordanMasPedido' as const
      : brand === 'NIKE'
        ? 'nikeMasPedido' as const
        : 'adidasMasPedido' as const
    const config = await prisma.siteConfig.findUnique({ where: { key: configKey } })
    if (!config) return null
    const parsed = config.value as Partial<MasPedidoConfig>
    const productId = parsed.productId
    if (!productId) return null
    return getProductById(productId)
  } catch {
    return null
  }
}
