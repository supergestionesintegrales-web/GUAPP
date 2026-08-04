import React from 'react';

interface GuappLogoProps {
  className?: string;
  gradientId?: string;
}

export const GuappLogo: React.FC<GuappLogoProps> = ({
  className = 'w-full h-full',
  gradientId = 'guappLogoGrad',
}) => (
  <svg viewBox="0 0 256 256" fill="none" className={className} aria-hidden="true">
    <defs>
      <linearGradient id={gradientId} x1="20%" y1="20%" x2="80%" y2="80%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#bfdbfe" />
      </linearGradient>
    </defs>
    <circle cx="128" cy="110" r="72" fill={`url(#${gradientId})`} />
    <path d="M 70 90 Q 50 70 70 50 Q 90 40 110 50" fill={`url(#${gradientId})`} />
    <path
      d="M 145 160 L 195 220"
      stroke={`url(#${gradientId})`}
      strokeWidth="32"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
