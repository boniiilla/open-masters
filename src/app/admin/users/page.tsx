'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { USER_ROLE_LABELS, UserRole } from '@/types'
import Avatar from '@/components/Avatar'

interface User {
  id: string; email: string; firstName: string; lastName: string
  alias: string; role: UserRole; profilePhoto: string | null; createdAt: string
}

function Icon({ d, size = 16, sw = 1.8, color }: { d: string | string[]; size?: number; sw?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  )
}

const ROLE_CFG: Record<string, { bg: string; color: string }> = {
  SUPERADMIN: { bg: 'rgba(255,80,80,.15)',    color: '#ff6060' },
  ADMIN:      { bg: 'rgba(59,91,255,.15)',    color: '#7090ff' },
  PLAYER:     { bg: 'rgba(50,210,120,.13)',   color: '#46d68a' },
}

const ROLE_TABS = [
  { value: 'all', label: 'Todos' },
  { value: 'PLAYER', label: 'Players' },
  { value: 'ADMIN', label: 'Admins' },
  { value: 'SUPERADMIN', label: 'Super Admins' },
]

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/auth/login'); return }
    if (session.user.role !== 'SUPERADMIN') { router.push('/'); return }
    fetchUsers()
  }, [session, status])

  async function fetchUsers() {
    const response = await fetch('/api/users')
    const data = await response.json()
    if (data.success) setUsers(data.data)
    setLoading(false)
  }

  if (status === 'loading' || !session || session.user.role !== 'SUPERADMIN' || loading) {
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

  const filtered = users.filter(u =>
    (roleFilter === 'all' || u.role === roleFilter) &&
    (!q ||
      u.alias.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase()) ||
      u.firstName.toLowerCase().includes(q.toLowerCase()) ||
      u.lastName.toLowerCase().includes(q.toLowerCase()))
  )

  const totalAdmins = users.filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN').length
  const totalPlayers = users.filter(u => u.role === 'PLAYER').length

  return (
    <div className="animate-fade-in px-5 md:px-0" style={{ paddingBottom: 40 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, paddingTop: 8, gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.025em', color: '#fff', lineHeight: 1 }}>Usuarios</h1>
          <p style={{ fontSize: 13, color: '#666688', marginTop: 5 }}>Administra todos los usuarios de la plataforma</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {[{ v: users.length, l: 'Total' }, { v: totalPlayers, l: 'Players' }, { v: totalAdmins, l: 'Admins' }].map(({ v, l }) => (
            <div key={l} style={{ background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 14, padding: '10px 14px', textAlign: 'center', minWidth: 54 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#7090ff' }}>{v}</div>
              <div style={{ fontSize: 10, color: '#555575', marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 18 }}>
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

      <div style={{ display: 'flex', gap: 7, marginBottom: 22, flexWrap: 'wrap' }}>
        {ROLE_TABS.map(t => (
          <button key={t.value} onClick={() => setRoleFilter(t.value)} style={{
            padding: '6px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            background: roleFilter === t.value ? '#3b5bff' : 'transparent',
            color: roleFilter === t.value ? '#fff' : '#666688',
            boxShadow: roleFilter === t.value ? '0 4px 14px rgba(59,91,255,.38)' : 'none',
            transition: 'all 140ms',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12, color: '#444460', textAlign: 'center' }}>
          <Icon d={['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M9 3a4 4 0 100 8 4 4 0 000-8z','M23 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75']} size={44} sw={1} color="#333348" />
          <p style={{ fontSize: 15 }}>
            {q || roleFilter !== 'all' ? 'No se encontraron usuarios' : 'No hay usuarios registrados'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: 10 }}>
          {filtered.map(user => {
            const rcfg = ROLE_CFG[user.role] || ROLE_CFG.PLAYER
            return (
              <Link key={user.id} href={`/users/${user.id}`} style={{
                background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 16,
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 13,
                textDecoration: 'none', cursor: 'pointer',
                transition: 'border-color 170ms,box-shadow 170ms,transform 170ms',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.cssText += ';border-color:#2e2e48;box-shadow:0 8px 28px rgba(0,0,0,.45);transform:translateY(-2px)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.cssText += ';border-color:#1a1a2a;box-shadow:none;transform:translateY(0)' }}
              >
                <Avatar firstName={user.firstName} lastName={user.lastName} alias={user.alias} size="md" className="w-11 h-11 flex-shrink-0" />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.alias}</div>
                  <div style={{ fontSize: 12, color: '#666688', marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.firstName} {user.lastName}</div>
                  <span style={{ fontSize: 10.5, fontWeight: 600, padding: '2px 9px', borderRadius: 9999, background: rcfg.bg, color: rcfg.color }}>
                    {USER_ROLE_LABELS[user.role]}
                  </span>
                </div>
                <Icon d="M9 18l6-6-6-6" size={15} sw={2} color="#44446a" />
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
