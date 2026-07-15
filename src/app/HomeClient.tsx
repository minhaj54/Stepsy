 'use client';
 
 import ShimmerImage from '../components/ShimmerImage';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Heart, Sparkles, Zap, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { Product, Brand, Category } from '../types';
import { useCart } from '../context/CartContext';

interface HomeClientProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
}

export default function HomeClient({ products, categories, brands }: HomeClientProps) {
  const { wishlist, toggleWishlist } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);

  const handleCarouselScroll = () => {
    const el = scrollRef.current;
    if (!el || featuredProducts.length === 0) return;
    const step = el.scrollWidth / featuredProducts.length;
    setActiveDot(Math.round(el.scrollLeft / step));
  };

  // Filter products for sections
  const featuredProducts = products.filter(p => p.featured).slice(0, 4);
  const newArrivals = products.filter(p => p.newArrival).slice(0, 4);
  const bestSellers = products.filter(p => p.bestSeller).slice(0, 4);

  return (
    <div className="w-full flex flex-col pb-12">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-zinc-950 py-20 lg:py-32 flex items-center">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 text-left space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/[0.04] border border-white/[0.08] rounded-full text-xs font-semibold text-primary uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-accent animate-pulse" />
              Next-Gen Footwear Hub
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-white">
              STEP INTO THE <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-indigo-400 to-accent bg-clip-text text-transparent">
                FUTURE OF STYLE
              </span>
            </h1>

            <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
              Explore performance athletic sneakers, hand-burnished luxury dress shoes, and rugged outdoor boots. Crafted for comfort, curated for the streets.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link 
                href="/shop"
                className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 transform active:scale-95 flex items-center gap-2 glow-btn text-sm cursor-pointer"
              >
                Shop Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link 
                href="/shop?category=sneakers"
                className="bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/[0.08] hover:border-white/[0.15] px-8 py-3.5 rounded-xl font-semibold transition-all duration-300 text-sm"
              >
                Explore Sneakers
              </Link>
            </div>

            {/* Micro badges */}
            <div className="grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-8 max-w-lg">
              <div>
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Authentic Brands</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">10K+</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl font-black text-white">Fast</p>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Global Shipping</p>
              </div>
            </div>
          </div>

          {/* Hero Image Container */}
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-tr from-zinc-900 to-white/5 border border-white/[0.06] group p-6 flex items-center justify-center">
              {/* Spinning light ring */}
              <div className="absolute inset-0 border border-primary/20 rounded-3xl scale-95 group-hover:scale-100 transition-transform duration-700 pointer-events-none" />
              
              <img
                src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
                alt="AeroStride Volt Runner"
                className="w-full h-auto object-contain transform -rotate-12 group-hover:rotate-[-6deg] group-hover:scale-110 transition-all duration-500 drop-shadow-[0_15px_30px_rgba(99,102,241,0.4)]"
              />
              
              <div className="absolute bottom-4 left-4 right-4 glass-card p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-primary uppercase tracking-wider">AeroStride Drop</p>
                  <p className="text-sm font-bold text-white">Volt Velocity v4</p>
                </div>
                <div className="text-right">
                  <p className="text-xs line-through text-zinc-500">₹1299</p>
                  <p className="text-sm font-black text-accent">₹999</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Selling Point Icons */}
      <section className="bg-zinc-900 py-6 border-y border-white/[0.04]">
        <div className="mx-auto max-w-2xl px-2 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Express Delivery</h3>
            <p className="text-xs text-zinc-500">Free shipping on orders over ₹1500</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Secure Payments</h3>
            <p className="text-xs text-zinc-500">Encrypted merchant checkout</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white">30-Day Returns</h3>
            <p className="text-xs text-zinc-500">Hassle-free size exchanges</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-white">Authentic Only</h3>
            <p className="text-xs text-zinc-500">100% verified real shoes</p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-4 sm:mb-8 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Shop by Category</h2>
          <p className="text-zinc-500 text-xs sm:text-sm">Explore specialized shoes designed for every scenario</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative w-[40%] sm:w-[25%] lg:w-[16%] aspect-[3/4] rounded-md sm:rounded-lg overflow-hidden border border-white/[0.06] hover:border-primary/40 transition-all duration-300 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent z-10 transition-opacity duration-300" />
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 right-2 sm:bottom-2.5 sm:left-2.5 sm:right-2.5 z-20">
                <span className="text-[8px] sm:text-[9px] text-primary font-bold uppercase tracking-wider">Explore</span>
                <h3 className="text-[10px] sm:text-xs font-extrabold text-white tracking-tight mt-0.5 group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-zinc-900/40 py-20 border-y border-white/[0.04]">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Curated Selections</span>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mt-1">Featured Footwear</h2>
            </div>
            <Link
              href="/shop"
              className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-white/[0.05] hover:bg-primary border border-white/[0.06] hover:border-primary rounded-xl px-4 py-2 transition-all duration-300"
            >
              View All
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div ref={scrollRef} onScroll={handleCarouselScroll} className="flex sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 overflow-x-auto sm:overflow-visible snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
            {featuredProducts.map((product) => {
              const isWishlisted = wishlist.includes(product.id);
              const price = product.price;
              const salePrice = product.sale_price;

              return (
                <div key={product.id} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative group w-full sm:w-auto shrink-0 snap-center">
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
                  <Link href={`/product/${product.slug}`} className="block aspect-square w-full bg-zinc-950/40 relative overflow-hidden">
                    <ShimmerImage
                      src={product.images[0]}
                      alt={product.title}
                      className="w-full h-full"
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
                            <span className="text-sm line-through text-zinc-500">₹{price}</span>
                            <span className="text-base font-black text-white">₹{salePrice}</span>
                          </div>
                        ) : (
                          <span className="text-base font-black text-white">₹{price}</span>
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

          {/* Carousel dots (mobile only) */}
          <div className="flex justify-center gap-2 mt-6 sm:hidden">
            {featuredProducts.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => {
                  const el = scrollRef.current;
                  if (el) el.scrollTo({ left: (el.scrollWidth / featuredProducts.length) * i, behavior: 'smooth' });
                }}
                className={`h-2 rounded-full transition-all duration-300 ${i === activeDot ? 'w-6 bg-primary' : 'w-2 bg-white/20'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Brand Partners Bar */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h3 className="text-xs uppercase font-bold tracking-widest text-zinc-500 mb-8">Featured Footwear Brands</h3>
        <div className="mx-auto max-w-2xl grid grid-cols-2 md:grid-cols-4 gap-2 items-center justify-items-center">
          {brands.map((brand) => (
            <Link 
              key={brand.id}
              href={`/shop?brand=${brand.slug}`}
              className="w-full max-w-[200px] p-6 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group cursor-pointer"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{brand.logo}</span>
              <span className="text-sm font-extrabold text-white tracking-wide">{brand.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Reviews Grid */}
      <section className="bg-zinc-900 py-20 border-t border-white/[0.04]">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-2">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Social Proof</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight">Verified Buyer Feedback</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">MV</div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Marcus Vance</h4>
                    <p className="text-[10px] text-zinc-500">Verified Buyer</p>
                  </div>
                </div>
                <div className="flex gap-0.5 text-accent">
                  <Star className="h-3.5 w-3.5 fill-accent" />
                  <Star className="h-3.5 w-3.5 fill-accent" />
                  <Star className="h-3.5 w-3.5 fill-accent" />
                  <Star className="h-3.5 w-3.5 fill-accent" />
                  <Star className="h-3.5 w-3.5 fill-accent" />
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed italic">
                "Absolutely phenomenal! The NitroFoam midsole gives so much energy return. Shaved a full minute off my 10k time on my first run in these. Highly recommend."
              </p>
              <div className="text-xs text-primary font-semibold">Product: Volt Velocity Runner v4</div>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">DJ</div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Derrick Jenkins</h4>
                    <p className="text-[10px] text-zinc-500">Verified Buyer</p>
                  </div>
                </div>
                <div className="flex gap-0.5 text-accent">
                  <Star className="h-3.5 w-3.5 fill-accent" />
                  <Star className="h-3.5 w-3.5 fill-accent" />
                  <Star className="h-3.5 w-3.5 fill-accent" />
                  <Star className="h-3.5 w-3.5 fill-accent" />
                  <Star className="h-3.5 w-3.5 fill-accent" />
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed italic">
                "Bought these for office casual days. Leather is incredibly supple, zero break-in period. Got several compliments on the matte black look."
              </p>
              <div className="text-xs text-primary font-semibold">Product: Midnight Stealth Leather</div>
            </div>

            <div className="glass-card p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">KH</div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Kevin Hart</h4>
                    <p className="text-[10px] text-zinc-500">Verified Buyer</p>
                  </div>
                </div>
                <div className="flex gap-0.5 text-accent">
                  <Star className="h-3.5 w-3.5 fill-accent" />
                  <Star className="h-3.5 w-3.5 fill-accent" />
                  <Star className="h-3.5 w-3.5 fill-accent" />
                  <Star className="h-3.5 w-3.5 fill-accent" />
                  <Star className="h-3.5 w-3.5 fill-accent" />
                </div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed italic">
                "True classic retro sneaker! The quality of the leather is surprisingly good for the price. The ankle collar support is super comfy."
              </p>
              <div className="text-xs text-primary font-semibold">Product: Retro Crimson Court High-Top</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
