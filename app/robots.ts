import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/constants'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout', '/cart', '/login', '/register', '/forgot-password', '/reset-password', '/account'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
