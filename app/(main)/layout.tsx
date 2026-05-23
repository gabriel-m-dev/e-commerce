import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/cart/CartDrawer'
import PageTransition from '@/components/layout/PageTransition'
import AnnouncementBar from '@/components/AnnouncementBar'
import { getAnnouncementBarConfig } from '@/lib/queries/site-config'

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const announcementConfig = await getAnnouncementBarConfig()

  return (
    <>
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[999] -translate-y-20 bg-foreground px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition-transform focus:translate-y-0"
      >
        Ir al contenido
      </a>
      <div className="[overflow-x:clip]">
        <AnnouncementBar config={announcementConfig} />
        <Navbar />
        <PageTransition id="main-content">{children}</PageTransition>
        <Footer />
      </div>
      <CartDrawer />
    </>
  )
}
