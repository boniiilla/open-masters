'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface Tournament { id: string; name: string; status: string }
interface TournamentTable { id: string; tournament: Tournament }
interface Table {
  id: string; name: string; location: string | null; isAvailable: boolean
  tournamentTables: TournamentTable[]; matches: { id: string }[]
}

function Icon({ d, size = 16, sw = 1.8, color }: { d: string | string[]; size?: number; sw?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  )
}

const STATUS_MAP: Record<string, { bg: string; color: string; label: string }> = {
  DRAFT:       { bg: 'rgba(140,140,180,.13)', color: '#9090b8', label: 'Borrador' },
  OPEN:        { bg: 'rgba(50,210,120,.13)',  color: '#46d68a', label: 'Abierto' },
  IN_PROGRESS: { bg: 'rgba(255,165,50,.13)',  color: '#ffa530', label: 'En Progreso' },
  FINISHED:    { bg: 'rgba(100,160,255,.13)', color: '#82b0ff', label: 'Finalizado' },
  CANCELLED:   { bg: 'rgba(140,140,180,.13)', color: '#9090b8', label: 'Parado' },
}

export default function TableDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [table, setTable] = useState<Table | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTable() }, [id])

  async function fetchTable() {
    const response = await fetch(`/api/tables/${id}`)
    const data = await response.json()
    if (data.success) setTable(data.data)
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

  if (!table) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-5">
        <p style={{ color: '#666688' }}>Mesa no encontrada</p>
        <Link href="/tables" style={{ padding: '8px 20px', borderRadius: 9999, background: '#3b5bff', color: '#fff', textDecoration: 'none', fontSize: 13.5, fontWeight: 600 }}>
          Volver
        </Link>
      </div>
    )
  }

  return (
    <div className="animate-fade-in px-5 md:px-0" style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, marginBottom: 24 }}>
        <Link href="/tables" style={{
          width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
          transition: 'background 130ms', flexShrink: 0,
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.12)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)'}
        >
          <Icon d="M15 19l-7-7 7-7" size={16} sw={2} color="#9090b0" />
        </Link>
        <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.025em', color: '#fff', lineHeight: 1 }}>{table.name}</h1>
      </div>

      <div style={{ background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 18, padding: '18px 20px', marginBottom: 14 }}>
        {table.location && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13.5, color: '#666688', marginBottom: 14 }}>
            <Icon d={['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z','M12 7a3 3 0 100 6 3 3 0 000-6z']} size={14} sw={1.8} color="#555575" />
            {table.location}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10.5, fontWeight: 500, padding: '4px 12px', borderRadius: 9999, background: 'rgba(100,160,255,.12)', color: '#82b0ff' }}>
              {table.matches.length} partidos
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 500, padding: '4px 12px', borderRadius: 9999, background: 'rgba(130,100,255,.12)', color: '#b0a0ff' }}>
              {table.tournamentTables.length} torneos
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 9999,
              background: table.isAvailable ? 'rgba(50,210,120,.13)' : 'rgba(255,60,60,.12)',
              color: table.isAvailable ? '#46d68a' : '#ff5555',
            }}>
              {table.isAvailable ? 'Disponible' : 'No disponible'}
            </span>
            <button onClick={toggleAvailability} style={{
              width: 42, height: 24, borderRadius: 9999, border: 'none', cursor: 'pointer',
              background: table.isAvailable ? '#3b5bff' : 'rgba(255,255,255,.1)',
              position: 'relative', transition: 'background 200ms', flexShrink: 0,
            }}>
              <span style={{
                position: 'absolute', top: 3, left: table.isAvailable ? 20 : 3,
                width: 18, height: 18, borderRadius: '50%', background: '#fff',
                transition: 'left 200ms', display: 'block',
              }} />
            </button>
          </div>
        </div>
      </div>

      {table.tournamentTables.length > 0 && (
        <div style={{ background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 18, padding: '18px 20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Torneos asignados</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {table.tournamentTables.map(tt => {
              const cfg = STATUS_MAP[tt.tournament.status] || STATUS_MAP.DRAFT
              return (
                <Link key={tt.id} href={`/tournaments/${tt.tournament.id}`} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '11px 14px', borderRadius: 12, background: 'rgba(255,255,255,.03)',
                  border: '1px solid #1e1e32', textDecoration: 'none',
                  transition: 'background 130ms',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.07)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.03)'}
                >
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: '#e0e0f0' }}>{tt.tournament.name}</span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 9px', borderRadius: 9999, background: cfg.bg, color: cfg.color, flexShrink: 0 }}>
                    {cfg.label}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
