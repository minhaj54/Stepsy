import React, { Suspense } from 'react';
import ShopContent from './ShopContent';

export const metadata = {
  title: "Shop Footwear - Stepzy Marketplace",
  description: "Browse sneakers, boots, loafers and formal footwear. Filter by size, brand, and color."
};

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-400 gap-4">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-semibold tracking-wider animate-pulse">Loading Collection...</span>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
