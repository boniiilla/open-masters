'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  alias: string
  profilePhoto: string | null
  createdAt: string
}

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [id])

  async function fetchUser() {
    const response = await fetch(`/api/users/${id}`)
    const data = await response.json()
    if (data.success) {
      setUser(data.data)
    }
    setLoading(false)
  }

  if (loading) {
    return <div className="text-center py-8">Cargando...</div>
  }

  if (!user) {
    return <div className="text-center py-8">Usuario no encontrado</div>
  }

  return (
    <div>
      <Link href="/users" className="text-primary-600 hover:text-primary-500 text-sm mb-4 inline-block">
        &larr; Volver a jugadores
      </Link>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt={user.alias} className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-gray-400">
                {user.firstName[0]}{user.lastName[0]}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{user.alias}</h1>
            <p className="text-gray-500 dark:text-gray-400">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{user.email}</p>
            <p className="text-xs text-gray-400 mt-2">
              Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
