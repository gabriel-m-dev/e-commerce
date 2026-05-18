import { prisma } from '@/lib/prisma'
import { type HeroSlide, type CategoryCard, DEFAULT_HERO_SLIDES, DEFAULT_CATEGORY_CARDS } from '@/lib/data/site-config-defaults'

export type { HeroSlide, CategoryCard }
export { DEFAULT_HERO_SLIDES, DEFAULT_CATEGORY_CARDS }

export type SiteConfigKey = 'hero' | 'productFeature' | 'categoryCards'

export type SiteConfigValues = {
  hero: { slides: HeroSlide[] }
  productFeature: { productId: string }
  categoryCards: { cards: CategoryCard[] }
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
