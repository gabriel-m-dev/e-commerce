'use client'

import { useState, useEffect } from 'react'

interface LocalDateProps {
  date: string
  options?: Intl.DateTimeFormatOptions
  locale?: string
}

export function LocalDate({ date, options, locale = 'es-AR' }: LocalDateProps) {
  const [formatted, setFormatted] = useState<string | null>(null)

  useEffect(() => {
    setFormatted(new Intl.DateTimeFormat(locale, options).format(new Date(date)))
  }, [date, locale, options])

  if (!formatted) return null

  return <>{formatted}</>
}
