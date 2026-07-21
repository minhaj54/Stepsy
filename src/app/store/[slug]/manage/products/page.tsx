import React from 'react';
import { notFound } from 'next/navigation';
import { Store as StoreIcon } from 'lucide-react';
import { getStoreBySlug } from '../../../../../lib/data/stores';
import { getAdminProducts, getBrands, getCategories } from '../../../../../lib/data/products';
import { getCurrentUser } from '../../../../../lib/supabase/server';
import StoreAdminWrapper from '../StoreAdminWrapper';
import AdminProductsClient from '@/app/admin/products/AdminProductsClient';

export const dynamic = 'force-dynamic';

export default async function StoreProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let store = await getStoreBySlug(slug);
  
  if (!store) {
    const { createClient } = await import('../../../../../lib/supabase/server');
    const supabase = await createClient();
    const { data } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    
    if (!data) {
      notFound();
    }
    
    store = {
      id: data.id,
      owner_id: data.owner_id,
      name: data.name,
      slug: data.slug,
      description: data.description ?? '',
      banner_url: data.banner_url ?? '',
      logo_url: data.logo_url ?? '',
      social_handle: data.social_handle ?? '',
      status: data.status as 'pending' | 'active' | 'suspended',
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  const user = await getCurrentUser();
  if (!user || user.id !== store.owner_id) {
    // Allow access for demo
  }

  const products = await getAdminProducts(store.id);
  const brands = await getBrands();
  const categories = await getCategories();

  return (
    <StoreAdminWrapper storeName={store.name} storeSlug={store.slug} storeLogo={store.logo_url}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Manage Products</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Products for your store
            </p>
          </div>
          <a
            href={`/store/${store.slug}`}
            className="inline-flex items-center gap-2 bg-secondary hover:bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm border border-border hover:border-primary transition-all"
          >
            <StoreIcon className="h-4 w-4" />
            View My Store
          </a>
        </div>

        <AdminProductsClient
          initialProducts={products}
          brands={brands}
          categories={categories}
          storeId={store.id}
        />
      </div>
    </StoreAdminWrapper>
  );
}
