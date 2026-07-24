import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Store as StoreIcon, AtSign, Package, ArrowRight, Settings, Star, TrendingUp, Phone } from 'lucide-react';
import { getStoreBySlug, getProductsByStore } from '../../../lib/data/stores';
import { getCurrentUser } from '../../../lib/supabase/server';
import ShimmerImage from '../../../components/ShimmerImage';

const SOCIAL_PLATFORMS: Record<string, { icon: string; label: string }> = {
  instagram: { icon: '📷', label: 'Instagram' },
  facebook: { icon: '📘', label: 'Facebook' },
  twitter: { icon: '🐦', label: 'Twitter / X' },
  youtube: { icon: '▶️', label: 'YouTube' },
  whatsapp: { icon: '💬', label: 'WhatsApp' },
  linkedin: { icon: '💼', label: 'LinkedIn' },
  other: { icon: '🌐', label: 'Other' },
};

export const dynamic = 'force-dynamic';

export default async function StorePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const products = await getProductsByStore(store.id);
  const user = await getCurrentUser();
  const isOwner = user?.id === store.owner_id;

  // If store is pending approval, show a message instead of the storefront
  if (store.status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-8 sm:p-12 rounded-2xl border border-border max-w-lg w-full text-center space-y-6">
          <div className="h-16 w-16 bg-yellow-500/10 text-yellow-400 rounded-full flex items-center justify-center mx-auto border border-yellow-500/20">
            <StoreIcon className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-foreground">Store Pending Approval</h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your store <span className="font-semibold text-foreground">{store.name}</span> has been submitted for review and is currently pending approval from our team.
            </p>
            <p className="text-muted-foreground text-sm">
              You will be able to view your storefront once it is approved. In the meantime, you can manage your store settings and products from the dashboard.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={`/store/${store.slug}/manage`}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              <Settings className="h-4 w-4" />
              Manage Store
            </Link>
            <Link
              href="/account"
              className="inline-flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-6 py-3 rounded-xl font-semibold text-sm transition-all border border-border"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              Back to Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8 sm:pb-16">
      {/* Hero Banner */}
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 w-full bg-zinc-900 overflow-hidden">
        {store.banner_url ? (
          <img src={store.banner_url} alt={`${store.name} banner`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-zinc-900 to-accent/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        {/* Store Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto pb-8">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 lg:gap-6">
              {/* Store Logo */}
              <div className="h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 rounded-2xl overflow-hidden border-4 border-background bg-card shrink-0 shadow-2xl -mt-12 sm:-mt-16 md:-mt-20">
                {store.logo_url ? (
                  <img src={store.logo_url} alt={`${store.name} logo`} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-card">
                    <StoreIcon className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Store Details */}
              <div className="flex-1 min-w-0 pt-3 sm:pt-4 md:pt-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight truncate">
                    {store.name}
                  </h1>
                  {isOwner && (
                    <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-primary/20 text-primary rounded-md">
                      Owner
                    </span>
                  )}
                </div>

                {/* Social Handles */}
                {store.social_handles && store.social_handles.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {store.social_handles.map((handle, index) => (
                      <a
                        key={index}
                        href={handle.url || `https://${handle.platform}.com/${handle.handle}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors bg-primary/10 px-2 py-1 rounded-lg"
                      >
                        <span>{SOCIAL_PLATFORMS[handle.platform]?.icon || '🌐'}</span>
                        <span className="capitalize">{handle.platform}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 mt-2 sm:mt-3">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Package className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">{products.length}</span> Products
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold text-foreground">4.8</span> Rating
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="font-semibold text-foreground">Active</span>
                  </div>
                  {store.customer_support_phone && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4 text-blue-400" />
                      <span className="font-semibold text-foreground">{store.customer_support_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {isOwner && (
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <Link
                    href={`/store/${store.slug}/manage`}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-95"
                  >
                    <Settings className="h-4 w-4" />
                    Manage Store
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Description */}
        {store.description && (
          <div className="mt-6 sm:mt-8 mb-6 sm:mb-8">
            <h2 className="text-lg font-bold text-foreground mb-3">About This Store</h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-3xl">{store.description}</p>
          </div>
        )}

        {/* Products Section */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Products</h2>
            <span className="text-sm text-muted-foreground">({products.length})</span>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No products listed yet.</p>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.slug}`}
                className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative group hover:border-primary/20 transition-all duration-300"
              >
                <div className="aspect-square w-full bg-background/40 relative overflow-hidden">
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
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{product.brand_name}</span>
                  <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                  <div className="mt-auto pt-2">
                    {product.sale_price ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs line-through text-muted-foreground">₹{product.price}</span>
                        <span className="text-sm font-black text-foreground">₹{product.sale_price}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-black text-foreground">₹{product.price}</span>
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
