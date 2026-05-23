'use client'

import { useState, useEffect } from 'react'
import type { AnnouncementBarConfig } from '@/lib/data/site-config-defaults'

const DISMISS_KEY = 'announcement_dismissed'

function isDismissed(): boolean {
  try {
    return sessionStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export default function AnnouncementBar({ config }: { config: AnnouncementBarConfig }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (config.enabled && !isDismissed()) {
      setVisible(true)
    }
  }, [config.enabled])

  if (!visible) return null

  function handleDismiss() {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1')
    } catch {
      // localStorage unavailable — just hide
    }
    setVisible(false)
  }

  // Two identical spans inside the animating track.
  // The keyframe moves translateX(0) → translateX(-50%), which scrolls exactly
  // one copy off-screen while the second copy fills the view — seamless loop.
  const label = `${config.text} · `

  return (
    <div
      className="relative flex h-10 w-full items-center overflow-hidden"
      style={{ backgroundColor: '#0a0a0a' }}
    >
      {/* Scrolling track — two identical copies for seamless loop */}
      <div
        className="animate-marquee flex shrink-0 whitespace-nowrap"
        aria-hidden="true"
      >
        <span
          className="pr-16 text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: '#c9a96e' }}
        >
          {label}
        </span>
        <span
          className="pr-16 text-[10px] font-semibold uppercase tracking-[0.2em]"
          style={{ color: '#c9a96e' }}
        >
          {label}
        </span>
      </div>

      {/* Accessible text (hidden from layout) */}
      <span className="sr-only">{config.text}</span>

      {/* Dismiss button */}
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Cerrar barra de anuncio"
        className="absolute right-0 top-0 flex h-full items-center px-3 transition-colors"
        style={{ color: '#8a8a8a' }}
        onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
        onMouseLeave={e => (e.currentTarget.style.color = '#8a8a8a')}
      >
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M1 1l8 8M9 1L1 9" />
        </svg>
      </button>

      {/* Right fade so text doesn't collide with the X button */}
      <div
        className="pointer-events-none absolute right-0 top-0 h-full w-16"
        style={{
          background: 'linear-gradient(to left, #0a0a0a 40%, transparent)',
        }}
      />
    </div>
  )
}
