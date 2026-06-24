import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants'
import './globals.css'

const drexs = localFont({
  src: './fonts/Drexs.otf',
  variable: '--font-drexs',
  display: 'swap',
})

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — Moda Premium Argentina`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  keywords: ['ropa premium', 'zapatillas', 'moda argentina', 'streetwear', 'eMe'],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'es_AR',
    url: SITE_URL,
    title: `${SITE_NAME} — Moda Premium Argentina`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Moda Premium Argentina`,
    description: SITE_DESCRIPTION,
  },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${drexs.variable}`}
    >
      <body className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'eMe',
              url: SITE_URL,
              description: 'Tienda de moda premium argentina. Zapatillas, ropa y accesorios.',
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer service',
                availableLanguage: 'Spanish',
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              url: SITE_URL,
              name: SITE_NAME,
              potentialAction: {
                '@type': 'SearchAction',
                target: `${SITE_URL}/products?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0a0a0a',
              color: '#ffffff',
              border: '1px solid #e5e5e5',
              borderRadius: 0,
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
            },
          }}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
