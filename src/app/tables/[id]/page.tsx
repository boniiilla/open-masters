'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface Tournament {
  id: string
  name: string
  status: string
}

interface TournamentTable {
  id: string
  tournament: Tournament
}

interface Table {
  id: string
  name: string
  location: string | null
  isAvailable: boolean
  tournamentTables: TournamentTable[]
  matches: { id: string }[]
}

export default function TableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [table, setTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTable()
  }, [id])

  async function fetchTable() {
    const response = await fetch(`/api/tables/${id}`)
    const data = await response.json()
    if (data.success) {
      setTable(data.data)
    }
    setLoading(false)
  }

  async function toggleAvailability() {
    if (!table) return
    await fetch(`/api/tables/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !table.isAvailable }),
    })
    fetchTable()
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  if (!table) {
    return <div className="text-center py-8">Mesa no encontrada</div>
  }

  return (
    <div>
      <Link href="/tables" className="text-primary-600 hover:text-primary-500 text-sm mb-4 inline-block">
        &larr; Volver a mesas
      </Link>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{table.name}</h1>
            {table.location && (
              <p className="text-gray-500 dark:text-gray-400 mt-1">{table.location}</p>
            )}
            <div className="mt-4 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{table.matches.length} partidos jugados</span>
              <span>{table.tournamentTables.length} torneos</span>
            </div>
          </div>
          <button
            onClick={toggleAvailability}
            className={`px-3 py-1 rounded text-sm ${
              table.isAvailable
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}
          >
            {table.isAvailable ? 'Disponible' : 'No disponible'}
          </button>
        </div>
      </div>

      {table.tournamentTables.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Torneos asignados</h2>
          <ul className="space-y-2">
            {table.tournamentTables.map((tt) => (
              <li key={tt.id}>
                <Link
                  href={`/tournaments/${tt.tournament.id}`}
                  className="block p-3 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <p className="font-medium text-gray-900 dark:text-white">{tt.tournament.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{tt.tournament.status}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
