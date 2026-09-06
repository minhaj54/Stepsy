import { Product, Brand, Category, BlogPost, Review } from '../../types';
import {
  mockProducts,
  mockBrands,
  mockCategories,
  mockBlogPosts,
  mockReviews,
} from '../../data/mockShoes';

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/** Race a thenable against a timeout; returns null if it times out */
function withTimeout<T>(thenable: PromiseLike<T>, ms: number): Promise<T | null> {
  return Promise.race([
    Promise.resolve(thenable),
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
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
  brand_name: string | null;
  categories: { slug: string } | null;
  colors: string[] | null;
  product_images: { image_url: string; sort_order: number }[];
  product_variants: { id: string; product_id: string; size: string; color: string; stock_quantity: number }[];
  weight_kg: number | null;
  length_cm: number | null;
  breadth_cm: number | null;
  height_cm: number | null;
  gender: string | null;
}

export function mapDbProduct(row: DbProduct): Product {
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
      .map(img => img.image_url),
    variants: (row.product_variants ?? []).map(v => ({
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
    weight_kg: row.weight_kg ?? undefined,
    length_cm: row.length_cm ?? undefined,
    breadth_cm: row.breadth_cm ?? undefined,
    height_cm: row.height_cm ?? undefined,
  };
}

export const PRODUCT_SELECT = `
  *,
  brands(name, slug),
  categories(slug),
  product_images(image_url, sort_order),
  product_variants(id, product_id, size, color, stock_quantity)
`;

export async function getProducts(limit?: number): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    console.log('Supabase not configured, returning mock products');
    return limit ? mockProducts.slice(0, limit) : mockProducts;
  }

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    if (limit) query.limit(limit);

    const result = await withTimeout(query, 4000);

    if (!result) {
      console.log('Product query timed out, returning mock products');
      return mockProducts;
    }
    
    if (result.error) {
      console.error('Error fetching products:', result.error);
      return mockProducts;
    }
    
    if (!result.data?.length) {
      console.log('No products found in Supabase, returning mock products');
      return mockProducts;
    }
    
    console.log(`Fetched ${result.data.length} products from Supabase`);
    return (result.data as DbProduct[]).map(mapDbProduct);
  } catch (error) {
    console.error('Exception in getProducts:', error);
    return mockProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return mockProducts.find(p => p.slug === slug) ?? null;
  }

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    const result = await withTimeout(query, 4000);

    if (!result || result.error || !result.data) {
      return mockProducts.find(p => p.slug === slug) ?? null;
    }
    return mapDbProduct(result.data as DbProduct);
  } catch {
    return mockProducts.find(p => p.slug === slug) ?? null;
  }
}

export async function getRelatedProducts(current: Product, limit = 4): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return mockProducts
      .filter(p => p.category_id === current.category_id && p.id !== current.id)
      .slice(0, limit);
  }

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('category_id', current.category_id)
      .eq('status', 'active')
      .neq('id', current.id)
      .limit(limit);

    const result = await withTimeout(query, 4000);

    if (!result || result.error || !result.data?.length) {
      return mockProducts
        .filter(p => p.category_id === current.category_id && p.id !== current.id)
        .slice(0, limit);
    }
    return (result.data as DbProduct[]).map(mapDbProduct);
  } catch {
    return mockProducts
      .filter(p => p.category_id === current.category_id && p.id !== current.id)
      .slice(0, limit);
  }
}

export async function getBrands(): Promise<Brand[]> {
  if (!isSupabaseConfigured()) return mockBrands;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const query = supabase.from('brands').select('*').order('name');
    const result = await withTimeout(query, 4000);

    if (!result || result.error || !result.data?.length) return mockBrands;

    return result.data.map((b: { id: string; name: string; slug: string; logo: string; description: string; featured: boolean }) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logo,
      description: b.description,
      featured: b.featured,
    }));
  } catch {
    return mockBrands;
  }
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return mockCategories;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const query = supabase.from('categories').select('*').order('name');
    const result = await withTimeout(query, 4000);

    if (!result || result.error || !result.data?.length) return mockCategories;

    return result.data.map((c: { id: string; name: string; slug: string; parent_id?: string; image: string }) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parent_id: c.parent_id ?? undefined,
      image: c.image,
    }));
  } catch {
    return mockCategories;
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured()) return mockBlogPosts;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const query = supabase
      .from('blog_posts')
      .select('*')
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });

    const result = await withTimeout(query, 4000);

    if (!result || result.error || !result.data?.length) return mockBlogPosts;

    return result.data.map((p: { id: string; title: string; slug: string; summary: string; content: string; featured_image: string; published_at: string; read_time: string; category: string; tags: string[] }) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      content: p.content,
      featured_image: p.featured_image,
      published_at: p.published_at,
      read_time: p.read_time,
      category: p.category,
      tags: p.tags ?? [],
    }));
  } catch {
    return mockBlogPosts;
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured()) {
    return mockBlogPosts.find(p => p.slug === slug) ?? null;
  }

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const query = supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)
      .single();

    const result = await withTimeout(query, 4000);

    if (!result || result.error || !result.data) {
      return mockBlogPosts.find(p => p.slug === slug) ?? null;
    }

    const data = result.data as { id: string; title: string; slug: string; summary: string; content: string; featured_image: string; published_at: string; read_time: string; category: string; tags: string[] };
    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      summary: data.summary,
      content: data.content,
      featured_image: data.featured_image,
      published_at: data.published_at,
      read_time: data.read_time,
      category: data.category,
      tags: data.tags ?? [],
    };
  } catch {
    return mockBlogPosts.find(p => p.slug === slug) ?? null;
  }
}

