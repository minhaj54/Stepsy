'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, X, Save, Search, Tag } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import { createCategory, updateCategory, deleteCategory } from '../../../lib/data/products';

interface AdminCategoriesClientProps {
  initialCategories: any[];
  brands: any[];
}

export default function AdminCategoriesClient({ initialCategories, brands }: AdminCategoriesClientProps) {
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const configured = isSupabaseConfigured();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [image, setImage] = useState('');

  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setImage('');
    setIsModalOpen(true);
  };

  const openEditModal = (category: any) => {
    setEditingCategory(category);
    setName(category.name);
    setSlug(category.slug);
    setImage(category.image || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    const slugValue = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (editingCategory) {
      setCategories(prev =>
        prev.map(c => (c.id === editingCategory.id ? { ...c, name, slug: slugValue, image } : c))
      );

      if (configured) {
        const supabase = createClient();
        await supabase
          .from('categories')
          .update({ name, slug: slugValue, image })
          .eq('id', editingCategory.id);
      }
    } else {
      const newCategory = { id: `cat_${Date.now()}`, name, slug: slugValue, image };
      setCategories(prev => [...prev, newCategory]);

      if (configured) {
        const supabase = createClient();
        await supabase
          .from('categories')
          .insert({ name, slug: slugValue, image });
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    setCategories(prev => prev.filter(c => c.id !== id));

    if (configured) {
      const supabase = createClient();
      await supabase
        .from('categories')
        .delete()
        .eq('id', id);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Categories</h1>
          <p className="text-zinc-400 text-sm mt-1">Manage product categories</p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900/50 text-white border border-white/[0.06] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
        />
      </div>

      {/* Categories Grid */}
      {filteredCategories.length === 0 ? (
        <div className="glass-card rounded-2xl p-12 text-center">
          <Tag className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-400 text-sm">No categories found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => (
            <div key={category.id} className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Tag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{category.name}</h3>
                  <p className="text-xs text-zinc-500">/{category.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(category)}
                  className="p-2 bg-white/[0.04] hover:bg-primary/20 text-zinc-400 hover:text-primary rounded-lg transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id)}
                  className="p-2 bg-white/[0.04] hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Category Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="e.g., Sneakers"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Slug
                </label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="e.g., sneakers"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Image URL (optional)
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-white/[0.05] hover:bg-white/[0.08] text-white rounded-xl font-semibold text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
