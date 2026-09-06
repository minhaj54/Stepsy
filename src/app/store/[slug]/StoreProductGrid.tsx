'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { Package, ArrowRight, Star, RefreshCw } from 'lucide-react';
import { Product } from '../../../types';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import ShimmerImage from '../../../components/ShimmerImage';

const PRODUCT_SELECT = `
  *,
  brands(name, slug),
  categories(slug),
  product_images(image_url, sort_order),
  product_variants(id, product_id, size, color, stock_quantity)
`;

interface DbProduct {
  id: string;
  brand_id: string;
  store_id: string | null;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  sale_price: number | null;
  sku: string;
  status: string;
  specifications: Record<string, string> | null;
  featured: boolean;
  new_arrival: boolean;
  best_seller: boolean;
  rating: number;
  reviews_count: number;
  created_at: string;
  brands: { name: string; slug: string } | null;
  brand_name: string | null;
  categories: { slug: string } | null;
  colors: string[] | null;
  product_images: { image_url: string; sort_order: number }[];
  product_variants: { id: string; product_id: string; size: string; color: string; stock_quantity: number }[];
  gender: string | null;
}

function mapDbProduct(row: DbProduct): Product {
  return {
    id: row.id,
    brand_id: row.brand_id,
    store_id: row.store_id ?? undefined,
    brand_name: row.brand_name || row.brands?.name || '',
    category_id: row.category_id,
    category_slug: row.categories?.slug ?? '',
    title: row.title,
    slug: row.slug,
    description: row.description,
    price: Number(row.price),
    sale_price: row.sale_price ? Number(row.sale_price) : undefined,
    sku: row.sku,
    status: row.status as Product['status'],
    created_at: row.created_at,
    images: (row.product_images ?? [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((img) => img.image_url),
    variants: (row.product_variants ?? []).map((v) => ({
      id: v.id,
      product_id: v.product_id,
      size: v.size,
      color: v.color,
      stock_quantity: v.stock_quantity,
    })),
    rating: Number(row.rating),
    reviews_count: row.reviews_count,
    featured: row.featured,
    newArrival: row.new_arrival,
    bestSeller: row.best_seller,
    specifications: row.specifications ?? undefined,
    colors: row.colors ?? [],
    gender: row.gender as Product['gender'] | undefined,
  };
}

interface StoreProductGridProps {
  initialProducts: Product[];
  storeId: string;
  storeSlug: string;
  isOwner?: boolean;
}

export default function StoreProductGrid({ initialProducts, storeId, storeSlug, isOwner }: StoreProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !isSupabaseConfigured()) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    const limit = 12;
    const from = (nextPage - 1) * limit;
    const to = from + limit - 1;

    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('products')
        .select(PRODUCT_SELECT)
        .eq('store_id', storeId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(from, to);

      if (data && data.length > 0) {
        const mapped = (data as DbProduct[]).map(mapDbProduct);
        const unique = mapped.filter(p => !products.some(existing => existing.id === p.id));
        if (unique.length > 0) {
          setProducts(prev => [...prev, ...unique]);
          setPage(nextPage);
        }
        if (unique.length < limit) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, page, products, storeId]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { rootMargin: '200px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore]);

  if (products.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No products listed yet.</p>
        {isOwner && (
          <Link
            href={`/store/${storeSlug}/manage/products`}
            className="mt-4 inline-flex items-center gap-2 text-primary hover:text-primary-hover font-semibold text-sm"
          >
            Add your first product <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {products.map((product) => {
          const salePrice = product.sale_price;
          const price = product.price;
          return (
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
                {salePrice && (
                  <div className="absolute top-2 left-2 px-2 py-1 bg-accent text-white text-[10px] font-bold uppercase rounded-md">
                    Sale
                  </div>
                )}
              </div>

              <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                    <span>{product.brand_name}</span>
                    {product.rating > 0 && (
                      <div className="flex items-center gap-0.5 text-accent font-semibold">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const fillRatio = product.rating - (star - 1);
                          if (fillRatio >= 1) {
                            return <Star key={star} className="h-3 w-3 fill-accent" />;
                          } else if (fillRatio > 0) {
                            return (
                              <div key={star} className="relative h-3 w-3">
                                <Star className="h-3 w-3 text-zinc-700" />
                                <div className="absolute inset-0 overflow-hidden">
                                  <Star className="h-3 w-3 fill-accent" />
                                </div>
                              </div>
                            );
                          } else {
                            return <Star key={star} className="h-3 w-3 text-zinc-700" />;
                          }
                        })}
                        <span className="ml-0.5">{product.rating}</span>
                      </div>
                    )}
                  </div>

                  <h3 className="font-bold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {product.title}
                  </h3>
                </div>

                <div className="flex justify-between items-center mt-3 pt-2.5 sm:mt-4 sm:pt-3 border-t border-border">
                  <div>
                    {salePrice ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs line-through text-muted-foreground">₹{price}</span>
                        <span className="text-sm font-black text-foreground">₹{salePrice}</span>
                      </div>
                    ) : (
                      <span className="text-sm font-black text-foreground">₹{price}</span>
                    )}
                  </div>
                  <div className="bg-primary hover:bg-primary-hover text-primary-foreground p-2.5 rounded-xl border border-primary hover:border-primary-hover transition-all duration-300">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {hasMore && (
        <div ref={observerRef} className="flex items-center justify-center py-8">
          {isLoadingMore && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4 animate-spin text-primary" />
              Loading more products...
            </div>
          )}
        </div>
      )}

      {!hasMore && products.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-6">All products loaded</p>
      )}
    </>
  );
}
