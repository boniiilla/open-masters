'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  alias: string
  profilePhoto: string | null
  createdAt: string
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [id])

  async function fetchUser() {
    try {
      const response = await fetch(`/api/users/${id}`)
      const data = await response.json()
      if (data.success) {
        setUser(data.data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-5">
        <p className="text-[var(--text-secondary)]">Usuario no encontrado</p>
        <Link href="/admin/users" className="px-6 py-2 rounded-full bg-[var(--primary)] text-white font-semibold text-sm">
          Volver
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in px-5 md:px-0">
      <div className="pt-4 flex items-center gap-3">
        <Link href="/admin/users" className="w-9 h-9 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center hover:bg-[var(--primary)]/20 transition-colors">
          <svg className="w-4 h-4 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">Jugador</h1>
      </div>

      <div className="app-card rounded-3xl p-6 flex items-center gap-5">
        <Avatar
          firstName={user.firstName}
          lastName={user.lastName}
          alias={user.alias}
          profilePhoto={user.profilePhoto}
          size="lg"
          className="w-20 h-20"
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] truncate">{user.alias}</h2>
          <p className="text-[var(--text-secondary)] truncate">{user.firstName} {user.lastName}</p>
          <p className="text-sm text-[var(--text-secondary)] truncate mt-1">{user.email}</p>
          <p className="text-xs text-[var(--text-secondary)] mt-2">
            Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  )
}
