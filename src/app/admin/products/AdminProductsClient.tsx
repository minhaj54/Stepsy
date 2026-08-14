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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const configured = isSupabaseConfigured();

  // Form Fields
  const [title, setTitle] = useState('');
  const [brandId, setBrandId] = useState(brands[0]?.id || '');
  const [customBrand, setCustomBrand] = useState('');
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
    { size: '6', color: 'Default', stock: 10 },
    { size: '7', color: 'Default', stock: 10 },
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
    setCustomBrand('');
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
      { size: '6', color: 'Default', stock: 10 },
      { size: '7', color: 'Default', stock: 10 },
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
    setCustomBrand(brands.some(b => b.id === product.brand_id) ? '' : (product.brand_name || ''));
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
      { size: '6', color: 'Default', stock: 10 },
      { size: '7', color: 'Default', stock: 10 },
      { size: '8', color: 'Default', stock: 10 },
      { size: '9', color: 'Default', stock: 10 },
      { size: '10', color: 'Default', stock: 10 },
    ]);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    setIsUploading(true);

    if (configured) {
      const supabase = createClient();
      const newImages: string[] = [];

      for (const file of fileList) {
        const key = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        setUploadProgress(prev => ({ ...prev, [key]: 5 }));

        // Smoothly simulate progress until the upload resolves (storage-js
        // doesn't expose byte-level progress for this bucket).
        const timer = setInterval(() => {
          setUploadProgress(prev => {
            const current = prev[key] ?? 5;
            if (current >= 90) return prev;
            return { ...prev, [key]: current + Math.floor(Math.random() * 12) + 4 };
          });
        }, 200);

        try {
          const { data, error } = await supabase.storage
            .from('product-images')
            .upload(key, file);

          clearInterval(timer);
          setUploadProgress(prev => ({ ...prev, [key]: 100 }));

          if (error) {
            console.error('Error uploading image:', error);
            continue;
          }

          if (data) {
            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(key);
            newImages.push(publicUrl);
          }
        } catch (err) {
          clearInterval(timer);
          console.error('Error uploading image:', err);
        } finally {
          setUploadProgress(prev => {
            const next = { ...prev };
            delete next[key];
            return next;
          });
        }
      }

      setUploadedImages(prev => [...prev, ...newImages]);
    } else {
      // Fallback for non-configured Supabase
      const newImages = fileList.map(file => URL.createObjectURL(file));
      setUploadedImages(prev => [...prev, ...newImages]);
    }

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      brand_id: brandId === 'other' ? (brands[0]?.id || null) : brandId,
      brand_name: brandId === 'other' ? customBrand : undefined,
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
      const newId = crypto.randomUUID();
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" /> Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Products</h1>
          <p className="text-muted-foreground text-sm mt-1">{filteredProducts.length} of {products.length} products in catalog</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-primary hover:bg-primary-hover text-white px-4 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-primary/20 active:scale-[0.98] w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-card/50 text-foreground border border-border rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="flex-1 sm:flex-none bg-card/50 text-foreground border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Product List - Mobile Cards / Desktop Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-border">
        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto">
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
                  <td colSpan={9} className="text-center p-8 text-muted-foreground italic">
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

        {/* Mobile Cards */}
        <div className="lg:hidden divide-y divide-border">
          {filteredProducts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground italic">
              No products found matching your filters.
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product.id} className="p-4 hover:bg-muted/30 transition-colors">
                <div className="flex gap-3">
                  <Link href={`/product/${product.slug}`} className="flex-shrink-0">
                    <img
                      src={product.images?.[0] || product.image_url || 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=120&h=120'}
                      alt=""
                      className="w-16 h-16 sm:w-20 sm:h-20 object-contain bg-background/40 p-1.5 border border-border rounded-xl"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-bold text-foreground hover:text-primary transition-colors line-clamp-2 text-sm"
                    >
                      {product.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground font-mono">{product.sku}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          product.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border border-green-500/10'
                            : product.status === 'draft'
                            ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/10'
                            : 'bg-zinc-500/10 text-muted-foreground border border-zinc-500/10'
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-foreground">
                          {product.sale_price ? (
                            <span>
                              <span className="line-through text-muted-foreground text-xs mr-1">₹{product.price}</span>
                              <span className="text-accent">₹{product.sale_price}</span>
                            </span>
                          ) : (
                            `₹{product.price}`
                          )}
                        </span>
                        <span className={`text-xs font-semibold ${product.stock < 10 ? 'text-red-400' : 'text-green-400'}`}>
                          {product.stock} left
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleFeatured(product.id, product.featured)}
                          className={`p-2 rounded-lg transition-all cursor-pointer ${
                            product.featured
                              ? 'text-yellow-400 bg-yellow-500/10 border border-yellow-500/20'
                              : 'text-muted-foreground bg-secondary border border-border'
                          }`}
                          title="Featured"
                        >
                          <Star className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleNewArrival(product.id, product.new_arrival)}
                          className={`p-2 rounded-lg transition-all cursor-pointer ${
                            product.new_arrival
                              ? 'text-green-400 bg-green-500/10 border border-green-500/20'
                              : 'text-muted-foreground bg-secondary border border-border'
                          }`}
                          title="New Arrival"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleBestSeller(product.id, product.best_seller)}
                          className={`p-2 rounded-lg transition-all cursor-pointer ${
                            product.best_seller
                              ? 'text-accent bg-accent/10 border border-accent/20'
                              : 'text-muted-foreground bg-secondary border border-border'
                          }`}
                          title="Best Seller"
                        >
                          <Trophy className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-muted-foreground hover:text-foreground bg-secondary hover:bg-muted border border-border rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full h-full bg-background border-l border-border flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 sm:max-w-2xl sm:h-auto sm:rounded-l-2xl sm:my-4 sm:max-h-[calc(100vh-2rem)] sm:rounded-r-none">
            <div className="flex justify-between items-center p-4 sm:p-6 border-b border-border flex-shrink-0">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
                {editingProduct ? 'Edit Footwear' : 'Add Footwear'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} id="product-form" className="flex-1 overflow-y-auto">
              <div className="p-4 sm:p-6 space-y-5 pb-24 sm:pb-6">
                {/* Basic Info */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Product Title <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AeroStride Infinity Max"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        SKU <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={sku}
                        onChange={e => setSku(e.target.value)}
                        className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-3 text-xs outline-none focus:border-primary font-mono"
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
                        className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Brand / Category / Status */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Brand
                      </label>
                      <select
                        value={brandId}
                        onChange={e => setBrandId(e.target.value)}
                        className="w-full bg-card text-foreground border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-primary"
                      >
                        {brands.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                        <option value="other">Other</option>
                      </select>
                      {brandId === 'other' && (
                        <input
                          type="text"
                          required
                          placeholder="Enter custom brand name"
                          value={customBrand}
                          onChange={e => setCustomBrand(e.target.value)}
                          className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                        />
                      )}
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Category
                      </label>
                      <select
                        value={categoryId}
                        onChange={e => setCategoryId(e.target.value)}
                        className="w-full bg-card text-foreground border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-primary"
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
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={e => setStatus(e.target.value as any)}
                        className="w-full bg-card text-foreground border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-primary"
                      >
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Pricing */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Regular Price (₹) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        placeholder="180"
                        value={price}
                        onChange={e => setPrice(e.target.value)}
                        className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Sale Price (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="140"
                        value={salePrice}
                        onChange={e => setSalePrice(e.target.value)}
                        className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Product Images
                  </label>
                  <div
                    className={`border-2 border-dashed border-border rounded-xl p-6 sm:p-8 text-center hover:border-primary/30 transition-colors cursor-pointer active:bg-muted/20 ${isUploading ? 'pointer-events-none opacity-80' : ''}`}
                    onClick={() => !isUploading && fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {isUploading ? (
                      <>
                        <div className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3">
                          <div className="h-full w-full rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                        </div>
                        <p className="text-sm text-foreground font-medium">Uploading images…</p>
                        <div className="mt-3 h-1.5 w-full max-w-xs mx-auto bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-200 rounded-full"
                            style={{ width: `${Math.max(5, ...Object.values(uploadProgress), 5)}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-foreground font-medium">Tap to upload images</p>
                        <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative group">
                          <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-20 sm:h-24 object-cover rounded-xl border border-border" />
                          <button
                            type="button"
                            onClick={() => setUploadedImages(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1.5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          >
                            <X className="h-3 w-3 text-white" />
                          </button>
                        </div>
                      ))}
                      {Object.entries(uploadProgress).map(([key, pct]) => (
                        <div key={key} className="relative w-full h-20 sm:h-24 rounded-xl border border-border bg-secondary flex flex-col items-center justify-center overflow-hidden">
                          <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                          <span className="text-[10px] text-muted-foreground mt-1">{pct}%</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {imageUrl && uploadedImages.length === 0 && (
                    <div className="mt-3">
                      <img src={imageUrl} alt="Product" className="w-full h-32 sm:h-40 object-cover rounded-xl border border-border" />
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
                          placeholder="Size"
                          value={variant.size}
                          onChange={e => updateVariant(idx, 'size', e.target.value)}
                          className="flex-1 bg-card text-foreground border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-primary"
                        />
                        <input
                          type="text"
                          placeholder="Color"
                          value={variant.color}
                          onChange={e => updateVariant(idx, 'color', e.target.value)}
                          className="flex-1 bg-card text-foreground border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-primary"
                        />
                        <input
                          type="number"
                          placeholder="Stock"
                          value={variant.stock}
                          onChange={e => updateVariant(idx, 'stock', parseInt(e.target.value) || 0)}
                          className="w-16 sm:w-20 bg-card text-foreground border border-border rounded-xl px-3 py-3 text-sm outline-none focus:border-primary"
                        />
                        {variants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeVariant(idx)}
                            className="p-2 text-red-400 hover:text-red-300 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed description of features, materials, and support specs."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-primary resize-none"
                  />
                </div>

                {/* Badges */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Product Badges
                  </label>
                  <div className="flex flex-wrap gap-3 p-4 bg-secondary border border-border rounded-xl">
                    <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={featured}
                        onChange={e => setFeatured(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary h-4 w-4"
                      />
                      Featured
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newArrival}
                        onChange={e => setNewArrival(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary h-4 w-4"
                      />
                      New Arrival
                    </label>
                    <label className="flex items-center gap-2 text-sm font-bold text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={bestSeller}
                        onChange={e => setBestSeller(e.target.checked)}
                        className="rounded border-zinc-700 bg-zinc-900 text-primary focus:ring-primary h-4 w-4"
                      />
                      Best Seller
                    </label>
                  </div>
                </div>
              </div>

              {/* Sticky Bottom Actions - Mobile Only */}
              <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-md border-t border-border p-4 flex gap-3 z-10">
                <button
                  type="submit"
                  form="product-form"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg shadow-primary/20"
                >
                  <Save className="h-4 w-4" /> Save Product
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-muted-foreground px-6 py-3.5 rounded-xl font-bold text-sm uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>

            {/* Desktop Actions */}
            <div className="hidden sm:flex gap-4 p-4 sm:p-6 border-t border-border flex-shrink-0">
              <button
                type="submit"
                form="product-form"
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
          </div>
        </div>
      )}
    </div>
  );
}
