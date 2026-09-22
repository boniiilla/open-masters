'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Avatar from '@/components/Avatar'
import { USER_ROLE_LABELS, UserRole } from '@/types'

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
  SUPERADMIN: { bg: 'rgba(255,80,80,.15)',  color: '#ff6060' },
  ADMIN:      { bg: 'rgba(59,91,255,.15)',  color: '#7090ff' },
  PLAYER:     { bg: 'rgba(50,210,120,.13)', color: '#46d68a' },
}

const ROLES: UserRole[] = ['PLAYER', 'ADMIN', 'SUPERADMIN']

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
      background: ok ? '#1b2660' : '#2a1020', border: `1px solid ${ok ? '#304090' : '#602030'}`,
      color: ok ? '#a0b8ff' : '#ff8080',
      fontSize: 13.5, fontWeight: 500, padding: '11px 24px', borderRadius: 9999,
      zIndex: 400, boxShadow: '0 10px 32px rgba(0,0,0,.45)', pointerEvents: 'none', whiteSpace: 'nowrap',
      animation: 'toastIn 250ms cubic-bezier(.16,1,.3,1)',
    }}>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {msg}
    </div>
  )
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { data: session } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<UserRole>('PLAYER')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const isSuperAdmin = session?.user?.role === 'SUPERADMIN'

  useEffect(() => { fetchUser() }, [id])

  async function fetchUser() {
    try {
      const response = await fetch(`/api/users/${id}`)
      const data = await response.json()
      if (data.success) {
        setUser(data.data)
        setSelectedRole(data.data.role)
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  async function handleRoleChange() {
    if (!user || selectedRole === user.role) return
    setSaving(true)
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      })
      const data = await response.json()
      if (data.success) {
        setUser(prev => prev ? { ...prev, role: selectedRole } : null)
        notify('Rol actualizado correctamente')
      } else {
        notify(data.error || 'Error al actualizar rol', false)
        setSelectedRole(user.role)
      }
    } catch {
      notify('Error al actualizar rol', false)
      setSelectedRole(user.role)
    }
    setSaving(false)
  }

  const notify = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2600)
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

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-5">
        <p style={{ color: '#666688' }}>Usuario no encontrado</p>
        <Link href="/users" style={{ padding: '8px 20px', borderRadius: 9999, background: '#3b5bff', color: '#fff', textDecoration: 'none', fontSize: 13.5, fontWeight: 600 }}>
          Volver
        </Link>
      </div>
    )
  }

  const rcfg = ROLE_CFG[user.role] || ROLE_CFG.PLAYER
  const roleChanged = selectedRole !== user.role

  return (
    <div className="animate-fade-in px-5 md:px-0" style={{ paddingBottom: 40, maxWidth: 560, margin: '0 auto' }}>
      {/* Back */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 8, marginBottom: 24 }}>
        <button onClick={() => router.back()} style={{
          width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none',
          cursor: 'pointer', transition: 'background 130ms', flexShrink: 0,
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.12)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)'}
        >
          <Icon d="M15 19l-7-7 7-7" size={16} sw={2} color="#9090b0" />
        </button>
        <span style={{ fontSize: 13, color: '#555575' }}>Volver</span>
      </div>

      {/* Profile card */}
      <div style={{ background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 18, padding: '22px 20px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 18 }}>
        <Avatar firstName={user.firstName} lastName={user.lastName} alias={user.alias} profilePhoto={user.profilePhoto} size="lg" className="w-20 h-20 flex-shrink-0" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.alias}</div>
            <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: rcfg.bg, color: rcfg.color, flexShrink: 0 }}>
              {USER_ROLE_LABELS[user.role]}
            </span>
          </div>
          <div style={{ fontSize: 14, color: '#9090b0', marginBottom: 8 }}>{user.firstName} {user.lastName}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#555575', marginBottom: 4 }}>
            <Icon d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" size={13} sw={1.8} color="#444460" />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: '#444460' }}>
            <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" size={12} sw={1.8} color="#333348" />
            <span>Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Role management — only for SUPERADMIN */}
      {isSuperAdmin && (
        <div style={{ background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 18, padding: '18px 20px' }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Gestionar Rol</h2>
          <p style={{ fontSize: 12, color: '#555575', marginBottom: 14 }}>Cambia el nivel de acceso de este usuario</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {ROLES.map(role => {
              const rcfgItem = ROLE_CFG[role]
              const isSelected = selectedRole === role
              return (
                <button key={role} onClick={() => setSelectedRole(role)} style={{
                  display: 'flex', alignItems: 'center', gap: 13, padding: '12px 16px',
                  borderRadius: 12, border: `1px solid ${isSelected ? rcfgItem.color + '44' : '#1e1e32'}`,
                  background: isSelected ? rcfgItem.bg : 'rgba(255,255,255,.02)',
                  cursor: 'pointer', textAlign: 'left', transition: 'all 150ms', fontFamily: 'inherit',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                    border: `2px solid ${isSelected ? rcfgItem.color : '#333348'}`,
                    background: isSelected ? rcfgItem.color : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 150ms',
                  }}>
                    {isSelected && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff' }} />}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: isSelected ? rcfgItem.color : '#e0e0f0' }}>{USER_ROLE_LABELS[role]}</div>
                    <div style={{ fontSize: 11.5, color: '#555575', marginTop: 1 }}>
                      {role === 'PLAYER' && 'Puede participar en torneos'}
                      {role === 'ADMIN' && 'Puede crear y gestionar torneos'}
                      {role === 'SUPERADMIN' && 'Acceso completo a la plataforma'}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          <button
            onClick={handleRoleChange}
            disabled={!roleChanged || saving}
            style={{
              width: '100%', padding: '11px', borderRadius: 9999, border: 'none',
              background: roleChanged ? '#3b5bff' : 'rgba(255,255,255,.06)',
              color: roleChanged ? '#fff' : '#555575',
              fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600,
              cursor: roleChanged ? 'pointer' : 'not-allowed',
              opacity: saving ? 0.6 : 1,
              boxShadow: roleChanged ? '0 4px 14px rgba(59,91,255,.35)' : 'none',
              transition: 'all 200ms',
            }}
          >
            {saving ? 'Guardando...' : roleChanged ? `Cambiar a ${USER_ROLE_LABELS[selectedRole]}` : 'Sin cambios'}
          </button>
        </div>
      )}

      {toast && <Toast msg={toast.msg} ok={toast.ok} />}
    </div>
  )
}
