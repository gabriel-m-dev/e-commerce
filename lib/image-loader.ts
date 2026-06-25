export default function supabaseLoader({
  src,
  width,
  quality,
}: {
  src: string
  width: number
  quality?: number
}): string {
  if (src.includes('.supabase.co/storage/v1/object/public/')) {
    const renderUrl = src.replace(
      '/storage/v1/object/public/',
      '/storage/v1/render/image/public/'
    )
    const params = new URLSearchParams({
      width: String(width),
      quality: String(quality ?? 80),
    })
    return `${renderUrl}?${params}`
  }
  return src
}
