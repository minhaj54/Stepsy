import { Store, Product } from '../../types';
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
      .eq('status', 'active')
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
    return data;
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

    const { data, error } = await supabase
      .from('stores')
      .update({
        ...(updates.name && { name: updates.name }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.banner_url !== undefined && { banner_url: updates.banner_url }),
        ...(updates.logo_url !== undefined && { logo_url: updates.logo_url }),
        ...(updates.social_handle !== undefined && { social_handle: updates.social_handle }),
      })
      .eq('id', storeId)
      .select()
      .single();

    if (error || !data) return null;
    return mapDbStore(data as DbStore);
  } catch {
    return null;
  }
}
