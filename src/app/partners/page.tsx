import React from 'react';
import Link from 'next/link';
import { Store as StoreIcon, Users, ArrowRight, ExternalLink } from 'lucide-react';
import { getStores, getProductsByStore } from '../../lib/data/stores';
import ShimmerImage from '../../components/ShimmerImage';

export const metadata = {
  title: "Partner Stores | Independent Sellers & Premium Brands - Zarwinto",
  description: "Discover unique footwear collections from independent sellers and premium brands on Zarwinto. Shop authentic sneakers, boots, and designer shoes from trusted partner stores.",
  keywords: ["partner stores", "independent sellers", "premium brands", "footwear stores", "sneaker brands", "shoe sellers", "Zarwinto partners", "authentic footwear"],
  openGraph: {
    title: "Partner Stores | Independent Sellers & Premium Brands - Zarwinto",
    description: "Discover unique footwear collections from independent sellers and premium brands on Zarwinto.",
    url: "https://zarwinto.com/partners",
    siteName: "Zarwinto",
    type: "website",
  },
  alternates: {
    canonical: "https://zarwinto.com/partners",
  },
};

export default async function PartnersPage() {
  const stores = await getStores();

  // Fetch product counts for each store
  const storesWithCounts = await Promise.all(
    stores.map(async (store) => {
      const products = await getProductsByStore(store.id);
      return { ...store, productCount: products.length };
    })
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative py-8 sm:py-12 lg:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            <Users className="h-4 w-4" />
            Trusted Partners
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-foreground tracking-tight mb-4 sm:mb-6">
            Our <span className="gradient-text">Partner Stores</span>
          </h1>
          
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover premium footwear from our curated network of trusted sellers and brands. 
            Each partner brings unique styles, quality craftsmanship, and exceptional service.
          </p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y border-border bg-background/50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-4 sm:py-6">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 lg:gap-16">
            <div className="text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground">{stores.length}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-0.5 sm:mt-1">Partner Stores</p>
            </div>
            <div className="w-px h-6 sm:h-8 bg-white/[0.08] hidden sm:block" />
            <div className="text-center">
              <p className="text-xl sm:text-2xl lg:text-3xl font-black text-foreground">100%</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mt-0.5 sm:mt-1">Verified Sellers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Partners Grid */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto py-6 sm:py-10 lg:py-14">
        {storesWithCounts.length === 0 ? (
          <div className="text-center py-20">
            <StoreIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">No Partners Yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We're currently onboarding new partner stores. Check back soon to discover amazing footwear brands.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {storesWithCounts.map((store) => (
              <Link
                key={store.id}
                href={`/store/${store.slug}`}
                className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group"
              >
                {/* Store Banner */}
                <div className="h-32 sm:h-40 w-full bg-zinc-900 relative overflow-hidden">
                  {store.banner_url ? (
                    <img 
                      src={store.banner_url} 
                      alt={`${store.name} banner`} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 via-zinc-900 to-accent/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent" />
                </div>

                {/* Store Info */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex items-start gap-4 -mt-12 sm:-mt-14 mb-4">
                    {/* Store Logo */}
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden border-4 border-zinc-950 bg-zinc-800 shrink-0 shadow-xl">
                      {store.logo_url ? (
                        <img 
                          src={store.logo_url} 
                          alt={`${store.name} logo`} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <StoreIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-8 sm:pt-10">
                      <h3 className="text-lg font-bold text-foreground tracking-tight truncate group-hover:text-primary transition-colors">
                        {store.name}
                      </h3>
                      {store.social_handle && (
                        <p className="text-xs text-muted-foreground mt-0.5">@{store.social_handle}</p>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {store.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4 flex-grow">
                      {store.description}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {store.productCount} {store.productCount === 1 ? 'product' : 'products'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:text-primary-hover transition-colors">
                      Visit Store
                      <ExternalLink className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-8 sm:pb-12">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />
          <div className="relative">
            <StoreIcon className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-3 sm:mb-4" />
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2 sm:mb-3">
              Want to become a partner?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto mb-4 sm:mb-6">
              Join our growing community of sellers and reach thousands of customers looking for premium footwear.
            </p>
            <Link
              href="/open-store"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl font-bold text-xs sm:text-sm transition-all active:scale-95"
            >
              Open Your Store
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