export interface AdminBlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  featured_image: string | null;
  published_at: string | null;
  read_time: string | null;
  category: string;
  tags: string[];
  created_at: string;
}

export async function getAdminBlogPosts(): Promise<AdminBlogPost[]> {
  if (!isSupabaseConfigured()) return mockBlogPosts as unknown as AdminBlogPost[];

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const query = supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    const result = await withTimeout(query, 4000);

    if (!result || result.error || !result.data) return mockBlogPosts as unknown as AdminBlogPost[];

    return result.data.map((p: any) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      summary: p.summary,
      content: p.content,
      featured_image: p.featured_image ?? null,
      published_at: p.published_at ?? null,
      read_time: p.read_time ?? null,
      category: p.category,
      tags: p.tags ?? [],
      created_at: p.created_at,
    }));
  } catch {
    return mockBlogPosts as unknown as AdminBlogPost[];
  }
}

export async function getHomeBannerProductId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();
    const { data } = await supabase
      .from('home_banner_product')
      .select('product_id')
      .eq('id', 1)
      .maybeSingle();
    return data?.product_id ?? null;
  } catch {
    return null;
  }
}

export interface Testimonial {
  id: string;
  name: string;
  initials: string;
  review: string;
  product: string;
  rating: number;
  sort_order: number;
  created_at: string;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as Testimonial[];
  } catch {
    return [];
  }
}

export async function getReviewsByProductId(productId: string): Promise<Review[]> {
  if (!isSupabaseConfigured()) return mockReviews[productId] ?? [];

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const query = supabase
      .from('reviews')
      .select('*, users(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    const result = await withTimeout(query, 4000);

    if (!result || result.error || !result.data) return mockReviews[productId] ?? [];

    return result.data.map((r: { id: string; user_id: string; users: { full_name: string } | null; product_id: string; rating: number; review_text: string; created_at: string; images?: string[]; approved: boolean }) => ({
      id: r.id,
      user_id: r.user_id,
      user_name: r.users?.full_name ?? 'Anonymous',
      product_id: r.product_id,
      rating: r.rating,
      review_text: r.review_text,
      created_at: r.created_at,
      images: r.images ?? [],
      approved: r.approved,
    }));
  } catch {
    return mockReviews[productId] ?? [];
  }
}

