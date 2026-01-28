'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Table {
  id: string
  name: string
  location: string | null
  isAvailable: boolean
  _count: { matches: number; tournamentTables: number }
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchTables()
  }, [])

  async function fetchTables() {
    const response = await fetch('/api/tables')
    const data = await response.json()
    if (data.success) {
      setTables(data.data)
    }
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.currentTarget)

    const response = await fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        location: formData.get('location') || undefined,
      }),
    })

    const data = await response.json()
    if (data.success) {
      setShowForm(false)
      fetchTables()
    } else {
      setError(data.error)
    }
  }

  async function toggleAvailability(table: Table) {
    await fetch(`/api/tables/${table.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAvailable: !table.isAvailable }),
    })
    fetchTables()
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
            Mesas
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
              Crear Mesa
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
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    placeholder="Ej: Mesa 1, Futbolín Principal"
                    className="ios-input p-0"
                  />
                </div>
                <div className="ios-list-item flex-col items-start">
                  <label className="text-[13px] text-[rgb(var(--ios-label-secondary))] mb-1">
                    Ubicación (opcional)
                  </label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Ej: Sala principal, Bar"
                    className="ios-input p-0"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="ios-button-primary ios-press"
              >
                Crear Mesa
              </button>
            </form>
          </div>
        )}

        {/* Table List */}
        {tables.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-[rgb(var(--ios-label-tertiary))] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <p className="text-[17px] text-[rgb(var(--ios-label-secondary))]">
              No hay mesas creadas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tables.map((table) => (
              <div
                key={table.id}
                className="ios-card-grouped ios-animate-in"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <Link href={`/tables/${table.id}`} className="flex-1 ios-press">
                      <h3 className="font-semibold text-[17px] text-[rgb(var(--ios-label-primary))]">
                        {table.name}
                      </h3>
                      {table.location && (
                        <p className="text-[15px] text-[rgb(var(--ios-label-secondary))] mt-1">
                          {table.location}
                        </p>
                      )}
                    </Link>
                    <label className="ios-switch ml-4">
                      <input
                        type="checkbox"
                        checked={table.isAvailable}
                        onChange={() => toggleAvailability(table)}
                      />
                      <span className="ios-switch-slider"></span>
                    </label>
                  </div>
                  <div className="flex gap-3">
                    <span className={table.isAvailable ? 'ios-badge-green' : 'ios-badge-red'}>
                      {table.isAvailable ? 'Disponible' : 'No disponible'}
                    </span>
                    <span className="ios-badge-gray">
                      {table._count.matches} partidos
                    </span>
                    <span className="ios-badge-blue">
                      {table._count.tournamentTables} torneos
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
