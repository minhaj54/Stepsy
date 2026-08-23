'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface BannerSlide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  theme: 'dark' | 'light' | 'gradient';
}

const banners: BannerSlide[] = [
  {
    id: 1,
    title: 'UNISEX ELEGANCE',
    subtitle: 'Step Into Style',
    description: 'Discover our curated collection of unisex footwear that blends comfort with contemporary fashion. Designed for everyone, crafted for all.',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=1600',
    ctaText: 'Shop Unisex Collection',
    ctaLink: '/shop?category=sneakers',
    secondaryCtaText: 'Explore All',
    secondaryCtaLink: '/shop',
    theme: 'dark',
  },
  {
    id: 2,
    title: 'STREET CULTURE',
    subtitle: 'Urban Fashion Forward',
    description: 'From street style to runway ready. Express your individuality with our exclusive range of sneakers and casual footwear.',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=1600',
    ctaText: 'Shop Sneakers',
    ctaLink: '/shop?category=sneakers',
    secondaryCtaText: 'New Arrivals',
    secondaryCtaLink: '/shop?filter=new',
    theme: 'gradient',
  },
  {
    id: 3,
    title: 'TIMELESS CLASSICS',
    subtitle: 'Elegant & Versatile',
    description: 'Elevate your everyday look with our collection of classic loafers, formal shoes, and versatile designs that never go out of style.',
    image: 'https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?auto=format&fit=crop&q=80&w=1600',
    ctaText: 'Shop Formal',
    ctaLink: '/shop?category=formal',
    secondaryCtaText: 'View Brands',
    secondaryCtaLink: '/shop',
    theme: 'light',
  },
  {
    id: 4,
    title: 'OUTDOOR ADVENTURE',
    subtitle: 'Built for the Journey',
    description: 'Rugged boots and outdoor footwear designed for those who dare to explore. Durable, comfortable, and ready for any terrain.',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=1600',
    ctaText: 'Shop Boots',
    ctaLink: '/shop?category=boots',
    secondaryCtaText: 'Shop All',
    secondaryCtaLink: '/shop',
    theme: 'dark',
  },
];

export default function FashionBanner() {
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const next = () => setCurrent((prev) => (prev + 1) % banners.length);
  const prev = () => setCurrent((prev) => (prev - 1 + banners.length) % banners.length);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(next, 4000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  // Drag handlers for manual scrolling
  const handleDragStart = (clientX: number) => {
    setIsDragging(true);
    setIsAutoPlaying(false);
    setDragStart(clientX);
    setDragOffset(0);
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging) return;
    setDragOffset(clientX - dragStart);
  };

  const handleDragEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const threshold = 50;
    if (dragOffset > threshold) {
      prev();
    } else if (dragOffset < -threshold) {
      next();
    }
    setDragOffset(0);
    // Resume auto-play after 5 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  };

  const onMouseUp = () => {
    handleDragEnd();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  };

  const onTouchEnd = () => {
    handleDragEnd();
  };

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'dark':
        return 'bg-background text-foreground';
      case 'light':
        return 'bg-muted text-foreground';
      case 'gradient':
        return 'bg-gradient-to-br from-primary/5 via-background to-accent/5 text-foreground';
      default:
        return 'bg-background text-foreground';
    }
  };

  const getOverlayClasses = (theme: string) => {
    switch (theme) {
      case 'dark':
        return 'bg-gradient-to-r from-background/95 via-background/70 to-background/30';
      case 'light':
        return 'bg-gradient-to-r from-muted/95 via-muted/70 to-muted/30';
      case 'gradient':
        return 'bg-gradient-to-r from-background/90 via-background/60 to-transparent';
      default:
        return 'bg-gradient-to-r from-background/95 via-background/70 to-background/30';
    }
  };

  const handleMouseLeave = () => {
    if (isDragging) {
      onMouseUp();
    } else {
      setIsAutoPlaying(true);
    }
  };

  return (
    <section className="relative w-full overflow-hidden">
      <div
        ref={containerRef}
        className={`flex transition-transform duration-700 ease-in-out ${getThemeClasses(banners[current].theme)} ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ transform: `translateX(calc(-${current * 100}% + ${dragOffset}px))` }}
        onMouseEnter={() => !isDragging && setIsAutoPlaying(false)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="w-full flex-shrink-0 relative min-h-[500px] sm:min-h-[600px] lg:min-h-[700px]"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover object-center"
                loading={banner.id === 1 ? 'eager' : 'lazy'}
              />
              <div className={`absolute inset-0 ${getOverlayClasses(banner.theme)}`} />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
              <div className="px-4 sm:px-6 lg:px-8 w-full max-w-7xl mx-auto">
                <div className="max-w-2xl space-y-4 sm:space-y-6">
                  <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight leading-[0.9]">
                    {banner.title.split(' ').map((word, i) => (
                      <span key={i} className={i === 1 ? 'text-primary' : ''}>
                        {word}{' '}
                      </span>
                    ))}
                  </h2>
                  <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-lg leading-relaxed">
                    {banner.description}
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link
                      href={banner.ctaLink}
                      className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 transform active:scale-95 flex items-center gap-2 text-sm"
                    >
                      {banner.ctaText}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    {banner.secondaryCtaText && banner.secondaryCtaLink && (
                      <Link
                        href={banner.secondaryCtaLink}
                        className="bg-background/80 hover:bg-background text-foreground border border-border hover:border-muted-foreground/50 px-5 py-2.5 sm:px-7 sm:py-3.5 rounded-xl font-semibold transition-all duration-300 text-sm backdrop-blur-sm"
                      >
                        {banner.secondaryCtaText}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Slide Number */}
            <div className="absolute bottom-6 right-6 z-20 text-right">
              <span className="text-5xl sm:text-6xl font-black text-foreground/10">
                {String(banner.id).padStart(2, '0')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows (hidden on mobile) */}
      <button
        onClick={() => { prev(); setIsAutoPlaying(false); }}
        className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-background/80 hover:bg-background text-foreground rounded-full border border-border shadow-lg transition-all duration-300 backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => { next(); setIsAutoPlaying(false); }}
        className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-background/80 hover:bg-background text-foreground rounded-full border border-border shadow-lg transition-all duration-300 backdrop-blur-sm"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setIsAutoPlaying(false); }}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? 'w-8 bg-primary' : 'w-2 bg-foreground/30 hover:bg-foreground/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
