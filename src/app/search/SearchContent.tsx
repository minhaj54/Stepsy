'use client';

import ShimmerImage from '../../components/ShimmerImage';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, Star, Heart, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';

interface SearchContentProps {
  products: Product[];
}

export default function SearchContent({ products }: SearchContentProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { wishlist, toggleWishlist } = useCart();
  
  const query = searchParams.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
  };

  const popularSuggestions = [
    'Sneakers',
    'Volt',
    'Leather',
    'Waterproof',
    'Boots',
    'AeroStride',
    'ApexCraft'
  ];

  const handleTagClick = (tag: string) => {
    setSearchInput(tag);
    router.push(`/search?q=${encodeURIComponent(tag)}`);
  };

  // Search filter logic
  const matchedProducts = query
    ? products.filter((product) => {
        const queryLower = query.toLowerCase();
        return (
          product.title.toLowerCase().includes(queryLower) ||
          product.brand_name.toLowerCase().includes(queryLower) ||
          product.description.toLowerCase().includes(queryLower) ||
          product.category_slug.toLowerCase().includes(queryLower) ||
          (product.specifications &&
            Object.values(product.specifications).some((val) =>
              val.toLowerCase().includes(queryLower)
            ))
        );
      })
    : [];

  const recommendations = products.slice(0, 3);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-grow">
      {/* Search Bar Block */}
      <div className="max-w-2xl mx-auto text-center space-y-4 sm:space-y-6 mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Explore Zarwinto Marketplace</h1>
        
        <form onSubmit={handleSearchSubmit} className="relative group">
          <input
            type="text"
            placeholder="Search footwear by brand, color, purpose..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full bg-card text-foreground placeholder:text-muted-foreground border border-border group-hover:border-muted-foreground/50 focus:border-primary focus:bg-muted focus:ring-1 focus:ring-primary rounded-2xl py-3 sm:py-4 pl-4 sm:pl-5 pr-12 sm:pr-14 outline-none transition-all duration-300 text-sm font-medium"
          />
          <button
            type="submit"
            className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 bg-primary hover:bg-primary-hover p-2 sm:p-2.5 rounded-xl text-white transition-all cursor-pointer"
            aria-label="Search Submit"
          >
            <Search className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>
        </form>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-muted-foreground font-semibold uppercase tracking-wider">Popular Searches:</span>
          {popularSuggestions.map((tag) => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className="bg-secondary hover:bg-primary/20 text-muted-foreground hover:text-foreground border border-border hover:border-primary/30 rounded-lg px-3 py-1 font-semibold transition-all cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Block */}
      {query ? (
        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Search Results
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Found {matchedProducts.length} results for "{query}"
            </p>
          </div>

          {matchedProducts.length === 0 ? (
            <div className="glass-card p-12 rounded-3xl text-center space-y-4 max-w-xl mx-auto">
              <p className="text-3xl">🕵️‍♂️👟</p>
              <h3 className="text-xl font-extrabold text-foreground">No results found</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We couldn't find anything matching your keywords. Double-check your spelling or click one of the popular search tags above.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {matchedProducts.map((product) => {
                const isWishlisted = wishlist.includes(product.id);
                const price = product.price;
                const salePrice = product.sale_price;

                return (
                  <div key={product.id} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative border border-border group">
                    <button 
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-4 right-4 z-20 p-2.5 bg-background/60 hover:bg-background text-muted-foreground hover:text-foreground rounded-full border border-border transition-colors cursor-pointer"
                      aria-label="Toggle Wishlist"
                    >
                      <Heart className={`h-4.5 w-4.5 ${isWishlisted ? 'fill-accent text-accent' : ''}`} />
                    </button>

                    {salePrice && (
                      <span className="absolute top-4 left-4 z-20 px-2 py-0.5 bg-accent text-white text-[10px] font-bold uppercase rounded-md">
                        Sale
                      </span>
                    )}

                    <Link href={`/product/${product.slug}`} className="block aspect-square w-full bg-background/40 relative overflow-hidden">
                      <ShimmerImage
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full"
                      />
                    </Link>

                    <div className="p-4 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground mb-1">
                          <span>{product.brand_name}</span>
                          <div className="flex items-center gap-0.5 text-accent font-semibold">
                            <Star className="h-3 w-3 fill-accent" />
                            <span>{product.rating}</span>
                          </div>
                        </div>

                        <Link href={`/product/${product.slug}`}>
                          <h3 className="font-bold text-foreground text-sm hover:text-primary transition-colors line-clamp-1">
                            {product.title}
                          </h3>
                        </Link>
                      </div>

                      <div className="flex justify-between items-center mt-3 pt-2 border-t border-border">
                        <div>
                          {salePrice ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs line-through text-muted-foreground">₹{price}</span>
                              <span className="text-sm font-black text-foreground">₹{salePrice}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-black text-foreground">₹{price}</span>
                          )}
                        </div>
                        <Link
                          href={`/product/${product.slug}`}
                          className="bg-secondary hover:bg-primary text-foreground p-2.5 rounded-xl border border-border hover:border-primary transition-all"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* Empty Search State: Recommendations */
        <div className="space-y-6 pt-6 border-t border-border">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">Trending In Store</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {recommendations.map((product) => (
              <div key={product.id} className="glass-card rounded-2xl overflow-hidden flex flex-col border border-border p-4 group">
                <Link href={`/product/${product.slug}`} className="block aspect-[4/3] bg-background/20 rounded-xl overflow-hidden">
                  <ShimmerImage
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-full"
                  />
                </Link>
                <div className="mt-3 flex justify-between items-start gap-2">
                  <div>
                    <h3 className="font-bold text-foreground text-sm line-clamp-1">{product.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{product.brand_name}</p>
                  </div>
                  <span className="text-sm font-black text-primary">₹{product.sale_price || product.price}</span>
                </div>
                <Link
                  href={`/product/${product.slug}`}
                  className="w-full bg-secondary hover:bg-primary hover:text-foreground text-muted-foreground py-2 rounded-xl text-xs font-bold text-center mt-4 border border-border transition-colors"
                >
                  View Shoe
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
