import React from 'react';

interface VerifiedBadgeProps {
  className?: string;
  size?: number;
}

export default function VerifiedBadge({ className = '', size = 16 }: VerifiedBadgeProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-label="Verified store"
      role="img"
      className={`inline-block align-middle ${className}`}
    >
      <path
        fill="currentColor"
        className="text-primary"
        d="M12.00 1.00 L13.07 2.46 L14.45 1.28 L15.17 2.94 L16.77 2.09 L17.11 3.87 L18.86 3.40 L18.79 5.21 L20.60 5.14 L20.13 6.89 L21.91 7.23 L21.06 8.83 L22.72 9.55 L21.54 10.93 L23.00 12.00 L21.54 13.07 L22.72 14.45 L21.06 15.17 L21.91 16.77 L20.13 17.11 L20.60 18.86 L18.79 18.79 L18.86 20.60 L17.11 20.13 L16.77 21.91 L15.17 21.06 L14.45 22.72 L13.07 21.54 L12.00 23.00 L10.93 21.54 L9.55 22.72 L8.83 21.06 L7.23 21.91 L6.89 20.13 L5.14 20.60 L5.21 18.79 L3.40 18.86 L3.87 17.11 L2.09 16.77 L2.94 15.17 L1.28 14.45 L2.46 13.07 L1.00 12.00 L2.46 10.93 L1.28 9.55 L2.94 8.83 L2.09 7.23 L3.87 6.89 L3.40 5.14 L5.21 5.21 L5.14 3.40 L6.89 3.87 L7.23 2.09 L8.83 2.94 L9.55 1.28 L10.93 2.46 Z"
      />
      <path
        d="M7 12.5l3 3 7-7"
        stroke="white"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
