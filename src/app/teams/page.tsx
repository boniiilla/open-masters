'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  firstName: string
  lastName: string
  alias: string
}

interface Team {
  id: string
  name: string | null
  player1: User
  player2: User
  _count: { tournamentTeams: number; matchesWon: number }
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTeams()
    fetchUsers()
  }, [])

  async function fetchTeams() {
    const response = await fetch('/api/teams')
    const data = await response.json()
    if (data.success) {
      setTeams(data.data)
    }
    setLoading(false)
  }

  async function fetchUsers() {
    const response = await fetch('/api/users')
    const data = await response.json()
    if (data.success) {
      setUsers(data.data)
    }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name') || undefined,
        player1Id: formData.get('player1Id'),
        player2Id: formData.get('player2Id'),
      }),
    })

    const data = await response.json()
    if (data.success) {
      setShowForm(false)
      fetchTeams()
    } else {
      setError(data.error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] flex items-center justify-center">
        <div className="text-[rgb(var(--ios-label-secondary))]">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--ios-bg-grouped))] pb-20 md:pb-8">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-[34px] font-bold text-[rgb(var(--ios-label-primary))]">
            Parejas
          </h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="ios-button-primary px-6 py-2 text-[15px] ios-press"
          >
            {showForm ? 'Cancelar' : '+ Nueva'}
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="ios-card-grouped mb-6 p-6 ios-animate-in">
            <h2 className="text-[22px] font-bold text-[rgb(var(--ios-label-primary))] mb-4">
              Crear Pareja
            </h2>
            {error && (
              <div className="mb-4 p-3 rounded-[10px] bg-[rgb(var(--ios-red))]/10 text-[rgb(var(--ios-red))] text-[15px]">
                {error}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-6">
              <div className="ios-section-header">INFORMACIÓN</div>
              <div className="ios-card-grouped">
                <div className="ios-list-item flex-col items-start">
                  <label className="text-[13px] text-[rgb(var(--ios-label-secondary))] mb-1">
                    Nombre de la pareja (opcional)
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Se generará automáticamente si no se especifica"
                    className="ios-input p-0"
                  />
                </div>
                <div className="ios-list-item">
                  <label className="text-[15px] text-[rgb(var(--ios-label-primary))] w-24">
                    Jugador 1
                  </label>
                  <select
                    name="player1Id"
                    required
                    className="ios-input p-0 text-right text-[rgb(var(--ios-blue))]"
                  >
                    <option value="">Seleccionar</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.alias}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ios-list-item">
                  <label className="text-[15px] text-[rgb(var(--ios-label-primary))] w-24">
                    Jugador 2
                  </label>
                  <select
                    name="player2Id"
                    required
                    className="ios-input p-0 text-right text-[rgb(var(--ios-blue))]"
                  >
                    <option value="">Seleccionar</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.alias}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="ios-button-primary ios-press"
              >
                Crear Pareja
              </button>
            </form>
          </div>
        )}

        {/* Team List */}
        {teams.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-[rgb(var(--ios-label-tertiary))] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-[17px] text-[rgb(var(--ios-label-secondary))]">
              No hay parejas creadas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => (
              <Link
                key={team.id}
                href={`/teams/${team.id}`}
                className="ios-card-grouped block ios-press ios-animate-in"
              >
                <div className="p-4">
                  <h3 className="font-semibold text-[17px] text-[rgb(var(--ios-label-primary))] mb-2">
                    {team.name || `${team.player1.alias} & ${team.player2.alias}`}
                  </h3>
                  <div className="space-y-1 text-[15px] text-[rgb(var(--ios-label-secondary))] mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[rgb(var(--ios-blue))]/20 flex items-center justify-center">
                        <span className="text-[11px] font-semibold text-[rgb(var(--ios-blue))]">1</span>
                      </div>
                      <span>{team.player1.firstName} {team.player1.lastName} ({team.player1.alias})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[rgb(var(--ios-green))]/20 flex items-center justify-center">
                        <span className="text-[11px] font-semibold text-[rgb(var(--ios-green))]">2</span>
                      </div>
                      <span>{team.player2.firstName} {team.player2.lastName} ({team.player2.alias})</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="ios-badge-gray">
                      {team._count.tournamentTeams} torneos
                    </span>
                    <span className="ios-badge-green">
                      {team._count.matchesWon} victorias
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
