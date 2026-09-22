'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User { id: string; firstName: string; lastName: string; alias: string }
interface Team {
  id: string; name: string | null
  player1: User; player2: User
  _count: { tournamentTeams: number; matchesWon: number }
}

function Icon({ d, size = 16, sw = 1.8, color }: { d: string | string[]; size?: number; sw?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  )
}

const fi: React.CSSProperties = {
  width: '100%', background: '#191926', border: '1px solid #252540',
  borderRadius: 11, padding: '11px 14px', fontFamily: 'inherit',
  fontSize: 13.5, color: '#e0e0f0', outline: 'none',
}
const fl: React.CSSProperties = { fontSize: 11.5, fontWeight: 500, color: '#666688', letterSpacing: '.02em', marginBottom: 5, display: 'block' }
const sel: React.CSSProperties = { ...{} as React.CSSProperties, width: '100%', background: '#191926', border: '1px solid #252540', borderRadius: 11, padding: '11px 14px', fontFamily: 'inherit', fontSize: 13.5, color: '#e0e0f0', outline: 'none', cursor: 'pointer' }

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [teamName, setTeamName] = useState('')
  const [player1Id, setPlayer1Id] = useState('')
  const [player2Id, setPlayer2Id] = useState('')

  useEffect(() => {
    fetchTeams()
    fetchUsers()
  }, [])

  async function fetchTeams() {
    const response = await fetch('/api/teams')
    const data = await response.json()
    if (data.success) setTeams(data.data)
    setLoading(false)
  }

  async function fetchUsers() {
    const response = await fetch('/api/users')
    const data = await response.json()
    if (data.success) setUsers(data.data)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const response = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: teamName || undefined, player1Id, player2Id }),
    })
    const data = await response.json()
    if (data.success) {
      setShowForm(false)
      setTeamName('')
      setPlayer1Id('')
      setPlayer2Id('')
      fetchTeams()
    } else {
      setError(data.error)
    }
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

  const btnStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 7,
    background: showForm ? 'rgba(255,255,255,.08)' : '#3b5bff',
    color: showForm ? '#9090b0' : '#fff',
    fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, border: 'none', borderRadius: 9999,
    padding: '10px 20px', cursor: 'pointer', whiteSpace: 'nowrap',
    boxShadow: showForm ? 'none' : '0 6px 22px rgba(59,91,255,.38)',
    transition: 'background 140ms,box-shadow 140ms',
  }

  return (
    <div className="animate-fade-in px-5 md:px-0" style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, paddingTop: 8 }}>
        <div>
          <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.025em', color: '#fff', lineHeight: 1 }}>Parejas</h1>
          <p style={{ fontSize: 13, color: '#666688', marginTop: 5 }}>Gestiona las parejas de jugadores</p>
        </div>
        <span className="hidden md:block">
          <button onClick={() => setShowForm(v => !v)} style={btnStyle}>
            {showForm
              ? <><Icon d={['M18 6L6 18','M6 6l12 12']} size={15} sw={2.5} />Cancelar</>
              : <><Icon d={['M12 5v14','M5 12h14']} size={15} sw={2.8} />Nueva Pareja</>
            }
          </button>
        </span>
      </div>

      <div className="md:hidden" style={{ marginBottom: 18 }}>
        <button onClick={() => setShowForm(v => !v)} style={{ ...btnStyle, display: 'flex', width: '100%', justifyContent: 'center' }}>
          {showForm
            ? <><Icon d={['M18 6L6 18','M6 6l12 12']} size={15} sw={2.5} />Cancelar</>
            : <><Icon d={['M12 5v14','M5 12h14']} size={15} sw={2.8} />Nueva Pareja</>
          }
        </button>
      </div>

      {showForm && (
        <div style={{
          background: '#11111b', border: '1px solid #22223a', borderRadius: 18,
          padding: 20, marginBottom: 20,
          animation: 'slideUp 200ms cubic-bezier(.16,1,.3,1)',
        }}>
          <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Nueva Pareja</h2>
          {error && (
            <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,50,50,.12)', color: '#ff5555', fontSize: 13 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label style={fl}>NOMBRE DE LA PAREJA (opcional)</label>
              <input style={fi} placeholder="Se generará automáticamente si no se especifica" value={teamName} onChange={e => setTeamName(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
              <div><label style={fl}>JUGADOR 1</label>
                <select style={sel} value={player1Id} onChange={e => setPlayer1Id(e.target.value)} required>
                  <option value="">Seleccionar</option>
                  {users.map(u => <option key={u.id} value={u.id} style={{ background: '#191926' }}>{u.alias}</option>)}
                </select>
              </div>
              <div><label style={fl}>JUGADOR 2</label>
                <select style={sel} value={player2Id} onChange={e => setPlayer2Id(e.target.value)} required>
                  <option value="">Seleccionar</option>
                  {users.map(u => <option key={u.id} value={u.id} style={{ background: '#191926' }}>{u.alias}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" onClick={() => setShowForm(false)} style={{
                flex: 1, padding: 10, borderRadius: 9999, border: '1px solid #2a2a42',
                background: 'transparent', color: '#9090b0', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500, cursor: 'pointer',
              }}>Cancelar</button>
              <button type="submit" style={{
                flex: 1, padding: 10, borderRadius: 9999, border: 'none',
                background: '#3b5bff', color: '#fff', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(59,91,255,.35)',
              }}>Crear Pareja</button>
            </div>
          </form>
        </div>
      )}

      {teams.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12, color: '#444460', textAlign: 'center' }}>
          <Icon d={['M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z']} size={44} sw={1} color="#333348" />
          <p style={{ fontSize: 15 }}>No hay parejas creadas</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {teams.map(team => (
            <Link key={team.id} href={`/teams/${team.id}`} style={{
              background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 16,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 13,
              textDecoration: 'none', cursor: 'pointer',
              transition: 'border-color 170ms,box-shadow 170ms,transform 170ms',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.cssText += ';border-color:#2e2e48;box-shadow:0 8px 28px rgba(0,0,0,.45);transform:translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.cssText += ';border-color:#1a1a2a;box-shadow:none;transform:translateY(0)' }}
            >
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {[team.player1, team.player2].map((p, i) => (
                  <div key={i} style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: i === 0 ? '#3b5bff' : '#8040ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: '#fff', fontSize: 11,
                  }}>
                    {p.alias.slice(0, 2).toUpperCase()}
                  </div>
                ))}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {team.name || `${team.player1.alias} & ${team.player2.alias}`}
                </div>
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 9px', borderRadius: 9999, background: 'rgba(130,100,255,.12)', color: '#b0a0ff' }}>
                    {team._count.tournamentTeams} torneos
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 9px', borderRadius: 9999, background: 'rgba(50,210,120,.12)', color: '#46d68a' }}>
                    {team._count.matchesWon} victorias
                  </span>
                </div>
              </div>
              <Icon d="M9 18l6-6-6-6" size={15} sw={2} color="#44446a" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
