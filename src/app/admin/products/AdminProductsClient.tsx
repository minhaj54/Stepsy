'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, X, Save, Eye, Layers } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import { Product, Brand, Category } from '../../../types';

interface AdminProductsClientProps {
  initialProducts: any[];
  brands: Brand[];
  categories: Category[];
}

export default function AdminProductsClient({
  initialProducts,
  brands,
  categories,
}: AdminProductsClientProps) {
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const configured = isSupabaseConfigured();

  // Form Fields
  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState(brands[0]?.id || '');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || '');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [status, setStatus] = useState<'active' | 'draft' | 'archived'>('active');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [stock, setStock] = useState('25'); // Default stock quantity

  const openAddModal = () => {
    setEditingProduct(null);
    setTitle('');
    setBrandId(brands[0]?.id || '');
    setCategoryId(categories[0]?.id || '');
    setSku(`STEP-${Math.floor(100000 + Math.random() * 900000)}`);
    setPrice('');
    setSalePrice('');
    setStatus('active');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600');
    setFeatured(false);
    setNewArrival(true);
    setBestSeller(false);
    setStock('50');
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setTitle(product.title);
    setBrandId(product.brand_id || brands[0]?.id || '');
    setCategoryId(product.category_id || categories[0]?.id || '');
    setSku(product.sku);
    setPrice(product.price.toString());
    setSalePrice(product.sale_price ? product.sale_price.toString() : '');
    setStatus(product.status);
    setDescription(product.description || '');
    setImageUrl(product.image_url || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600');
    setFeatured(product.featured || false);
    setNewArrival(product.new_arrival || false);
    setBestSeller(product.best_seller || false);
    setStock(product.stock.toString());
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !sku) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const pData = {
      title,
      slug,
      brand_id: brandId,
      category_id: categoryId,
      sku,
      price: parseFloat(price),
      sale_price: salePrice ? parseFloat(salePrice) : null,
      status,
      description,
      featured,
      new_arrival: newArrival,
      best_seller: bestSeller,
    };

    if (editingProduct) {
      // 1. Update Locally
      setProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id
            ? { ...p, ...pData, price: pData.price, sale_price: pData.sale_price, stock: parseInt(stock) }
            : p
        )
      );

      // 2. Update DB
      if (configured) {
        const supabase = createClient();
        const { error } = await supabase
          .from('products')
          .update(pData)
          .eq('id', editingProduct.id);

        if (error) {
          console.error('Error updating product in Supabase:', error);
        }
      }
    } else {
      // Create new product
      const newId = editingProduct?.id || `prod_${Date.now()}`;
      const localProduct = {
        id: newId,
        ...pData,
        stock: parseInt(stock),
        image_url: imageUrl,
      };

      setProducts(prev => [localProduct, ...prev]);

      if (configured) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('products')
          .insert(pData)
          .select()
          .single();

        if (!error && data) {
          // Add default image
          await supabase.from('product_images').insert({
            product_id: data.id,
            image_url: imageUrl,
            sort_order: 0,
          });

          // Add default variants
          const sizes = ['8', '9', '10', '11', '12'];
          const variants = sizes.map(sz => ({
            product_id: data.id,
            size: sz,
            color: 'Default',
            stock_quantity: Math.ceil(parseInt(stock) / 5),
          }));

          await supabase.from('product_variants').insert(variants);

          // Update local state with real ID
          setProducts(prev =>
            prev.map(p => (p.sku === sku ? { ...p, id: data.id } : p))
          );
        } else {
          console.error('Error inserting product in Supabase:', error);
        }
      }
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setProducts(prev => prev.filter(p => p.id !== id));

    if (configured) {
      const supabase = createClient();
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-white mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Products</h1>
          <p className="text-zinc-400 text-sm mt-1">{products.length} products in catalog</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20 hover:scale-102 active:scale-98"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.05]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] text-zinc-400 text-xs uppercase tracking-wider bg-white/[0.02]">
                <th className="text-left p-4 font-semibold">Product</th>
                <th className="text-left p-4 font-semibold">SKU</th>
                <th className="text-left p-4 font-semibold">Price</th>
                <th className="text-left p-4 font-semibold">Stock</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-center p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-zinc-500 italic">
                    No products found in the catalog.
                  </td>
                </tr>
              ) : (
                products.map(product => (
                  <tr
                    key={product.id}
                    className="hover:bg-white/[0.01] transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image_url || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=60&h=60'}
                          alt=""
                          className="w-10 h-10 object-contain bg-zinc-950/40 p-1 border border-white/[0.05] rounded-lg"
                        />
                        <div>
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-bold text-white hover:text-primary transition-colors line-clamp-1"
                          >
                            {product.title}
                          </Link>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            {brands.find(b => b.id === product.brand_id)?.name || 'Custom'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-400 font-mono text-xs">{product.sku}</td>
                    <td className="p-4 text-white">
                      {product.sale_price ? (
                        <span>
                          <span className="line-through text-zinc-500 mr-2">
                            ${product.price}
                          </span>
                          <span className="text-accent font-bold">${product.sale_price}</span>
                        </span>
                      ) : (
                        `$${product.price}`
                      )}
                    </td>
                    <td className="p-4">
                      <span
                        className={`font-semibold ${
                          product.stock < 10 ? 'text-red-400' : 'text-green-400'
                        }`}
                      >
                        {product.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          product.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/10'
                            : product.status === 'draft'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/10'
                            : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/10'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-zinc-400 hover:text-white bg-white/[0.02] hover:bg-white/5 border border-white/[0.06] rounded-lg transition-all cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 rounded-lg transition-all cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Drawer Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-2xl h-full bg-zinc-950 border-l border-white/[0.06] p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-4 mb-6">
                <h2 className="text-xl font-extrabold text-white">
                  {editingProduct ? 'Edit Footwear' : 'Add Footwear to Catalog'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Product Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AeroStride Infinity Max"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Stock Keeping Unit (SKU)
                    </label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={e => setSku(e.target.value)}
                      className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Brand
                    </label>
                    <select
                      value={brandId}
                      onChange={e => setBrandId(e.target.value)}
                      className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Publish Status
                    </label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Regular Price ($)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="180"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Sale Price ($) (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="140"
                      value={salePrice}
                      onChange={e => setSalePrice(e.target.value)}
                      className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Total Stock
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={e => setStock(e.target.value)}
                      className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {!editingProduct && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Product Image URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/shoe.png"
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed description of features, materials, and support specs."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-zinc-900 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-wrap gap-6 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={e => setFeatured(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary h-4 w-4"
                    />
                    Featured product
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newArrival}
                      onChange={e => setNewArrival(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary h-4 w-4"
                    />
                    New Arrival
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bestSeller}
                      onChange={e => setBestSeller(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary h-4 w-4"
                    />
                    Best Seller
                  </label>
                </div>

                <div className="flex gap-4 pt-4 border-t border-white/[0.06]">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="h-4 w-4" /> Save Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
