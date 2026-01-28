'use client'

import { useState, useEffect } from 'react'
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

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    const url = search ? `/api/users?search=${encodeURIComponent(search)}` : '/api/users'
    const response = await fetch(url)
    const data = await response.json()
    if (data.success) {
      setUsers(data.data)
    }
    setLoading(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    fetchUsers()
  }

  if (loading && users.length === 0) {
    return <div className="text-center py-8">Cargando...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Jugadores</h1>
        <Link
          href="/auth/register"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Nuevo Jugador
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, alias o email..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <button
            type="submit"
            className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-4 py-2 rounded-md text-sm font-medium text-gray-900 dark:text-white"
          >
            Buscar
          </button>
        </div>
      </form>

      {users.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No hay jugadores registrados
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/users/${user.id}`}
              className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.alias} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-bold text-gray-400">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{user.alias}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.firstName} {user.lastName}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
