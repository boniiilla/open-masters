'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="space-y-8 animate-fade-in px-5 md:px-0">
      {/* Hero Section */}
      <section className="min-h-[400px] md:min-h-[500px] flex items-center">
        <div className="w-full">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-normal text-[var(--text-primary)] mb-6 leading-tight">
              Open Masters
            </h1>
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-10 max-w-2xl">
              Sistema de gestión de torneos de futbolín profesional
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/tournaments" className="app-btn-primary inline-flex items-center gap-2 text-lg px-8 py-4">
                Ver Torneos
              </Link>
              {!session && (
                <Link href="/auth/register" className="app-btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
                  Registrarse
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions / Pills */}
      <div className="app-category-pills">
        <Link href="/tournaments" className="app-pill-active">
          Todos
        </Link>
        <Link href="/tournaments?status=OPEN" className="app-pill-inactive">
          Abiertos
        </Link>
        <Link href="/tournaments?status=IN_PROGRESS" className="app-pill-inactive">
          En Curso
        </Link>
        <Link href="/tournaments?status=FINISHED" className="app-pill-inactive">
          Finalizados
        </Link>
      </div>
    </div>
  )
}
