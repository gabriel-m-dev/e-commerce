'use client'

export default function BrandHeroVideo({
  src,
  overlayOpacity = 0.55,
  children,
}: {
  src: string
  overlayOpacity?: number
  children?: React.ReactNode
}) {
  return (
    <div
      className="relative mt-6 overflow-hidden"
      style={{
        marginLeft: 'calc(50% - 50vw)',
        marginRight: 'calc(50% - 50vw)',
        height: 'clamp(280px, 45vh, 520px)',
      }}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 h-full w-full object-cover object-center"
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Overlay oscuro */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity})` }}
        aria-hidden
      />

      {/* Slot de texto opcional */}
      {children && (
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          {children}
        </div>
      )}
    </div>
  )
}
