'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Star, Heart, SlidersHorizontal, ArrowUpDown, ChevronDown, Check, X, ArrowRight } from 'lucide-react';
import { mockProducts, mockCategories, mockBrands } from '../../data/mockShoes';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';

export default function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { wishlist, toggleWishlist } = useCart();

  // URL parameters
  const initialCategory = searchParams.get('category') || '';
  const initialBrand = searchParams.get('brand') || '';

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState(initialBrand);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(300);
  const [sortBy, setSortBy] = useState('newest');
  
  // Mobile Filter Drawer
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sync URL changes to state
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedBrand(searchParams.get('brand') || '');
  }, [searchParams]);

  // Unique lists from data
  const sizes = ['8', '9', '10', '11', '12'];
  const colors = [
    { name: 'Volt Electric', class: 'bg-[#ccff00]' },
    { name: 'Cyber Pink', class: 'bg-[#ff007f]' },
    { name: 'Stealth Black', class: 'bg-[#18181b]' },
    { name: 'Mocha Tan', class: 'bg-[#a18262]' },
    { name: 'Varsity Red/White', class: 'bg-[#dc2626]' },
    { name: 'Sahara Sand', class: 'bg-[#e4d5b7]' },
    { name: 'Burnished Mahogany', class: 'bg-[#4a1c1c]' },
    { name: 'Navy Blue', class: 'bg-[#1e3a8a]' },
    { name: 'Off-White', class: 'bg-[#faf9f6]' },
    { name: 'Space Grey', class: 'bg-[#71717a]' },
    { name: 'Copper Rough & Tough', class: 'bg-[#b85a3c]' }
  ];

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const handleColorToggle = (colorName: string) => {
    setSelectedColors(prev => 
      prev.includes(colorName) ? prev.filter(c => c !== colorName) : [...prev, colorName]
    );
  };

  const resetFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedSizes([]);
    setSelectedColors([]);
    setMaxPrice(300);
    setSortBy('newest');
    router.push('/shop');
  };

  // Filtering Logic
  const filteredProducts = mockProducts.filter(product => {
    // Category match
    if (selectedCategory && product.category_slug !== selectedCategory) return false;

    // Brand match
    if (selectedBrand && product.brand_id !== selectedBrand && mockBrands.find(b => b.slug === selectedBrand)?.id !== product.brand_id) return false;

    // Price match
    const currentPrice = product.sale_price || product.price;
    if (currentPrice > maxPrice) return false;

    // Size match
    if (selectedSizes.length > 0) {
      const hasSize = product.variants.some(v => selectedSizes.includes(v.size) && v.stock_quantity > 0);
      if (!hasSize) return false;
    }

    // Color match
    if (selectedColors.length > 0) {
      const hasColor = product.variants.some(v => 
        selectedColors.some(selectedCol => v.color.toLowerCase().includes(selectedCol.toLowerCase())) && v.stock_quantity > 0
      );
      if (!hasColor) return false;
    }

    return true;
  });

  // Sorting Logic
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aPrice = a.sale_price || a.price;
    const bPrice = b.sale_price || b.price;

    if (sortBy === 'price-low') return aPrice - bPrice;
    if (sortBy === 'price-high') return bPrice - aPrice;
    if (sortBy === 'rating') return b.rating - a.rating;
    
    // Default: Newest (by ID/date)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      {/* Top Title & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Stepzy Footwear Catalog</h1>
          <p className="text-zinc-500 text-sm mt-1">Showing {sortedProducts.length} premium products</p>
        </div>

        <div className="flex w-full md:w-auto items-center justify-between sm:justify-end gap-3 self-stretch md:self-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex md:hidden items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-white/[0.08] hover:border-white/[0.15] text-zinc-300 rounded-xl text-sm font-semibold transition-all cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 bg-zinc-900 border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-3 py-2 text-sm text-zinc-300 transition-all w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-zinc-500 text-xs flex items-center gap-1 font-medium">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-white outline-none border-none pr-6 cursor-pointer font-semibold text-xs"
            >
              <option value="newest" className="bg-zinc-900">Newest Drops</option>
              <option value="price-low" className="bg-zinc-900">Price: Low to High</option>
              <option value="price-high" className="bg-zinc-900">Price: High to Low</option>
              <option value="rating" className="bg-zinc-900">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-8 glass-card p-6 rounded-2xl border border-white/[0.05]">
          <div className="flex justify-between items-center pb-4 border-b border-white/[0.06]">
            <h3 className="font-bold text-white text-base">Filter Products</h3>
            <button 
              onClick={resetFilters}
              className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Category</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors font-medium ${
                  selectedCategory === '' ? 'bg-primary/20 text-primary font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Categories
              </button>
              {mockCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors font-medium flex justify-between items-center ${
                    selectedCategory === cat.slug ? 'bg-primary/20 text-primary font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat.name}
                  {selectedCategory === cat.slug && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-3 pt-4 border-t border-white/[0.06]">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Brand</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedBrand('')}
                className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors font-medium ${
                  selectedBrand === '' ? 'bg-primary/20 text-primary font-bold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All Brands
              </button>
              {mockBrands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.slug)}
                  className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors font-medium flex justify-between items-center ${
                    selectedBrand === brand.slug ? 'bg-primary/20 text-primary font-bold' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {brand.name}
                  {selectedBrand === brand.slug && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-white/[0.06]">
            <div className="flex justify-between items-center">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Max Price</h4>
              <span className="text-sm font-bold text-white">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="30"
              max="300"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-semibold">
              <span>$30</span>
              <span>$300</span>
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-3 pt-4 border-t border-white/[0.06]">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Sizes (US)</h4>
            <div className="grid grid-cols-4 gap-2">
              {sizes.map((size) => {
                const isSelected = selectedSizes.includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => handleSizeToggle(size)}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                        : 'bg-zinc-900 border-white/[0.08] hover:border-white/[0.15] text-zinc-300'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-3 pt-4 border-t border-white/[0.06]">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Colors</h4>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((color) => {
                const isSelected = selectedColors.includes(color.name);
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorToggle(color.name)}
                    className={`h-8 w-8 rounded-full border flex items-center justify-center relative cursor-pointer group transition-transform ${
                      isSelected ? 'border-primary scale-110' : 'border-white/[0.08] hover:scale-105'
                    }`}
                    title={color.name}
                  >
                    <span className={`h-6 w-6 rounded-full ${color.class} block`} />
                    {isSelected && (
                      <span className="absolute inset-0 flex items-center justify-center text-zinc-950 font-bold bg-white/20 rounded-full">
                        <Check className="h-3.5 w-3.5 stroke-[3] text-white mix-blend-difference" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {sortedProducts.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl text-center space-y-4">
              <p className="text-3xl">👟🚫</p>
              <h3 className="text-xl font-extrabold text-white">No footwear matches your filters</h3>
              <p className="text-zinc-500 text-sm max-w-md mx-auto">
                We couldn't find any shoes matching your configuration. Try relaxing your filters or resetting the catalog.
              </p>
              <button
                onClick={resetFilters}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                const price = product.price;
                const salePrice = product.sale_price;

                return (
                  <div key={product.id} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative group border border-white/[0.04]">
                    {/* Wishlist toggle */}
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-4 right-4 z-20 p-2.5 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-white rounded-full border border-white/[0.04] transition-colors"
                      aria-label="Toggle Wishlist"
                    >
                      <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-accent text-accent' : ''}`} />
                    </button>

                    {/* Product Badge */}
                    {salePrice && (
                      <span className="absolute top-4 left-4 z-20 px-2 py-0.5 bg-accent text-white text-[10px] font-bold uppercase rounded-md">
                        Sale
                      </span>
                    )}

                    {/* Product Image */}
                    <Link href={`/product/${product.slug}`} className="block aspect-square w-full p-6 bg-zinc-950/40 relative overflow-hidden flex items-center justify-center">
                      <img 
                        src={product.images[0]} 
                        alt={product.title} 
                        className="max-h-[160px] w-auto object-contain transform -rotate-6 group-hover:rotate-0 group-hover:scale-110 transition-all duration-300 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                      />
                    </Link>

                    {/* Details */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center text-xs text-zinc-500 mb-1">
                          <span>{product.brand_name}</span>
                          <div className="flex items-center gap-0.5 text-accent font-semibold">
                            <Star className="h-3 w-3 fill-accent" />
                            <span>{product.rating}</span>
                          </div>
                        </div>

                        <Link href={`/product/${product.slug}`}>
                          <h3 className="font-bold text-white text-base hover:text-primary transition-colors line-clamp-1">
                            {product.title}
                          </h3>
                        </Link>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/[0.04]">
                        <div>
                          {salePrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm line-through text-zinc-500">${price}</span>
                              <span className="text-base font-black text-white">${salePrice}</span>
                            </div>
                          ) : (
                            <span className="text-base font-black text-white">${price}</span>
                          )}
                        </div>
                        <Link 
                          href={`/product/${product.slug}`}
                          className="bg-white/[0.05] hover:bg-primary text-white p-2 rounded-xl border border-white/[0.06] hover:border-primary transition-all duration-300"
                          aria-label="View Details"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Absolute overlay) */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-zinc-900 border-l border-white/[0.08] p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-white/[0.06] mb-6">
              <h3 className="font-bold text-white text-base">Filters</h3>
              <button 
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/5"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Mobile Category */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Category</h4>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => { setSelectedCategory(''); setIsFilterDrawerOpen(false); }}
                  className={`text-left text-sm py-2 px-3 rounded-lg font-semibold ${selectedCategory === '' ? 'bg-primary/20 text-primary' : 'text-zinc-400'}`}
                >
                  All Categories
                </button>
                {mockCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.slug); setIsFilterDrawerOpen(false); }}
                    className={`text-left text-sm py-2 px-3 rounded-lg font-semibold flex justify-between items-center ${selectedCategory === cat.slug ? 'bg-primary/20 text-primary' : 'text-zinc-400'}`}
                  >
                    {cat.name}
                    {selectedCategory === cat.slug && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Brand */}
            <div className="space-y-3 mb-6 pt-4 border-t border-white/[0.06]">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Brand</h4>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => { setSelectedBrand(''); setIsFilterDrawerOpen(false); }}
                  className={`text-left text-sm py-2 px-3 rounded-lg font-semibold ${selectedBrand === '' ? 'bg-primary/20 text-primary' : 'text-zinc-400'}`}
                >
                  All Brands
                </button>
                {mockBrands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => { setSelectedBrand(brand.slug); setIsFilterDrawerOpen(false); }}
                    className={`text-left text-sm py-2 px-3 rounded-lg font-semibold flex justify-between items-center ${selectedBrand === brand.slug ? 'bg-primary/20 text-primary' : 'text-zinc-400'}`}
                  >
                    {brand.name}
                    {selectedBrand === brand.slug && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Price */}
            <div className="space-y-3 mb-6 pt-4 border-t border-white/[0.06]">
              <div className="flex justify-between items-center">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Max Price</h4>
                <span className="text-sm font-bold text-white">${maxPrice}</span>
              </div>
              <input
                type="range"
                min="30"
                max="300"
                step="10"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Mobile Size */}
            <div className="space-y-3 mb-6 pt-4 border-t border-white/[0.06]">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-zinc-400">Sizes</h4>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center border ${isSelected ? 'bg-primary text-white border-primary' : 'bg-zinc-800 border-white/[0.08] text-zinc-300'}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-4 border-t border-white/[0.06]">
              <button
                onClick={() => { resetFilters(); setIsFilterDrawerOpen(false); }}
                className="flex-1 py-3 bg-zinc-800 text-white rounded-xl text-xs font-bold text-center"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-3 bg-primary text-white rounded-xl text-xs font-bold text-center"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
