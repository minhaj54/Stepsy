'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Pencil, Trash2, Star, Save, X, MessageSquare } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import type { Testimonial } from '../../../lib/data/products';

interface TestimonialsClientProps {
  initialTestimonials: Testimonial[];
}

interface FormState {
  id: string | null;
  name: string;
  initials: string;
  review: string;
  product: string;
  rating: number;
}

const emptyForm: FormState = { id: null, name: '', initials: '', review: '', product: '', rating: 5 };

export default function TestimonialsClient({ initialTestimonials }: TestimonialsClientProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(initialTestimonials);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openNew = () => {
    setForm(emptyForm);
    setEditing(true);
  };

  const openEdit = (t: Testimonial) => {
    setForm({
      id: t.id,
      name: t.name,
      initials: t.initials,
      review: t.review,
      product: t.product,
      rating: t.rating,
    });
    setEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.review.trim()) {
      setMessage({ type: 'error', text: 'Name and review are required.' });
      return;
    }
    if (!isSupabaseConfigured()) {
      setMessage({ type: 'error', text: 'Supabase is not configured.' });
      return;
    }
    setSaving(true);
    setMessage(null);
    const supabase = createClient();

    const payload = {
      name: form.name.trim(),
      initials: form.initials.trim().toUpperCase() || form.name.trim().slice(0, 2).toUpperCase(),
      review: form.review.trim(),
      product: form.product.trim(),
      rating: form.rating,
    };

    let error;
    if (form.id) {
      ({ error } = await supabase.from('testimonials').update(payload).eq('id', form.id));
    } else {
      ({ error } = await supabase.from('testimonials').insert(payload));
    }

    if (error) {
      setMessage({ type: 'error', text: 'Failed to save: ' + error.message });
    } else {
      setMessage({ type: 'success', text: form.id ? 'Testimonial updated!' : 'Testimonial added!' });
      setEditing(false);
      setForm(emptyForm);
      const { data } = await supabase
        .from('testimonials')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (data) setTestimonials(data as Testimonial[]);
    }
    setSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDelete = async (t: Testimonial) => {
    if (!confirm(`Delete testimonial from "${t.name}"?`)) return;
    if (!isSupabaseConfigured()) return;
    const supabase = createClient();
    const { error } = await supabase.from('testimonials').delete().eq('id', t.id);
    if (error) {
      setMessage({ type: 'error', text: 'Failed to delete.' });
    } else {
      setTestimonials((prev) => prev.filter((x) => x.id !== t.id));
      setMessage({ type: 'success', text: 'Testimonial deleted.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MessageSquare className="h-7 w-7 text-primary" /> Testimonials
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Manage the "Verified Buyer Feedback" shown on the home page.
          </p>
        </div>
        {!editing && (
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Testimonial
          </button>
        )}
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {editing && (
        <form onSubmit={handleSave} className="glass-card rounded-2xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">{form.id ? 'Edit Testimonial' : 'New Testimonial'}</h2>
            <button
              type="button"
              onClick={() => { setEditing(false); setForm(emptyForm); }}
              className="text-zinc-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="e.g., Marcus Vance"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Initials (optional)
              </label>
              <input
                value={form.initials}
                onChange={(e) => setForm({ ...form, initials: e.target.value })}
                maxLength={3}
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="MV"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Review</label>
            <textarea
              value={form.review}
              onChange={(e) => setForm({ ...form, review: e.target.value })}
              rows={3}
              className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary resize-none"
              placeholder="What did the customer say?"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                Product (optional)
              </label>
              <input
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="e.g., Volt Velocity Runner v4"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm({ ...form, rating: n })}
                    className={n <= form.rating ? 'text-accent' : 'text-zinc-600'}
                  >
                    <Star className="h-6 w-6" fill={n <= form.rating ? 'currentColor' : 'none'} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { setEditing(false); setForm(emptyForm); }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-zinc-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {testimonials.length === 0 && !editing ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <MessageSquare className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400">No testimonials yet.</p>
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 mt-4 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
          >
            <Plus className="h-4 w-4" /> Add your first testimonial
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t) => (
            <div key={t.id} className="glass-card rounded-2xl p-5 flex items-start gap-4 border border-white/[0.04]">
              <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary flex-shrink-0">
                {t.initials || t.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-white">{t.name}</span>
                  <span className="flex gap-0.5 text-accent">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-accent" />
                    ))}
                  </span>
                </div>
                <p className="text-sm text-zinc-400 italic mt-1">"{t.review}"</p>
                {t.product && <p className="text-xs text-primary font-semibold mt-1">Product: {t.product}</p>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => openEdit(t)}
                  title="Edit"
                  className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(t)}
                  title="Delete"
                  className="p-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
