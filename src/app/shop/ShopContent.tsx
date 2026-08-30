'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Star, Heart, SlidersHorizontal, ArrowUpDown, ChevronDown, Check, X, ArrowRight } from 'lucide-react';
import { Product, Brand, Category } from '../../types';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import ShimmerImage from '../../components/ShimmerImage';

interface ShopContentProps {
  products: Product[];
  brands: Brand[];
  categories: Category[];
}

export default function ShopContent({ products, brands, categories }: ShopContentProps) {
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

  // Derive the real price ceiling from the catalog so premium products are
  // never hidden behind a hard-coded ₹10000 default on the shop page.
  const catalogPrices = products.map(p => p.sale_price || p.price);
  const priceCeiling = catalogPrices.length
    ? Math.max(10000, Math.ceil(Math.max(...catalogPrices) / 50) * 50)
    : 10000;

  const [maxPrice, setMaxPrice] = useState(priceCeiling);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const PRODUCTS_PER_PAGE = 9;
  
  // Mobile Filter Drawer
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Sync URL changes to state and reset pagination
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedBrand(searchParams.get('brand') || '');
    setCurrentPage(1);
  }, [searchParams]);

  // Unique lists from data
  const sizes = ['6', '7', '8', '9', '10', '11', '12'];
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
    setMaxPrice(priceCeiling);
    setSortBy('newest');
    setCurrentPage(1);
    router.push('/shop');
  };

  // Filtering Logic
  const filteredProducts = products.filter(product => {
    // Category match
    if (selectedCategory && product.category_slug !== selectedCategory) return false;

    // Brand match
    if (selectedBrand && product.brand_id !== selectedBrand && brands.find(b => b.slug === selectedBrand)?.id !== product.brand_id) return false;

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
  const sortedProducts = useMemo(() => {
    if (sortBy === 'price-low') {
      return [...filteredProducts].sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
    }
    if (sortBy === 'price-high') {
      return [...filteredProducts].sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
    }
    if (sortBy === 'rating') {
      return [...filteredProducts].sort((a, b) => b.rating - a.rating);
    }
    // Default "newest": return products in original order
    return filteredProducts;
  }, [filteredProducts, sortBy]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrand, selectedSizes, selectedColors, maxPrice, sortBy]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow">
      {/* Top Title & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Zarwinto Footwear Catalog</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Premium footwear catalog</p>
        </div>

        <div className="flex w-full md:w-auto items-center justify-between sm:justify-end gap-2 sm:gap-3 self-stretch md:self-auto">
          {/* Mobile Filter Button */}
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex md:hidden items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-card border border-border hover:border-muted-foreground/50 text-muted-foreground rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 bg-card border border-border hover:border-muted-foreground/50 rounded-xl px-2.5 py-2 sm:px-3 sm:py-2 text-xs sm:text-sm text-muted-foreground transition-all w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-muted-foreground text-[10px] sm:text-xs flex items-center gap-1 font-medium">
              <ArrowUpDown className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-foreground outline-none border-none pr-6 cursor-pointer font-semibold text-[10px] sm:text-xs"
            >
              <option value="newest" className="bg-zinc-900">Newest Drops</option>
              <option value="price-low" className="bg-zinc-900">Price: Low to High</option>
              <option value="price-high" className="bg-zinc-900">Price: High to Low</option>
              <option value="rating" className="bg-zinc-900">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block space-y-8 glass-card p-6 rounded-2xl border border-border">
          <div className="flex justify-between items-center pb-4 border-b border-border">
            <h3 className="font-bold text-foreground text-base">Filter Products</h3>
            <button 
              onClick={resetFilters}
              className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-foreground/60">Category</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors font-medium ${
                  selectedCategory === '' ? 'bg-primary/20 text-primary font-bold' : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors font-medium flex justify-between items-center ${
                    selectedCategory === cat.slug ? 'bg-primary/20 text-primary font-bold' : 'text-foreground/70 hover:text-foreground'
                  }`}
                >
                  {cat.name}
                  {selectedCategory === cat.slug && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-foreground/60">Brand</h4>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedBrand('')}
                className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors font-medium ${
                  selectedBrand === '' ? 'bg-primary/20 text-primary font-bold' : 'text-foreground/70 hover:text-foreground'
                }`}
              >
                All Brands
              </button>
              {brands.map((brand) => (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrand(brand.slug)}
                  className={`text-left text-sm py-1.5 px-3 rounded-lg transition-colors font-medium flex justify-between items-center ${
                    selectedBrand === brand.slug ? 'bg-primary/20 text-primary font-bold' : 'text-foreground/70 hover:text-foreground'
                  }`}
                >
                  {brand.name}
                  {selectedBrand === brand.slug && <Check className="h-4 w-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-foreground/60">Max Price</h4>
              <span className="text-sm font-bold text-foreground">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max={priceCeiling}
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-primary h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-foreground/50 font-semibold">
              <span>₹0</span>
              <span>₹{priceCeiling}</span>
            </div>
          </div>

          {/* Size Filter */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-foreground/60">Sizes (US)</h4>
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
                        : 'bg-card border-border hover:border-muted-foreground/50 text-foreground/80'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Filter */}
          <div className="space-y-3 pt-4 border-t border-border">
            <h4 className="text-xs uppercase font-extrabold tracking-widest text-foreground/60">Colors</h4>
            <div className="flex flex-wrap gap-2.5">
              {colors.map((color) => {
                const isSelected = selectedColors.includes(color.name);
                return (
                  <button
                    key={color.name}
                    onClick={() => handleColorToggle(color.name)}
                    className={`h-8 w-8 rounded-full border flex items-center justify-center relative cursor-pointer group transition-transform ${
                      isSelected ? 'border-primary scale-110' : 'border-border hover:scale-105'
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
              <h3 className="text-xl font-extrabold text-foreground">No footwear matches your filters</h3>
              <p className="text-foreground/70 text-sm max-w-md mx-auto">
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              {paginatedProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                const price = product.price;
                const salePrice = product.sale_price;

                return (
                  <div key={product.id} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative group border border-border">
                    {/* Wishlist toggle */}
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-4 right-4 z-20 p-2.5 bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full border border-border transition-colors"
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
                    <Link href={`/product/${product.slug}`} className="block aspect-square w-full bg-background/40 relative overflow-hidden">
                      <ShimmerImage
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full"
                      />
                    </Link>

                    {/* Details */}
                    <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between">
                      <div>
                         <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                           <span>{product.brand_name}</span>
                           {product.rating > 0 && (
                             <div className="flex items-center gap-0.5 text-accent font-semibold">
                               {[1, 2, 3, 4, 5].map((star) => {
                                 const fillRatio = product.rating - (star - 1);
                                 if (fillRatio >= 1) {
                                   return <Star key={star} className="h-3 w-3 fill-accent" />;
                                 } else if (fillRatio > 0) {
                                   return (
                                     <div key={star} className="relative h-3 w-3">
                                       <Star className="h-3 w-3 text-zinc-700" />
                                       <div className="absolute inset-0 overflow-hidden">
                                         <Star className="h-3 w-3 fill-accent" />
                                       </div>
                                     </div>
                                   );
                                 } else {
                                   return <Star key={star} className="h-3 w-3 text-zinc-700" />;
                                 }
                               })}
                               <span className="ml-0.5">{product.rating}</span>
                             </div>
                           )}
                         </div>

                        <Link href={`/product/${product.slug}`}>
                          <h3 className="font-bold text-foreground text-base hover:text-primary transition-colors line-clamp-1">
                            {product.title}
                          </h3>
                        </Link>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-2.5 sm:mt-4 sm:pt-3 border-t border-border">
                        <div>
                          {salePrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-sm line-through text-muted-foreground">₹{price}</span>
                              <span className="text-base font-black text-foreground">₹{salePrice}</span>
                            </div>
                          ) : (
                            <span className="text-base font-black text-foreground">₹{price}</span>
                          )}
                        </div>
                        <Link
                          href={`/product/${product.slug}`}
                          className="bg-primary hover:bg-primary-hover text-primary-foreground p-2.5 rounded-xl border border-primary hover:border-primary-hover transition-all duration-300"
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 sm:mt-12">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                        : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:border-muted-foreground/50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl bg-card border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:border-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Absolute overlay) */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-background/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-background border-l border-border p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
              <h3 className="font-bold text-foreground text-base">Filters</h3>
              <button 
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 text-foreground/60 hover:text-foreground rounded-lg hover:bg-secondary"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

             {/* Mobile Category */}
            <div className="space-y-3 mb-6">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-foreground/60">Category</h4>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => { setSelectedCategory(''); setIsFilterDrawerOpen(false); }}
                  className={`text-left text-sm py-2 px-3 rounded-lg font-semibold ${selectedCategory === '' ? 'bg-primary/20 text-primary' : 'text-foreground/70'}`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.slug); setIsFilterDrawerOpen(false); }}
                    className={`text-left text-sm py-2 px-3 rounded-lg font-semibold flex justify-between items-center ${selectedCategory === cat.slug ? 'bg-primary/20 text-primary' : 'text-foreground/70'}`}
                  >
                    {cat.name}
                    {selectedCategory === cat.slug && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Brand */}
            <div className="space-y-3 mb-6 pt-4 border-t border-border">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-foreground/60">Brand</h4>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => { setSelectedBrand(''); setIsFilterDrawerOpen(false); }}
                  className={`text-left text-sm py-2 px-3 rounded-lg font-semibold ${selectedBrand === '' ? 'bg-primary/20 text-primary' : 'text-foreground/70'}`}
                >
                  All Brands
                </button>
                {brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => { setSelectedBrand(brand.slug); setIsFilterDrawerOpen(false); }}
                    className={`text-left text-sm py-2 px-3 rounded-lg font-semibold flex justify-between items-center ${selectedBrand === brand.slug ? 'bg-primary/20 text-primary' : 'text-foreground/70'}`}
                  >
                    {brand.name}
                    {selectedBrand === brand.slug && <Check className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Price */}
            <div className="space-y-3 mb-6 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <h4 className="text-xs uppercase font-extrabold tracking-widest text-foreground/60">Max Price</h4>
                <span className="text-sm font-bold text-foreground">₹{maxPrice}</span>
              </div>
              <input
                type="range"
                min="0"
                max={priceCeiling}
                step="50"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-primary h-1.5 bg-border rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-foreground/50 font-semibold">
                <span>₹0</span>
                <span>₹{priceCeiling}</span>
              </div>
            </div>

            {/* Mobile Size */}
            <div className="space-y-3 mb-6 pt-4 border-t border-border">
              <h4 className="text-xs uppercase font-extrabold tracking-widest text-foreground/60">Sizes</h4>
              <div className="grid grid-cols-4 gap-2">
                {sizes.map((size) => {
                  const isSelected = selectedSizes.includes(size);
                  return (
                    <button
                      key={size}
                      onClick={() => handleSizeToggle(size)}
                      className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center border ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-border text-foreground/80'}`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4 mt-8 pt-4 border-t border-border">
              <button
                onClick={() => { resetFilters(); setIsFilterDrawerOpen(false); }}
                className="flex-1 py-3 bg-muted text-foreground rounded-xl text-xs font-bold text-center"
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
