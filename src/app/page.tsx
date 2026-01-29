'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { KNOCKOUT_FORMAT_LABELS, MODALITY_LABELS, STATUS_LABELS, getTournamentFormatDescription, KnockoutFormat } from '@/types'
import Avatar from '@/components/Avatar'

interface Creator {
  id: string
  firstName: string
  lastName: string
  alias: string
}

interface Tournament {
  id: string
  name: string
  description: string
  hasGroupStage: boolean
  knockoutFormat: KnockoutFormat
  modality: keyof typeof MODALITY_LABELS
  status: keyof typeof STATUS_LABELS
  maxTeams: number | null
  locationName: string | null
  photo: string | null
  startDate: string | null
  creator: Creator
  _count: { teams: number; rounds: number }
}

export default function Home() {
  const { data: session } = useSession()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('OPEN')

  useEffect(() => {
    fetchTournaments()
  }, [])

  useEffect(() => {
    let filtered = tournaments

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.creator.alias.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    setFilteredTournaments(filtered)
  }, [tournaments, searchQuery, statusFilter])

  async function fetchTournaments() {
    const response = await fetch('/api/tournaments')
    const data = await response.json()
    if (data.success) {
      // Filtrar solo torneos que no sean DRAFT (borradores)
      const publishedTournaments = data.data.filter((t: Tournament) => t.status !== 'DRAFT')
      setTournaments(publishedTournaments)
      setFilteredTournaments(publishedTournaments)
    }
    setLoading(false)
  }

  const totalTeams = tournaments.reduce((acc, t) => acc + t._count.teams, 0)
  const openTournaments = tournaments.filter(t => t.status === 'OPEN').length

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

  return (
    <div className="space-y-8 animate-fade-in px-5 md:px-0">
      {/* Header */}
      <section className="pt-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
            Torneos Disponibles
          </h1>
          {session ? (
            <p className="text-[var(--text-secondary)] mt-2">
              Bienvenido, {session.user.alias}
            </p>
          ) : (
            <p className="text-[var(--text-secondary)] mt-2">
              Descubre y únete a los mejores torneos de futbolín
            </p>
          )}
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
            placeholder="Buscar torneos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="app-input pl-12"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {[
            { value: 'OPEN', label: 'Abiertos' },
            { value: 'all', label: 'Todos' },
            { value: 'IN_PROGRESS', label: 'En Progreso' },
            { value: 'FINISHED', label: 'Finalizados' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={statusFilter === filter.value ? 'app-pill-active' : 'app-pill-inactive'}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      {/* Alert para no logueados */}
      {!session && (
        <div className="p-4 rounded-full bg-[var(--primary)]/10 border-2 border-[var(--primary)]/20">
          <p className="text-sm text-[var(--text-secondary)] text-center">
            <Link href="/auth/login" className="text-[var(--primary)] font-semibold hover:underline">
              Inicia sesión
            </Link> para unirte a los torneos
          </p>
        </div>
      )}

      {/* Tournaments Grid */}
      <section>
        {filteredTournaments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--surface-elevated)] flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)]">
              {searchQuery || statusFilter !== 'all' ? 'No se encontraron torneos' : 'No hay torneos todavía'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournaments/${tournament.id}`}
                className="app-card group hover:bg-[var(--surface-elevated)] transition-all cursor-pointer overflow-hidden rounded-3xl"
              >
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {tournament.photo ? (
                    <img
                      src={tournament.photo}
                      alt={tournament.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary-dark)]/20 flex items-center justify-center">
                      <svg className="w-16 h-16 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

                  {/* Creator Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                    <Avatar
                      firstName={tournament.creator.firstName}
                      lastName={tournament.creator.lastName}
                      alias={tournament.creator.alias}
                      size="sm"
                      className="w-5 h-5"
                    />
                    <span className="text-xs text-white font-medium">{tournament.creator.alias}</span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${
                      tournament.status === 'OPEN' ? 'bg-green-500/20 text-green-400' :
                      tournament.status === 'IN_PROGRESS' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {STATUS_LABELS[tournament.status]}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 group-hover:text-[var(--primary)] transition-all">
                      {tournament.name}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                      {tournament.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                      <span className="font-medium">{tournament._count.teams} equipos</span>
                    </div>
                    {tournament.locationName && (
                      <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="text-xs truncate max-w-[100px]">{tournament.locationName}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-400">
                      {getTournamentFormatDescription(tournament.hasGroupStage, tournament.knockoutFormat)}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-400">
                      {MODALITY_LABELS[tournament.modality]}
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
