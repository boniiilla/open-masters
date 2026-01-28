'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Email o contraseña incorrectos')
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-8">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-normal text-[var(--text-primary)] mb-2">
            Open Masters
          </h1>
          <p className="text-[var(--text-secondary)]">
            Inicia sesión en tu cuenta
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[var(--surface)] rounded-3xl overflow-hidden">
          {/* Header */}
          <div className="app-modal-header">
            <Link
              href="/"
              className="px-4 py-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-colors"
            >
              Volver
            </Link>
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              Iniciar Sesión
            </h2>
            <button
              type="submit"
              form="login-form"
              disabled={loading}
              className="px-6 py-2 rounded-full bg-[var(--primary)] text-black font-semibold hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </div>

          {/* Body */}
          <form id="login-form" onSubmit={handleSubmit} className="app-modal-body">
            {error && (
              <div className="p-4 rounded-full bg-red-500/10 text-red-400 text-sm border-2 border-red-500/20 text-center">
                {error}
              </div>
            )}

            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              className="app-input"
              placeholder="Email"
            />

            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="app-input"
              placeholder="Contraseña"
            />
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[var(--text-secondary)] text-sm">
            ¿No tienes una cuenta?{' '}
            <Link
              href="/auth/register"
              className="text-[var(--primary)] font-medium hover:underline"
            >
              Registrarse
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
