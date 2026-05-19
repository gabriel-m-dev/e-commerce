import { prisma } from '@/lib/prisma'
import { type HeroSlide, type CategoryCard, type BrandCategorySplitConfig, type NuestraSeleccionConfig, DEFAULT_HERO_SLIDES, DEFAULT_CATEGORY_CARDS, DEFAULT_BRAND_CATEGORY_SPLIT } from '@/lib/data/site-config-defaults'

export type { HeroSlide, CategoryCard, BrandCategorySplitConfig, NuestraSeleccionConfig }
export { DEFAULT_HERO_SLIDES, DEFAULT_CATEGORY_CARDS, DEFAULT_BRAND_CATEGORY_SPLIT }

export type SiteConfigKey =
  | 'hero'
  | 'productFeature'
  | 'categoryCards'
  | 'jordanCategorySplit'
  | 'nikeCategorySplit'
  | 'adidasCategorySplit'
  | 'nuestraSeleccion'

export type SiteConfigValues = {
  hero: { slides: HeroSlide[] }
  productFeature: { productId: string }
  categoryCards: { cards: CategoryCard[] }
  jordanCategorySplit: BrandCategorySplitConfig
  nikeCategorySplit: BrandCategorySplitConfig
  adidasCategorySplit: BrandCategorySplitConfig
  nuestraSeleccion: NuestraSeleccionConfig
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
