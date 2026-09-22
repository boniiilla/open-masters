'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface User { id: string; firstName: string; lastName: string; alias: string; email: string }
interface Tournament { id: string; name: string; status: string; hasGroupStage: boolean; knockoutFormat: string; modality: string }
interface TournamentTeam { id: string; tournament: Tournament }
interface Team {
  id: string; name: string | null
  player1: User; player2: User
  tournamentTeams: TournamentTeam[]; matchesWon: { id: string }[]
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

export default function TeamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchTeam() }, [id])

  async function fetchTeam() {
    const response = await fetch(`/api/teams/${id}`)
    const data = await response.json()
    if (data.success) setTeam(data.data)
    setLoading(false)
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

  if (!team) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-5">
        <p style={{ color: '#666688' }}>Pareja no encontrada</p>
        <Link href="/teams" style={{ padding: '8px 20px', borderRadius: 9999, background: '#3b5bff', color: '#fff', textDecoration: 'none', fontSize: 13.5, fontWeight: 600 }}>
          Volver
        </Link>
      </div>
    )
  }

  const teamLabel = team.name || `${team.player1.alias} & ${team.player2.alias}`

  return (
    <div className="animate-fade-in px-5 md:px-0" style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 8, marginBottom: 24 }}>
        <Link href="/teams" style={{
          width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
          transition: 'background 130ms', flexShrink: 0,
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.12)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)'}
        >
          <Icon d="M15 19l-7-7 7-7" size={16} sw={2} color="#9090b0" />
        </Link>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-.025em', color: '#fff', lineHeight: 1 }}>{teamLabel}</h1>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10.5, fontWeight: 500, padding: '4px 12px', borderRadius: 9999, background: 'rgba(130,100,255,.12)', color: '#b0a0ff' }}>
          {team.tournamentTeams.length} torneos
        </span>
        <span style={{ fontSize: 10.5, fontWeight: 500, padding: '4px 12px', borderRadius: 9999, background: 'rgba(50,210,120,.12)', color: '#46d68a' }}>
          {team.matchesWon.length} victorias
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10, marginBottom: 14 }}>
        {[{ player: team.player1, label: 'Jugador 1', color: '#3b5bff' }, { player: team.player2, label: 'Jugador 2', color: '#8040ff' }].map(({ player, label, color }) => (
          <div key={player.id} style={{ background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 16, padding: '16px 18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 10 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', background: color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#fff', fontSize: 12, flexShrink: 0,
              }}>
                {player.alias.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 500, color: '#666688', letterSpacing: '.04em', marginBottom: 1 }}>{label.toUpperCase()}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{player.alias}</div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: '#666688', marginBottom: 3 }}>{player.firstName} {player.lastName}</div>
            <div style={{ fontSize: 11.5, color: '#444460' }}>{player.email}</div>
          </div>
        ))}
      </div>

      {team.tournamentTeams.length > 0 && (
        <div style={{ background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 18, padding: '18px 20px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Torneos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {team.tournamentTeams.map(tt => {
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
