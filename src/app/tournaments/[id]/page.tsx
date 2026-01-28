'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { KNOCKOUT_FORMAT_LABELS, MODALITY_LABELS, STATUS_LABELS, MATCH_STATUS_LABELS, getTournamentFormatDescription, KnockoutFormat } from '@/types'

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
}

interface TournamentTeam {
  id: string
  teamId: string
  seedNumber: number | null
  isEliminated: boolean
  team: Team
}

interface Table {
  id: string
  name: string
  location: string | null
}

interface TournamentTable {
  id: string
  table: Table
}

interface Match {
  id: string
  matchNumber: number
  status: keyof typeof MATCH_STATUS_LABELS
  team1Score: number | null
  team2Score: number | null
  team1: Team | null
  team2: Team | null
  winner: Team | null
  table: Table | null
}

interface Round {
  id: string
  roundNumber: number
  name: string | null
  isLosersBracket: boolean
  matches: Match[]
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
  teamsPerGroup: number | null
  teamsAdvancing: number | null
  modality: keyof typeof MODALITY_LABELS
  status: keyof typeof STATUS_LABELS
  maxTeams: number | null
  locationName: string | null
  locationAddress: string | null
  latitude: number | null
  longitude: number | null
  photo: string | null
  startDate: string | null
  creator: Creator
  teams: TournamentTeam[]
  tables: TournamentTable[]
  rounds: Round[]
}