export async function recalculateProductRating(productId: string): Promise<{ rating: number; reviews_count: number } | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    // Get all approved reviews for this product
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('product_id', productId)
      .eq('approved', true);

    if (error || !reviews) return null;

    const reviewsCount = reviews.length;
    const avgRating = reviewsCount > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsCount
      : 0;

    // Update product with new rating and count
    const { error: updateError } = await supabase
      .from('products')
      .update({
        rating: Math.round(avgRating * 10) / 10, // Round to 1 decimal
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

export async function getAdminStats() {
  if (!isSupabaseConfigured()) {
    return {
      revenue: 12450,
      orders: 87,
      customers: 234,
      products: mockProducts.length,
    };
  }

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const [ordersRes, customersRes, productsRes] = await Promise.all([
      supabase.from('orders').select('total_amount, payment_status'),
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('products').select('id', { count: 'exact', head: true }),
    ]);

    const orders = ordersRes.data ?? [];
    const revenue = orders
      .filter(o => o.payment_status === 'paid' || o.payment_status === 'cod_pending')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    return {
      revenue,
      orders: orders.length,
      customers: customersRes.count ?? 0,
      products: productsRes.count ?? 0,
    };
  } catch {
    return {
      revenue: 0,
      orders: 0,
      customers: 0,
      products: mockProducts.length,
    };
  }
}

export async function getAdminOrders(page = 1, limit = 50) {
  if (!isSupabaseConfigured()) return [];

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const from = (page - 1) * limit;
    const to = from + limit - 1;

const { data } = await supabase
      .from('orders')
      .select('*, users(full_name, email, phone), stores(name, slug, logo_url), order_items(*, stores(name, slug, logo_url), products(title, price, sale_price, stores(name, slug, logo_url), product_images(image_url, sort_order)))')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!data) return [];

    const variantIds = new Set<string>();
    data.forEach((order: any) => {
      (order.order_items ?? []).forEach((item: any) => {
        if (item.variant_id) variantIds.add(item.variant_id);
      });
    });

    let variantsMap = new Map<string, { size: string; color: string }>();
    if (variantIds.size > 0) {
      const { data: variants } = await supabase
        .from('product_variants')
        .select('id, size, color')
        .in('id', Array.from(variantIds));
      
      (variants ?? []).forEach((v: any) => {
        variantsMap.set(v.id, { size: v.size, color: v.color });
      });
    }

    data.forEach((order: any) => {
      (order.order_items ?? []).forEach((item: any) => {
        const variant = variantsMap.get(item.variant_id);
        if (variant) {
          item.variant_size = variant.size;
          item.variant_color = variant.color;
        }
      });
    });

    return data;
  } catch {
    return [];
  }
}

export async function getAdminProducts(storeId?: string) {
  if (!isSupabaseConfigured()) {
    return mockProducts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      sale_price: p.sale_price,
      status: p.status,
      sku: p.sku,
      description: p.description,
      featured: p.featured,
      new_arrival: p.newArrival,
      best_seller: p.bestSeller,
      gender: p.gender,
      brand_id: p.brand_id,
      category_id: p.category_id,
      images: p.images,
      variants: p.variants.map(v => ({ size: v.size, color: v.color, stock: v.stock_quantity })),
      stock: p.variants.reduce((sum, v) => sum + v.stock_quantity, 0),
    }));
  }

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const query = supabase
      .from('products')
      .select('id, title, slug, price, sale_price, status, sku, description, featured, new_arrival, best_seller, gender, brand_id, category_id, product_images(image_url, sort_order), product_variants(id, size, color, stock_quantity)')
      .order('created_at', { ascending: false });
    if (storeId) query.eq('store_id', storeId);

    const { data } = await query;

    return (data ?? []).map((p: {
      id: string;
      title: string;
      slug: string;
      price: number;
      sale_price?: number;
      status: string;
      sku: string;
      description: string | null;
      featured: boolean;
      new_arrival: boolean;
      best_seller: boolean;
      gender?: string;
      brand_id: string;
      category_id: string;
      product_images: { image_url: string; sort_order: number }[] | null;
      product_variants: { id: string; size: string; color: string; stock_quantity: number }[] | null;
    }) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: Number(p.price),
      sale_price: p.sale_price ? Number(p.sale_price) : undefined,
      status: p.status,
      sku: p.sku,
      description: p.description ?? '',
      featured: p.featured,
      new_arrival: p.new_arrival,
      best_seller: p.best_seller,
      gender: p.gender || '',
      brand_id: p.brand_id,
      category_id: p.category_id,
      images: (p.product_images ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(img => img.image_url),
      variants: (p.product_variants ?? []).map(v => ({
        id: v.id,
        size: v.size,
        color: v.color,
        stock: v.stock_quantity,
      })),
      stock: (p.product_variants ?? []).reduce((sum, v) => sum + (v.stock_quantity || 0), 0),
    }));
  } catch {
    return mockProducts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      sale_price: p.sale_price,
      status: p.status,
      sku: p.sku,
      description: p.description,
      featured: p.featured,
      new_arrival: p.newArrival,
      best_seller: p.bestSeller,
      gender: p.gender,
      brand_id: p.brand_id,
      category_id: p.category_id,
      images: p.images,
      variants: p.variants.map(v => ({ size: v.size, color: v.color, stock: v.stock_quantity })),
      stock: p.variants.reduce((sum, v) => sum + v.stock_quantity, 0),
    }));
  }
}

export async function getAdminCustomers() {
  if (!isSupabaseConfigured()) return [];

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data } = await supabase
      .from('users')
      .select('id, full_name, email, phone, role, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    return data ?? [];
  } catch {
    return [];
  }
}

