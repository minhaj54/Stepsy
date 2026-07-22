'use client';

import ShimmerImage from '../components/ShimmerImage';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Heart, Zap, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { Product, Brand, Category } from '../types';
import { useCart } from '../context/CartContext';
import type { Testimonial } from '../lib/data/products';

interface HomeClientProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  bannerProduct?: Product | null;
  testimonials?: Testimonial[];
}

export default function HomeClient({ products, categories, brands, bannerProduct, testimonials = [] }: HomeClientProps) {
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
    <div className="w-full flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-background py-10 sm:py-16 lg:py-24 flex items-center">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="px-4 sm:px-6 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 text-left space-y-6">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-none text-foreground">
              STEP INTO THE <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-indigo-400 to-accent bg-clip-text text-transparent">
                RIGHT CHOICE
              </span>
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Explore performance athletic sneakers, hand-burnished luxury dress shoes, and rugged outdoor boots. Crafted for comfort, curated for the streets.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/shop"
                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl font-bold tracking-wide transition-all duration-300 transform active:scale-95 flex items-center gap-2 glow-btn text-sm cursor-pointer"
              >
                Shop Collection
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop?category=sneakers"
                className="bg-secondary hover:bg-muted text-foreground border border-border hover:border-muted-foreground/50 px-6 py-3 sm:px-8 sm:py-3.5 rounded-xl font-semibold transition-all duration-300 text-sm"
              >
                Explore Sneakers
              </Link>
            </div>

            {/* Micro badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 border-t border-border pt-6 sm:pt-8 max-w-lg">
              <div>
                <p className="text-2xl font-black text-foreground">100%</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Authentic Brands</p>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">10K+</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">Fast</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Global Shipping</p>
              </div>
            </div>
          </div>

          {/* Hero Image Container */}
          <div className="lg:col-span-5 flex justify-center relative">
            {bannerProduct ? (
              <Link
                href={`/product/${bannerProduct.slug}`}
                className="relative w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-tr from-card to-secondary/50 border border-border group p-6 flex items-center justify-center cursor-pointer"
              >
                {/* Spinning light ring */}
                <div className="absolute inset-0 border border-primary/20 rounded-3xl scale-95 group-hover:scale-100 transition-transform duration-700 pointer-events-none" />

                <img
                  src={bannerProduct.images[0]}
                  alt={bannerProduct.title}
                  className="w-full h-auto object-contain transform -rotate-12 group-hover:rotate-[-6deg] group-hover:scale-110 transition-all duration-500 drop-shadow-[0_15px_30px_rgba(99,102,241,0.4)]"
                />

                <div className="absolute bottom-4 left-4 right-4 glass-card p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">{bannerProduct.brand_name}</p>
                    <p className="text-sm font-bold text-foreground">{bannerProduct.title}</p>
                  </div>
                  <div className="text-right">
                    {bannerProduct.sale_price ? (
                      <>
                        <p className="text-xs line-through text-muted-foreground">₹{bannerProduct.price}</p>
                        <p className="text-sm font-black text-accent">₹{bannerProduct.sale_price}</p>
                      </>
                    ) : (
                      <p className="text-sm font-black text-accent">₹{bannerProduct.price}</p>
                    )}
                  </div>
                </div>

                <span className="absolute top-4 right-4 z-20 inline-flex items-center gap-1 bg-primary text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  View Details <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            ) : (
              <div className="relative w-full max-w-[400px] aspect-square rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-tr from-card to-secondary/50 border border-border group p-6 flex items-center justify-center">
                {/* Spinning light ring */}
                <div className="absolute inset-0 border border-primary/20 rounded-3xl scale-95 group-hover:scale-100 transition-transform duration-700 pointer-events-none" />

                <img
                  src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
                  alt="Featured shoe"
                  className="w-full h-auto object-contain transform -rotate-12 group-hover:rotate-[-6deg] group-hover:scale-110 transition-all duration-500 drop-shadow-[0_15px_30px_rgba(99,102,241,0.4)]"
                />

                <div className="absolute bottom-4 left-4 right-4 glass-card p-4 rounded-2xl flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-primary uppercase tracking-wider">AeroStride Drop</p>
                    <p className="text-sm font-bold text-foreground">Volt Velocity v4</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-accent">₹999</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Selling Point Icons */}
      <section className="bg-card py-8 border-y border-border">
        <div className="mx-auto max-w-2xl px-2 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center gap-1">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Express Delivery</h3>
            <p className="text-xs text-muted-foreground">Free shipping on orders over ₹1500</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Secure Payments</h3>
            <p className="text-xs text-muted-foreground">Encrypted merchant checkout</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <RefreshCw className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">30-Day Returns</h3>
            <p className="text-xs text-muted-foreground">Hassle-free size exchanges</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-foreground">Authentic Only</h3>
            <p className="text-xs text-muted-foreground">100% verified real shoes</p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="text-center mb-4 sm:mb-8 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Shop by Category</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Explore specialized shoes designed for every scenario</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative w-[45%] sm:w-[25%] lg:w-[16%] aspect-[3/4] rounded-md sm:rounded-lg overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10 transition-opacity duration-300" />
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute bottom-2 left-2 right-2 sm:bottom-2.5 sm:left-2.5 sm:right-2.5 z-20">
                <span className="text-[9px] sm:text-[9px] text-primary font-bold uppercase tracking-wider">Explore</span>
                <h3 className="text-[11px] sm:text-xs font-extrabold text-foreground tracking-tight mt-0.5 group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-secondary/40 py-12 sm:py-16 border-y border-border">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Curated Selections</span>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight mt-1">Featured Footwear</h2>
            </div>
            <Link
              href="/shop"
              className="shrink-0 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground bg-secondary hover:bg-primary border border-border hover:border-primary rounded-xl px-4 py-2 transition-all duration-300"
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
                    className="absolute top-4 right-4 z-20 p-2.5 bg-background/60 hover:bg-background text-muted-foreground hover:text-foreground rounded-full border border-border transition-colors"
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
                        <div className="flex items-center gap-0.5 text-accent font-semibold">
                          <Star className="h-3 w-3 fill-accent" />
                          <span>{product.rating}</span>
                        </div>
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
                        className="bg-secondary hover:bg-primary text-foreground p-2.5 rounded-xl border border-border hover:border-primary transition-all duration-300"
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
                className={`h-2 rounded-full transition-all duration-300 ${i === activeDot ? 'w-6 bg-primary' : 'w-2 bg-muted'}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Brand Partners Bar */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 text-center">
        <h3 className="text-xs uppercase font-bold tracking-widest text-muted-foreground mb-8">Featured Footwear Brands</h3>
        <div className="mx-auto max-w-2xl grid grid-cols-2 md:grid-cols-4 gap-2 items-center justify-items-center">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/shop?brand=${brand.slug}`}
              className="w-full max-w-[200px] p-6 bg-secondary hover:bg-muted border border-border hover:border-muted-foreground/50 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-300 group cursor-pointer"
            >
              <span className="text-3xl group-hover:scale-110 transition-transform">{brand.logo}</span>
              <span className="text-sm font-extrabold text-foreground tracking-wide">{brand.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Reviews Grid */}
      {testimonials.length > 0 && (
        <section className="bg-card py-12 sm:py-16 border-t border-border">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 space-y-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Social Proof</span>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Verified Buyer Feedback</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.id} className="glass-card p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-sm font-bold text-primary">
                        {t.initials || t.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{t.name}</h4>
                        <p className="text-[10px] text-muted-foreground">Verified Buyer</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5 text-accent">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-accent" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.review}"</p>
                  {t.product && <div className="text-xs text-primary font-semibold">Product: {t.product}</div>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
