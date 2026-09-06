'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '../types';
import ShimmerImage from './ShimmerImage';

interface FeaturedProductCardProps {
  product: Product;
}

export default function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const imageSrc = product.images?.[0] || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600';
  const price = product.sale_price || product.price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block rounded-2xl sm:rounded-3xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.25)] hover:-translate-y-1"
    >
      <div className="aspect-square overflow-hidden bg-background/40">
        <ShimmerImage
          src={imageSrc}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs font-bold text-primary uppercase tracking-wider mb-1 truncate">
          {product.brand_name}
        </p>
        <h3 className="text-xs sm:text-sm font-bold text-foreground line-clamp-1 mb-1.5 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        <p className="text-sm sm:text-base font-black text-foreground">
          ₹{price}
        </p>
      </div>
    </Link>
  );
}
