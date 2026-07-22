import React, { Suspense } from 'react';
import ShopContent from './ShopContent';
import { getProducts, getBrands, getCategories } from '../../lib/data/products';
import { BreadcrumbSchema } from '../../components/JsonLd';

export const metadata = {
  title: "Shop Footwear Online | Sneakers, Boots, Loafers - Zarwinto",
  description: "Shop premium footwear at Zarwinto. Browse sneakers, boots, loafers, formal shoes, and athletic runners from top brands. Free shipping on orders above ₹999. COD available.",
  keywords: ["buy shoes online", "footwear store", "sneakers", "boots", "loafers", "formal shoes", "athletic shoes", "Zarwinto", "online shoe store", "best footwear brand"],
  openGraph: {
    title: "Shop Footwear Online | Sneakers, Boots, Loafers - Zarwinto",
    description: "Shop premium footwear at Zarwinto. Browse sneakers, boots, loafers, formal shoes, and athletic runners from top brands.",
    url: "https://zarwinto.com/shop",
    siteName: "Zarwinto",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop Footwear Online | Sneakers, Boots, Loafers - Zarwinto",
    description: "Shop premium footwear at Zarwinto. Browse sneakers, boots, loafers, formal shoes, and athletic runners from top brands.",
  },
  alternates: {
    canonical: "https://zarwinto.com/shop",
  },
};

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const [products, brands, categories] = await Promise.all([
    getProducts(),
    getBrands(),
    getCategories(),
  ]);

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Home', url: 'https://zarwinto.com' },
          { name: 'Shop', url: 'https://zarwinto.com/shop' },
        ]}
      />
      <Suspense fallback={<ShopSkeleton />}>
        <ShopContent products={products} brands={brands} categories={categories} />
      </Suspense>
    </>
  );
}

function ShopSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Sidebar placeholder */}
        <aside className="hidden lg:block space-y-8 glass-card p-6 rounded-2xl border border-border">
          <div className="h-5 w-32 rounded bg-zinc-800 animate-pulse" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 w-full rounded bg-zinc-800 animate-pulse" />
            ))}
          </div>
          <div className="space-y-2 pt-4 border-t border-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 w-3/4 rounded bg-zinc-800 animate-pulse" />
            ))}
          </div>
        </aside>

        {/* Product grid placeholder */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative group border border-border"
              >
                {/* Image placeholder */}
                <div className="block aspect-square w-full bg-background/40 relative overflow-hidden">
                  <div className="shimmer absolute inset-0" />
                </div>

                {/* Details placeholder */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <div className="h-3 w-16 rounded bg-zinc-800 animate-pulse" />
                      <div className="h-3 w-8 rounded bg-zinc-800 animate-pulse" />
                    </div>
                    <div className="h-4 w-3/4 rounded bg-zinc-800 animate-pulse mt-1" />
                  </div>
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-border">
                    <div className="h-4 w-20 rounded bg-zinc-800 animate-pulse" />
                    <div className="h-8 w-8 rounded-xl bg-zinc-800 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
