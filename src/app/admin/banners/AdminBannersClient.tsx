'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Globe } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';

interface AdminBannersClientProps {
  initialBanner: any;
}

export default function AdminBannersClient({ initialBanner }: AdminBannersClientProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [imageUrl, setImageUrl] = useState(initialBanner?.image_url || '');
  const [title, setTitle] = useState(initialBanner?.title || '');
  const [subtitle, setSubtitle] = useState(initialBanner?.subtitle || '');
  const [link, setLink] = useState(initialBanner?.link || '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      
      // Upload image if provided
      let finalImageUrl = imageUrl;
      if (imageUrl && imageUrl.startsWith('blob:')) {
        // Handle blob URL from file input
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        const fileName = `banner-${Date.now()}.jpg`;
        
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, blob);

        if (error) {
          setMessage({ type: 'error', text: 'Failed to upload image' });
          setSaving(false);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);
        
        finalImageUrl = publicUrl;
      }

      // Check if banner exists
      const { data: existing } = await supabase
        .from('home_banners')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('home_banners')
          .update({ image_url: finalImageUrl, title, subtitle, link })
          .eq('id', existing.id);

        if (error) {
          setMessage({ type: 'error', text: 'Failed to save banner' });
        } else {
          setMessage({ type: 'success', text: 'Banner saved successfully!' });
        }
      } else {
        const { error } = await supabase
          .from('home_banners')
          .insert({ image_url: finalImageUrl, title, subtitle, link });

        if (error) {
          setMessage({ type: 'error', text: 'Failed to save banner' });
        } else {
          setMessage({ type: 'success', text: 'Banner saved successfully!' });
        }
      }
    } else {
      // Simulate saving for demo
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Banner saved successfully!' });
        setSaving(false);
      }, 1000);
      return;
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setImageUrl(url);
      }
    };
    input.click();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Home Page Banner</h1>
        <p className="text-zinc-400 text-sm mt-1">Manage the hero banner on the home page</p>
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

      <form onSubmit={handleSave} className="space-y-6">
        {/* Banner Preview */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" /> Banner Preview
          </h2>
          
          <div className="relative h-64 sm:h-80 w-full bg-zinc-900 rounded-2xl overflow-hidden mb-6">
            {imageUrl ? (
              <img src={imageUrl} alt="Banner" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 via-zinc-900 to-accent/20 flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
                  <p className="text-zinc-400 text-sm">No banner image uploaded</p>
                </div>
              </div>
            )}
            {title && (
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 to-transparent flex items-end p-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{title}</h3>
                  {subtitle && <p className="text-zinc-300">{subtitle}</p>}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleImageUpload}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-sm text-zinc-300 hover:text-white transition-colors"
          >
            <Upload className="h-4 w-4" />
            Upload Banner Image
          </button>
        </div>

        {/* Banner Settings */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> Banner Settings
          </h2>
          
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Banner Title
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="e.g., New Season Arrivals"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="e.g., Discover the latest trends in footwear"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Link URL (optional)
              </label>
              <input
                type="text"
                value={link}
                onChange={e => setLink(e.target.value)}
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="e.g., /shop?category=new-arrivals"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Banner'}
          </button>
        </div>
      </form>
    </div>
  );
}
