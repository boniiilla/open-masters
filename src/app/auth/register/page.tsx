'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no puede superar los 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const data = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      alias: formData.get('alias') as string,
      profilePhoto: profilePhoto || undefined,
    }

    const confirmPassword = formData.get('confirmPassword') as string
    if (data.password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (data.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!result.success) {
        setError(result.error)
        setLoading(false)
        return
      }

      router.push('/auth/login?registered=true')
    } catch {
      setError('Error al crear la cuenta')
      setLoading(false)
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
            Crea tu cuenta
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
              Registro
            </h2>
            <button
              type="submit"
              form="register-form"
              disabled={loading}
              className="px-6 py-2 rounded-full bg-[var(--primary)] text-black font-semibold hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>

          {/* Body */}
          <form id="register-form" onSubmit={handleSubmit} className="app-modal-body">
            {error && (
              <div className="p-4 rounded-full bg-red-500/10 text-red-400 text-sm border-2 border-red-500/20 text-center">
                {error}
              </div>
            )}

            {/* Photo Upload */}
            <label htmlFor="photo" className="block cursor-pointer group">
              <div className="w-full aspect-[16/9] rounded-3xl bg-[var(--surface-elevated)] border-2 border-dashed border-[var(--surface-elevated)] group-hover:border-[var(--primary)] flex items-center justify-center overflow-hidden transition-colors">
                {profilePhoto ? (
                  <img src={profilePhoto} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-[var(--surface)] flex items-center justify-center">
                      <svg className="w-8 h-8 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] font-medium">Añadir foto de perfil</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Opcional - JPG, PNG o GIF (max. 5MB)</p>
                  </div>
                )}
              </div>
              <input type="file" id="photo" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>

            <input
              type="text"
              name="firstName"
              required
              autoComplete="given-name"
              className="app-input"
              placeholder="Nombre"
            />

            <input
              type="text"
              name="lastName"
              required
              autoComplete="family-name"
              className="app-input"
              placeholder="Apellido"
            />

            <input
              type="text"
              name="alias"
              required
              autoComplete="nickname"
              className="app-input"
              placeholder="Alias (nombre de jugador)"
            />

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
              minLength={6}
              autoComplete="new-password"
              className="app-input"
              placeholder="Contraseña (mín. 6 caracteres)"
            />

            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              autoComplete="new-password"
              className="app-input"
              placeholder="Confirmar contraseña"
            />
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-[var(--text-secondary)] text-sm">
            ¿Ya tienes una cuenta?{' '}
            <Link
              href="/auth/login"
              className="text-[var(--primary)] font-medium hover:underline"
            >
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
