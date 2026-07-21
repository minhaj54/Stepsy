import React from 'react';
import Link from 'next/link';
import { Store as StoreIcon } from 'lucide-react';
import { getAdminProducts, getBrands, getCategories } from '../../../lib/data/products';
import { getCurrentUser } from '../../../lib/supabase/server';
import AdminProductsClient from './AdminProductsClient';

export const metadata = {
  title: 'Manage Products - Zarwinto Admin',
};

export default async function AdminProductsPage() {
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'admin';

  // Vendors are scoped to their own store; admins see everything.
  let storeId: string | undefined;
  let storeSlug: string | undefined;
  if (user && !isAdmin) {
    const { createClient } = await import('../../../lib/supabase/server');
    const supabase = await createClient();
    const { data } = await supabase
      .from('stores')
      .select('id, slug')
      .eq('owner_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    if (data) {
      storeId = data.id;
      storeSlug = data.slug;
    }
  }

  const products = await getAdminProducts(storeId);
  const brands = await getBrands();
  const categories = await getCategories();

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Manage Products</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {storeSlug ? 'Products for your store' : 'Create, edit, and manage inventory'}
          </p>
        </div>
        {storeSlug && (
          <Link
            href={`/store/${storeSlug}`}
            className="inline-flex items-center gap-2 bg-secondary hover:bg-primary text-white px-4 py-2.5 rounded-xl font-semibold text-sm border border-border hover:border-primary transition-all"
          >
            <StoreIcon className="h-4 w-4" />
            View My Store
          </Link>
        )}
      </div>

      <AdminProductsClient
        initialProducts={products}
        brands={brands}
        categories={categories}
        storeId={storeId}
      />
    </div>
  );
}
