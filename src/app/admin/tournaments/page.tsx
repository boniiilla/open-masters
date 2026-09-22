'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { getTournamentFormatDescription, KnockoutFormat, TournamentStatus } from '@/types'

// ─── Types ───────────────────────────────────────────────
interface Creator { id: string; firstName: string; lastName: string; alias: string }
interface Tournament {
  id: string; name: string; description: string
  hasGroupStage: boolean; knockoutFormat: KnockoutFormat
  modality: 'STATIC' | 'MOVEMENT' | 'COMBINED'
  status: TournamentStatus
  maxTeams: number | null; locationName: string | null
  photo: string | null; startDate: string | null
  creator: Creator; _count: { teams: number; rounds: number }
}
interface FormState {
  name: string; description: string; modality: string
  knockoutFormat: string; status: string
  locationName: string; maxTeams: string; photo: string | null
}

// ─── Status config ────────────────────────────────────────
const STATUS_CFG: Record<string, { label: string; badgeBg: string; badgeColor: string; tagBg: string; tagColor: string }> = {
  DRAFT:       { label: 'Borrador',    badgeBg: 'rgba(140,140,180,.13)', badgeColor: '#9090b8', tagBg: 'rgba(100,100,140,.18)', tagColor: '#9090b0' },
  OPEN:        { label: 'Abierto',     badgeBg: 'rgba(50,210,120,.13)',  badgeColor: '#46d68a', tagBg: 'rgba(50,210,120,.13)',  tagColor: '#46d68a' },
  IN_PROGRESS: { label: 'En Progreso', badgeBg: 'rgba(255,165,50,.13)',  badgeColor: '#ffa530', tagBg: 'rgba(255,165,50,.13)',  tagColor: '#ffa530' },
  FINISHED:    { label: 'Finalizado',  badgeBg: 'rgba(100,160,255,.13)', badgeColor: '#82b0ff', tagBg: 'rgba(100,160,255,.13)', tagColor: '#82b0ff' },
  CANCELLED:   { label: 'Parado',      badgeBg: 'rgba(140,140,180,.13)', badgeColor: '#9090b8', tagBg: 'rgba(100,100,140,.18)', tagColor: '#9090b0' },
}

// ─── Icons ────────────────────────────────────────────────
function Icon({ d, size = 16, sw = 1.8, color }: { d: string | string[]; size?: number; sw?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color || 'currentColor'} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  )
}

