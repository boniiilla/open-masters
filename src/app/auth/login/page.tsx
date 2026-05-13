'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogoVertical } from '@/components/Logo'

const TESTIMONIALS = [
  { text: '"Organizamos la liga del bar en 5 minutos. Nunca fue tan fácil."', author: 'Matías B., Barcelona' },
  { text: '"El formato dobles con grupos funciona perfecto para nuestro torneo semanal."', author: 'Lola M., Madrid' },
  { text: '"Desde que usamos Open Masters el nivel ha subido muchísimo."', author: 'Pep G., Valencia' },
]

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      {open ? (
        <>
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M17.94 17.94A10.07 10.07 0 0112 20C7 20 2.73 16.39 1 12c.7-1.76 1.83-3.3 3.25-4.55M9.9 4.24A9.12 9.12 0 0112 4c5 0 9.27 3.61 11 8-.35.88-.82 1.71-1.39 2.47M3 3l18 18" />
        </>
      )}
    </svg>
  )
}

function LeftPanel() {
  const [idx, setIdx] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    timerRef.current = setInterval(() => setIdx(i => (i + 1) % TESTIMONIALS.length), 4000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  return (
    <div className="relative flex-none hidden md:flex flex-col p-12 overflow-hidden" style={{ width: 480, background: 'linear-gradient(160deg, #0f0f0f 0%, #0a0a0a 100%)' }}>
      {/* Gradient blobs */}
      <div className="absolute pointer-events-none" style={{ width: 340, height: 340, borderRadius: '50%', background: 'rgba(42,50,235,.22)', filter: 'blur(80px)', top: -80, left: -80 }} />
      <div className="absolute pointer-events-none" style={{ width: 260, height: 260, borderRadius: '50%', background: 'rgba(91,97,239,.15)', filter: 'blur(80px)', bottom: 60, right: -60 }} />

      {/* Wordmark */}
      <div className="relative z-10 flex justify-center">
        <LogoVertical height={220} />
      </div>

      {/* Hero copy */}
      <div className="relative z-10 my-auto">
        <p className="text-xs font-semibold uppercase tracking-widest mb-5" style={{ color: '#5B61EF' }}>
          Gestión de torneos de futbolín
        </p>
        <h1 className="text-5xl font-black leading-tight tracking-tight mb-5">
          El futbolín<br />se juega en serio.
        </h1>
        <p className="text-[var(--text-secondary)] leading-relaxed max-w-sm" style={{ fontSize: 15 }}>
          Crea torneos con grupos, eliminatorias, dobles o individuales. Inscribe equipos, sigue los resultados y lleva el ranking de tu local.
        </p>
      </div>

      {/* Testimonial */}
      <div className="relative z-10 mt-auto rounded-2xl p-5 border-2" style={{ background: '#1a1a1a', borderColor: '#252525' }}>
        <p className="italic leading-relaxed mb-3" style={{ fontSize: 14, color: '#ccc', minHeight: 48 }}>
          {TESTIMONIALS[idx].text}
        </p>
        <p style={{ fontSize: 12, color: '#555', fontWeight: 500 }}>{TESTIMONIALS[idx].author}</p>
        <div className="flex gap-1.5 mt-3">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="h-1 rounded-full transition-all duration-300"
              style={{ background: i === idx ? '#2A32EB' : '#333', flex: i === idx ? 2 : 1 }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function AuthFormInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'login'

  const [tab, setTab] = useState<'login' | 'register'>(initialTab)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [alias, setAlias] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function switchTab(t: 'login' | 'register') {
    setTab(t)
    setError('')
    setSuccess('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!email || !password) { setError('Por favor, completa todos los campos.'); return }

    if (tab === 'register') {
      if (!firstName || !lastName || !alias) { setError('Por favor, completa todos los campos.'); return }
      if (password !== confirmPassword) { setError('Las contraseñas no coinciden.'); return }
      if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }

      setLoading(true)
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, firstName, lastName, alias }),
        })
        const data = await res.json()
        if (!data.success) { setError(data.error || 'Error al crear la cuenta'); return }
        setSuccess('¡Cuenta creada! Iniciando sesión…')
        const result = await signIn('credentials', { email, password, redirect: false })
        if (result?.error) { switchTab('login'); return }
        router.push('/')
        router.refresh()
      } catch {
        setError('Error al crear la cuenta')
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(true)
      const result = await signIn('credentials', { email, password, redirect: false })
      setLoading(false)
      if (result?.error) { setError('Email o contraseña incorrectos'); return }
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto" style={{ background: '#0f0f0f' }}>
      {/* Mobile logo */}
      <div className="md:hidden flex flex-col items-center mb-8">
        <LogoVertical height={180} />
      </div>

      <div className="w-full max-w-sm flex flex-col gap-5">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-1">
            {tab === 'login' ? 'Inicia sesión' : 'Crea tu cuenta'}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            {tab === 'login' ? 'Accede a tus torneos y resultados' : 'Únete a la comunidad de Open Masters'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-full" style={{ background: '#1a1a1a' }}>
          {(['login', 'register'] as const).map(t => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className="flex-1 py-2 rounded-full text-sm font-medium transition-all duration-300"
              style={tab === t ? { background: '#2A32EB', color: '#fff', boxShadow: '0 4px 12px rgba(42,50,235,.35)' } : { background: 'transparent', color: '#999' }}
            >
              {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {tab === 'register' && (
            <>
              <Field label="Nombre">
                <input
                  type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  placeholder="Tu nombre" autoComplete="given-name"
                  className="auth-input"
                />
              </Field>
              <Field label="Apellido">
                <input
                  type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                  placeholder="Tu apellido" autoComplete="family-name"
                  className="auth-input"
                />
              </Field>
              <Field label="Alias">
                <input
                  type="text" value={alias} onChange={e => setAlias(e.target.value)}
                  placeholder="futbolin_pro" autoComplete="nickname"
                  className="auth-input"
                />
              </Field>
            </>
          )}

          <Field label="Email">
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="tu@email.com" autoComplete="email"
              className="auth-input"
            />
          </Field>

          <Field label="Contraseña">
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                className="auth-input pr-12"
              />
              <button
                type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-white transition-colors"
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
          </Field>

          {tab === 'register' && (
            <Field label="Confirmar contraseña">
              <input
                type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••" autoComplete="new-password"
                className="auth-input"
              />
            </Field>
          )}

          {tab === 'login' && (
            <div className="text-right -mt-1">
              <span className="text-sm font-medium cursor-pointer" style={{ color: '#5B61EF' }}>
                ¿Olvidaste tu contraseña?
              </span>
            </div>
          )}

          {error && (
            <div className="px-5 py-3 rounded-full text-sm text-center" style={{ background: 'rgba(239,68,68,.10)', border: '2px solid rgba(239,68,68,.20)', color: '#f87171' }}>
              {error}
            </div>
          )}
          {success && (
            <div className="px-5 py-3 rounded-full text-sm text-center" style={{ background: 'rgba(74,222,128,.10)', border: '2px solid rgba(74,222,128,.20)', color: '#4ade80' }}>
              {success}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            className="w-full py-3 rounded-full font-semibold text-white text-sm transition-all duration-300 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #2A32EB 0%, #5B61EF 100%)', boxShadow: '0 8px 24px rgba(42,50,235,.35)' }}
          >
            {loading ? 'Un momento…' : tab === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm" style={{ color: '#555' }}>
          {tab === 'login' ? (
            <>¿Aún no tienes cuenta?{' '}
              <button onClick={() => switchTab('register')} className="font-semibold" style={{ color: '#5B61EF' }}>Regístrate gratis</button>
            </>
          ) : (
            <>¿Ya tienes cuenta?{' '}
              <button onClick={() => switchTab('login')} className="font-semibold" style={{ color: '#5B61EF' }}>Inicia sesión</button>
            </>
          )}
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold uppercase tracking-widest pl-4" style={{ color: '#999' }}>{label}</label>
      {children}
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>
      <LeftPanel />
      <Suspense fallback={null}>
        <AuthFormInner />
      </Suspense>
    </div>
  )
}
