import { prisma } from '@/lib/prisma'
import { type HeroSlide, type CategoryCard, type BrandCategorySplitConfig, type NuestraSeleccionConfig, type BrandSneakersConfig, type BenefitCardsConfig, type NewArrivalsConfig, DEFAULT_HERO_SLIDES, DEFAULT_CATEGORY_CARDS, DEFAULT_BRAND_CATEGORY_SPLIT, DEFAULT_BENEFIT_CARDS, DEFAULT_NEW_ARRIVALS } from '@/lib/data/site-config-defaults'

export type { HeroSlide, CategoryCard, BrandCategorySplitConfig, NuestraSeleccionConfig, BrandSneakersConfig, BenefitCardsConfig, NewArrivalsConfig }
export { DEFAULT_HERO_SLIDES, DEFAULT_CATEGORY_CARDS, DEFAULT_BRAND_CATEGORY_SPLIT, DEFAULT_BENEFIT_CARDS, DEFAULT_NEW_ARRIVALS }

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