export async function validateCoupon(code: string) {
  if (!isSupabaseConfigured()) {
    const normalized = code.toUpperCase().trim();
    const mockCoupons: Record<string, { type: 'percentage' | 'fixed'; value: number }> = {
      STEPZY20: { type: 'percentage', value: 20 },
      ZARWINTO20: { type: 'percentage', value: 20 },
      WELCOME10: { type: 'percentage', value: 10 },
      SHOEHEAVEN: { type: 'fixed', value: 30 },
    };
    const coupon = mockCoupons[normalized];
    return coupon ? { code: normalized, ...coupon } : null;
  }

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', code.toUpperCase().trim())
      .eq('active', true)
      .lte('start_date', new Date().toISOString())
      .gte('end_date', new Date().toISOString())
      .single();

    if (!data) return null;
    const coupon = data as { code: string; type: 'percentage' | 'fixed'; value: number };
    return {
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
    };
  } catch {
    return null;
  }
}

export async function getAdminReviews() {
  if (!isSupabaseConfigured()) {
    return Object.values(mockReviews).flat().map(r => ({
      id: r.id,
      user_id: r.user_id,
      user_name: r.user_name,
      user_email: 'customer@example.com',
      product_id: r.product_id,
      product_title: mockProducts.find(p => p.id === r.product_id)?.title ?? 'Product',
      rating: r.rating,
      review_text: r.review_text,
      approved: true,
      created_at: r.created_at
    }));
  }

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data } = await supabase
      .from('reviews')
      .select('*, users(full_name, email), products(title)')
      .order('created_at', { ascending: false })
      .limit(50);

    return (data ?? []).map((r: { id: string; user_id: string; users?: { full_name: string; email: string } | null; product_id: string; products?: { title: string } | null; rating: number; review_text: string; approved: boolean; created_at: string }) => ({
      id: r.id,
      user_id: r.user_id,
      user_name: r.users?.full_name ?? 'Anonymous',
      user_email: r.users?.email ?? '',
      product_id: r.product_id,
      product_title: r.products?.title ?? 'Product',
      rating: r.rating,
      review_text: r.review_text,
      approved: r.approved,
      created_at: r.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getStoreStats(storeId: string) {
  if (!isSupabaseConfigured()) {
    return {
      revenue: 12450,
      orders: 87,
      customers: 234,
      products: mockProducts.length,
    };
  }

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    // Get all product IDs for this store
    const { data: storeProducts } = await supabase
      .from('products')
      .select('id')
      .eq('store_id', storeId);

    const productIds = (storeProducts ?? []).map((p: { id: string }) => p.id);

    if (productIds.length === 0) {
      return { revenue: 0, orders: 0, customers: 0, products: 0 };
    }

    // Get order items for these products
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('order_id, quantity, products!inner(price, sale_price)')
      .in('product_id', productIds);

    const orderIds = [...new Set((orderItems ?? []).map((oi: { order_id: string }) => oi.order_id))];

    // Get orders
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount, payment_status, user_id')
      .in('id', orderIds);

    const ordersList = orders ?? [];
    const revenue = ordersList
      .filter(o => o.payment_status === 'paid' || o.payment_status === 'cod_pending')
      .reduce((sum, o) => sum + Number(o.total_amount), 0);

    const uniqueCustomers = new Set(ordersList.map(o => o.user_id));

    return {
      revenue,
      orders: ordersList.length,
      customers: uniqueCustomers.size,
      products: productIds.length,
    };
  } catch {
    return { revenue: 0, orders: 0, customers: 0, products: 0 };
  }
}

export async function getStoreOrders(storeId: string) {
  if (!isSupabaseConfigured()) return [];

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    // Get all product IDs for this store
    const { data: storeProducts } = await supabase
      .from('products')
      .select('id')
      .eq('store_id', storeId);

    const productIds = (storeProducts ?? []).map((p: { id: string }) => p.id);

    if (productIds.length === 0) return [];

    // Get order items for these products
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('order_id, quantity, products(title, price, sale_price)')
      .in('product_id', productIds);

    const orderIds = [...new Set((orderItems ?? []).map((oi: { order_id: string }) => oi.order_id))];

    if (orderIds.length === 0) return [];

     // Get orders with user info
     const { data } = await supabase
       .from('orders')
        .select('*, users(full_name, email, phone), order_items(*, products(title, price, sale_price, product_images(image_url)))')
        .in('id', orderIds)
        .order('created_at', { ascending: false })
        .limit(50);

     if (data) {
       const variantIds = new Set<string>();
       data.forEach((order: any) => {
         (order.order_items ?? []).forEach((item: any) => {
           if (item.variant_id) variantIds.add(item.variant_id);
         });
       });

       let variantsMap = new Map<string, { size: string; color: string }>();
       if (variantIds.size > 0) {
         const { data: variants } = await supabase
           .from('product_variants')
           .select('id, size, color')
           .in('id', Array.from(variantIds));
         
         (variants ?? []).forEach((v: any) => {
           variantsMap.set(v.id, { size: v.size, color: v.color });
         });
       }

       data.forEach((order: any) => {
         (order.order_items ?? []).forEach((item: any) => {
           const variant = variantsMap.get(item.variant_id);
           if (variant) {
             item.variant_size = variant.size;
             item.variant_color = variant.color;
           }
         });
       });
     }

      return data ?? [];
   } catch (err) {
     console.error('[getStoreOrders] Error fetching store orders:', err);
     return [];
   }
}

export async function getStoreReviews(storeId: string) {
  if (!isSupabaseConfigured()) return [];

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    // Get all product IDs for this store
    const { data: storeProducts } = await supabase
      .from('products')
      .select('id')
      .eq('store_id', storeId);

    const productIds = (storeProducts ?? []).map((p: { id: string }) => p.id);

    if (productIds.length === 0) return [];

    // Get reviews for these products
    const { data } = await supabase
      .from('reviews')
      .select('*, users(full_name, email), products(title)')
      .in('product_id', productIds)
      .order('created_at', { ascending: false })
      .limit(50);

    return (data ?? []).map((r: { id: string; user_id: string; users?: { full_name: string; email: string } | null; product_id: string; products?: { title: string } | null; rating: number; review_text: string; approved: boolean; created_at: string }) => ({
      id: r.id,
      user_id: r.user_id,
      user_name: r.users?.full_name ?? 'Anonymous',
      user_email: r.users?.email ?? '',
      product_id: r.product_id,
      product_title: r.products?.title ?? 'Product',
      rating: r.rating,
      review_text: r.review_text,
      approved: r.approved,
      created_at: r.created_at,
    }));
  } catch {
    return [];
  }
}

