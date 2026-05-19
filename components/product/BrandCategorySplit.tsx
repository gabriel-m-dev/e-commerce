import Image from 'next/image'

interface BrandCategorySplitProps {
  ropaImage: string
  zapatillasImage: string
}

export default function BrandCategorySplit({ ropaImage, zapatillasImage }: BrandCategorySplitProps) {
  if (!ropaImage && !zapatillasImage) return null

  return (
    <div className="flex flex-col md:flex-row gap-1 mt-8">
      {[ropaImage, zapatillasImage].map((img, i) => (
        <div key={i} className="relative flex-1 h-[55vw] md:h-[65vh] min-h-[280px] overflow-hidden">
          {img ? (
            <Image
              src={img}
              alt=""
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 bg-foreground/10" />
          )}
        </div>
      ))}
    </div>
  )
}
