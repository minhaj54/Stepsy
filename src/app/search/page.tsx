import React, { Suspense } from 'react';
import SearchContent from './SearchContent';
import { getProducts } from '../../lib/data/products';

export const metadata = {
  title: "Search Footwear - Whishkhu",
  description: "Search for premium running sneakers, leather boots, loafers and comfort shoes."
};

export default async function SearchPage() {
  const products = await getProducts();

  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-400 gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wider animate-pulse">Searching Whishkhu...</span>
      </div>
    }>
      <SearchContent products={products} />
    </Suspense>
  );
}
