'use client';

import { useState } from 'react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Error al cambiar la contraseña');
        return;
      }

      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError('Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="app-modal-backdrop" onClick={onClose}>
      <div className="bg-[var(--surface)] rounded-3xl w-full max-w-md animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="app-modal-header">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-full text-[var(--text-secondary)] hover:bg-[var(--surface-elevated)] transition-colors"
          >
            Cancelar
          </button>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">
            Cambiar Contraseña
          </h2>
          <button
            type="submit"
            form="change-password-form"
            disabled={loading}
            className="px-6 py-2 rounded-full bg-[var(--primary)] text-black font-semibold hover:bg-[var(--primary-dark)] transition-colors disabled:opacity-50"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>

        {/* Body */}
        <form id="change-password-form" onSubmit={handleSubmit} className="app-modal-body">
          {error && (
            <div className="p-4 rounded-full bg-red-500/10 text-red-400 text-sm border-2 border-red-500/20 text-center">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 rounded-full bg-green-500/10 text-green-400 text-sm border-2 border-green-500/20 text-center">
              Contraseña actualizada correctamente
            </div>
          )}

          <input
            type="password"
            placeholder="Contraseña actual"
            className="app-input"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Nueva contraseña (mín. 6 caracteres)"
            className="app-input"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            className="app-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </form>
      </div>
    </div>
  );
}
