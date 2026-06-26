'use client'

import { Info } from 'lucide-react'
import { TIMELINE_STEPS, STATUS_STEP, STATUS_ALERT } from '@/lib/order-status'
import type { OrderStatus } from '@/lib/queries/orders'

interface OrderTimelineProps {
  currentStatus: OrderStatus
  updatedAt: Date | string
}

export function OrderTimeline({ currentStatus, updatedAt }: OrderTimelineProps) {
  const activeStep = STATUS_STEP[currentStatus]
  const isCancelled = currentStatus === 'CANCELLED'
  const alertText = STATUS_ALERT[currentStatus]

  const formattedDate = new Intl.DateTimeFormat('es-AR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(updatedAt))

  return (
    <div className="space-y-6">
      {/* Desktop: horizontal | Mobile: vertical */}
      <div className="hidden md:flex items-start justify-between relative">
        {/* connecting line */}
        <div className="absolute top-5 left-0 right-0 h-px bg-[#e5e5e5] z-0" />
        <div
          className="absolute top-5 left-0 h-px bg-[#c9a96e] z-0 transition-all duration-500"
          style={{
            width: isCancelled
              ? '0%'
              : `${(activeStep / (TIMELINE_STEPS.length - 1)) * 100}%`,
          }}
        />
        {TIMELINE_STEPS.map((step, index) => {
          const completed = !isCancelled && index <= activeStep
          const Icon = step.icon
          return (
            <div key={index} className="flex flex-col items-center z-10 flex-1">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300"
                style={{
                  backgroundColor: completed ? '#c9a96e' : '#ffffff',
                  borderColor: completed ? '#c9a96e' : '#e5e5e5',
                }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: completed ? '#ffffff' : '#8a8a8a' }}
                />
              </div>
              <span
                className="mt-2 text-xs text-center leading-tight"
                style={{ color: completed ? '#0a0a0a' : '#8a8a8a' }}
              >
                {step.label}
              </span>
              {index === activeStep && !isCancelled && (
                <span className="mt-1 text-[10px] text-[#c9a96e] text-center">
                  {formattedDate}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile: vertical timeline */}
      <div className="flex flex-col gap-0 md:hidden">
        {TIMELINE_STEPS.map((step, index) => {
          const completed = !isCancelled && index <= activeStep
          const isLast = index === TIMELINE_STEPS.length - 1
          const Icon = step.icon
          return (
            <div key={index} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center border-2 flex-shrink-0 transition-all duration-300"
                  style={{
                    backgroundColor: completed ? '#c9a96e' : '#ffffff',
                    borderColor: completed ? '#c9a96e' : '#e5e5e5',
                  }}
                >
                  <Icon
                    className="w-4 h-4"
                    style={{ color: completed ? '#ffffff' : '#8a8a8a' }}
                  />
                </div>
                {!isLast && (
                  <div
                    className="w-px flex-1 min-h-[2rem]"
                    style={{ backgroundColor: completed ? '#c9a96e' : '#e5e5e5' }}
                  />
                )}
              </div>
              <div className="pb-4 pt-1.5">
                <span
                  className="text-sm font-medium"
                  style={{ color: completed ? '#0a0a0a' : '#8a8a8a' }}
                >
                  {step.label}
                </span>
                {index === activeStep && !isCancelled && (
                  <p className="text-[11px] text-[#c9a96e] mt-0.5">{formattedDate}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Alert banner */}
      <div
        className="flex items-start gap-3 rounded-xl p-4"
        style={{ backgroundColor: '#f5f5f5', border: '1px solid #e5e5e5' }}
      >
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#c9a96e' }} />
        <p className="text-sm text-[#0a0a0a]">{alertText}</p>
      </div>
    </div>
  )
}
