import React, { Suspense } from 'react';
import ShopContent from './ShopContent';
import { getProducts, getBrands, getCategories } from '../../lib/data/products';

export const metadata = {
  title: "Shop Footwear - Whishkhu Marketplace",
  description: "Browse sneakers, boots, loafers and formal footwear. Filter by size, brand, and color."
};

export default async function ShopPage() {
  const [products, brands, categories] = await Promise.all([
    getProducts(),
    getBrands(),
    getCategories(),
  ]);

  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-400 gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wider animate-pulse">Loading Collection...</span>
      </div>
    }>
      <ShopContent products={products} brands={brands} categories={categories} />
    </Suspense>
  );
}
