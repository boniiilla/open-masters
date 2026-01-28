'use client';

import { useState, useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Avatar from './Avatar';

interface ProfileDropdownProps {
  user: {
    firstName: string;
    lastName: string;
    alias: string;
    profilePhoto?: string | null;
  };
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  const handleSettings = () => {
    setIsOpen(false);
    router.push('/settings');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="press-effect flex items-center gap-2 p-1 rounded-full hover:bg-[var(--surface)] transition-colors"
        aria-label="Perfil de usuario"
      >
        <Avatar
          firstName={user.firstName}
          lastName={user.lastName}
          alias={user.alias}
          profilePhoto={user.profilePhoto}
          size="sm"
        />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 min-w-48 bg-[var(--surface)] rounded-xl shadow-2xl border border-[var(--surface-elevated)] overflow-hidden animate-scale-in z-50">
          <div className="p-4 border-b border-[var(--surface-elevated)]">
            <div className="flex items-center gap-3">
              <Avatar
                firstName={user.firstName}
                lastName={user.lastName}
                alias={user.alias}
                profilePhoto={user.profilePhoto}
                size="md"
              />
              <div>
                <p className="font-semibold text-sm text-[var(--text-primary)]">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-[var(--text-secondary)]">
                  @{user.alias}
                </p>
              </div>
            </div>
          </div>

          <div className="py-1">
            <button
              onClick={handleSettings}
              className="flex items-center gap-3 px-4 py-3 w-full text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Configuración
            </button>
          </div>

          <div className="border-t border-[var(--surface-elevated)] py-1">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
