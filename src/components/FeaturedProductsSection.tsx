'use client';

import React from 'react';
import { Product } from '../types';
import FeaturedProductCard from './FeaturedProductCard';
import FeaturedLargeCard from './FeaturedLargeCard';

interface FeaturedProductsSectionProps {
  products: Product[];
}

function pickProducts(products: Product[]): { featured: Product; supporting: Product[] } {
  if (!products.length) {
    return { featured: null!, supporting: [] };
  }

  const scored = products.map((p) => ({
    product: p,
    score: (p.bestSeller ? 3 : 0) + (p.featured ? 2 : 0) + (p.newArrival ? 1 : 0),
  }));

  scored.sort((a, b) => b.score - a.score);

  const featured = scored[0]?.product ?? products[0];
  const supporting = scored.slice(1, 5).map((s) => s.product);

  while (supporting.length < 4) {
    const remaining = products.filter((p) => p.id !== featured.id && !supporting.some((s) => s.id === p.id));
    if (!remaining.length) break;
    supporting.push(remaining[0]);
  }

  return { featured, supporting: supporting.slice(0, 4) };
}

export default function FeaturedProductsSection({ products }: FeaturedProductsSectionProps) {
  const { featured, supporting } = pickProducts(products);

  if (!featured) {
    return null;
  }

  return (
    <section className="relative bg-card border-y border-border">
      <div className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 sm:mb-10 lg:mb-14">
            <span className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-[0.2em]">
              Zarwinto Picks
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight mt-2 sm:mt-3">
              Step Into Your Favorites
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm mt-2 max-w-lg">
              Discover the pairs our customers keep coming back to.
            </p>
          </div>

          {/* Asymmetric Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 items-stretch">
            {/* Left: 4 small products */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
              {supporting.map((product) => (
                <FeaturedProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Right: 1 large featured */}
            <div className="lg:col-span-7 mt-4 lg:mt-0">
              <FeaturedLargeCard product={featured} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
