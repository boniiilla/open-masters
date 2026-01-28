'use client'

import { useState, useEffect, useRef } from 'react'
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

export default function TournamentsPage() {
  const { data: session } = useSession()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [tournamentPhoto, setTournamentPhoto] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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
      setTournaments(data.data)
      setFilteredTournaments(data.data)
    }
    setLoading(false)
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no puede superar los 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setTournamentPhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (!session) {
      setError('Debes iniciar sesion para crear un torneo')
      return
    }

    const formData = new FormData(e.currentTarget)

    const response = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        description: formData.get('description'),
        modality: formData.get('modality'),
        hasGroupStage: false,
        knockoutFormat: formData.get('knockoutFormat'),
        maxTeams: formData.get('maxTeams') ? Number(formData.get('maxTeams')) : undefined,
        locationName: formData.get('locationName') || undefined,
        locationAddress: formData.get('locationAddress') || undefined,
        photo: tournamentPhoto || undefined,
        startDate: formData.get('startDate') || undefined,
      }),
    })

    const data = await response.json()
    if (data.success) {
      setShowForm(false)
      setTournamentPhoto(null)
      fetchTournaments()
    } else {
      setError(data.error)
    }
  }

  const totalTeams = tournaments.reduce((acc, t) => acc + t._count.teams, 0)
  const activeTournaments = tournaments.filter(t => t.status === 'IN_PROGRESS' || t.status === 'OPEN').length

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
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
              Torneos
            </h1>
            {session && (
              <p className="text-[var(--text-secondary)] mt-2">
                Bienvenido, {session.user.alias}
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            <div className="app-card p-5 text-center min-w-[80px] rounded-full">
              <p className="text-2xl font-bold gradient-text">{tournaments.length}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Torneos</p>
            </div>
            <div className="app-card p-5 text-center min-w-[80px] rounded-full">
              <p className="text-2xl font-bold gradient-text">{totalTeams}</p>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Equipos</p>
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
          {session && (
            <button
              onClick={() => setShowForm(true)}
              className="app-pill-active flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Crear Torneo
            </button>
          )}
        </div>
      </section>

      {/* Alert para no logueados */}
      {!session && (
        <div className="p-4 rounded-full bg-[var(--primary)]/10 border-2 border-[var(--primary)]/20">
          <p className="text-sm text-[var(--text-secondary)] text-center">
            <Link href="/auth/login" className="text-[var(--primary)] font-semibold hover:underline">
              Inicia sesión
            </Link> para crear y gestionar torneos
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
                className="stream-card-hover group"
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
                    <div className="w-full h-full bg-gradient-to-br from-[rgb(var(--accent-purple))]/20 to-[rgb(var(--accent-magenta))]/20 flex items-center justify-center">
                      <svg className="w-16 h-16 text-[rgb(var(--text-tertiary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <h3 className="text-lg font-bold text-[rgb(var(--text-primary))] mb-1 group-hover:gradient-text transition-all">
                      {tournament.name}
                    </h3>
                    <p className="text-sm text-[rgb(var(--text-secondary))] line-clamp-2">
                      {tournament.description}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5 text-[rgb(var(--text-tertiary))]">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                      <span className="font-medium">{tournament._count.teams}</span>
                    </div>
                    {tournament.locationName && (
                      <div className="flex items-center gap-1.5 text-[rgb(var(--text-tertiary))]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        <span className="text-xs truncate max-w-[100px]">{tournament.locationName}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className="stream-badge-purple">
                      {getTournamentFormatDescription(tournament.hasGroupStage, tournament.knockoutFormat)}
                    </span>
                    <span className="stream-badge-magenta">
                      {MODALITY_LABELS[tournament.modality]}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Modal para crear torneo */}
      {showForm && (
        <div className="app-modal-backdrop" onClick={() => setShowForm(false)}>
          <div
            className="bg-[var(--surface)] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="app-modal-header">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-colors"
              >
                Cancelar
              </button>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                Crear Torneo
              </h2>
              <button
                type="submit"
                form="tournament-form"
                className="px-6 py-2 rounded-full bg-[var(--primary)] text-black font-semibold hover:bg-[var(--primary-dark)] transition-colors"
              >
                Crear
              </button>
            </div>

            {/* Form */}
            <form id="tournament-form" onSubmit={handleCreate} className="app-modal-body overflow-y-auto max-h-[calc(90vh-80px)]">
              {error && (
                <div className="p-4 rounded-full bg-red-500/10 text-red-400 text-sm border-2 border-red-500/20">
                  {error}
                </div>
              )}

              <label htmlFor="tournamentPhoto" className="block cursor-pointer group">
                <div className="w-full aspect-[16/9] rounded-3xl bg-[var(--surface-elevated)] border-2 border-dashed border-[var(--surface-elevated)] group-hover:border-[var(--primary)] flex items-center justify-center overflow-hidden transition-colors">
                  {tournamentPhoto ? (
                    <img src={tournamentPhoto} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[var(--surface)] flex items-center justify-center">
                        <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-[var(--text-secondary)] font-medium">Añadir imagen del torneo</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-1">JPG, PNG o GIF (max. 5MB)</p>
                    </div>
                  )}
                </div>
                <input type="file" id="tournamentPhoto" accept="image/*" className="hidden" onChange={handlePhotoChange} />
              </label>

              <input
                type="text"
                name="name"
                placeholder="Nombre del torneo"
                required
                className="app-input"
              />
              <textarea
                name="description"
                placeholder="Descripción del torneo"
                required
                rows={3}
                className="app-textarea"
              />

              <div className="grid grid-cols-2 gap-4">
                <select name="modality" required className="app-input">
                  <option value="">Modalidad</option>
                  <option value="STATIC">Parado</option>
                  <option value="MOVEMENT">Movimiento</option>
                  <option value="COMBINED">Combinado</option>
                </select>
                <select name="knockoutFormat" className="app-input">
                  <option value="">Formato</option>
                  <option value="SINGLE_KO">KO Directo</option>
                  <option value="DOUBLE_KO">Doble KO</option>
                </select>
              </div>

              <input
                type="text"
                name="locationName"
                placeholder="Ubicación (opcional)"
                className="app-input"
              />

              <input
                type="number"
                name="maxTeams"
                placeholder="Número máximo de equipos (opcional)"
                min="2"
                className="app-input"
              />

              <input
                type="date"
                name="startDate"
                placeholder="Fecha de inicio (opcional)"
                className="app-input"
              />
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
