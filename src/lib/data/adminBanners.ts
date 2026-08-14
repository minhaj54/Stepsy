import { createClient, isSupabaseConfigured } from '../supabase/client';

export interface Banner {
  id: string;
  image_url: string;
  title: string;
  subtitle: string;
  link_url: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface BannerResult {
  banner: Banner | null;
  error: string | null;
}

async function run<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error('[adminBanners]', err);
    return fallback;
  }
}

export async function getAdminBanners(): Promise<Banner[]> {
  if (!isSupabaseConfigured()) return [];
  return run(async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('home_banners')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data as Banner[]) ?? [];
  }, []);
}

export async function createAdminBanner(banner: Partial<Banner>): Promise<BannerResult> {
  if (!isSupabaseConfigured()) return { banner: null, error: 'Supabase is not configured' };
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('home_banners')
      .insert({
        image_url: banner.image_url ?? '',
        title: banner.title ?? '',
        subtitle: banner.subtitle ?? '',
        link_url: banner.link_url ?? '',
        background_color: banner.background_color ?? '',
        text_color: banner.text_color ?? '',
        is_active: banner.is_active ?? true,
        sort_order: banner.sort_order ?? 0,
      })
      .select()
      .single();
    if (error) return { banner: null, error: error.message };
    return { banner: data as Banner, error: null };
  } catch (err) {
    return { banner: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function updateAdminBanner(id: string, updates: Partial<Banner>): Promise<BannerResult> {
  if (!isSupabaseConfigured()) return { banner: null, error: 'Supabase is not configured' };
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('home_banners')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) return { banner: null, error: error.message };
    return { banner: data as Banner, error: null };
  } catch (err) {
    return { banner: null, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export async function deleteAdminBanner(id: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured()) return { success: false, error: 'Supabase is not configured' };
  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('home_banners')
      .delete()
      .eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}
