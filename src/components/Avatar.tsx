'use client';

import Image from 'next/image';

interface AvatarProps {
  firstName?: string;
  lastName?: string;
  alias?: string;
  profilePhoto?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const getInitials = (firstName?: string, lastName?: string, alias?: string): string => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (alias) {
    return alias.charAt(0).toUpperCase();
  }
  return '?';
};

const getBackgroundColor = (firstName?: string, lastName?: string, alias?: string): string => {
  const colors = [
    'bg-cyan-500',
    'bg-teal-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  const str = firstName || alias || 'default';
  const index = str.charCodeAt(0) % colors.length;
  return colors[index];
};

export default function Avatar({
  firstName,
  lastName,
  alias,
  profilePhoto,
  size = 'md',
  className = ''
}: AvatarProps) {
  const sizeClasses = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-20 h-20 text-lg',
  };

  const sizeClass = sizeClasses[size];
  const bgColor = getBackgroundColor(firstName, lastName, alias);

  if (profilePhoto) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden relative ${className}`}>
        <Image
          src={profilePhoto}
          alt={alias || `${firstName} ${lastName}`}
          fill
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${sizeClass} rounded-full ${bgColor} text-white font-semibold flex items-center justify-center ${className}`}>
      {getInitials(firstName, lastName, alias)}
    </div>
  );
}
