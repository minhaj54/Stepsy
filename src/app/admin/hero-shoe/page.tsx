import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAdminProducts, getHomeBannerProductId } from '../../../lib/data/products';
import HeroShoeClient from './HeroShoeClient';

export const metadata = {
  title: 'Hero Shoe - Super Admin',
};

export default async function AdminHeroShoePage() {
  const [products, currentId] = await Promise.all([
    getAdminProducts(),
    getHomeBannerProductId(),
  ]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
      >
        <ArrowLeft className="h-3 w-3" /> Dashboard
      </Link>
      <HeroShoeClient products={products} currentProductId={currentId} />
    </div>
  );
}
