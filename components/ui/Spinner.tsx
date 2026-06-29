export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin ${className}`}
      aria-hidden="true"
    />
  )
}
