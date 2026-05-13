'use client'

import { usePathname } from 'next/navigation'

export function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuth = pathname?.startsWith('/auth')

  if (isAuth) {
    return <>{children}</>
  }

  return (
    <main className="flex-1 pb-28 md:pb-8 md:pl-60">
      <div className="max-w-7xl mx-auto md:px-6 lg:px-8 md:py-6">
        {children}
      </div>
    </main>
  )
}
