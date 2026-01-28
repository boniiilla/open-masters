import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Open Masters - Gestion de Torneos de Futbolin',
  description: 'Aplicacion para gestionar torneos de futbolin con diferentes modos de juego',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Open Masters',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f0f0f',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[var(--background)] text-[var(--text-primary)] min-h-screen">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 pb-28 md:pb-8 md:pl-60">
              <div className="max-w-7xl mx-auto md:px-6 lg:px-8 md:py-6">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}
