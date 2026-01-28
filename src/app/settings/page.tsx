'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Avatar from '@/components/Avatar';
import PhotoUpload from '@/components/PhotoUpload';
import ChangePasswordModal from '@/components/ChangePasswordModal';

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  alias: string;
  profilePhoto?: string | null;
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status]);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.success) {
        setUserData(data.data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userData) return;

    setSaving(true);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          alias: userData.alias,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.data);
        alert('Perfil actualizado correctamente');
      } else {
        alert(data.error || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (photoBase64: string) => {
    if (!userData) return;

    setSaving(true);
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ profilePhoto: photoBase64 }),
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.data);
      }
    } catch (error) {
      console.error('Error updating photo:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (field: keyof UserData, value: string) => {
    if (!userData) return;
    setUserData({ ...userData, [field]: value });
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };

  if (loading || !userData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-3 h-3 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-3 h-3 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in px-5 md:px-0">
      {/* Header */}
      <div className="pt-4">
        <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
          Perfil
        </h1>
      </div>

      {/* Profile Photo */}
      <div className="flex justify-center">
        <PhotoUpload user={userData} onUpload={handlePhotoUpload} />
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-2 px-5">
            Nombre
          </label>
          <input
            type="text"
            value={userData.firstName}
            onChange={(e) => handleFieldChange('firstName', e.target.value)}
            placeholder="Tu nombre"
            className="app-input"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-2 px-5">
            Apellido
          </label>
          <input
            type="text"
            value={userData.lastName}
            onChange={(e) => handleFieldChange('lastName', e.target.value)}
            placeholder="Tu apellido"
            className="app-input"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-2 px-5">
            Alias
          </label>
          <input
            type="text"
            value={userData.alias}
            onChange={(e) => handleFieldChange('alias', e.target.value)}
            placeholder="Tu alias"
            className="app-input"
          />
        </div>

        <div>
          <label className="block text-xs text-[var(--text-secondary)] mb-2 px-5">
            Email
          </label>
          <input
            type="email"
            value={userData.email}
            disabled
            className="app-input opacity-50 cursor-not-allowed"
          />
        </div>
      </div>

      {/* Security */}
      <div>
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full app-input text-left flex items-center justify-between hover:border-[var(--primary)] transition-colors"
        >
          <span className="text-[var(--text-primary)]">
            Cambiar Contraseña
          </span>
          <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 pb-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 px-6 py-3 rounded-full font-semibold bg-[var(--primary)] text-black hover:bg-[var(--primary-dark)] transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 px-6 py-3 rounded-full font-semibold bg-red-500 text-white hover:bg-red-600 transition-colors active:scale-95 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Cerrar Sesión
        </button>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
}