export async function getAllUsers() {
  if (!isSupabaseConfigured()) return [];

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    return data ?? [];
  } catch {
    return [];
  }
}

export async function updateUserRole(userId: string, role: 'customer' | 'admin' | 'vendor') {
  if (!isSupabaseConfigured()) return null;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function toggleProductFeatured(productId: string, featured: boolean) {
  if (!isSupabaseConfigured()) return null;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .update({ featured })
      .eq('id', productId)
      .select()
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function toggleProductNewArrival(productId: string, newArrival: boolean) {
  if (!isSupabaseConfigured()) return null;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .update({ new_arrival: newArrival })
      .eq('id', productId)
      .select()
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function toggleProductBestSeller(productId: string, bestSeller: boolean) {
  if (!isSupabaseConfigured()) return null;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .update({ best_seller: bestSeller })
      .eq('id', productId)
      .select()
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function createCategory(data: { name: string; slug: string; parent_id?: string; image?: string }) {
  if (!isSupabaseConfigured()) return null;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data: result, error } = await supabase
      .from('categories')
      .insert(data)
      .select()
      .single();

    if (error || !result) return null;
    return result;
  } catch {
    return null;
  }
}

export async function updateCategory(id: string, data: { name?: string; slug?: string; parent_id?: string; image?: string }) {
  if (!isSupabaseConfigured()) return null;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data: result, error } = await supabase
      .from('categories')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !result) return null;
    return result;
  } catch {
    return null;
  }
}

export async function deleteCategory(id: string) {
  if (!isSupabaseConfigured()) return false;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    return !error;
  } catch {
    return false;
  }
}

export async function updateHomeBanner(bannerData: { image_url: string; title?: string; subtitle?: string; link?: string }) {
  if (!isSupabaseConfigured()) return null;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    // Check if banner exists
    const { data: existing } = await supabase
      .from('home_banners')
      .select('id')
      .limit(1)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('home_banners')
        .update(bannerData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error || !data) return null;
      return data;
    } else {
      const { data, error } = await supabase
        .from('home_banners')
        .insert(bannerData)
        .select()
        .single();

      if (error || !data) return null;
      return data;
    }
  } catch {
    return null;
  }
}

export async function getHomeBanner() {
  if (!isSupabaseConfigured()) return null;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data } = await supabase
      .from('home_banners')
      .select('*')
      .limit(1)
      .maybeSingle();

    return data;
  } catch {
    return null;
  }
}
