'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Star, Check, Save, Search, Eye } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';

interface AdminProductLite {
  id: string;
  title: string;
  slug: string;
  price: number;
  sale_price?: number;
  brand_id: string;
  images: string[];
  status: string;
}

interface HeroShoeClientProps {
  products: AdminProductLite[];
  currentProductId: string | null;
}

export default function HeroShoeClient({ products, currentProductId }: HeroShoeClientProps) {
  const [selectedId, setSelectedId] = useState<string | null>(currentProductId);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.trim().toLowerCase())
  );

  const selected = products.find((p) => p.id === selectedId) ?? null;

  const handleSave = async () => {
    if (!isSupabaseConfigured()) {
      setMessage({ type: 'error', text: 'Supabase is not configured.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    const supabase = createClient();

    const { error } = await supabase
      .from('home_banner_product')
      .upsert({ id: 1, product_id: selectedId, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save: ' + error.message });
    } else {
      setMessage({ type: 'success', text: selected ? 'Hero shoe updated!' : 'Hero shoe cleared.' });
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Star className="h-7 w-7 text-primary" /> Hero Shoe
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Pick one product from your collection to feature in the home page hero banner.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product picker */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {filtered.map((p) => {
              const isSelected = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`relative rounded-xl overflow-hidden border text-left transition-all ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/40'
                      : 'border-white/[0.06] hover:border-white/[0.15]'
                  }`}
                >
                  <div className="aspect-square bg-zinc-900">
                    {p.images[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-semibold text-white truncate">{p.title}</p>
                    <p className="text-[11px] text-zinc-500">
                      ₹{p.sale_price ?? p.price}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-zinc-500 text-sm py-8">No products found.</p>
            )}
          </div>
        </div>

        {/* Preview + actions */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Eye className="h-4 w-4 text-primary" /> Live Preview
            </h3>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-tr from-zinc-900 to-white/5 border border-white/[0.06] flex items-center justify-center p-4">
              {selected ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.images[0]}
                  alt=""
                  className="w-full h-auto object-contain transform -rotate-12 drop-shadow-[0_15px_30px_rgba(99,102,241,0.4)]"
                />
              ) : (
                <p className="text-zinc-500 text-sm text-center">No shoe selected.<br />Default will be shown.</p>
              )}
              {selected && (
                <div className="absolute bottom-3 left-3 right-3 glass-card p-3 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Featured</p>
                    <p className="text-xs font-bold text-white truncate">{selected.title}</p>
                  </div>
                  <p className="text-xs font-black text-accent">₹{selected.sale_price ?? selected.price}</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save Hero Shoe'}
            </button>
            {selected && (
              <Link
                href={`/product/${selected.slug}`}
                target="_blank"
                className="text-center text-xs text-zinc-500 hover:text-white transition-colors"
              >
                View product page →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
