'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MODALITY_LABELS, getTournamentFormatDescription, KnockoutFormat } from '@/types'

interface Player { id: string; firstName: string; lastName: string; alias: string }
interface Team { id: string; name: string | null; player1: Player; player2: Player }
interface TournamentTeam { team: Team }
interface Creator { id: string; firstName: string; lastName: string; alias: string }
interface Tournament {
  id: string; name: string; description: string
  hasGroupStage: boolean; knockoutFormat: KnockoutFormat
  modality: keyof typeof MODALITY_LABELS
  status: string
  maxTeams: number | null; locationName: string | null
  photo: string | null; startDate: string | null
  creator: Creator; teams: TournamentTeam[]
  _count: { teams: number; rounds: number }
}

function Icon({ d, size = 16, sw = 1.8, color }: { d: string | string[]; size?: number; sw?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  )
}

const STATUS_CFG: Record<string, { label: string; badgeBg: string; badgeColor: string }> = {
  OPEN:        { label: 'Abierto',     badgeBg: 'rgba(50,210,120,.13)',  badgeColor: '#46d68a' },
  IN_PROGRESS: { label: 'En Progreso', badgeBg: 'rgba(255,165,50,.13)',  badgeColor: '#ffa530' },
  FINISHED:    { label: 'Finalizado',  badgeBg: 'rgba(100,160,255,.13)', badgeColor: '#82b0ff' },
  CANCELLED:   { label: 'Parado',      badgeBg: 'rgba(140,140,180,.13)', badgeColor: '#9090b8' },
  DRAFT:       { label: 'Borrador',    badgeBg: 'rgba(140,140,180,.13)', badgeColor: '#9090b8' },
}

const TABS = [
  { k: 'all', l: 'Todos' },
  { k: 'OPEN', l: 'Abiertos' },
  { k: 'IN_PROGRESS', l: 'En Progreso' },
  { k: 'FINISHED', l: 'Finalizados' },
]

