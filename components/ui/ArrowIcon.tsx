type Props = {
  className?: string
  size?: number
}

export default function ArrowIcon({ className, size = 20 }: Props) {
  return (
    <svg
      width={size}
      height={size * 0.5}
      viewBox="0 0 20 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M0 5h17M13 1l4 4-4 4" />
    </svg>
  )
}
