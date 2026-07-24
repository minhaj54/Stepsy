'use client';

import { Product } from '../../types';
import { mockProducts } from '../../data/mockShoes';
import { createClient } from '../supabase/client';

function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

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
  categories: { slug: string } | null;
  product_images: { image_url: string; sort_order: number }[];
  product_variants: { id: string; product_id: string; size: string; color: string; stock_quantity: number }[];
}

function mapDbProduct(row: DbProduct): Product {
  return {
    id: row.id,
    brand_id: row.brand_id,
    store_id: row.store_id ?? undefined,
    brand_name: row.brands?.name ?? '',
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
  };
}

const PRODUCT_SELECT = `
  *,
  brands(name, slug),
  categories(slug),
  product_images(image_url, sort_order),
  product_variants(id, product_id, size, color, stock_quantity)
`;

/**
 * Client-side product fetch for browser components (e.g. header autocomplete).
 * Uses the browser Supabase client and falls back to mock data when Supabase
 * is not configured or the request fails/times out.
 */
export async function getProductsClient(): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockProducts;
  }

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error || !data?.length) {
      return mockProducts;
    }
    return (data as DbProduct[]).map(mapDbProduct);
  } catch {
    return mockProducts;
  }
}

export async function recalculateProductRating(productId: string): Promise<{ rating: number; reviews_count: number } | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const supabase = createClient();

    // Get all approved reviews for this product
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('approved', true);

    if (error || !reviews) return null;

    const reviewsCount = reviews.length;
    const avgRating = reviewsCount > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviewsCount
      : 0;

    // Update product with new rating and count
    const { error: updateError } = await supabase
      .from('products')
      .update({
        rating: Math.round(avgRating * 10) / 10,
        reviews_count: reviewsCount,
      })
      .eq('id', productId);

    if (updateError) {
      console.error('Error updating product rating:', updateError);
      return null;
    }

    return { rating: Math.round(avgRating * 10) / 10, reviews_count: reviewsCount };
  } catch {
    return null;
  }
}
