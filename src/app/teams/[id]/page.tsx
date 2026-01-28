'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface User {
  id: string
  firstName: string
  lastName: string
  alias: string
  email: string
}

interface Tournament {
  id: string
  name: string
  status: string
  hasGroupStage: boolean
  knockoutFormat: string
  modality: string
}

interface TournamentTeam {
  id: string
  tournament: Tournament
}

interface Team {
  id: string
  name: string | null
  player1: User
  player2: User
  tournamentTeams: TournamentTeam[]
  matchesWon: { id: string }[]
}

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTeam()
  }, [id])

  async function fetchTeam() {
    const response = await fetch(`/api/teams/${id}`)
    const data = await response.json()
    if (data.success) {
      setTeam(data.data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  if (!team) {
    return <div className="text-center py-8">Equipo no encontrado</div>
  }

  return (
    <div>
      <Link href="/teams" className="text-primary-600 hover:text-primary-500 text-sm mb-4 inline-block">
        &larr; Volver a parejas
      </Link>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {team.name || `${team.player1.alias} & ${team.player2.alias}`}
        </h1>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <h3 className="font-medium text-gray-900 dark:text-white">{team.player1.alias}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {team.player1.firstName} {team.player1.lastName}
            </p>
            <p className="text-xs text-gray-400">{team.player1.email}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded">
            <h3 className="font-medium text-gray-900 dark:text-white">{team.player2.alias}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {team.player2.firstName} {team.player2.lastName}
            </p>
            <p className="text-xs text-gray-400">{team.player2.email}</p>
          </div>
        </div>
        <div className="mt-4 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{team.tournamentTeams.length} torneos</span>
          <span>{team.matchesWon.length} victorias</span>
        </div>
      </div>

      {team.tournamentTeams.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Torneos</h2>
          <ul className="space-y-2">
            {team.tournamentTeams.map((tt) => (
              <li key={tt.id}>
                <Link
                  href={`/tournaments/${tt.tournament.id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <p className="font-medium text-gray-900 dark:text-white">{tt.tournament.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {tt.tournament.status}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
