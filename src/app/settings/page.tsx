'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Avatar from '@/components/Avatar'
import PhotoUpload from '@/components/PhotoUpload'
import ChangePasswordModal from '@/components/ChangePasswordModal'

interface UserData {
  id: string; email: string; firstName: string; lastName: string
  alias: string; profilePhoto?: string | null
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
  width: '100%', background: '#111118', border: '1px solid #1e1e2e',
  borderRadius: 13, padding: '13px 16px', fontFamily: 'inherit',
  fontSize: 14, color: '#e0e0f0', outline: 'none',
}
const fl: React.CSSProperties = { fontSize: 11.5, fontWeight: 500, color: '#666688', letterSpacing: '.03em', marginBottom: 6, display: 'block', paddingLeft: 4 }

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') fetchUserData()
  }, [status])

  const notify = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2600)
  }

  async function fetchUserData() {
    try {
      const response = await fetch('/api/auth/me')
      const data = await response.json()
      if (data.success) setUserData(data.data)
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  async function handleSave() {
    if (!userData) return
    setSaving(true)
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: userData.firstName, lastName: userData.lastName, alias: userData.alias }),
      })
      const data = await response.json()
      if (data.success) { setUserData(data.data); notify('Perfil actualizado') }
      else notify(data.error || 'Error al actualizar perfil', false)
    } catch { notify('Error al actualizar perfil', false) }
    finally { setSaving(false) }
  }

  async function handlePhotoUpload(photoBase64: string) {
    if (!userData) return
    setSaving(true)
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profilePhoto: photoBase64 }),
      })
      const data = await response.json()
      if (data.success) setUserData(data.data)
    } catch { /* silent */ }
    finally { setSaving(false) }
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

  if (!userData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p style={{ color: '#666688' }}>Error al cargar el perfil</p>
        <button onClick={fetchUserData} style={{ padding: '8px 22px', borderRadius: 9999, background: '#3b5bff', color: '#fff', border: 'none', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="animate-fade-in px-5 md:px-0" style={{ paddingBottom: 56, maxWidth: 560, margin: '0 auto' }}>
      <div style={{ paddingTop: 8, marginBottom: 28 }}>
        <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.025em', color: '#fff', lineHeight: 1 }}>Perfil</h1>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
        <PhotoUpload user={userData} onUpload={handlePhotoUpload} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 14 }}>
        <div>
          <label style={fl}>NOMBRE</label>
          <input style={fi} type="text" placeholder="Tu nombre" value={userData.firstName} onChange={e => setUserData({ ...userData, firstName: e.target.value })} />
        </div>
        <div>
          <label style={fl}>APELLIDO</label>
          <input style={fi} type="text" placeholder="Tu apellido" value={userData.lastName} onChange={e => setUserData({ ...userData, lastName: e.target.value })} />
        </div>
        <div>
          <label style={fl}>ALIAS</label>
          <input style={fi} type="text" placeholder="Tu alias" value={userData.alias} onChange={e => setUserData({ ...userData, alias: e.target.value })} />
        </div>
        <div>
          <label style={fl}>EMAIL</label>
          <input style={{ ...fi, opacity: 0.45, cursor: 'not-allowed' }} type="email" value={userData.email} disabled />
        </div>
      </div>

      <button onClick={() => setShowPasswordModal(true)} style={{
        width: '100%', background: '#111118', border: '1px solid #1e1e2e',
        borderRadius: 13, padding: '13px 16px', fontFamily: 'inherit', fontSize: 14,
        color: '#e0e0f0', cursor: 'pointer', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', marginBottom: 28,
        transition: 'border-color 150ms',
      }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#3b5bff'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#1e1e2e'}
      >
        <span>Cambiar Contraseña</span>
        <Icon d="M9 18l6-6-6-6" size={16} sw={2} color="#555575" />
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={handleSave} disabled={saving} style={{
          padding: '13px', borderRadius: 9999, border: 'none',
          background: '#3b5bff', color: '#fff', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          boxShadow: '0 6px 22px rgba(59,91,255,.38)', transition: 'opacity 150ms',
        }}>
          <Icon d="M5 13l4 4L19 7" size={16} sw={2.5} />
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
        <button onClick={() => signOut({ callbackUrl: '/auth/login' })} style={{
          padding: '13px', borderRadius: 9999, border: 'none',
          background: 'rgba(255,60,60,.15)', color: '#ff6060', fontFamily: 'inherit', fontSize: 14, fontWeight: 600,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'background 150ms',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,60,60,.25)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,60,60,.15)'}
        >
          <Icon d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" size={16} sw={2} color="#ff6060" />
          Cerrar Sesión
        </button>
      </div>

      {toast && (
        <div style={{
          position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
          background: toast.ok ? '#1b2660' : '#2a1020', border: `1px solid ${toast.ok ? '#304090' : '#602030'}`,
          color: toast.ok ? '#a0b8ff' : '#ff8080',
          fontSize: 13.5, fontWeight: 500, padding: '11px 24px', borderRadius: 9999,
          zIndex: 400, boxShadow: '0 10px 32px rgba(0,0,0,.45)', pointerEvents: 'none', whiteSpace: 'nowrap',
          animation: 'toastIn 250ms cubic-bezier(.16,1,.3,1)',
        }}>
          <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
          {toast.msg}
        </div>
      )}

      <ChangePasswordModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
    </div>
  )
}
