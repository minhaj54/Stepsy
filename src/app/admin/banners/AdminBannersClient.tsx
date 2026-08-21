'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Globe, Plus, Trash2, ChevronUp, ChevronDown, Eye, Edit2, X, GripVertical } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import { getAdminBanners, createAdminBanner, updateAdminBanner, deleteAdminBanner } from '../../../lib/data/adminBanners';

interface Banner {
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

interface AdminBannersClientProps {
  initialBanners: Banner[];
}

export default function AdminBannersClient({ initialBanners }: AdminBannersClientProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    setBanners(initialBanners);
  }, [initialBanners]);

  useEffect(() => {
    if (banners.length === 0) return;
    const interval = setInterval(() => {
      setPreviewIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const uploadImage = async (file: File, bannerId: string): Promise<string> => {
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'png';
    const path = `banners/${bannerId}-${Date.now()}.${ext}`;
    
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(path, file, { upsert: true, cacheControl: '3600' });

    if (uploadError) throw uploadError;
    
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAddBanner = async () => {
    if (!isSupabaseConfigured()) return;
    
    try {
      const result = await createAdminBanner({
        image_url: '',
        title: '',
        subtitle: '',
        link_url: '',
        sort_order: banners.length,
        is_active: true,
      });

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
        return;
      }

      if (result.banner) {
        setBanners([...banners, result.banner]);
        setMessage({ type: 'success', text: 'Banner added! Click Edit to customize it.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add banner' });
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    setDeleting(id);
    try {
      const result = await deleteAdminBanner(id);
      if (result.success) {
        setBanners(banners.filter(b => b.id !== id));
        setMessage({ type: 'success', text: 'Banner deleted successfully!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to delete banner' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete banner' });
    } finally {
      setDeleting(null);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const newBanners = [...banners];
    [newBanners[index - 1], newBanners[index]] = [newBanners[index], newBanners[index - 1]];
    
    const updates = newBanners.map((banner, i) => ({ ...banner, sort_order: i }));
    setBanners(updates);
    
    for (const banner of updates) {
      await updateAdminBanner(banner.id, { sort_order: banner.sort_order });
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === banners.length - 1) return;
    
    const newBanners = [...banners];
    [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
    
    const updates = newBanners.map((banner, i) => ({ ...banner, sort_order: i }));
    setBanners(updates);
    
    for (const banner of updates) {
      await updateAdminBanner(banner.id, { sort_order: banner.sort_order });
    }
  };

  const handleImageChange = async (id: string, file: File | null) => {
    if (!file) return;
    
    setSaving(id);
    try {
      const imageUrl = await uploadImage(file, id);
      await updateAdminBanner(id, { image_url: imageUrl });
      setBanners(banners.map(b => b.id === id ? { ...b, image_url: imageUrl } : b));
      setMessage({ type: 'success', text: 'Image uploaded successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to upload image' });
    } finally {
      setSaving(null);
    }
  };

  const handleSaveBanner = async (id: string) => {
    const banner = banners.find(b => b.id === id);
    if (!banner) return;

    setSaving(id);
    try {
      const result = await updateAdminBanner(id, {
        title: banner.title,
        subtitle: banner.subtitle,
        link_url: banner.link_url,
        is_active: banner.is_active,
      });

      if (result.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ type: 'success', text: 'Banner saved successfully!' });
        setEditingId(null);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save banner' });
    } finally {
      setSaving(null);
    }
  };

  const startEditing = (id: string) => {
    setEditingId(id);
  };

  const cancelEditing = () => {
    setEditingId(null);
  };

  const updateBannerField = (id: string, field: keyof Banner, value: string | boolean) => {
    setBanners(banners.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Home Banners</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage and reorder banners that appear on the mobile app home screen</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Live Preview */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" /> Live Preview
          </h2>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs text-primary hover:text-primary/80 font-semibold"
          >
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
        </div>
        
        {showPreview && (
          <div className="relative h-64 sm:h-80 w-full bg-zinc-900 rounded-2xl overflow-hidden">
            {banners.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No banners to preview</p>
              </div>
            ) : (
              <div className="relative h-full">
                {banners.map((banner, index) => (
                  <div
                    key={banner.id}
                    className={`absolute inset-0 transition-opacity duration-500 ${
                      index === previewIndex ? 'opacity-100' : 'opacity-0'
                    }`}
                  >
                    {banner.image_url ? (
                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 via-zinc-900 to-accent/20" />
                    )}
                    {(banner.title || banner.subtitle) && (
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent flex items-end p-6">
                        <div>
                          {banner.title && <h3 className="text-2xl font-bold text-foreground mb-1">{banner.title}</h3>}
                          {banner.subtitle && <p className="text-muted-foreground">{banner.subtitle}</p>}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Dots */}
            {banners.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setPreviewIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === previewIndex ? 'bg-white w-6' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Banners List */}
      <div className="space-y-6 mb-8">
        {banners.length === 0 ? (
          <div className="glass-card rounded-2xl p-12 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">No banners yet</h3>
            <p className="text-muted-foreground text-sm mb-6">Create your first banner to display on the mobile app home screen</p>
            <button
              type="button"
              onClick={handleAddBanner}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-bold text-sm transition-all"
            >
              <Plus className="h-4 w-4" />
              Add First Banner
            </button>
          </div>
        ) : (
          banners.map((banner, index) => (
            <div key={banner.id} className="glass-card rounded-2xl p-6">
              <div className="flex items-start gap-4">
                {/* Drag Handle & Order */}
                <div className="flex flex-col items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1.5 hover:bg-muted rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move up"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <div className="text-xs font-bold text-muted-foreground bg-muted/50 rounded px-2 py-1 min-w-[2rem] text-center">
                    {index + 1}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMoveDown(index)}
                    disabled={index === banners.length - 1}
                    className="p-1.5 hover:bg-muted rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    title="Move down"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Banner Image */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 sm:w-40 sm:h-40 bg-zinc-900 rounded-xl overflow-hidden relative">
                    {banner.image_url ? (
                      <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <label className="mt-2 flex items-center justify-center gap-1 px-3 py-1.5 bg-secondary hover:bg-muted border border-border rounded-lg text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    <Upload className="h-3 w-3" />
                    {saving === banner.id ? 'Uploading...' : 'Upload Image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageChange(banner.id, file);
                      }}
                    />
                  </label>
                </div>

                {/* Banner Info / Edit Form */}
                <div className="flex-1 min-w-0">
                  {editingId === banner.id ? (
                    /* Edit Mode */
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={banner.title}
                          onChange={(e) => updateBannerField(banner.id, 'title', e.target.value)}
                          className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                          placeholder="Enter banner title"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          Subtitle
                        </label>
                        <input
                          type="text"
                          value={banner.subtitle}
                          onChange={(e) => updateBannerField(banner.id, 'subtitle', e.target.value)}
                          className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                          placeholder="Enter banner subtitle"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                          Link URL
                        </label>
                        <input
                          type="text"
                          value={banner.link_url}
                          onChange={(e) => updateBannerField(banner.id, 'link_url', e.target.value)}
                          className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                          placeholder="e.g., /shop?category=new-arrivals"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id={`active-${banner.id}`}
                          checked={banner.is_active}
                          onChange={(e) => updateBannerField(banner.id, 'is_active', e.target.checked)}
                          className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <label htmlFor={`active-${banner.id}`} className="text-sm text-foreground">
                          Active (show on app)
                        </label>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => handleSaveBanner(banner.id)}
                          disabled={saving === banner.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                        >
                          <Save className="h-4 w-4" />
                          {saving === banner.id ? 'Saving...' : 'Save'}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-muted border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* View Mode */
                    <div>
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {banner.title || <span className="text-muted-foreground italic">Untitled Banner</span>}
                          </h3>
                          {banner.subtitle && (
                            <p className="text-sm text-muted-foreground mt-1">{banner.subtitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            banner.is_active 
                              ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                              : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
                          }`}>
                            {banner.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      
                      {banner.link_url && (
                        <p className="text-xs text-muted-foreground mb-3">
                          <span className="font-semibold">Link:</span> {banner.link_url}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startEditing(banner.id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-muted border border-border rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Edit2 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBanner(banner.id)}
                          disabled={deleting === banner.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm text-red-400 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deleting === banner.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Banner Button */}
      {banners.length > 0 && (
        <div className="flex justify-center mb-8">
          <button
            type="button"
            onClick={handleAddBanner}
            className="inline-flex items-center gap-2 px-6 py-3 bg-secondary hover:bg-muted border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Banner
          </button>
        </div>
      )}
    </div>
  );
}
