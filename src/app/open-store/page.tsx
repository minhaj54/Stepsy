'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Store as StoreIcon, UploadCloud, CheckCircle2, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { createClient } from '../../lib/supabase/client';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60);
}

export default function OpenStorePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [socialHandle, setSocialHandle] = useState('');

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');

  const bannerInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
      setUser(data.user);
      setLoadingAuth(false);
    });
  }, []);

  const pickBanner = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const pickLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File, folder: string, userId: string) => {
    const supabase = createClient();
    const ext = file.name.split('.').pop() || 'png';
    const path = `${userId}/${folder}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('store-assets')
      .upload(path, file, { upsert: true, cacheControl: '3600' });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('store-assets').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!user) {
      setError('Please sign in to open a store.');
      return;
    }
    if (!name.trim()) {
      setError('Store name is required.');
      return;
    }
    setSubmitting(true);
    try {
      const supabase = createClient();
      let bannerUrl = '';
      let logoUrl = '';
      if (bannerFile) bannerUrl = await uploadImage(bannerFile, 'banner', user.id);
      if (logoFile) logoUrl = await uploadImage(logoFile, 'logo', user.id);

      const slug = slugify(name) + '-' + Math.random().toString(36).slice(2, 6);
      const { data: inserted, error: insertError } = await supabase
        .from('stores')
        .insert({
          owner_id: user.id,
          name: name.trim(),
          slug,
          description: description.trim(),
          social_handle: socialHandle.trim(),
          banner_url: bannerUrl,
          logo_url: logoUrl,
          status: 'active',
        })
        .select('slug')
        .single();

      if (insertError) throw insertError;
      router.push(`/store/${inserted.slug}`);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Something went wrong creating your store.');
      setSubmitting(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass-card rounded-2xl p-10 max-w-md text-center">
          <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-5">
            <StoreIcon className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground">Open Your Store</h1>
          <p className="text-muted-foreground text-sm mt-2">
            You need to sign in before you can create a store on the marketplace.
          </p>
          <Link
            href="/account"
            className="mt-6 inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Sign in to continue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <div className="p-4 bg-primary/10 rounded-2xl w-fit mx-auto mb-4">
          <StoreIcon className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Open Your Store</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Set up your storefront and start selling your footwear to the world.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 sm:p-8 space-y-6">
        {/* Banner */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Store Banner</label>
          <input ref={bannerInputRef} type="file" accept="image/*" onChange={pickBanner} className="hidden" />
          {bannerPreview ? (
            <div className="relative rounded-xl overflow-hidden border border-border">
              <img src={bannerPreview} alt="Banner preview" className="w-full h-40 object-cover" />
              <button
                type="button"
                onClick={() => { setBannerFile(null); setBannerPreview(''); }}
                className="absolute top-2 right-2 p-1.5 bg-zinc-900/70 hover:bg-zinc-900 text-foreground rounded-full"
                aria-label="Remove banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="w-full h-40 border-2 border-dashed border-border hover:border-primary/40 rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ImageIcon className="h-6 w-6" />
              <span className="text-sm">Click to upload banner (recommended 1200×300)</span>
            </button>
          )}
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Store Logo</label>
          <input ref={logoInputRef} type="file" accept="image/*" onChange={pickLogo} className="hidden" />
          <div className="flex items-center gap-4">
            {logoPreview ? (
              <div className="relative">
                <img src={logoPreview} alt="Logo preview" className="h-20 w-20 rounded-xl object-cover border border-border" />
                <button
                  type="button"
                  onClick={() => { setLogoFile(null); setLogoPreview(''); }}
                  className="absolute -top-2 -right-2 p-1 bg-zinc-900/70 hover:bg-zinc-900 text-foreground rounded-full"
                  aria-label="Remove logo"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                className="h-20 w-20 border-2 border-dashed border-border hover:border-primary/40 rounded-xl flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary transition-colors"
              >
                <UploadCloud className="h-5 w-5" />
                <span className="text-[10px]">Logo</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="text-sm text-primary hover:text-primary-hover font-medium"
            >
              {logoPreview ? 'Change logo' : 'Upload logo'}
            </button>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Store Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sole Society"
            className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-white/[0.06] rounded-xl px-4 py-3 text-sm outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Store Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Tell customers what makes your store special..."
            className="w-full bg-secondary text-foreground border border-border hover:border-muted-foreground/50 focus:border-primary focus:bg-white/[0.06] rounded-xl px-4 py-3 text-sm outline-none transition-all resize-none"
          />
        </div>

        {/* Social handle */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">Social Handle (optional)</label>
          <div className="flex items-center bg-secondary border border-border focus-within:border-primary rounded-xl px-4 transition-all">
            <span className="text-muted-foreground text-sm">@</span>
            <input
              type="text"
              value={socialHandle}
              onChange={(e) => setSocialHandle(e.target.value.replace(/[^a-zA-Z0-9._]/g, ''))}
              placeholder="yourhandle"
              className="flex-grow bg-transparent text-foreground py-3 text-sm outline-none"
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary hover:bg-primary-hover text-white px-6 py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
        >
          {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
          {submitting ? 'Creating your store...' : 'Create Store'}
        </button>
      </form>
    </div>
  );
}
