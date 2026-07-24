import { Store, Product, SocialHandle, PickupAddress } from '../../types';
import { PRODUCT_SELECT, mapDbProduct } from './products';
import { mockStores } from '../../data/mockShoes';

interface DbStore {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  description: string;
  banner_url: string;
  logo_url: string;
  social_handle: string;
  social_handles?: SocialHandle[];
  customer_support_phone?: string;
  government_id_url?: string;
  government_id_type?: string;
  pickup_address?: PickupAddress;
  pickup_pincode?: string;
  pickup_city?: string;
  pickup_state?: string;
  gst_number?: string;
  business_name?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function mapDbStore(row: DbStore): Store {
  return {
    id: row.id,
    owner_id: row.owner_id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? '',
    banner_url: row.banner_url ?? '',
    logo_url: row.logo_url ?? '',
    social_handle: row.social_handle ?? '',
    social_handles: row.social_handles ?? [],
    customer_support_phone: row.customer_support_phone ?? '',
    government_id_url: row.government_id_url ?? '',
    government_id_type: row.government_id_type ?? '',
    pickup_address: row.pickup_address ?? { addressLine1: '', city: '', state: '', pincode: '' },
    pickup_pincode: row.pickup_pincode ?? '',
    pickup_city: row.pickup_city ?? '',
    pickup_state: row.pickup_state ?? '',
    gst_number: row.gst_number ?? '',
    business_name: row.business_name ?? '',
    status: row.status as Store['status'],
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export async function getStores(): Promise<Store[]> {
  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return (data as DbStore[]).map(mapDbStore);
  } catch {
    return [];
  }
}

export async function getStoreBySlug(slug: string): Promise<Store | null> {
  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return mapDbStore(data as DbStore);
  } catch {
    return null;
  }
}

export async function getStoreById(id: string): Promise<Store | null> {
  // Mock fallback when Supabase is not configured or id matches a mock store.
  const mock = mockStores.find((s) => s.id === id);
  if (mock) return mock;

  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapDbStore(data as DbStore);
  } catch {
    return null;
  }
}

export async function getProductsByStore(storeId: string): Promise<Product[]> {
  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('products')
      .select(PRODUCT_SELECT)
      .eq('store_id', storeId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return (data as any[]).map(mapDbProduct);
  } catch {
    return [];
  }
}

export async function getAllStores() {
  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return (data as DbStore[]).map(mapDbStore);
  } catch {
    return [];
  }
}

export async function updateStoreStatus(storeId: string, status: 'pending' | 'active' | 'suspended') {
  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('stores')
      .update({ status })
      .eq('id', storeId)
      .select()
      .single();

    if (error || !data) return null;
    return data;
  } catch {
    return null;
  }
}

export async function updateStore(storeId: string, updates: Partial<Store>) {
  try {
    const { createClient } = await import('../supabase/server');
    const supabase = await createClient();

    const dbUpdates: Record<string, any> = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.banner_url !== undefined) dbUpdates.banner_url = updates.banner_url;
    if (updates.logo_url !== undefined) dbUpdates.logo_url = updates.logo_url;
    if (updates.social_handle !== undefined) dbUpdates.social_handle = updates.social_handle;
    if (updates.social_handles !== undefined) dbUpdates.social_handles = updates.social_handles;
    if (updates.customer_support_phone !== undefined) dbUpdates.customer_support_phone = updates.customer_support_phone;
    if (updates.government_id_url !== undefined) dbUpdates.government_id_url = updates.government_id_url;
    if (updates.government_id_type !== undefined) dbUpdates.government_id_type = updates.government_id_type;
    if (updates.pickup_address !== undefined) dbUpdates.pickup_address = updates.pickup_address;
    if (updates.pickup_pincode !== undefined) dbUpdates.pickup_pincode = updates.pickup_pincode;
    if (updates.pickup_city !== undefined) dbUpdates.pickup_city = updates.pickup_city;
    if (updates.pickup_state !== undefined) dbUpdates.pickup_state = updates.pickup_state;
    if (updates.gst_number !== undefined) dbUpdates.gst_number = updates.gst_number;
    if (updates.business_name !== undefined) dbUpdates.business_name = updates.business_name;

    const { data, error } = await supabase
      .from('stores')
      .update(dbUpdates)
      .eq('id', storeId)
      .select()
      .single();

    if (error || !data) return null;
    return mapDbStore(data as DbStore);
  } catch {
    return null;
  }
}