export default function TournamentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [allTables, setAllTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showAddTable, setShowAddTable] = useState(false)

  useEffect(() => {
    fetchTournament()
    fetchAllTeams()
    fetchAllTables()
  }, [id])

  async function fetchTournament() {
    const response = await fetch(`/api/tournaments/${id}`)
    const data = await response.json()
    if (data.success) {
      setTournament(data.data)
    }
    setLoading(false)
  }

  async function fetchAllTeams() {
    const response = await fetch('/api/teams')
    const data = await response.json()
    if (data.success) {
      setAllTeams(data.data)
    }
  }

  async function fetchAllTables() {
    const response = await fetch('/api/tables?available=true')
    const data = await response.json()
    if (data.success) {
      setAllTables(data.data)
    }
  }

  async function addTeam(teamId: string) {
    await fetch(`/api/tournaments/${id}/teams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teamId }),
    })
    fetchTournament()
    setShowAddTeam(false)
  }

  async function removeTeam(teamId: string) {
    await fetch(`/api/tournaments/${id}/teams?teamId=${teamId}`, {
      method: 'DELETE',
    })
    fetchTournament()
  }

  async function addTable(tableId: string) {
    await fetch(`/api/tournaments/${id}/tables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId }),
    })
    fetchTournament()
    setShowAddTable(false)
  }

  async function updateStatus(status: string) {
    await fetch(`/api/tournaments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchTournament()
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  if (!tournament) {
    return <div className="text-center py-8">Torneo no encontrado</div>
  }

  const enrolledTeamIds = tournament.teams.map(t => t.teamId)
  const availableTeams = allTeams.filter(t => !enrolledTeamIds.includes(t.id))

  const assignedTableIds = tournament.tables.map(t => t.table.id)
  const availableTables = allTables.filter(t => !assignedTableIds.includes(t.id))

  const googleMapsUrl = tournament.latitude && tournament.longitude
    ? `https://www.google.com/maps?q=${tournament.latitude},${tournament.longitude}`
    : tournament.locationAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tournament.locationAddress)}`
    : null

  const googleMapsEmbedUrl = tournament.latitude && tournament.longitude
    ? `https://maps.google.com/maps?q=${tournament.latitude},${tournament.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : null

  return (
    <div>
      <Link href="/tournaments" className="text-primary-600 hover:text-primary-500 text-sm mb-4 inline-block">
        &larr; Volver a torneos
      </Link>

      {/* Cabecera del torneo */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
        {tournament.photo && (
          <div className="h-48 w-full">
            <img src={tournament.photo} alt={tournament.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tournament.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-2">{tournament.description}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">
                  {getTournamentFormatDescription(tournament.hasGroupStage, tournament.knockoutFormat)}
                </span>
                <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                  {MODALITY_LABELS[tournament.modality]}
                </span>
                <span className="text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                  {STATUS_LABELS[tournament.status]}
                </span>
              </div>

              {tournament.hasGroupStage && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  {tournament.teamsPerGroup} equipos por grupo, {tournament.teamsAdvancing} avanzan
                </p>
              )}

              <p className="text-sm text-gray-400 mt-2">
                Creado por {tournament.creator.alias}
              </p>
            </div>
            <div className="flex gap-2">
              {tournament.status === 'DRAFT' && (
                <button
                  onClick={() => updateStatus('OPEN')}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                >
                  Abrir inscripciones
                </button>
              )}
              {tournament.status === 'OPEN' && (
                <button
                  onClick={() => updateStatus('IN_PROGRESS')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                >
                  Iniciar torneo
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Ubicación con Google Maps */}
      {(tournament.locationName || tournament.locationAddress || googleMapsEmbedUrl) && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ubicacion</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              {tournament.locationName && (
                <p className="font-medium text-gray-900 dark:text-white">{tournament.locationName}</p>
              )}
              {tournament.locationAddress && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tournament.locationAddress}</p>
              )}
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-primary-600 hover:text-primary-500 text-sm mt-3"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Abrir en Google Maps
                </a>
              )}
            </div>
            {googleMapsEmbedUrl && (
              <div className="h-48 rounded overflow-hidden">
                <iframe
                  src={googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Equipos */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Equipos ({tournament.teams.length}{tournament.maxTeams ? `/${tournament.maxTeams}` : ''})
            </h2>
            {(tournament.status === 'DRAFT' || tournament.status === 'OPEN') && (
              <button
                onClick={() => setShowAddTeam(!showAddTeam)}
                className="text-primary-600 hover:text-primary-500 text-sm"
              >
                {showAddTeam ? 'Cancelar' : '+ Añadir'}
              </button>
            )}
          </div>

          {showAddTeam && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <select
                onChange={(e) => e.target.value && addTeam(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Seleccionar equipo</option>
                {availableTeams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name || `${team.player1.alias} & ${team.player2.alias}`}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tournament.teams.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No hay equipos inscritos</p>
          ) : (
            <ul className="space-y-2">
              {tournament.teams.map((tt) => (
                <li key={tt.id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {tt.team.name || `${tt.team.player1.alias} & ${tt.team.player2.alias}`}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {tt.team.player1.alias} - {tt.team.player2.alias}
                    </p>
                  </div>
                  {(tournament.status === 'DRAFT' || tournament.status === 'OPEN') && (
                    <button
                      onClick={() => removeTeam(tt.teamId)}
                      className="text-red-600 hover:text-red-500 text-sm"
                    >
                      Quitar
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Mesas */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Mesas ({tournament.tables.length})
            </h2>
            <button
              onClick={() => setShowAddTable(!showAddTable)}
              className="text-primary-600 hover:text-primary-500 text-sm"
            >
              {showAddTable ? 'Cancelar' : '+ Añadir'}
            </button>
          </div>

          {showAddTable && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <select
                onChange={(e) => e.target.value && addTable(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Seleccionar mesa</option>
                {availableTables.map((table) => (
                  <option key={table.id} value={table.id}>
                    {table.name} {table.location ? `(${table.location})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {tournament.tables.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No hay mesas asignadas</p>
          ) : (
            <ul className="space-y-2">
              {tournament.tables.map((tt) => (
                <li key={tt.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{tt.table.name}</p>
                  {tt.table.location && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{tt.table.location}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Rondas y partidos */}
      {tournament.rounds.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Rondas</h2>
          {tournament.rounds.map((round) => (
            <div key={round.id} className="mb-6">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                {round.name || `Ronda ${round.roundNumber}`}
                {round.isLosersBracket && ' (Repesca)'}
              </h3>
              <div className="grid gap-2">
                {round.matches.map((match) => (
                  <div key={match.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded flex justify-between items-center">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {match.team1 ? `${match.team1.player1.alias} & ${match.team1.player2.alias}` : 'TBD'}
                        {' vs '}
                        {match.team2 ? `${match.team2.player1.alias} & ${match.team2.player2.alias}` : 'TBD'}
                      </p>
                      {match.table && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">Mesa: {match.table.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {match.status === 'FINISHED' ? (
                        <p className="font-bold text-gray-900 dark:text-white">
                          {match.team1Score} - {match.team2Score}
                        </p>
                      ) : (
                        <span className="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">
                          {MATCH_STATUS_LABELS[match.status]}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