export default function MyPlayerPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [tab, setTab] = useState('all')

  useEffect(() => {
    if (!session) { router.push('/auth/login'); return }
    fetchMyTournaments()
  }, [session])

  async function fetchMyTournaments() {
    if (!session?.user?.id) return
    const response = await fetch('/api/tournaments')
    const data = await response.json()
    if (data.success) {
      const mine = data.data.filter((t: Tournament) =>
        t.teams.some((tt: TournamentTeam) =>
          tt.team.player1.id === session.user.id || tt.team.player2.id === session.user.id
        )
      )
      mine.sort((a: Tournament, b: Tournament) => {
        if (!a.startDate) return 1
        if (!b.startDate) return -1
        return new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      })
      setTournaments(mine)
    }
    setLoading(false)
  }

  if (!session) return null

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

  const visible = tournaments.filter(t =>
    (tab === 'all' || t.status === tab) &&
    (!q || t.name.toLowerCase().includes(q.toLowerCase()) || t.description.toLowerCase().includes(q.toLowerCase()))
  )

  const activeCount = tournaments.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length

  return (
    <div className="animate-fade-in px-5 md:px-0" style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, paddingTop: 8 }}>
        <div>
          <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.025em', color: '#fff', lineHeight: 1 }}>Mi Player</h1>
          <p style={{ fontSize: 13, color: '#666688', marginTop: 5 }}>Torneos en los que estás inscrito</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {[{ v: tournaments.length, l: 'Inscritos' }, { v: activeCount, l: 'Activos' }].map(({ v, l }) => (
            <div key={l} style={{ background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 14, padding: '10px 16px', textAlign: 'center', minWidth: 64 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#7090ff' }}>{v}</div>
              <div style={{ fontSize: 10.5, color: '#555575', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 18 }}>
        <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#44446a', pointerEvents: 'none' }}>
          <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" size={16} sw={2} />
        </span>
        <input
          type="text" placeholder="Buscar torneos..." value={q}
          onChange={e => setQ(e.target.value)}
          style={{
            width: '100%', height: 44, background: '#111118', border: '1px solid #1e1e2e',
            borderRadius: 9999, padding: '0 16px 0 43px', fontFamily: 'inherit',
            fontSize: 13.5, color: '#e0e0f0', outline: 'none',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 7, marginBottom: 22, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            padding: '6px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            background: tab === t.k ? '#3b5bff' : 'transparent',
            color: tab === t.k ? '#fff' : '#666688',
            boxShadow: tab === t.k ? '0 4px 14px rgba(59,91,255,.38)' : 'none',
            transition: 'all 140ms',
          }}>
            {t.l}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12, color: '#444460', textAlign: 'center' }}>
          <Icon d={['M8 21h8','M12 17v4','M7 4h10l-1 9.5a5 5 0 01-8 0L7 4z','M5 7H3a2 2 0 000 4h2.3','M19 7h2a2 2 0 010 4h-2.3']} size={44} sw={1} color="#333348" />
          <p style={{ fontSize: 15 }}>
            {q || tab !== 'all' ? 'No hay torneos que coincidan' : 'No estás inscrito en ningún torneo todavía'}
          </p>
          {tab === 'all' && !q && (
            <Link href="/" style={{
              marginTop: 4, padding: '9px 22px', borderRadius: 9999, border: 'none',
              background: '#3b5bff', color: '#fff', textDecoration: 'none', fontSize: 13.5, fontWeight: 600,
            }}>
              Explorar Torneos
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(268px,1fr))', gap: 14 }}>
          {visible.map(t => {
            const cfg = STATUS_CFG[t.status] || STATUS_CFG.DRAFT
            const initials = (t.creator.alias || `${t.creator.firstName}${t.creator.lastName}`).slice(0, 2).toUpperCase()
            const formatLabel = getTournamentFormatDescription(t.hasGroupStage, t.knockoutFormat)
            const userTeam = t.teams.find((tt: TournamentTeam) =>
              tt.team.player1.id === session.user.id || tt.team.player2.id === session.user.id
            )?.team
            return (
              <Link key={t.id} href={`/tournaments/${t.id}`} style={{
                background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 16,
                overflow: 'hidden', display: 'block', textDecoration: 'none', cursor: 'pointer',
                transition: 'border-color 170ms,box-shadow 170ms,transform 170ms',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.cssText += ';border-color:#2e2e48;box-shadow:0 10px 36px rgba(0,0,0,.45);transform:translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.cssText += ';border-color:#1a1a2a;box-shadow:none;transform:translateY(0)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px 9px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#9090b0' }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: '#3b5bff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: 9.5, flexShrink: 0 }}>
                      {initials}
                    </span>
                    {t.creator.alias}
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: cfg.badgeBg, color: cfg.badgeColor }}>
                    {cfg.label}
                  </span>
                </div>

                <div style={{
                  height: 158, position: 'relative', overflow: 'hidden',
                  background: t.photo ? undefined : 'radial-gradient(ellipse at 50% 20%,#161626 0%,#0a0a12 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ opacity: 0.25 }}>
                      <Icon d={['M8 21h8','M12 17v4','M7 4h10l-1 9.5a5 5 0 01-8 0L7 4z','M5 7H3a2 2 0 000 4h2.3','M19 7h2a2 2 0 010 4h-2.3']} size={48} sw={1} color="#fff" />
                    </div>
                  )}
                  <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 1px 1px,rgba(255,255,255,.025) 1px,transparent 0)', backgroundSize: '22px 22px' }} />
                </div>

                <div style={{ padding: '13px 14px 12px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{t.name}</div>
                  {userTeam && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 7, padding: '4px 10px', borderRadius: 9999, background: 'rgba(59,91,255,.12)', border: '1px solid rgba(59,91,255,.2)', width: 'fit-content' }}>
                      <Icon d={['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M9 3a4 4 0 100 8 4 4 0 000-8z']} size={11} sw={2} color="#7090ff" />
                      <span style={{ fontSize: 11, color: '#7090ff', fontWeight: 600 }}>{userTeam.player1.alias} & {userTeam.player2.alias}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, color: '#555575', marginBottom: 9 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Icon d={['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M9 3a4 4 0 100 8 4 4 0 000-8z','M23 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75']} size={12} sw={2} />
                      {t._count.teams} equipos
                    </span>
                    {t.locationName && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
                        <Icon d={['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z','M12 7a3 3 0 100 6 3 3 0 000-6z']} size={12} sw={2} />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120 }}>{t.locationName}</span>
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 9px', borderRadius: 9999, background: 'rgba(130,100,255,.18)', color: '#b0a0ff' }}>
                      {formatLabel}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
