'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { USER_ROLE_LABELS, UserRole } from '@/types'
import Avatar from '@/components/Avatar'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  alias: string
  role: UserRole
  profilePhoto: string | null
  createdAt: string
}

export default function AdminUsersPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    if (session.user.role !== 'SUPERADMIN') {
      router.push('/')
      return
    }
    fetchUsers()
  }, [session])

  useEffect(() => {
    let filtered = users

    if (searchQuery) {
      filtered = filtered.filter(u =>
        u.alias.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.lastName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter])

  async function fetchUsers() {
    const response = await fetch('/api/users')
    const data = await response.json()
    if (data.success) {
      setUsers(data.data)
      setFilteredUsers(data.data)
    }
    setLoading(false)
  }

  if (!session || session.user.role !== 'SUPERADMIN') {
    return null
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

  const totalAdmins = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN').length
  const totalPlayers = users.filter(u => u.role === 'PLAYER').length

  return (
    <div className="space-y-8 animate-fade-in px-5 md:px-0">
      {/* Header */}
      <section className="pt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
              Gestión de Usuarios
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              Administra todos los usuarios de la plataforma
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="app-card p-5 text-center min-w-[80px] rounded-full">
              <p className="text-2xl font-bold gradient-text">{users.length}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Total</p>
            </div>
            <div className="app-card p-5 text-center min-w-[80px] rounded-full">
              <p className="text-2xl font-bold gradient-text">{totalPlayers}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Players</p>
            </div>
            <div className="app-card p-5 text-center min-w-[80px] rounded-full">
              <p className="text-2xl font-bold gradient-text">{totalAdmins}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Admins</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="space-y-4">
        <div className="relative">
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="app-input pl-12"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'PLAYER', label: 'Players' },
            { value: 'ADMIN', label: 'Admins' },
            { value: 'SUPERADMIN', label: 'Super Admins' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setRoleFilter(filter.value)}
              className={roleFilter === filter.value ? 'app-pill-active' : 'app-pill-inactive'}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* Users Grid */}
      <section>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--surface-elevated)] flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)]">
              {searchQuery || roleFilter !== 'all' ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((user) => (
              <Link
                key={user.id}
                href={`/users/${user.id}`}
                className="app-card group hover:bg-[var(--surface-elevated)] transition-all cursor-pointer overflow-hidden rounded-3xl p-6"
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar
                      firstName={user.firstName}
                      lastName={user.lastName}
                      alias={user.alias}
                      size="lg"
                      className="w-16 h-16"
                    />
                    {/* Role Badge */}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                      user.role === 'SUPERADMIN' ? 'bg-red-500' :
                      user.role === 'ADMIN' ? 'bg-[var(--primary)]' :
                      'bg-green-500'
                    }`}>
                      {user.role === 'SUPERADMIN' ? (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                        </svg>
                      ) : user.role === 'ADMIN' ? (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-all truncate">
                      {user.alias}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        user.role === 'SUPERADMIN' ? 'bg-red-500/20 text-red-400' :
                        user.role === 'ADMIN' ? 'bg-[var(--primary)]/20 text-[var(--primary)]' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {USER_ROLE_LABELS[user.role]}
                      </span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg className="w-5 h-5 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Additional Info */}
                <div className="mt-4 pt-4 border-t border-[var(--surface-elevated)]">
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] mt-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>
                      Registrado {new Date(user.createdAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
