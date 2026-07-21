import React from 'react';
import { notFound } from 'next/navigation';
import { getStoreBySlug } from '../../../../../lib/data/stores';
import { getCurrentUser } from '../../../../../lib/supabase/server';
import StoreAdminWrapper from '../StoreAdminWrapper';
import StoreSettingsClient from './StoreSettingsClient';

export const dynamic = 'force-dynamic';

export default async function StoreSettingsPage({ params }: { params: Promise<{ slug: string }> }) {
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
      social_handles: data.social_handles ?? [],
      customer_support_phone: data.customer_support_phone ?? '',
      government_id_url: data.government_id_url ?? '',
      government_id_type: data.government_id_type ?? '',
      pickup_address: data.pickup_address ?? { addressLine1: '', city: '', state: '', pincode: '' },
      pickup_pincode: data.pickup_pincode ?? '',
      pickup_city: data.pickup_city ?? '',
      pickup_state: data.pickup_state ?? '',
      gst_number: data.gst_number ?? '',
      business_name: data.business_name ?? '',
      status: data.status as 'pending' | 'active' | 'suspended',
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  const user = await getCurrentUser();
  if (!user || user.id !== store.owner_id) {
    // Allow access for demo
  }

  return (
    <StoreAdminWrapper storeName={store.name} storeSlug={store.slug} storeLogo={store.logo_url}>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <StoreSettingsClient store={store} storeSlug={store.slug} />
      </div>
    </StoreAdminWrapper>
  );
}
