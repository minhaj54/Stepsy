import { Product, Brand, Category, BlogPost, Review } from '../../types';
import {
  mockProducts,
  mockBrands,
  mockCategories,
  mockBlogPosts,
  mockReviews,
} from '../../data/mockShoes';

function isSupabaseConfigured(): boolean {
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
  };
}

const PRODUCT_SELECT = `
  *,
  brands(name, slug),
  categories(slug),
  product_images(image_url, sort_order),
  product_variants(id, product_id, size, color, stock_quantity)
`;

export async function getProducts(): Promise<Product[]> {
  if (!isSupabaseConfigured()) return mockProducts;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const query = supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    const result = await withTimeout(query, 4000);

    if (!result || result.error || !result.data?.length) return mockProducts;
    return (result.data as DbProduct[]).map(mapDbProduct);
  } catch {
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

    return result.data.map((p: { id: string; title: string; slug: string; summary: string; content: string; featured_image: string; published_at: string; read_time: number; category: string; tags: string[] }) => ({
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

    const data = result.data as { id: string; title: string; slug: string; summary: string; content: string; featured_image: string; published_at: string; read_time: number; category: string; tags: string[] };
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

export async function getReviewsByProductId(productId: string): Promise<Review[]> {
  if (!isSupabaseConfigured()) return mockReviews[productId] ?? [];

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const query = supabase
      .from('reviews')
      .select('*, users(full_name)')
      .eq('product_id', productId)
      .eq('approved', true)
      .order('created_at', { ascending: false });

    const result = await withTimeout(query, 4000);

    if (!result || result.error || !result.data) return mockReviews[productId] ?? [];

    return result.data.map((r: { id: string; user_id: string; users: { full_name: string } | null; product_id: string; rating: number; review_text: string; created_at: string; images?: string[] }) => ({
      id: r.id,
      user_id: r.user_id,
      user_name: r.users?.full_name ?? 'Anonymous',
      product_id: r.product_id,
      rating: r.rating,
      review_text: r.review_text,
      created_at: r.created_at,
      images: r.images ?? [],
    }));
  } catch {
    return mockReviews[productId] ?? [];
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
      .filter(o => o.payment_status === 'paid')
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

export async function getAdminOrders() {
  if (!isSupabaseConfigured()) return [];

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data } = await supabase
      .from('orders')
      .select('*, users(full_name, email), order_items(*, products(title))')
      .order('created_at', { ascending: false })
      .limit(50);

    return data ?? [];
  } catch {
    return [];
  }
}

export async function getAdminProducts() {
  if (!isSupabaseConfigured()) {
    return mockProducts.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      sale_price: p.sale_price,
      status: p.status,
      sku: p.sku,
      stock: p.variants.reduce((sum, v) => sum + v.stock_quantity, 0),
    }));
  }

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data } = await supabase
      .from('products')
      .select('id, title, slug, price, sale_price, status, sku, product_variants(stock_quantity)')
      .order('created_at', { ascending: false });

    return (data ?? []).map((p: { id: string; title: string; slug: string; price: number; sale_price?: number; status: string; sku: string; product_variants: { stock_quantity: number }[] }) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: Number(p.price),
      sale_price: p.sale_price ? Number(p.sale_price) : undefined,
      status: p.status,
      sku: p.sku,
      stock: (p.product_variants ?? []).reduce((sum, v) => sum + v.stock_quantity, 0),
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
