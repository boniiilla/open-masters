'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { KNOCKOUT_FORMAT_LABELS, MODALITY_LABELS, STATUS_LABELS, getTournamentFormatDescription, KnockoutFormat } from '@/types'
import Avatar from '@/components/Avatar'

interface Player {
  id: string
  firstName: string
  lastName: string
  alias: string
}

interface Team {
  id: string
  name: string | null
  player1: Player
  player2: Player
}

interface TournamentTeam {
  team: Team
}

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
  teams: TournamentTeam[]
  _count: { teams: number; rounds: number }
}

export default function MyPlayerPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchMyTournaments()
  }, [session])

  useEffect(() => {
    let filtered = tournaments

    if (searchQuery) {
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    // Ordenar por fecha de inicio (próximos primero)
    filtered.sort((a, b) => {
      if (!a.startDate) return 1
      if (!b.startDate) return -1
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    })

    setFilteredTournaments(filtered)
  }, [tournaments, searchQuery, statusFilter])

  async function fetchMyTournaments() {
    if (!session?.user?.id) return

    const response = await fetch('/api/tournaments')
    const data = await response.json()

    if (data.success) {
      // Filtrar solo los torneos donde el usuario está inscrito
      const myTournaments = data.data.filter((tournament: Tournament) => {
        return tournament.teams.some((tournamentTeam: TournamentTeam) => {
          const team = tournamentTeam.team
          return team.player1.id === session.user.id || team.player2.id === session.user.id
        })
      })

      setTournaments(myTournaments)
      setFilteredTournaments(myTournaments)
    }
    setLoading(false)
  }

  if (!session) {
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

  const upcomingTournaments = tournaments.filter(t =>
    t.status === 'OPEN' || t.status === 'IN_PROGRESS'
  ).length

  return (
    <div className="space-y-8 animate-fade-in px-5 md:px-0">
      {/* Header */}
      <section className="pt-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
              Mi Player
            </h1>
            <p className="text-[var(--text-secondary)] mt-2">
              Torneos en los que estás inscrito
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="app-card p-5 text-center min-w-[80px] rounded-full">
              <p className="text-2xl font-bold gradient-text">{tournaments.length}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Inscritos</p>
            </div>
            <div className="app-card p-5 text-center min-w-[80px] rounded-full">
              <p className="text-2xl font-bold gradient-text">{upcomingTournaments}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Activos</p>
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
            placeholder="Buscar torneos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="app-input pl-12"
          />
        </div>

        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {[
            { value: 'all', label: 'Todos' },
            { value: 'OPEN', label: 'Abiertos' },
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

      {/* Tournaments Grid */}
      <section>
        {filteredTournaments.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-full bg-[var(--surface-elevated)] flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-[var(--text-secondary)] mb-4">
              {searchQuery || statusFilter !== 'all' ? 'No se encontraron torneos' : 'No estás inscrito en ningún torneo todavía'}
            </p>
            <Link href="/" className="app-btn-primary inline-block">
              Explorar Torneos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTournaments.map((tournament) => {
              // Encontrar el equipo del usuario en este torneo
              const userTeam = tournament.teams.find((tournamentTeam: TournamentTeam) => {
                const team = tournamentTeam.team
                return team.player1.id === session.user.id || team.player2.id === session.user.id
              })?.team

              return (
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

                    {/* Date Badge */}
                    {tournament.startDate && (
                      <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm">
                        <span className="text-xs text-white font-medium">
                          {new Date(tournament.startDate).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    )}

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

                    {/* User Team */}
                    {userTeam && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20">
                        <svg className="w-4 h-4 text-[var(--primary)]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                        </svg>
                        <span className="text-xs text-[var(--primary)] font-medium">
                          {userTeam.player1.alias} & {userTeam.player2.alias}
                        </span>
                      </div>
                    )}

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
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
