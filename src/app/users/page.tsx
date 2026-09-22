'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Avatar from '@/components/Avatar'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  alias: string
  profilePhoto: string | null
  createdAt: string
}

function Icon({ d, size = 16, sw = 1.8, color }: { d: string | string[]; size?: number; sw?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => { fetchUsers() }, [])

  async function fetchUsers() {
    const response = await fetch('/api/users')
    const data = await response.json()
    if (data.success) setUsers(data.data)
    setLoading(false)
  }

  const filtered = users.filter(u =>
    !q ||
    u.alias.toLowerCase().includes(q.toLowerCase()) ||
    u.firstName.toLowerCase().includes(q.toLowerCase()) ||
    u.lastName.toLowerCase().includes(q.toLowerCase()) ||
    u.email.toLowerCase().includes(q.toLowerCase())
  )

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

  return (
    <div className="animate-fade-in px-5 md:px-0" style={{ paddingBottom: 40 }}>
      <div style={{ marginBottom: 28, paddingTop: 8 }}>
        <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.025em', color: '#fff', lineHeight: 1 }}>Usuarios</h1>
        <p style={{ fontSize: 13, color: '#666688', marginTop: 5 }}>Todos los usuarios registrados</p>
      </div>

      <div style={{ position: 'relative', marginBottom: 22 }}>
        <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#44446a', pointerEvents: 'none' }}>
          <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" size={16} sw={2} />
        </span>
        <input
          type="text" placeholder="Buscar usuarios..." value={q}
          onChange={e => setQ(e.target.value)}
          style={{
            width: '100%', height: 44, background: '#111118', border: '1px solid #1e1e2e',
            borderRadius: 9999, padding: '0 16px 0 43px', fontFamily: 'inherit',
            fontSize: 13.5, color: '#e0e0f0', outline: 'none',
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12, color: '#444460', textAlign: 'center' }}>
          <Icon d={['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M9 3a4 4 0 100 8 4 4 0 000-8z','M23 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75']} size={44} sw={1} color="#333348" />
          <p style={{ fontSize: 15 }}>No se encontraron usuarios</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
          {filtered.map(user => (
            <Link key={user.id} href={`/users/${user.id}`} style={{
              background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 16,
              padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 13,
              textDecoration: 'none', cursor: 'pointer',
              transition: 'border-color 170ms,box-shadow 170ms,transform 170ms',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.cssText += ';border-color:#2e2e48;box-shadow:0 8px 28px rgba(0,0,0,.45);transform:translateY(-2px)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.cssText += ';border-color:#1a1a2a;box-shadow:none;transform:translateY(0)' }}
            >
              <Avatar firstName={user.firstName} lastName={user.lastName} alias={user.alias} profilePhoto={user.profilePhoto} size="md" className="w-11 h-11 flex-shrink-0" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.alias}</div>
                <div style={{ fontSize: 12, color: '#666688', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.firstName} {user.lastName}</div>
              </div>
              <Icon d="M9 18l6-6-6-6" size={15} sw={2} color="#44446a" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
