'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, X, Save, Eye, Layers, Upload, Image as ImageIcon, Search, Filter, ChevronDown, Star, Sparkles, Trophy } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import { Product, Brand, Category } from '../../../types';
import { useToast } from '../../../components/Toast';

interface AdminProductsClientProps {
  initialProducts: any[];
  brands: Brand[];
  categories: Category[];
  storeId?: string;
}

export default function AdminProductsClient({
  initialProducts,
  brands,
  categories,
  storeId,
}: AdminProductsClientProps) {
  const { addToast } = useToast();
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  const [stock, setStock] = useState('25');
  const [variants, setVariants] = useState<Array<{ size: string; color: string; stock: number }>>([
    { size: '8', color: 'Default', stock: 10 },
    { size: '9', color: 'Default', stock: 10 },
    { size: '10', color: 'Default', stock: 10 },
  ]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
    setImageUrl('');
    setUploadedImages([]);
    setFeatured(false);
    setNewArrival(true);
    setBestSeller(false);
    setStock('50');
    setVariants([
      { size: '8', color: 'Default', stock: 10 },
      { size: '9', color: 'Default', stock: 10 },
      { size: '10', color: 'Default', stock: 10 },
    ]);
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
    setImageUrl(product.image_url || '');
    setUploadedImages(product.images || []);
    setFeatured(product.featured || false);
    setNewArrival(product.new_arrival || false);
    setBestSeller(product.best_seller || false);
    setStock(product.stock.toString());
    setVariants(product.variants || [
      { size: '8', color: 'Default', stock: 10 },
      { size: '9', color: 'Default', stock: 10 },
      { size: '10', color: 'Default', stock: 10 },
    ]);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (configured) {
      const supabase = createClient();
      const newImages: string[] = [];

      for (const file of Array.from(files)) {
        const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const { data, error } = await supabase.storage
          .from('product-images')
          .upload(fileName, file);

        if (error) {
          console.error('Error uploading image:', error);
          continue;
        }

        if (data) {
          const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName);
          newImages.push(publicUrl);
        }
      }

      setUploadedImages(prev => [...prev, ...newImages]);
    } else {
      // Fallback for non-configured Supabase
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { size: '', color: 'Default', stock: 0 }]);
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price || !sku) return;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const pData: any = {
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
      rating: 0,
      reviews_count: 0,
    };

    // Associate new products with the vendor's store (admins leave it null).
    if (storeId) pData.store_id = storeId;

    console.log('Saving product với data:', pData);
    console.log('Supabase configured:', configured);
    console.log('Environment URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...');

    if (editingProduct) {
      setProducts(prev =>
        prev.map(p =>
          p.id === editingProduct.id
            ? { ...p, ...pData, price: pData.price, sale_price: pData.sale_price, stock: parseInt(stock), images: uploadedImages }
            : p
        )
      );

      if (configured) {
        const supabase = createClient();
        
        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Authenticated user:', user?.id);
        
        const { error } = await supabase
          .from('products')
          .update(pData)
          .eq('id', editingProduct.id);

        if (error) {
          console.error('Error updating product in Supabase:', error);
          addToast('Error updating product: ' + error.message, 'error');
        } else {
          console.log('Product updated successfully');
        }

        // Update images if changed
        if (uploadedImages.length > 0) {
          await supabase.from('product_images').delete().eq('product_id', editingProduct.id);
          const imageInserts = uploadedImages.map((img, idx) => ({
            product_id: editingProduct.id,
            image_url: img,
            sort_order: idx,
          }));
          await supabase.from('product_images').insert(imageInserts);
        }

        // Sync variants: replace the existing set with the edited one
        const { error: delVarErr } = await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', editingProduct.id);

        if (!delVarErr) {
          const variantInserts = variants
            .filter(v => v.size && v.size.trim() !== '')
            .map(v => ({
              product_id: editingProduct.id,
              size: v.size,
              color: v.color,
              stock_quantity: v.stock || 0,
            }));
          if (variantInserts.length > 0) {
            const { error: varError } = await supabase.from('product_variants').insert(variantInserts);
            if (varError) console.error('Error inserting variants:', varError);
          }
        }
      }
    } else {
      const newId = `prod_${Date.now()}`;
      const finalImages = uploadedImages.length > 0 ? uploadedImages : ['https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=600'];
      
      const localProduct = {
        id: newId,
        ...pData,
        stock: parseInt(stock),
        image_url: finalImages[0],
        images: finalImages,
      };

      setProducts(prev => [localProduct, ...prev]);

      if (configured) {
        const supabase = createClient();
        
        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        console.log('Authenticated user:', user?.id);
        
        const { data, error } = await supabase
          .from('products')
          .insert(pData)
          .select()
          .single();

        if (!error && data) {
          console.log('Product inserted successfully with ID:', data.id);
          
          const imageInserts = finalImages.map((img, idx) => ({
            product_id: data.id,
            image_url: img,
            sort_order: idx,
          }));
          const { error: imgError } = await supabase.from('product_images').insert(imageInserts);
          if (imgError) console.error('Error inserting images:', imgError);

          const variantInserts = variants
            .filter(v => v.size && v.size.trim() !== '')
            .map(v => ({
              product_id: data.id,
              size: v.size,
              color: v.color,
              stock_quantity: v.stock || 0,
            }));
          
          if (variantInserts.length > 0) {
            const { error: varError } = await supabase.from('product_variants').insert(variantInserts);
            if (varError) console.error('Error inserting variants:', varError);
          }

          setProducts(prev =>
            prev.map(p => (p.sku === sku ? { ...p, id: data.id } : p))
          );
          
          addToast('Product saved successfully to Supabase!', 'success');
        } else {
          console.error('Error inserting product in Supabase:', error);
          addToast('Error saving product: ' + (error?.message || 'Unknown error'), 'error');
        }
      } else {
        addToast('ERROR: Supabase not configured. Products will NOT sync to database.', 'error');
      }
    }

    setIsModalOpen(false);
  };

  const handleToggleFeatured = async (productId: string, currentValue: boolean) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, featured: !currentValue } : p))
    );

    if (configured) {
      const supabase = createClient();
      await supabase
        .from('products')
        .update({ featured: !currentValue })
        .eq('id', productId);
    }
  };

  const handleToggleNewArrival = async (productId: string, currentValue: boolean) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, new_arrival: !currentValue } : p))
    );

    if (configured) {
      const supabase = createClient();
      await supabase
        .from('products')
        .update({ new_arrival: !currentValue })
        .eq('id', productId);
    }
  };

  const handleToggleBestSeller = async (productId: string, currentValue: boolean) => {
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, best_seller: !currentValue } : p))
    );

    if (configured) {
      const supabase = createClient();
      await supabase
        .from('products')
        .update({ best_seller: !currentValue })
        .eq('id', productId);
    }
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
    <div className="px-4 sm:px-6 lg:px-8 py-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">{filteredProducts.length} of {products.length} products in catalog</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20 hover:scale-102 active:scale-98"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-card/50 text-foreground border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-card/50 text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider bg-secondary">
                <th className="text-left p-4 font-semibold">Product</th>
                <th className="text-left p-4 font-semibold">SKU</th>
                <th className="text-left p-4 font-semibold">Price</th>
                <th className="text-left p-4 font-semibold">Stock</th>
                <th className="text-center p-4 font-semibold">Featured</th>
                <th className="text-center p-4 font-semibold">New</th>
                <th className="text-center p-4 font-semibold">Best</th>
                <th className="text-left p-4 font-semibold">Status</th>
                <th className="text-center p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground italic">
                    No products found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => (
                  <tr
                    key={product.id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images?.[0] || product.image_url || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=60&h=60'}
                          alt=""
                          className="w-10 h-10 object-contain bg-background/40 p-1 border border-border rounded-lg"
                        />
                        <div>
                          <Link
                            href={`/product/${product.slug}`}
                            className="font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {product.title}
                          </Link>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            {brands.find(b => b.id === product.brand_id)?.name || 'Custom'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground font-mono text-xs">{product.sku}</td>
                    <td className="p-4 text-foreground">
                      {product.sale_price ? (
                        <span>
                          <span className="line-through text-muted-foreground mr-2">
                            ₹{product.price}
                          </span>
                          <span className="text-accent font-bold">₹{product.sale_price}</span>
                        </span>
                      ) : (
                        `₹{product.price}`
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
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleFeatured(product.id, product.featured)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          product.featured
                            ? 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20'
                            : 'text-muted-foreground bg-secondary border border-border hover:text-yellow-400'
                        }`}
                        title="Toggle Featured"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleNewArrival(product.id, product.new_arrival)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          product.new_arrival
                            ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                            : 'text-muted-foreground bg-secondary border border-border hover:text-green-400'
                        }`}
                        title="Toggle New Arrival"
                      >
                        <Sparkles className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleBestSeller(product.id, product.best_seller)}
                        className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                          product.best_seller
                            ? 'text-accent bg-accent/10 border border-accent/20'
                            : 'text-muted-foreground bg-secondary border border-border hover:text-accent'
                        }`}
                        title="Toggle Best Seller"
                      >
                        <Trophy className="h-4 w-4" />
                      </button>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          product.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/10'
                            : product.status === 'draft'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/10'
                            : 'bg-zinc-500/10 text-muted-foreground border border-zinc-500/10'
                        }`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-muted-foreground hover:text-foreground bg-secondary hover:bg-muted border border-border rounded-lg transition-all cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all cursor-pointer"
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
          <div className="w-full max-w-2xl h-full bg-background border-l border-border p-6 sm:p-8 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
                <h2 className="text-xl font-extrabold text-foreground">
                  {editingProduct ? 'Edit Footwear' : 'Add Footwear to Catalog'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Product Title
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AeroStride Infinity Max"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Stock Keeping Unit (SKU)
                    </label>
                    <input
                      type="text"
                      required
                      value={sku}
                      onChange={e => setSku(e.target.value)}
                      className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Brand
                    </label>
                    <select
                      value={brandId}
                      onChange={e => setBrandId(e.target.value)}
                      className="w-full bg-card text-foreground border border-border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Category
                    </label>
                    <select
                      value={categoryId}
                      onChange={e => setCategoryId(e.target.value)}
                      className="w-full bg-card text-foreground border border-border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Publish Status
                    </label>
                    <select
                      value={status}
                      onChange={e => setStatus(e.target.value as any)}
                      className="w-full bg-card text-foreground border border-border rounded-xl px-3 py-2.5 text-xs outline-none focus:border-primary"
                    >
                      <option value="active">Active</option>
                      <option value="draft">Draft</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Regular Price (₹)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      placeholder="180"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Sale Price (₹) (Optional)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="140"
                      value={salePrice}
                      onChange={e => setSalePrice(e.target.value)}
                      className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Total Stock
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={stock}
                      onChange={e => setStock(e.target.value)}
                      className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                    />
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Product Images
                  </label>
                  <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary/30 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload images</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                  </div>
                  
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-20 object-cover rounded-lg border border-border" />
                          <button
                            onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {imageUrl && uploadedImages.length === 0 && (
                    <div className="mt-3">
                      <img src={imageUrl} alt="Product" className="w-full h-32 object-cover rounded-lg border border-border" />
                    </div>
                  )}
                </div>

                {/* Variants */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Size & Color Variants
                    </label>
                    <button
                      type="button"
                      onClick={addVariant}
                      className="text-xs text-primary hover:text-primary-hover font-semibold"
                    >
                      + Add Variant
                    </button>
                  </div>
                  <div className="space-y-2">
                    {variants.map((variant, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Size (e.g., 8, 9, 10)"
                          value={variant.size}
                          onChange={e => updateVariant(idx, 'size', e.target.value)}
                          className="flex-1 bg-card text-foreground border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          placeholder="Color"
                          value={variant.color}
                          onChange={e => updateVariant(idx, 'color', e.target.value)}
                          className="flex-1 bg-card text-foreground border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={variant.stock}
                          onChange={e => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                          className="w-20 bg-card text-foreground border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary"
                        />
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(idx)}
                            className="p-2 text-red-400 hover:text-red-300"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed description of features, materials, and support specs."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-xs outline-none focus:border-primary"
                  />
                </div>

                <div className="flex flex-wrap gap-6 p-4 bg-secondary border border-border rounded-xl">
                  <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={e => setFeatured(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary h-4 w-4"
                    />
                    Featured product
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newArrival}
                      onChange={e => setNewArrival(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary h-4 w-4"
                    />
                    New Arrival
                  </label>
                  <label className="flex items-center gap-2 text-xs font-bold text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bestSeller}
                      onChange={e => setBestSeller(e.target.checked)}
                      className="rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary h-4 w-4"
                    />
                    Best Seller
                  </label>
                </div>

                <div className="flex gap-4 pt-4 border-t border-border">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Save className="h-4 w-4" /> Save Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-zinc-800 hover:bg-zinc-700 text-muted-foreground px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
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