// ─── Context menu ─────────────────────────────────────────
function CtxMenu({ onPublish, onEdit, onDelete, onClose }: { onPublish(): void; onEdit(): void; onDelete(): void; onClose(): void }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', fn, true)
    return () => document.removeEventListener('mousedown', fn, true)
  }, [onClose])
  return (
    <div ref={ref} onClick={e => e.stopPropagation()} style={{
      position: 'absolute', top: 'calc(100% + 4px)', right: 0,
      background: '#1c1c2c', border: '1px solid #2a2a3e', borderRadius: 12, padding: 5,
      zIndex: 100, minWidth: 140,
      boxShadow: '0 16px 48px rgba(0,0,0,.6),0 4px 12px rgba(0,0,0,.3)',
      animation: 'menuPop 140ms cubic-bezier(.16,1,.3,1)',
    }}>
      <style>{`@keyframes menuPop{from{opacity:0;transform:scale(.9) translateY(-6px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      {[
        { label: 'Publicar', color: '#46d68a', icon: 'M20 6L9 17l-5-5', fn: onPublish },
        { label: 'Editar',   color: '#7090ff', icon: ['M12 20h9','M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z'], fn: onEdit },
        { label: 'Eliminar', color: '#ff5555', icon: ['M3 6h18','M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6','M9 6V4h6v2'], fn: onDelete },
      ].map(({ label, color, icon, fn }) => (
        <div key={label} onClick={fn} style={{
          display: 'flex', alignItems: 'center', gap: 9, padding: '8px 11px',
          borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer', color,
          transition: 'background 110ms',
        }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.07)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
          <Icon d={icon} size={14} sw={2} color={color} />
          {label}
        </div>
      ))}
    </div>
  )
}

// ─── Tournament card ──────────────────────────────────────
function TCard({ t, onEdit, onDelete, onPublish }: { t: Tournament; onEdit(): void; onDelete(): void; onPublish(): void }) {
  const [menu, setMenu] = useState(false)
  const cfg = STATUS_CFG[t.status] || STATUS_CFG.DRAFT
  const formatLabel = getTournamentFormatDescription(t.hasGroupStage, t.knockoutFormat)
  const initials = (t.creator.alias || `${t.creator.firstName}${t.creator.lastName}`).slice(0, 2).toUpperCase()

  return (
    <Link href={`/tournaments/${t.id}`} style={{
      background: '#10101a', border: '1px solid #1a1a2a', borderRadius: 16,
      overflow: 'hidden', display: 'block', textDecoration: 'none', cursor: 'pointer',
      transition: 'border-color 170ms,box-shadow 170ms,transform 170ms',
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.cssText += ';border-color:#2e2e48;box-shadow:0 10px 36px rgba(0,0,0,.45);transform:translateY(-2px)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.cssText += ';border-color:#1a1a2a;box-shadow:none;transform:translateY(0)' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 13px 9px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: '#9090b0' }}>
          <span style={{
            width: 26, height: 26, borderRadius: '50%', background: '#3b5bff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, color: '#fff', fontSize: 9.5, flexShrink: 0,
          }}>{initials}</span>
          {t.creator.alias || `${t.creator.firstName} ${t.creator.lastName}`}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 10.5, fontWeight: 600, padding: '3px 10px', borderRadius: 9999, background: cfg.badgeBg, color: cfg.badgeColor }}>
            {cfg.label}
          </span>
          <span style={{ position: 'relative' }}>
            <button onClick={e => { e.preventDefault(); setMenu(v => !v) }} style={{
              width: 27, height: 27, borderRadius: 7, border: 'none',
              background: 'rgba(255,255,255,.06)', color: '#9090b0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'background 130ms,color 130ms',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.12)'; (e.currentTarget as HTMLElement).style.color = '#fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)'; (e.currentTarget as HTMLElement).style.color = '#9090b0' }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="1.9" /><circle cx="12" cy="12" r="1.9" /><circle cx="12" cy="19" r="1.9" />
              </svg>
            </button>
            {menu && (
              <CtxMenu
                onPublish={() => { onPublish(); setMenu(false) }}
                onEdit={() => { onEdit(); setMenu(false) }}
                onDelete={() => { onDelete(); setMenu(false) }}
                onClose={() => setMenu(false)}
              />
            )}
          </span>
        </span>
      </div>

      {/* Image area */}
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

      {/* Body */}
      <div style={{ padding: '13px 14px 12px' }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#fff', marginBottom: 3 }}>{t.name}</div>
        <div style={{ fontSize: 12, color: '#666680', marginBottom: 9, lineHeight: 1.45 }}
          className="line-clamp-2">{t.description}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 11.5, color: '#555575', marginBottom: 9 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Icon d={['M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2','M9 3a4 4 0 100 8 4 4 0 000-8z','M23 21v-2a4 4 0 00-3-3.87','M16 3.13a4 4 0 010 7.75']} size={12} sw={2} />
            {t._count.teams} equipos
          </span>
          {t.locationName && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon d={['M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z','M12 7a3 3 0 100 6 3 3 0 000-6z']} size={12} sw={2} />
              <span className="truncate" style={{ maxWidth: 120 }}>{t.locationName}</span>
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 9px', borderRadius: 9999, background: 'rgba(130,100,255,.18)', color: '#b0a0ff' }}>
            {formatLabel}
          </span>
          <span style={{ fontSize: 10.5, fontWeight: 500, padding: '3px 9px', borderRadius: 9999, background: cfg.tagBg, color: cfg.tagColor }}>
            {cfg.label}
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Modal ────────────────────────────────────────────────
function TModal({ mode, t, onClose, onSave }: { mode: 'create' | 'edit'; t?: Tournament; onClose(): void; onSave(f: FormState): void }) {
  const [form, setForm] = useState<FormState>({
    name: t?.name || '', description: t?.description || '',
    modality: t?.modality || 'STATIC', knockoutFormat: t?.knockoutFormat || 'SINGLE_KO',
    status: t?.status || 'DRAFT', locationName: t?.locationName || '',
    maxTeams: t?.maxTeams?.toString() || '8', photo: t?.photo || null,
  })
  const [imgHover, setImgHover] = useState(false)
  const set = (k: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => setForm(f => ({ ...f, photo: reader.result as string }))
    reader.readAsDataURL(file)
  }

  const fi: React.CSSProperties = { width: '100%', background: '#191926', border: '1px solid #252540', borderRadius: 11, padding: '11px 14px', fontFamily: 'inherit', fontSize: 13.5, color: '#e0e0f0', outline: 'none' }
  const fl: React.CSSProperties = { fontSize: 11.5, fontWeight: 500, color: '#666688', letterSpacing: '.02em', marginBottom: 5, display: 'block' }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#11111b', border: '1px solid #22223a', borderRadius: 22,
        width: 580, maxWidth: 'calc(100vw - 32px)', maxHeight: '88vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,.6)', animation: 'slideUp 200ms cubic-bezier(.16,1,.3,1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1c1c2c', flexShrink: 0 }}>
          <button onClick={onClose} style={{ fontFamily: 'inherit', fontSize: 14, fontWeight: 500, color: '#8888aa', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: 8 }}>Cancelar</button>
          <span style={{ fontSize: 15.5, fontWeight: 700, color: '#fff' }}>{mode === 'edit' ? 'Editar Torneo' : 'Crear Torneo'}</span>
          <button onClick={() => onSave(form)} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: '#3b5bff', color: '#fff', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 9999, padding: '7px 18px', cursor: 'pointer', boxShadow: '0 6px 22px rgba(59,91,255,.38)' }}>Guardar</button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 13 }}>
          <label style={{ cursor: 'pointer' }} onMouseEnter={() => setImgHover(true)} onMouseLeave={() => setImgHover(false)}>
            <div style={{ height: 190, border: `2px dashed ${imgHover ? '#5070ff' : '#3b5bff'}`, borderRadius: 14, background: imgHover ? 'rgba(59,91,255,.09)' : 'rgba(59,91,255,.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, overflow: 'hidden', transition: 'background 140ms,border-color 140ms' }}>
              {form.photo ? <img src={form.photo} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (
                <>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon d={['M3 5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5z','M8.5 8.5m-1.5 0a1.5 1.5 0 103 0 1.5 1.5 0 10-3 0','M21 15l-5-5L5 20']} size={22} color="#8888aa" />
                  </div>
                  <p style={{ fontSize: 13.5, fontWeight: 500, color: '#9898ba', margin: 0 }}>{imgHover ? 'Haz clic para subir imagen' : 'Cambiar imagen del torneo'}</p>
                  <span style={{ fontSize: 11.5, color: '#555570' }}>JPG, PNG o GIF (max. 5MB)</span>
                </>
              )}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </label>
          <div><label style={fl}>NOMBRE DEL TORNEO</label><input style={fi} placeholder="Nombre del torneo" value={form.name} onChange={set('name')} /></div>
          <div><label style={fl}>DESCRIPCIÓN</label><textarea style={{ ...fi, resize: 'vertical', minHeight: 76, lineHeight: 1.55 }} placeholder="Descripción del torneo" value={form.description} onChange={set('description')} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 11 }}>
            <div><label style={fl}>ESTADO</label>
              <select style={{ ...fi, cursor: 'pointer' }} value={form.status} onChange={set('status')}>
                {[['DRAFT','Borrador'],['OPEN','Abierto'],['IN_PROGRESS','En Progreso'],['FINISHED','Finalizado'],['CANCELLED','Parado']].map(([v,l]) => <option key={v} value={v} style={{ background: '#191926' }}>{l}</option>)}
              </select>
            </div>
            <div><label style={fl}>FORMATO</label>
              <select style={{ ...fi, cursor: 'pointer' }} value={form.knockoutFormat} onChange={set('knockoutFormat')}>
                {[['SINGLE_KO','Simple KO'],['DOUBLE_KO','Doble KO (con repesca)'],['NONE','Sin eliminatoria']].map(([v,l]) => <option key={v} value={v} style={{ background: '#191926' }}>{l}</option>)}
              </select>
            </div>
          </div>
          <div><label style={fl}>MODALIDAD</label>
            <select style={{ ...fi, cursor: 'pointer' }} value={form.modality} onChange={set('modality')}>
              {[['STATIC','Parado'],['MOVEMENT','Movimiento'],['COMBINED','Combinado']].map(([v,l]) => <option key={v} value={v} style={{ background: '#191926' }}>{l}</option>)}
            </select>
          </div>
          <div><label style={fl}>UBICACIÓN</label><input style={fi} placeholder="Nombre del local o ubicación" value={form.locationName} onChange={set('locationName')} /></div>
          <div><label style={fl}>MÁXIMO DE EQUIPOS</label><input style={fi} type="number" min={2} max={256} value={form.maxTeams} onChange={set('maxTeams')} /></div>
        </div>
      </div>
    </div>
  )
}

// ─── Delete confirm ───────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm(): void; onCancel(): void }) {
  return (
    <div onClick={onCancel} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)', backdropFilter: 'blur(6px)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div onClick={e => e.stopPropagation()} style={{ background: '#16162a', border: '1px solid #2a2a42', borderRadius: 18, width: 360, maxWidth: 'calc(100vw - 32px)', padding: '28px 28px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', animation: 'slideUp 200ms cubic-bezier(.16,1,.3,1)' }}>
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,60,60,.13)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon d={['M3 6h18','M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6','M9 6V4h6v2']} size={24} color="#ff5555" sw={1.8} />
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Eliminar torneo</h3>
        <p style={{ fontSize: 13.5, color: '#7070a0', lineHeight: 1.5 }}>¿Seguro que quieres eliminar <strong style={{ color: '#e0e0f0' }}>"{name}"</strong>? Esta acción no se puede deshacer.</p>
        <div style={{ display: 'flex', gap: 10, width: '100%' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: 10, borderRadius: 9999, border: '1px solid #2a2a42', background: 'transparent', color: '#9090b0', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 500, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: 10, borderRadius: 9999, border: 'none', background: '#ff3a3a', color: '#fff', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Toast ────────────────────────────────────────────────
function Toast({ msg }: { msg: string }) {
  return (
    <div style={{ position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)', background: '#1b2660', border: '1px solid #304090', color: '#a0b8ff', fontSize: 13.5, fontWeight: 500, padding: '11px 24px', borderRadius: 9999, zIndex: 400, boxShadow: '0 10px 32px rgba(0,0,0,.45)', pointerEvents: 'none', whiteSpace: 'nowrap', animation: 'toastIn 250ms cubic-bezier(.16,1,.3,1)' }}>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {msg}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────
const TABS = [
  { k: 'all',         l: 'Todos'       },
  { k: 'DRAFT',       l: 'Borradores'  },
  { k: 'OPEN',        l: 'Abiertos'    },
  { k: 'IN_PROGRESS', l: 'En Progreso' },
  { k: 'FINISHED',    l: 'Finalizados' },
]

export default function AdminTournamentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')
  const [q, setQ] = useState('')
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; t?: Tournament } | null>(null)
  const [delTarget, setDelTarget] = useState<Tournament | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const notify = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2600)
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) { router.push('/auth/login'); return }
    if (session.user.role !== 'SUPERADMIN') { router.push('/'); return }
    fetchTournaments()
  }, [session, status])

  async function fetchTournaments() {
    const res = await fetch('/api/tournaments')
    const data = await res.json()
    if (data.success) setTournaments(data.data)
    setLoading(false)
  }

  async function handleSave(form: FormState) {
    const body = {
      name: form.name, description: form.description,
      modality: form.modality, knockoutFormat: form.knockoutFormat,
      status: form.status, hasGroupStage: false,
      locationName: form.locationName || undefined,
      maxTeams: form.maxTeams ? Number(form.maxTeams) : undefined,
      photo: form.photo || undefined,
    }
    if (modal?.mode === 'edit' && modal.t) {
      const res = await fetch(`/api/tournaments/${modal.t.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.success) { notify('Torneo actualizado ✓'); setModal(null); fetchTournaments() }
    } else {
      const res = await fetch('/api/tournaments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json()
      if (data.success) { notify('Torneo creado ✓'); setModal(null); fetchTournaments() }
    }
  }

  async function handlePublish(t: Tournament) {
    const res = await fetch(`/api/tournaments/${t.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'OPEN' }) })
    const data = await res.json()
    if (data.success) { notify(`"${t.name}" publicado ✓`); fetchTournaments() }
  }

  async function handleDelete() {
    if (!delTarget) return
    const res = await fetch(`/api/tournaments/${delTarget.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (data.success) { notify(`"${delTarget.name}" eliminado`); setDelTarget(null); fetchTournaments() }
  }

  const visible = tournaments.filter(t =>
    (tab === 'all' || t.status === tab) &&
    (!q || t.name.toLowerCase().includes(q.toLowerCase()) || (t.locationName || '').toLowerCase().includes(q.toLowerCase()))
  )

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

  return (
    <div className="animate-fade-in px-5 md:px-0" style={{ paddingBottom: 40 }}>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, paddingTop: 8 }}>
        <div>
          <h1 style={{ fontSize: 38, fontWeight: 800, letterSpacing: '-.025em', color: '#fff', lineHeight: 1 }}>Gestión de Torneos</h1>
          <p style={{ fontSize: 13, color: '#666688', marginTop: 5 }}>Administra todos los torneos de la plataforma</p>
        </div>
        <span className="hidden md:block">
          <button onClick={() => setModal({ mode: 'create' })} style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            background: '#3b5bff', color: '#fff', fontFamily: 'inherit',
            fontSize: 13.5, fontWeight: 600, border: 'none', borderRadius: 9999,
            padding: '10px 20px', cursor: 'pointer', whiteSpace: 'nowrap',
            boxShadow: '0 6px 22px rgba(59,91,255,.38)', transition: 'background 140ms,box-shadow 140ms',
          }}>
            <Icon d={['M12 5v14','M5 12h14']} size={15} sw={2.8} />
            Crear Torneo
          </button>
        </span>
      </div>

      {/* Mobile create button */}
      <div className="md:hidden" style={{ marginBottom: 18 }}>
        <button onClick={() => setModal({ mode: 'create' })} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '100%',
          background: '#3b5bff', color: '#fff', fontFamily: 'inherit',
          fontSize: 13.5, fontWeight: 600, border: 'none', borderRadius: 9999,
          padding: '10px 20px', cursor: 'pointer',
          boxShadow: '0 6px 22px rgba(59,91,255,.38)',
        }}>
          <Icon d={['M12 5v14','M5 12h14']} size={15} sw={2.8} />
          Crear Torneo
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 18 }}>
        <span style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: '#44446a', pointerEvents: 'none' }}>
          <Icon d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0" size={16} sw={2} />
        </span>
        <input type="text" placeholder="Buscar torneos..." value={q} onChange={e => setQ(e.target.value)}
          style={{ width: '100%', height: 44, background: '#111118', border: '1px solid #1e1e2e', borderRadius: 9999, padding: '0 16px 0 43px', fontFamily: 'inherit', fontSize: 13.5, color: '#e0e0f0', outline: 'none' }} />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 7, marginBottom: 22, flexWrap: 'wrap' }}>
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            padding: '6px 16px', borderRadius: 9999, border: 'none', cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 500,
            background: tab === t.k ? '#3b5bff' : 'transparent',
            color: tab === t.k ? '#fff' : '#666688',
            boxShadow: tab === t.k ? '0 4px 14px rgba(59,91,255,.38)' : 'none',
            transition: 'all 140ms',
          }}>{t.l}</button>
        ))}
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', gap: 12, color: '#444460', textAlign: 'center' }}>
          <Icon d={['M8 21h8','M12 17v4','M7 4h10l-1 9.5a5 5 0 01-8 0L7 4z','M5 7H3a2 2 0 000 4h2.3','M19 7h2a2 2 0 010 4h-2.3']} size={44} sw={1} color="#333348" />
          <p style={{ fontSize: 15 }}>{q || tab !== 'all' ? 'No hay torneos que coincidan' : 'No hay torneos en la plataforma'}</p>
          {tab === 'all' && !q && (
            <button onClick={() => setModal({ mode: 'create' })} style={{ marginTop: 4, padding: '9px 22px', borderRadius: 9999, border: 'none', background: '#3b5bff', color: '#fff', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 600, cursor: 'pointer' }}>
              Crear torneo
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(268px,1fr))', gap: 14 }}>
          {visible.map(t => (
            <TCard key={t.id} t={t}
              onEdit={() => setModal({ mode: 'edit', t })}
              onDelete={() => setDelTarget(t)}
              onPublish={() => handlePublish(t)}
            />
          ))}
        </div>
      )}

      {modal && <TModal mode={modal.mode} t={modal.t} onClose={() => setModal(null)} onSave={handleSave} />}
      {delTarget && <DeleteConfirm name={delTarget.name} onConfirm={handleDelete} onCancel={() => setDelTarget(null)} />}
      {toast && <Toast msg={toast} />}
    </div>
  )
}
