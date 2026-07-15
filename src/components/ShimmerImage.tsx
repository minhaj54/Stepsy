'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ShimmerImageProps {
  src: string;
  alt: string;
  className?: string;
  shimmerClassName?: string;
  onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
}

export default function ShimmerImage({ src, alt, className = '', shimmerClassName = '', onClick }: ShimmerImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setLoaded(false);
  }, [src]);

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;

    // If image is already cached/complete, show it immediately
    if (img.complete) {
      setLoaded(true);
      return;
    }

    // Fallback: show image after 3 seconds even if onLoad hasn't fired
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, [src]);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Shimmer skeleton */}
      {!loaded && (
        <div
          className={`absolute inset-0 ${shimmerClassName}`}
          style={{
            background: 'linear-gradient(90deg, #27272a 0%, #3f3f46 50%, #27272a 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onClick={onClick}
        className={`w-full h-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
