'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import ProfileDropdown from '../ProfileDropdown'
import { useState, useEffect } from 'react'
import Avatar from '../Avatar'

export function Navbar() {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [userData, setUserData] = useState<any>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  useEffect(() => {
    if (session?.user) {
      setUserData({
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        alias: session.user.alias || '',
        profilePhoto: null,
      })
    }
  }, [session])

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Buenos días!'
    if (hour < 18) return 'Buenas tardes!'
    return 'Buenas noches!'
  }

  const navItems = [
    {
      href: '/',
      label: 'Inicio',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      href: '/tournaments',
      label: 'Mi Player',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      href: '/settings',
      label: 'Perfil',
      icon: (active: boolean) => (
        <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 0 : 2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex app-sidebar">
        {/* Logo */}
        <div className="p-6 border-b border-[var(--surface-elevated)]">
          <Link href="/" className="flex items-center group">
            <span className="text-2xl font-normal text-[var(--text-primary)]">
              Open Masters
            </span>
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`app-sidebar-item ${active ? 'app-sidebar-item-active' : ''}`}
                >
                  <span className={active ? 'text-[var(--primary)]' : ''}>
                    {item.icon(active)}
                  </span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom Section - User */}
        <div className="p-4 border-t border-[var(--surface-elevated)]">
          {status === 'loading' ? (
            <div className="h-12 bg-[var(--surface-elevated)] rounded-xl animate-pulse" />
          ) : session && userData ? (
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--surface-elevated)] transition-colors">
              <Avatar
                firstName={userData.firstName}
                lastName={userData.lastName}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {userData.alias || `${userData.firstName} ${userData.lastName}`}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">Ver perfil</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Link href="/auth/login" className="app-btn-secondary w-full text-center block text-sm py-2">
                Iniciar sesión
              </Link>
              <Link href="/auth/register" className="app-btn-primary w-full text-center block text-sm py-2">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* ===== MOBILE TOP HEADER ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--background)]">
        <div className="flex items-center justify-between px-5 pt-16 pb-4">
          {/* Left: Logo */}
          <Link href="/">
            <h1 className="text-xl font-normal text-[var(--text-primary)]">
              Open Masters
            </h1>
          </Link>

          {/* Right: User Avatar */}
          {session && userData ? (
            <Link href="/settings">
              <Avatar
                firstName={userData.firstName}
                lastName={userData.lastName}
                size="sm"
              />
            </Link>
          ) : (
            <Link href="/auth/login">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-elevated)] flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </Link>
          )}
        </div>

        {/* Search Bar */}
        <div className="app-search">
          <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search..."
          />
        </div>
      </header>

      {/* ===== MOBILE BOTTOM NAVIGATION ===== */}
      <nav className="md:hidden app-bottom-nav">
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={active ? 'app-bottom-nav-icon-active' : 'app-bottom-nav-icon-inactive'}
            >
              <span className={active ? 'text-black' : 'text-[var(--text-secondary)]'}>
                {item.icon(active)}
              </span>
            </Link>
          )
        })}
      </nav>

      {/* Spacer for mobile header */}
      <div className="md:hidden h-36" />
    </>
  )
}
