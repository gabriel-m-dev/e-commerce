'use client'

import NextImage, { type ImageProps } from 'next/image'

export default function AppImage({ src, ...props }: ImageProps) {
  return <NextImage src={src} unoptimized {...props} />
}
