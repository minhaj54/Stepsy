'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';
import ShimmerImage from './ShimmerImage';

interface FeaturedLargeCardProps {
  product: Product;
}

export default function FeaturedLargeCard({ product }: FeaturedLargeCardProps) {
  const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800';
  const price = product.sale_price || product.price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex flex-col justify-end aspect-[3/4] sm:aspect-auto sm:h-full rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
    >
      <div className="absolute inset-0">
        <ShimmerImage
          src={imageSrc}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent" />
      </div>

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <p className="text-[10px] sm:text-xs font-bold text-accent uppercase tracking-wider mb-2 sm:mb-3">
          {product.brand_name}
        </p>
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground tracking-tight mb-2 sm:mb-3 leading-tight">
          {product.title}
        </h3>
        <p className="text-base sm:text-lg font-bold text-foreground mb-4 sm:mb-6">
          ₹{price}
        </p>
        <span className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all duration-300 group-hover:gap-3">
          Shop Now
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Link>
  );
}
