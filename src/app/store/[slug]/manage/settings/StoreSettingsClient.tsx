'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Save, Upload, Image as ImageIcon, Globe, AtSign, Store as StoreIcon } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

interface StoreSettingsClientProps {
  store: {
    id: string;
    name: string;
    description: string;
    banner_url: string;
    logo_url: string;
    social_handle: string;
  };
  storeSlug: string;
}

export default function StoreSettingsClient({ store, storeSlug }: StoreSettingsClientProps) {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [name, setName] = useState(store.name);
  const [description, setDescription] = useState(store.description);
  const [socialHandle, setSocialHandle] = useState(store.social_handle);
  const [logoUrl, setLogoUrl] = useState(store.logo_url);
  const [bannerUrl, setBannerUrl] = useState(store.banner_url);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase
        .from('stores')
        .update({
          name,
          description,
          social_handle: socialHandle,
          logo_url: logoUrl,
          banner_url: bannerUrl,
        })
        .eq('id', store.id);

      if (error) {
        setMessage({ type: 'error', text: 'Failed to save settings' });
        console.error('Error updating store:', error);
      } else {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
      }
    } else {
      // Simulate saving for demo
      setTimeout(() => {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setSaving(false);
      }, 1000);
      return;
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleImageUpload = (type: 'logo' | 'banner') => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        if (type === 'logo') setLogoUrl(url);
        else setBannerUrl(url);
      }
    };
    input.click();
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href={`/store/${storeSlug}/manage`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
        >
          <ArrowLeft className="h-3 w-3" /> Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Store Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your store's appearance and information</p>
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
        {/* Store Identity */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <StoreIcon className="h-5 w-5 text-primary" /> Store Identity
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Store Name
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Social Handle
              </label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={socialHandle}
                  onChange={e => setSocialHandle(e.target.value)}
                  placeholder="instagram_handle"
                  className="w-full bg-card text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none"
            />
          </div>
        </div>

        {/* Store Images */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-primary" /> Store Images
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Store Logo
              </label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 rounded-xl overflow-hidden bg-zinc-800 border border-border shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <StoreIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleImageUpload('logo')}
                  className="px-4 py-2 bg-secondary hover:bg-muted border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Upload Logo
                </button>
              </div>
            </div>

            {/* Banner Upload */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Store Banner
              </label>
              <div className="flex items-center gap-4">
                <div className="h-20 w-32 rounded-xl overflow-hidden bg-zinc-800 border border-border shrink-0">
                  {bannerUrl ? (
                    <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleImageUpload('banner')}
                  className="px-4 py-2 bg-secondary hover:bg-muted border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Upload Banner
                </button>
              </div>
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
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
