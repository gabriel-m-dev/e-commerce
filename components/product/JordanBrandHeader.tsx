'use client'

import Image from 'next/image'

interface JordanBrandHeaderProps {
  brand?: 'JORDAN'
}

export default function JordanBrandHeader({ brand = 'JORDAN' }: JordanBrandHeaderProps) {
  void brand

  return (
    <>
      <style>{`
        @keyframes jordan-row1-in {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes jordan-row2-in {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes jordan-bg-img-in {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .jordan-row1 { animation: jordan-row1-in 0.5s ease-out 0s both; }
        .jordan-row2 { animation: jordan-row2-in 0.5s ease-out 0.15s both; }
        .jordan-bg-img { animation: jordan-bg-img-in 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) 0.1s both; }
      `}</style>
      <div className="relative mb-8 pt-2">

        {/* Row 1: logo dorado + JORDAN dorado */}
        <div className="jordan-row1 flex items-center gap-3 max-[374px]:gap-2 sm:gap-4">
          <div className="relative w-[53px] h-[53px] max-[374px]:w-[40px] max-[374px]:h-[40px] sm:w-[64px] sm:h-[64px] md:w-[76px] md:h-[76px] lg:w-[88px] lg:h-[88px] shrink-0">
            <Image
              src="/jordan_logo.png"
              alt="Jordan"
              fill
              sizes="(max-width: 374px) 40px, (max-width: 640px) 53px, (max-width: 768px) 64px, (max-width: 1024px) 76px, 88px"
              className="object-contain"
              style={{
                filter:
                  'brightness(0) saturate(100%) invert(76%) sepia(28%) saturate(700%) hue-rotate(358deg)',
              }}
            />
          </div>
          <p className="text-[12px] max-[374px]:text-[10px] sm:text-[14px] md:text-[16px] lg:text-[19px] font-semibold uppercase tracking-[0.28em] text-gold">
            JORDAN
          </p>
        </div>

        {/* Row 2: gold line + frase uppercase */}
        <div className="jordan-row2 flex items-center gap-3 sm:gap-4 mt-3 max-[374px]:mt-2 sm:mt-4">
          <div className="h-px w-8 max-[374px]:w-6 sm:w-10 md:w-12 bg-gold shrink-0" aria-hidden />
          <p className="text-3xl max-[374px]:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-[0.07em] text-white leading-tight">
            <span className="max-[470px]:block">DREAM IT,</span>
            <span className="max-[470px]:block">DO IT<span className="text-gold ml-1"> .</span></span>
          </p>
        </div>

      </div>
    </>
  )
}
