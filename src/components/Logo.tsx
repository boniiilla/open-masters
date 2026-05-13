import Image from 'next/image'

interface LogoProps {
  height?: number
  className?: string
}

export function LogoHorizontal({ height = 36, className = '' }: LogoProps) {
  const width = Math.round(height * (1774 / 887))
  return (
    <Image
      src="/logo-horizontal.png"
      alt="Open Masters"
      width={width}
      height={height}
      className={className}
      priority
    />
  )
}

export function LogoVertical({ height = 80, className = '' }: LogoProps) {
  return (
    <Image
      src="/logo-vertical.png"
      alt="Open Masters"
      width={height}
      height={height}
      className={className}
      priority
    />
  )
}

// Kept for backward compat — renders the horizontal logo
export function LogoWordmark({ size = 40, className = '' }: { size?: number; className?: string }) {
  return <LogoHorizontal height={size} className={className} />
}

export function LogoMark({ size = 40, className = '' }: { size?: number; bgFill?: string; className?: string }) {
  return <LogoVertical height={size} className={className} />
}
