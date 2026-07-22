'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const posters = [
  {
    id: 1,
    title: 'MEN\'S COLLECTION',
    subtitle: 'Bold & Confident',
    description: 'Step up your game with our men\'s footwear range. From sleek sneakers to rugged boots, find your perfect match.',
    image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&q=80&w=800',
    ctaText: 'Shop Men\'s',
    ctaLink: '/shop?gender=men',
    align: 'left',
  },
  {
    id: 2,
    title: 'WOMEN\'S COLLECTION',
    subtitle: 'Elegant & Stylish',
    description: 'Express your style with our women\'s footwear. Trendy sneakers, elegant heels, and comfortable casuals.',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
    ctaText: 'Shop Women\'s',
    ctaLink: '/shop?gender=women',
    align: 'right',
  },
];

export default function ModelPoster() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 sm:mb-16 space-y-3">
          <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Fashion Forward</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight">
            Worn With Confidence
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
            Discover how our footwear complements every style. From street fashion to formal elegance, find your perfect pair.
          </p>
        </div>

        {/* Two Big Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {posters.map((poster) => (
            <div
              key={poster.id}
              className="group relative aspect-[4/5] lg:aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer"
            >
              {/* Background Image */}
              <img
                src={poster.image}
                alt={poster.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />

              {/* Content */}
              <div className={`absolute inset-0 flex flex-col justify-end p-8 sm:p-10 ${
                poster.align === 'right' ? 'items-end text-right' : 'items-start text-left'
              }`}>
                <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3">
                  {poster.subtitle}
                </span>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tight mb-3">
                  {poster.title}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mb-6 leading-relaxed">
                  {poster.description}
                </p>
                <Link
                  href={poster.ctaLink}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 transform active:scale-95"
                >
                  {poster.ctaText}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Hover Border Effect */}
              <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-3xl transition-colors duration-300 pointer-events-none" />
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-10 sm:mt-16">
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 bg-secondary hover:bg-primary text-foreground hover:text-white border border-border hover:border-primary px-8 py-3.5 rounded-xl font-bold transition-all duration-300"
          >
            View All Collections
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
