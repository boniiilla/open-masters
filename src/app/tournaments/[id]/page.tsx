'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { MODALITY_LABELS, STATUS_LABELS, MATCH_STATUS_LABELS, getTournamentFormatDescription, KnockoutFormat } from '@/types'

interface User { id: string; firstName: string; lastName: string; alias: string }
interface Team { id: string; name: string | null; player1: User; player2: User }
interface TournamentTeam { id: string; teamId: string; seedNumber: number | null; isEliminated: boolean; team: Team }
interface Table { id: string; name: string; location: string | null }
interface TournamentTable { id: string; table: Table }
interface Match {
  id: string; matchNumber: number; status: keyof typeof MATCH_STATUS_LABELS
  team1Score: number | null; team2Score: number | null
  team1: Team | null; team2: Team | null; winner: Team | null; table: Table | null
}
interface Round { id: string; roundNumber: number; name: string | null; isLosersBracket: boolean; matches: Match[] }
interface Creator { id: string; firstName: string; lastName: string; alias: string }
interface Tournament {
  id: string; name: string; description: string
  hasGroupStage: boolean; knockoutFormat: KnockoutFormat
  teamsPerGroup: number | null; teamsAdvancing: number | null
  modality: keyof typeof MODALITY_LABELS; status: keyof typeof STATUS_LABELS
  maxTeams: number | null; locationName: string | null; locationAddress: string | null
  latitude: number | null; longitude: number | null
  photo: string | null; startDate: string | null
  creator: Creator; teams: TournamentTeam[]; tables: TournamentTable[]; rounds: Round[]
}

function Icon({ d, size = 16, sw = 1.8, color }: { d: string | string[]; size?: number; sw?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  )
}

const STATUS_CFG: Record<string, { label: string; bg: string; color: string; dotColor: string }> = {
  DRAFT:       { label: 'Borrador',    bg: 'rgba(140,140,180,.13)', color: '#9090b8', dotColor: '#9090b8' },
  OPEN:        { label: 'Abierto',     bg: 'rgba(50,210,120,.13)',  color: '#46d68a', dotColor: '#46d68a' },
  IN_PROGRESS: { label: 'En Progreso', bg: 'rgba(255,165,50,.13)',  color: '#ffa530', dotColor: '#ffa530' },
  FINISHED:    { label: 'Finalizado',  bg: 'rgba(100,160,255,.13)', color: '#82b0ff', dotColor: '#82b0ff' },
  CANCELLED:   { label: 'Parado',      bg: 'rgba(140,140,180,.13)', color: '#9090b8', dotColor: '#9090b8' },
}

const MATCH_STATUS_CFG: Record<string, { bg: string; color: string }> = {
  PENDING:     { bg: 'rgba(140,140,180,.13)', color: '#9090b8' },
  IN_PROGRESS: { bg: 'rgba(255,165,50,.13)',  color: '#ffa530' },
  FINISHED:    { bg: 'rgba(50,210,120,.13)',  color: '#46d68a' },
}

function TeamAvatar({ alias, color = '#3b5bff' }: { alias: string; color?: string }) {
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%', background: color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, color: '#fff', fontSize: 10, flexShrink: 0,
    }}>
      {alias.slice(0, 2).toUpperCase()}
    </div>
  )
}

