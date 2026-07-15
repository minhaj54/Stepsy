import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Store as StoreIcon, AtSign, Package, ArrowRight, Settings, ExternalLink, Star, TrendingUp } from 'lucide-react';
import { getStoreBySlug, getProductsByStore } from '../../../lib/data/stores';
import { getCurrentUser } from '../../../lib/supabase/server';
import ShimmerImage from '../../../components/ShimmerImage';

export const dynamic = 'force-dynamic';

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const products = await getProductsByStore(store.id);
  const user = await getCurrentUser();
  const isOwner = user?.id === store.owner_id;

  return (
    <div className="min-h-screen pb-16">
      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 lg:h-96 w-full bg-zinc-900 overflow-hidden">
        {store.banner_url ? (
          <img src={store.banner_url} alt={`${store.name} banner`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-zinc-900 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        
        {/* Store Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 sm:gap-6">
              {/* Store Logo */}
              <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-2xl overflow-hidden border-4 border-zinc-950 bg-zinc-800 shrink-0 shadow-2xl -mt-16 sm:-mt-20">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={`${store.name} logo`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                    <StoreIcon className="h-12 w-12 text-zinc-500" />
                  </div>
                )}
              </div>

              {/* Store Details */}
              <div className="flex-1 min-w-0 pt-4 sm:pt-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight truncate">
                    {store.name}
                  </h1>
                  {isOwner && (
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary rounded-md">
                      Owner
                    </span>
                  )}
                </div>
                
                {store.social_handle && (
                  <a
                    href={`https://instagram.com/${store.social_handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary-hover transition-colors"
                  >
                    <AtSign className="h-4 w-4" />@{store.social_handle}
                  </a>
                )}

                {/* Stats */}
                <div className="flex items-center gap-6 mt-3">
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-white">{products.length}</span> Products
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-white">4.8</span> Rating
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-400">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="font-semibold text-white">Active</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 shrink-0">
                {isOwner ? (
                  <Link
                    href={`/store/${store.slug}/manage`}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
                  >
                    <Settings className="h-4 w-4" />
                    Manage Store
                  </Link>
                ) : (
                  <Link
                    href={`/store/${store.slug}/manage`}
                    className="inline-flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.08] text-white px-5 py-2.5 rounded-xl font-semibold text-sm border border-white/[0.06] hover:border-primary transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Visit Store
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Description */}
        {store.description && (
          <div className="mt-8 mb-8">
            <h2 className="text-lg font-bold text-white mb-3">About This Store</h2>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-3xl">{store.description}</p>
          </div>
        )}

        {/* Products Section */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-white">Products</h2>
            <span className="text-sm text-zinc-500">({products.length})</span>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Package className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-400 text-sm">No products listed yet.</p>
            {isOwner && (
              <Link
                href="/admin/products"
                className="mt-4 inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold text-sm"
              >
                Add your first product <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative group hover:border-primary/20 transition-all duration-300"
              >
                <div className="aspect-square w-full bg-zinc-950/40 relative overflow-hidden">
                  <ShimmerImage
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                  {product.sale_price && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-accent text-white text-[10px] font-bold uppercase rounded-md">
                      Sale
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col gap-1.5 flex-grow">
                  <span className="text-[11px] text-zinc-500 uppercase tracking-wider">{product.brand_name}</span>
                  <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <div className="mt-auto pt-2">
                    {product.sale_price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs line-through text-zinc-500">₹{product.price}</span>
                        <span className="text-sm font-black text-white">₹{product.sale_price}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-black text-white">₹{product.price}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
