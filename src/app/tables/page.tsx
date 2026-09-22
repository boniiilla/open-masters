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

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')

  useEffect(() => { fetchTables() }, [])

  async function fetchTables() {
    const response = await fetch('/api/tables')
    const data = await response.json()
    if (data.success) setTables(data.data)
    setLoading(false)
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const response = await fetch('/api/tables', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, location: location || undefined }),
    })
    const data = await response.json()
    if (data.success) {
      setShowForm(false)
      setName('')
      setLocation('')
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
          <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.025em', color: '#fff', lineHeight: 1 }}>Mesas</h1>
          <p style={{ fontSize: 13, color: '#666688', marginTop: 5 }}>Gestiona las mesas de futbolín</p>
        </div>
        <span className="hidden md:block">
          <button onClick={() => setShowForm(v => !v)} style={btnStyle}>
            {showForm
              ? <><Icon d={['M18 6L6 18','M6 6l12 12']} size={15} sw={2.5} />Cancelar</>
              : <><Icon d={['M12 5v14','M5 12h14']} size={15} sw={2.8} />Nueva Mesa</>
            }
          </button>
        </span>
      </div>

      <div className="md:hidden" style={{ marginBottom: 18 }}>
        <button onClick={() => setShowForm(v => !v)} style={{ ...btnStyle, display: 'flex', width: '100%', justifyContent: 'center' }}>
          {showForm
            ? <><Icon d={['M18 6L6 18','M6 6l12 12']} size={15} sw={2.5} />Cancelar</>
            : <><Icon d={['M12 5v14','M5 12h14']} size={15} sw={2.8} />Nueva Mesa</>
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
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 14 }}>Nueva Mesa</h2>
          {error && (
            <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,50,50,.12)', color: '#ff5555', fontSize: 13 }}>
              {error}
            </div>
          )}
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div><label style={fl}>NOMBRE *</label>
              <input style={fi} placeholder="Ej: Mesa 1, Futbolín Principal" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div><label style={fl}>UBICACIÓN (opcional)</label>
              <input style={fi} placeholder="Ej: Sala principal, Bar" value={location} onChange={e => setLocation(e.target.value)} />
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
              }}>Crear Mesa</button>
            </div>
          </form>
        </div>
      )}

      {tables.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12, color: '#444460', textAlign: 'center' }}>
          <Icon d={['M4 6h16','M4 10h16','M4 14h16','M4 18h16']} size={44} sw={1} color="#333348" />
          <p style={{ fontSize: 15 }}>No hay mesas creadas</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {tables.map(table => (
            <div key={table.id} style={{
              background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 16,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 14,
              transition: 'border-color 170ms',
            }}>
              <Link href={`/tables/${table.id}`} style={{ flex: 1, textDecoration: 'none', minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{table.name}</div>
                {table.location && (
                  <div style={{ fontSize: 12.5, color: '#666688', marginBottom: 7 }}>{table.location}</div>
                )}
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 9px', borderRadius: 9999, background: 'rgba(100,160,255,.12)', color: '#82b0ff' }}>
                    {table._count.matches} partidos
                  </span>
                  <span style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 9px', borderRadius: 9999, background: 'rgba(130,100,255,.12)', color: '#b0a0ff' }}>
                    {table._count.tournamentTables} torneos
                  </span>
                </div>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <span style={{
                  fontSize: 10.5, fontWeight: 600, padding: '4px 11px', borderRadius: 9999,
                  background: table.isAvailable ? 'rgba(50,210,120,.13)' : 'rgba(255,60,60,.12)',
                  color: table.isAvailable ? '#46d68a' : '#ff5555',
                }} className="hidden sm:inline">
                  {table.isAvailable ? 'Disponible' : 'No disp.'}
                </span>
                <button onClick={() => toggleAvailability(table)} style={{
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
          ))}
        </div>
      )}
    </div>
  )
}
