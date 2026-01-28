'use client';

import { useState, useRef } from 'react';
import Avatar from './Avatar';

interface PhotoUploadProps {
  user: {
    firstName?: string;
    lastName?: string;
    alias: string;
    profilePhoto?: string | null;
  };
  onUpload: (photoBase64: string) => void;
}

export default function PhotoUpload({ user, onUpload }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(user.profilePhoto || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreview(base64String);
      onUpload(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group cursor-pointer" onClick={handleClick}>
        <Avatar
          firstName={user.firstName}
          lastName={user.lastName}
          alias={user.alias}
          profilePhoto={preview}
          size="lg"
        />
        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
      </div>
      <button
        type="button"
        onClick={handleClick}
        className="text-sm text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
      >
        Cambiar foto de perfil
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
