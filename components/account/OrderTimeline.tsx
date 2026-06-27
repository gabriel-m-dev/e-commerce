'use client'

import { Fragment } from 'react'
import { STATUS_TO_STAGE, STAGE_CONFIG, STATUS_ALERT, Info, XCircle } from '@/lib/order-status'
import type { OrderStatus } from '@/lib/queries/orders'

interface Props {
  status: OrderStatus
  subStatus: string | null
  subStatusHistory: string[]
  updatedAt?: Date | null
}

function parseSubStatus(raw: string): { v: string; t?: string } {
  try { return JSON.parse(raw) } catch { return { v: raw } }
}

export function OrderTimeline({ status, subStatus, subStatusHistory, updatedAt }: Props) {
  const stage = STATUS_TO_STAGE[status]
  const isCancelled = stage === -1
  const alertMessage = STATUS_ALERT[status]

  const formattedDate = updatedAt
    ? new Date(updatedAt).toLocaleDateString('es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null

  return (
    <div className="mb-8">
      {!isCancelled && (
        <>
          {/* Desktop: horizontal bar */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute top-4 left-4 right-4 h-[2px] bg-border" />
              <div
                className="absolute top-4 left-4 h-[2px] bg-[#c9a96e] transition-all duration-700"
                style={{ width: `calc(${(stage / 4) * 100}% - ${(stage / 4) * 2}rem)` }}
              />
              <div className="relative flex justify-between">
                {STAGE_CONFIG.map((s, i) => {
                  const isActive = i === stage
                  const isPassed = i < stage
                  const Icon = s.icon
                  return (
                    <div key={i} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 flex items-center justify-center border-2 rounded-full ${
                          isPassed || isActive
                            ? 'bg-[#c9a96e] border-[#c9a96e]'
                            : 'bg-white border-border'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isPassed || isActive ? 'text-white' : 'text-[#8a8a8a]'}`}
                        />
                      </div>
                      <p
                        className={`mt-2 text-xs md:text-sm uppercase tracking-[0.12em] text-center max-w-[64px] leading-tight ${
                          isActive ? 'text-foreground font-semibold' : 'text-[#8a8a8a]'
                        }`}
                      >
                        {s.label}
                      </p>
                      {isActive && (
                        <div className="mt-1 text-center space-y-2 max-w-[80px] w-full">
                          {subStatusHistory.length > 0
                            ? [...subStatusHistory].reverse().map((entry, idx) => {
                                const { v, t } = parseSubStatus(entry)
                                const timeStr = t ? new Date(t).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : null
                                return (
                                  <Fragment key={idx}>
                                    <p
                                      className={`text-[11px] md:text-xs font-medium ${
                                        idx === 0 ? 'text-[#c9a96e]' : 'text-[#8a8a8a]'
                                      }`}
                                    >
                                      {v}
                                    </p>
                                    {timeStr && (
                                      <p className="text-[10px] text-[#8a8a8a]">{timeStr}</p>
                                    )}
                                  </Fragment>
                                )
                              })
                            : subStatus && (
                                <p className="text-[11px] md:text-xs text-[#c9a96e] font-medium">{subStatus}</p>
                              )}
                          {formattedDate && (
                            <p className="text-[11px] md:text-xs text-[#8a8a8a]">{formattedDate}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Mobile: vertical */}
          <div className="md:hidden">
            <div className="space-y-0">
              {STAGE_CONFIG.map((s, i) => {
                const isActive = i === stage
                const isPassed = i < stage
                const isLast = i === STAGE_CONFIG.length - 1
                const Icon = s.icon
                return (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-11 h-11 flex items-center justify-center border-2 rounded-full shrink-0 ${
                          isPassed || isActive
                            ? 'bg-[#c9a96e] border-[#c9a96e]'
                            : 'bg-white border-border'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 ${isPassed || isActive ? 'text-white' : 'text-[#8a8a8a]'}`}
                        />
                      </div>
                      {!isLast && (
                        <div
                          className={`w-[2px] flex-1 min-h-[24px] ${
                            isPassed ? 'bg-[#c9a96e]' : 'bg-border'
                          }`}
                        />
                      )}
                    </div>
                    <div className={`pt-1 ${isLast ? '' : 'pb-4'}`}>
                      <p
                        className={`text-xs uppercase tracking-[0.12em] ${
                          isActive ? 'text-foreground font-semibold' : 'text-[#8a8a8a]'
                        }`}
                      >
                        {s.label}
                      </p>
                      {isActive && (
                        <div className="mt-0.5 space-y-2">
                          {subStatusHistory.length > 0
                            ? [...subStatusHistory].reverse().map((entry, idx) => {
                                const { v, t } = parseSubStatus(entry)
                                const timeStr = t ? new Date(t).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }) : null
                                return (
                                  <Fragment key={idx}>
                                    <p
                                      className={`text-[11px] font-medium ${
                                        idx === 0 ? 'text-[#c9a96e]' : 'text-[#8a8a8a]'
                                      }`}
                                    >
                                      {v}
                                    </p>
                                    {timeStr && (
                                      <p className="text-[10px] text-[#8a8a8a]">{timeStr}</p>
                                    )}
                                  </Fragment>
                                )
                              })
                            : subStatus && (
                                <p className="text-[11px] text-[#c9a96e] font-medium">{subStatus}</p>
                              )}
                          {formattedDate && (
                            <p className="text-[11px] text-[#8a8a8a]">{formattedDate}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}

      {/* STATUS_ALERT banner */}
      <div
        className={`flex gap-3 border px-5 py-4 mt-6 ${
          isCancelled
            ? 'bg-red-50 border-red-200'
            : 'bg-surface border-border'
        }`}
      >
        {isCancelled ? (
          <XCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
        ) : (
          <Info className="w-5 h-5 text-[#c9a96e] mt-0.5 shrink-0" />
        )}
        <p className="text-sm md:text-base text-muted leading-relaxed">{alertMessage}</p>
      </div>
    </div>
  )
}
