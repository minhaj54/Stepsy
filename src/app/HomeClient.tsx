'use client';

import ShimmerImage from '../components/ShimmerImage';
import FashionBanner from '../components/FashionBanner';
import ModelPoster from '../components/ModelPoster';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Star, Heart, Zap, Truck, ShieldCheck, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Product, Brand, Category } from '../types';
import { useCart } from '../context/CartContext';
import type { Testimonial } from '../lib/data/products';

interface HomeClientProps {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  testimonials?: Testimonial[];
}

export default function HomeClient({ products, categories, brands, testimonials = [] }: HomeClientProps) {
  const { wishlist, toggleWishlist } = useCart();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeDot, setActiveDot] = useState(0);
  const [currentReview, setCurrentReview] = useState(0);

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
      {/* Fashion Banner Carousel */}
      <FashionBanner />

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
            <h3 className="text-sm font-bold text-foreground">7-Day Returns</h3>
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
      <section className="px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
        <div className="text-center mb-6 sm:mb-10 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Shop by Category</h2>
          <p className="text-muted-foreground text-xs sm:text-sm">Explore specialized shoes designed for every scenario</p>
        </div>

        <div className="flex overflow-x-auto gap-3 sm:gap-5 pb-6 pl-4 sm:pl-0 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/shop?category=${cat.slug}`}
              className="group relative shrink-0 flex flex-col items-center cursor-pointer snap-start"
            >
              <div className="relative w-[100px] h-[100px] sm:w-[130px] sm:h-[130px] md:w-[150px] md:h-[150px] rounded-full overflow-hidden border-2 sm:border-3 border-border hover:border-primary/70 hover:shadow-[0_0_15px_rgba(99,102,241,0.25)] transition-all duration-300">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <h3 className="text-[10px] sm:text-xs font-extrabold text-foreground tracking-tight mt-1.5 group-hover:text-primary transition-colors leading-tight text-center">
                {cat.name}
              </h3>
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

      {/* Model Poster Section */}
      <ModelPoster />

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

      {/* Reviews Carousel/Grid */}
      {testimonials.length > 0 && (
        <section className="bg-card py-12 sm:py-16 border-t border-border">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 space-y-2">
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Social Proof</span>
              <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Verified Buyer Feedback</h2>
            </div>

            {/* Mobile Carousel */}
            <div className="md:hidden relative">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentReview * 100}%)` }}
                >
                  {testimonials.map((t) => (
                    <div key={t.id} className="w-full flex-shrink-0 px-1">
                      <div className="glass-card p-6 rounded-2xl space-y-4">
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
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows */}
              {testimonials.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentReview((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 p-2 bg-background/80 hover:bg-background text-foreground rounded-full border border-border shadow-lg transition-all z-10"
                    aria-label="Previous review"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentReview((prev) => (prev + 1) % testimonials.length)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 p-2 bg-background/80 hover:bg-background text-foreground rounded-full border border-border shadow-lg transition-all z-10"
                    aria-label="Next review"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Dots */}
              {testimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentReview(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${i === currentReview ? 'w-6 bg-primary' : 'w-2 bg-muted'}`}
                      aria-label={`Go to review ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Grid */}
            <div className="hidden md:grid grid-cols-3 gap-6">
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
