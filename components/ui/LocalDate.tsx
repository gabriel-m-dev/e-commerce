interface LocalDateProps {
  date: string
  options?: Intl.DateTimeFormatOptions
  locale?: string
}

export function LocalDate({ date, options, locale = 'es-AR' }: LocalDateProps) {
  const formatted = new Intl.DateTimeFormat(locale, { ...options, timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(date))

  return <span suppressHydrationWarning>{formatted}</span>
}