export default function TournamentDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: session } = useSession()
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [allTeams, setAllTeams] = useState<Team[]>([])
  const [allTables, setAllTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddTeam, setShowAddTeam] = useState(false)
  const [showAddTable, setShowAddTable] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'teams' | 'rounds'>('info')

  const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPERADMIN'

  useEffect(() => {
    fetchTournament()
    fetchAllTeams()
    fetchAllTables()
  }, [id])

  async function fetchTournament() {
    const r = await fetch(`/api/tournaments/${id}`)
    const d = await r.json()
    if (d.success) setTournament(d.data)
    setLoading(false)
  }
  async function fetchAllTeams() {
    const r = await fetch('/api/teams')
    const d = await r.json()
    if (d.success) setAllTeams(d.data)
  }
  async function fetchAllTables() {
    const r = await fetch('/api/tables?available=true')
    const d = await r.json()
    if (d.success) setAllTables(d.data)
  }
  async function addTeam(teamId: string) {
    await fetch(`/api/tournaments/${id}/teams`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teamId }) })
    fetchTournament(); setShowAddTeam(false)
  }
  async function removeTeam(teamId: string) {
    await fetch(`/api/tournaments/${id}/teams?teamId=${teamId}`, { method: 'DELETE' })
    fetchTournament()
  }
  async function addTable(tableId: string) {
    await fetch(`/api/tournaments/${id}/tables`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tableId }) })
    fetchTournament(); setShowAddTable(false)
  }
  async function updateStatus(status: string) {
    await fetch(`/api/tournaments/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    fetchTournament()
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

  if (!tournament) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-5">
        <p style={{ color: '#666688' }}>Torneo no encontrado</p>
        <Link href="/" style={{ padding: '8px 20px', borderRadius: 9999, background: '#3b5bff', color: '#fff', textDecoration: 'none', fontSize: 13.5, fontWeight: 600 }}>Volver</Link>
      </div>
    )
  }

  const cfg = STATUS_CFG[tournament.status] || STATUS_CFG.DRAFT
  const enrolledTeamIds = tournament.teams.map(t => t.teamId)
  const availableTeams = allTeams.filter(t => !enrolledTeamIds.includes(t.id))
  const assignedTableIds = tournament.tables.map(t => t.table.id)
  const availableTables = allTables.filter(t => !assignedTableIds.includes(t.id))

  const myTeam = session ? tournament.teams.find(tt =>
    tt.team.player1.id === session.user.id || tt.team.player2.id === session.user.id
  )?.team : null

  const googleMapsUrl = tournament.latitude && tournament.longitude
    ? `https://www.google.com/maps?q=${tournament.latitude},${tournament.longitude}`
    : tournament.locationAddress
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tournament.locationAddress)}`
    : null
  const googleMapsEmbedUrl = tournament.latitude && tournament.longitude
    ? `https://maps.google.com/maps?q=${tournament.latitude},${tournament.longitude}&t=&z=15&ie=UTF8&iwloc=&output=embed`
    : null

  const selStyle: React.CSSProperties = {
    width: '100%', background: '#191926', border: '1px solid #252540',
    borderRadius: 11, padding: '10px 14px', fontFamily: 'inherit',
    fontSize: 13.5, color: '#e0e0f0', outline: 'none', cursor: 'pointer',
  }

  const TABS = [
    { k: 'info' as const, l: 'Info' },
    { k: 'teams' as const, l: `Equipos (${tournament.teams.length})` },
    ...(tournament.rounds.length > 0 ? [{ k: 'rounds' as const, l: 'Rondas' }] : []),
  ]

  return (
    <div className="animate-fade-in" style={{ paddingBottom: 48 }}>
      {/* ── HERO ── */}
      <div style={{ position: 'relative', marginBottom: 0 }}>
        {/* Image / gradient */}
        <div style={{
          height: 260, position: 'relative', overflow: 'hidden',
          background: tournament.photo ? undefined : 'radial-gradient(ellipse at 30% 40%, #1a1060 0%, #0a0a18 100%)',
        }}>
          {tournament.photo && (
            <img src={tournament.photo} alt={tournament.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          {/* overlay gradient */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,.15) 0%, rgba(5,5,15,.92) 100%)' }} />
          {/* dot grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px,rgba(255,255,255,.03) 1px,transparent 0)', backgroundSize: '24px 24px' }} />
        </div>

        {/* Back button */}
        <div className="px-5 md:px-0" style={{ position: 'absolute', top: 16, left: 0, right: 0, maxWidth: 768, margin: '0 auto' }}>
          <Link href="/" style={{
            width: 36, height: 36, borderRadius: '50%', background: 'rgba(0,0,0,.45)',
            backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,.1)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
          }}>
            <Icon d="M15 19l-7-7 7-7" size={16} sw={2} color="#fff" />
          </Link>
        </div>

        {/* Hero content overlaying bottom of image */}
        <div className="px-5 md:px-0" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          <div style={{ maxWidth: 768, margin: '0 auto', paddingBottom: 20 }}>
            {/* Status pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 700, letterSpacing: '.05em',
                padding: '4px 12px', borderRadius: 9999,
                background: cfg.bg, color: cfg.color,
                backdropFilter: 'blur(4px)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dotColor, display: 'inline-block' }} />
                {cfg.label.toUpperCase()}
              </span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: '#fff', lineHeight: 1.1, letterSpacing: '-.02em', marginBottom: 8, textShadow: '0 2px 12px rgba(0,0,0,.5)' }}>
              {tournament.name}
            </h1>
            {/* Creator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'rgba(255,255,255,.6)' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#3b5bff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', fontSize: 8 }}>
                {(tournament.creator.alias).slice(0, 2).toUpperCase()}
              </div>
              Organizado por <span style={{ color: 'rgba(255,255,255,.85)', fontWeight: 600 }}>{tournament.creator.alias}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS BAR ── */}
      <div className="px-5 md:px-0" style={{ maxWidth: 768, margin: '0 auto' }}>
        {/* Mi equipo banner */}
        {myTeam && (
          <div style={{
            margin: '14px 0 0', padding: '11px 16px', borderRadius: 14,
            background: 'rgba(59,91,255,.12)', border: '1px solid rgba(59,91,255,.3)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon d={['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M9 3a4 4 0 100 8 4 4 0 000-8z']} size={15} sw={2} color="#7090ff" />
            <span style={{ fontSize: 13, color: '#7090ff', fontWeight: 600 }}>
              Tu equipo: {myTeam.name || `${myTeam.player1.alias} & ${myTeam.player2.alias}`}
            </span>
          </div>
        )}

        {/* Quick stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(120px,1fr))', gap: 10, margin: '14px 0 0' }}>
          {[
            {
              icon: ['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M9 3a4 4 0 100 8 4 4 0 000-8z','M23 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75'],
              val: `${tournament.teams.length}${tournament.maxTeams ? `/${tournament.maxTeams}` : ''}`,
              label: 'Equipos',
              color: '#7090ff',
            },
            {
              icon: ['M8 21h8','M12 17v4','M7 4h10l-1 9.5a5 5 0 01-8 0L7 4z','M5 7H3a2 2 0 000 4h2.3','M19 7h2a2 2 0 010 4h-2.3'],
              val: getTournamentFormatDescription(tournament.hasGroupStage, tournament.knockoutFormat),
              label: 'Formato',
              color: '#b0a0ff',
            },
            {
              icon: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z'],
              val: MODALITY_LABELS[tournament.modality],
              label: 'Modalidad',
              color: '#46d68a',
            },
            ...(tournament.locationName ? [{
              icon: ['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z','M12 7a3 3 0 100 6 3 3 0 000-6z'],
              val: tournament.locationName,
              label: 'Ubicación',
              color: '#ffa530',
            }] : []),
            ...(tournament.startDate ? [{
              icon: ['M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'],
              val: new Date(tournament.startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
              label: 'Fecha',
              color: '#82b0ff',
            }] : []),
          ].map(({ icon, val, label, color }) => (
            <div key={label} style={{ background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 14, padding: '12px 14px' }}>
              <Icon d={icon} size={15} sw={1.8} color={color} />
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e0e0f0', marginTop: 7, marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{val}</div>
              <div style={{ fontSize: 10.5, color: '#555575' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Admin actions */}
        {isAdmin && (tournament.status === 'DRAFT' || tournament.status === 'OPEN') && (
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {tournament.status === 'DRAFT' && (
              <button onClick={() => updateStatus('OPEN')} style={{
                padding: '9px 20px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                background: 'rgba(50,210,120,.15)', color: '#46d68a', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                transition: 'background 140ms',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(50,210,120,.28)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(50,210,120,.15)'}
              >
                Abrir inscripciones
              </button>
            )}
            {tournament.status === 'OPEN' && (
              <button onClick={() => updateStatus('IN_PROGRESS')} style={{
                padding: '9px 20px', borderRadius: 9999, border: 'none', cursor: 'pointer',
                background: 'rgba(59,91,255,.2)', color: '#7090ff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
                transition: 'background 140ms',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,91,255,.38)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(59,91,255,.2)'}
              >
                Iniciar torneo
              </button>
            )}
          </div>
        )}

        {/* Description */}
        <div style={{ background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 16, padding: '16px 18px', marginTop: 14 }}>
          <p style={{ fontSize: 14, color: '#8888aa', lineHeight: 1.65 }}>{tournament.description}</p>
          {tournament.hasGroupStage && (
            <p style={{ fontSize: 12.5, color: '#555575', marginTop: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" size={13} color="#555575" sw={1.8} />
              {tournament.teamsPerGroup} equipos por grupo · {tournament.teamsAdvancing} avanzan a eliminatoria
            </p>
          )}
        </div>

        {/* ── TABS ── */}
        <div style={{ display: 'flex', gap: 4, marginTop: 20, background: '#0d0d1a', borderRadius: 12, padding: 4 }}>
          {TABS.map(t => (
            <button key={t.k} onClick={() => setActiveTab(t.k)} style={{
              flex: 1, padding: '8px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600,
              background: activeTab === t.k ? '#1a1a2e' : 'transparent',
              color: activeTab === t.k ? '#fff' : '#555575',
              transition: 'all 150ms',
              boxShadow: activeTab === t.k ? '0 2px 8px rgba(0,0,0,.4)' : 'none',
            }}>
              {t.l}
            </button>
          ))}
        </div>

        {/* ── TAB: INFO ── */}
        {activeTab === 'info' && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Location map */}
            {(tournament.locationName || tournament.locationAddress || googleMapsEmbedUrl) && (
              <div style={{ background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 16, padding: '16px 18px' }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon d={['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z','M12 7a3 3 0 100 6 3 3 0 000-6z']} size={14} sw={2} color="#ffa530" />
                  Ubicación
                </h3>
                {tournament.locationName && <p style={{ fontSize: 14, fontWeight: 600, color: '#e0e0f0', marginBottom: 3 }}>{tournament.locationName}</p>}
                {tournament.locationAddress && <p style={{ fontSize: 12.5, color: '#666688', marginBottom: 10 }}>{tournament.locationAddress}</p>}
                {googleMapsUrl && (
                  <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13,
                    color: '#7090ff', textDecoration: 'none', marginBottom: googleMapsEmbedUrl ? 12 : 0,
                  }}>
                    <Icon d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" size={13} sw={2} color="#7090ff" />
                    Abrir en Google Maps
                  </a>
                )}
                {googleMapsEmbedUrl && (
                  <div style={{ height: 180, borderRadius: 12, overflow: 'hidden' }}>
                    <iframe src={googleMapsEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                  </div>
                )}
              </div>
            )}

            {/* Tables */}
            <div style={{ background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 16, padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Icon d={['M4 6h16','M4 10h16','M4 14h16','M4 18h16']} size={14} sw={2} color="#82b0ff" />
                  Mesas ({tournament.tables.length})
                </h3>
                {isAdmin && (
                  <button onClick={() => setShowAddTable(v => !v)} style={{ fontSize: 12, color: showAddTable ? '#666688' : '#7090ff', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
                    {showAddTable ? 'Cancelar' : '+ Añadir'}
                  </button>
                )}
              </div>
              {showAddTable && (
                <div style={{ marginBottom: 10 }}>
                  <select onChange={e => e.target.value && addTable(e.target.value)} defaultValue="" style={selStyle}>
                    <option value="">Seleccionar mesa</option>
                    {availableTables.map(t => <option key={t.id} value={t.id} style={{ background: '#191926' }}>{t.name}{t.location ? ` (${t.location})` : ''}</option>)}
                  </select>
                </div>
              )}
              {tournament.tables.length === 0 ? (
                <p style={{ fontSize: 13, color: '#444460' }}>No hay mesas asignadas</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {tournament.tables.map(tt => (
                    <div key={tt.id} style={{ padding: '9px 12px', borderRadius: 10, background: 'rgba(255,255,255,.03)', border: '1px solid #1e1e32', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon d={['M4 6h16','M4 10h16','M4 14h16','M4 18h16']} size={13} sw={1.8} color="#555575" />
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e0f0' }}>{tt.table.name}</div>
                        {tt.table.location && <div style={{ fontSize: 11, color: '#555575' }}>{tt.table.location}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: TEAMS ── */}
        {activeTab === 'teams' && (
          <div style={{ marginTop: 14 }}>
            {isAdmin && (tournament.status === 'DRAFT' || tournament.status === 'OPEN') && (
              <div style={{ marginBottom: 14 }}>
                {showAddTeam ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <select onChange={e => e.target.value && addTeam(e.target.value)} defaultValue="" style={selStyle}>
                      <option value="">Seleccionar equipo para añadir</option>
                      {availableTeams.map(team => (
                        <option key={team.id} value={team.id} style={{ background: '#191926' }}>
                          {team.name || `${team.player1.alias} & ${team.player2.alias}`}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => setShowAddTeam(false)} style={{
                      padding: '9px', borderRadius: 9999, border: '1px solid #2a2a42',
                      background: 'transparent', color: '#9090b0', fontFamily: 'inherit', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}>Cancelar</button>
                  </div>
                ) : (
                  <button onClick={() => setShowAddTeam(true)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%',
                    padding: '10px', borderRadius: 9999, border: '1px dashed #2a2a42',
                    background: 'transparent', color: '#7090ff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                    transition: 'border-color 140ms,background 140ms',
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#3b5bff'; (e.currentTarget as HTMLElement).style.background = 'rgba(59,91,255,.06)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2a2a42'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                  >
                    <Icon d={['M12 5v14','M5 12h14']} size={14} sw={2.5} />
                    Añadir equipo
                  </button>
                )}
              </div>
            )}

            {tournament.teams.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 20px', gap: 10, color: '#444460', textAlign: 'center' }}>
                <Icon d={['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M9 3a4 4 0 100 8 4 4 0 000-8z','M23 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75']} size={36} sw={1} color="#333348" />
                <p style={{ fontSize: 14 }}>No hay equipos inscritos</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                {tournament.teams.map((tt, idx) => {
                  const isMyTeam = myTeam?.id === tt.team.id
                  return (
                    <div key={tt.id} style={{
                      background: isMyTeam ? 'rgba(59,91,255,.08)' : '#10101a',
                      border: `1px solid ${isMyTeam ? 'rgba(59,91,255,.35)' : '#1a1a2a'}`,
                      borderRadius: 14, padding: '13px 16px',
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#555575', flexShrink: 0 }}>
                        {idx + 1}
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <TeamAvatar alias={tt.team.player1.alias} color="#3b5bff" />
                        <TeamAvatar alias={tt.team.player2.alias} color="#8040ff" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700, color: isMyTeam ? '#7090ff' : '#e0e0f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {tt.team.name || `${tt.team.player1.alias} & ${tt.team.player2.alias}`}
                        </div>
                        <div style={{ fontSize: 11.5, color: '#555575', marginTop: 1 }}>
                          {tt.team.player1.firstName} · {tt.team.player2.firstName}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        {isMyTeam && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 9999, background: 'rgba(59,91,255,.2)', color: '#7090ff' }}>
                            TU EQUIPO
                          </span>
                        )}
                        {tt.isEliminated && (
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 9999, background: 'rgba(255,60,60,.12)', color: '#ff5555' }}>
                            ELIMINADO
                          </span>
                        )}
                        {isAdmin && (tournament.status === 'DRAFT' || tournament.status === 'OPEN') && (
                          <button onClick={() => removeTeam(tt.teamId)} style={{
                            fontSize: 11, color: '#ff5555', background: 'none', border: 'none', cursor: 'pointer',
                            fontFamily: 'inherit', fontWeight: 600, padding: '4px 8px', borderRadius: 7,
                            transition: 'background 130ms',
                          }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,50,50,.12)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                          >
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB: ROUNDS ── */}
        {activeTab === 'rounds' && tournament.rounds.length > 0 && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 18 }}>
            {tournament.rounds.map(round => (
              <div key={round.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{ height: 1, flex: 1, background: '#1a1a2a' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#555575', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>
                    {(round.name || `RONDA ${round.roundNumber}`).toUpperCase()}
                    {round.isLosersBracket ? ' · REPESCA' : ''}
                  </span>
                  <div style={{ height: 1, flex: 1, background: '#1a1a2a' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {round.matches.map(match => {
                    const mstatus = MATCH_STATUS_CFG[match.status] || MATCH_STATUS_CFG.PENDING
                    const isFinished = match.status === 'FINISHED'
                    return (
                      <div key={match.id} style={{
                        background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 14,
                        padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10,
                      }}>
                        {/* Team 1 */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            {match.team1 && <TeamAvatar alias={match.team1.player1.alias} color={match.winner?.id === match.team1.id ? '#46d68a' : '#3b5bff'} />}
                            <span style={{
                              fontSize: 13, fontWeight: 600, color: match.winner?.id === match.team1?.id ? '#46d68a' : '#e0e0f0',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {match.team1 ? (match.team1.name || `${match.team1.player1.alias} & ${match.team1.player2.alias}`) : 'TBD'}
                            </span>
                          </div>
                        </div>

                        {/* Score / status */}
                        <div style={{ flexShrink: 0, textAlign: 'center', minWidth: 64 }}>
                          {isFinished ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 18, fontWeight: 900, color: match.team1Score! > match.team2Score! ? '#fff' : '#555575' }}>
                                {match.team1Score}
                              </span>
                              <span style={{ fontSize: 12, color: '#333348' }}>—</span>
                              <span style={{ fontSize: 18, fontWeight: 900, color: match.team2Score! > match.team1Score! ? '#fff' : '#555575' }}>
                                {match.team2Score}
                              </span>
                            </div>
                          ) : (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 9999, background: mstatus.bg, color: mstatus.color }}>
                              {MATCH_STATUS_LABELS[match.status]}
                            </span>
                          )}
                          {match.table && (
                            <div style={{ fontSize: 10, color: '#333348', marginTop: 3 }}>{match.table.name}</div>
                          )}
                        </div>

                        {/* Team 2 */}
                        <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 7 }}>
                            <span style={{
                              fontSize: 13, fontWeight: 600, color: match.winner?.id === match.team2?.id ? '#46d68a' : '#e0e0f0',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {match.team2 ? (match.team2.name || `${match.team2.player1.alias} & ${match.team2.player2.alias}`) : 'TBD'}
                            </span>
                            {match.team2 && <TeamAvatar alias={match.team2.player1.alias} color={match.winner?.id === match.team2.id ? '#46d68a' : '#8040ff'} />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
