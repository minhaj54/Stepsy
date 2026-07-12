'use client';

import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, Shield, Truck, RefreshCw, Send, Check, ArrowRight } from 'lucide-react';
import { Product, ProductVariant, Review } from '../../../types';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import { mockProducts, mockReviews } from '../../../data/mockShoes';
import Link from 'next/link';

interface ProductDetailClientProps {
  product: Product;
  initialReviews: Review[];
}

export default function ProductDetailClient({ product, initialReviews }: ProductDetailClientProps) {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { user } = useAuth();
  const configured = isSupabaseConfigured();
  
  // Image gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Selection states
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color || '');
  const [quantity, setQuantity] = useState(1);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'shipping'>('description');

  // Local Review State
  const [localReviews, setLocalReviews] = useState<Review[]>(initialReviews && initialReviews.length > 0 ? initialReviews : mockReviews[product.id] || []);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const price = product.price;
  const salePrice = product.sale_price;

  // Filter variants based on color
  const colorVariants = product.variants.filter(v => v.color === selectedColor);
  
  // Get active variant
  const activeVariant = colorVariants.find(v => v.size === selectedSize) || colorVariants[0];

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size first.');
      return;
    }
    if (activeVariant) {
      addToCart(product, activeVariant, quantity);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;

    const reviewId = `rev_db_${Date.now()}`;
    const newReview: Review = {
      id: reviewId,
      user_id: user?.id || 'usr_local',
      user_name: newReviewName,
      product_id: product.id,
      rating: newReviewRating,
      review_text: newReviewText,
      created_at: new Date().toISOString()
    };

    setLocalReviews(prev => [newReview, ...prev]);

    if (configured && user) {
      const supabase = createClient();
      const { error } = await supabase
        .from('reviews')
        .insert({
          id: reviewId,
          user_id: user.id,
          product_id: product.id,
          rating: newReviewRating,
          review_text: newReviewText,
          approved: false // Require admin moderation by default
        });

      if (error) {
        console.error('Error submitting review:', error);
      }
    }

    setNewReviewName('');
    setNewReviewText('');
    setNewReviewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  // Find related products
  const relatedProducts = mockProducts
    .filter(p => p.category_id === product.category_id && p.id !== product.id)
    .slice(0, 4);

  // Quick helper to get unique colors in variants
  const uniqueColors = Array.from(new Set(product.variants.map(v => v.color)));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-grow">
      {/* Product Top Half */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Images */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-square bg-zinc-950/40 rounded-3xl overflow-hidden border border-white/[0.05] p-10 flex items-center justify-center relative group">
            <img
              src={product.images[activeImageIndex]}
              alt={product.title}
              className="max-h-[350px] w-auto object-contain transform -rotate-6 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500 drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
            />
          </div>
          
          {/* Thumbnails */}
          <div className="flex gap-4">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`flex-grow aspect-square max-w-[100px] bg-zinc-950/40 border rounded-2xl p-2 flex items-center justify-center transition-all cursor-pointer ${
                  activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <img src={img} alt="" className="max-h-[60px] w-auto object-contain" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-primary uppercase tracking-wider">{product.brand_name}</span>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full border bg-zinc-900/40 border-white/[0.06] transition-colors cursor-pointer ${
                  isWishlisted ? 'text-accent border-accent/40' : 'text-zinc-400 hover:text-white'
                }`}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-accent' : ''}`} />
              </button>
            </div>
            
            <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight">{product.title}</h1>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-0.5 text-accent font-bold text-sm">
                <Star className="h-4 w-4 fill-accent" />
                <span>{product.rating}</span>
                <span className="text-zinc-500 font-semibold ml-1">({localReviews.length} reviews)</span>
              </div>
              <span className="h-4 w-[1px] bg-white/[0.08]" />
              <span className="text-xs text-zinc-400 font-semibold">SKU: {product.sku}</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="p-4 bg-zinc-900/40 border border-white/[0.04] rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-xs text-zinc-500 font-bold block mb-0.5 uppercase tracking-wider">Price</span>
              {salePrice ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">${salePrice}</span>
                  <span className="text-sm line-through text-zinc-500">${price}</span>
                </div>
              ) : (
                <span className="text-2xl font-black text-white">${price}</span>
              )}
            </div>
            {salePrice && (
              <span className="px-2.5 py-1 bg-accent/20 border border-accent/30 text-accent rounded-lg text-xs font-bold uppercase tracking-wide">
                Save ${price - salePrice}
              </span>
            )}
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Select Color</h3>
            <div className="flex gap-3">
              {uniqueColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize(''); // Reset size on color change
                  }}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedColor === color
                      ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                      : 'bg-zinc-900 border-white/[0.06] hover:border-white/[0.12] text-zinc-300'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <h3 className="font-bold uppercase tracking-wider text-zinc-400">Select Size (US)</h3>
              <a href="#" className="text-primary hover:underline font-semibold">Size Guide</a>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {['8', '9', '10', '11', '12'].map((size) => {
                // Check stock for this size and color combination
                const variant = product.variants.find(v => v.color === selectedColor && v.size === size);
                const hasStock = variant ? variant.stock_quantity > 0 : false;
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    disabled={!hasStock}
                    onClick={() => setSelectedSize(size)}
                    className={`h-11 rounded-xl font-bold text-xs flex flex-col items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                        : hasStock
                        ? 'bg-zinc-900 border-white/[0.06] hover:border-white/[0.12] text-zinc-300'
                        : 'bg-zinc-950 border-white/[0.02] text-zinc-600 cursor-not-allowed line-through'
                    }`}
                  >
                    <span>{size}</span>
                    {hasStock && variant && (
                      <span className={`text-[8px] mt-0.5 ${isSelected ? 'text-white/60' : 'text-zinc-500'}`}>
                        {variant.stock_quantity} left
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex gap-4 pt-2">
            <div className="flex items-center bg-zinc-900 border border-white/[0.06] rounded-xl px-2">
              <button
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="h-10 w-8 flex items-center justify-center font-bold text-zinc-400 hover:text-white"
              >
                -
              </button>
              <span className="w-8 text-center text-sm font-extrabold text-white">{quantity}</span>
              <button
                onClick={() => setQuantity(prev => prev + 1)}
                className="h-10 w-8 flex items-center justify-center font-bold text-zinc-400 hover:text-white"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className={`flex-grow py-3 px-6 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                cartSuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-primary hover:bg-primary-hover text-white glow-btn'
              }`}
            >
              {cartSuccess ? (
                <>
                  <Check className="h-4 w-4" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4" /> Add to Cart
                </>
              )}
            </button>
          </div>

          {/* Delivery & Warranty */}
          <div className="border-t border-white/[0.06] pt-6 space-y-4">
            <div className="flex gap-3 items-start text-xs">
              <Truck className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Free Express Delivery</p>
                <p className="text-zinc-500 mt-0.5">Arrives in 2-4 business days.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start text-xs">
              <RefreshCw className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Easy Returns</p>
                <p className="text-zinc-500 mt-0.5">30-day exchange window with free return label.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start text-xs">
              <Shield className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-bold text-white">Authenticity Guaranteed</p>
                <p className="text-zinc-500 mt-0.5">Checked manually by our experts before shipping.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Tabs */}
      <section className="mt-20 border-t border-white/[0.06] pt-10">
        <div className="flex gap-6 border-b border-white/[0.04] pb-2 text-sm">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3.5 font-bold tracking-wide transition-all ${
              activeTab === 'description' ? 'text-white border-b-2 border-primary' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`pb-3.5 font-bold tracking-wide transition-all ${
              activeTab === 'specifications' ? 'text-white border-b-2 border-primary' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3.5 font-bold tracking-wide transition-all ${
              activeTab === 'shipping' ? 'text-white border-b-2 border-primary' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Shipping & Returns
          </button>
        </div>

        <div className="py-6 text-sm leading-relaxed text-zinc-400">
          {activeTab === 'description' && (
            <p className="max-w-3xl">{product.description}</p>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-xl bg-zinc-900/40 border border-white/[0.04] rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
              {product.specifications ? (
                Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-2 p-4">
                    <span className="font-semibold text-white">{key}</span>
                    <span>{val}</span>
                  </div>
                ))
              ) : (
                <p className="p-4 text-zinc-500 italic">No specifications available for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-2xl space-y-4">
              <p>We provide fast and secure shipping worldwide. Standard shipping is completely free for all orders above $150.</p>
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">Return Rules</h4>
              <p>Items must be returned in their original packaging, unworn, and with tags attached. Once our inspection team validates the returned item, a refund is processed back to your original payment method within 5-7 business days.</p>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Tab */}
      <section className="mt-16 border-t border-white/[0.06] pt-10">
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-8">Customer Reviews ({localReviews.length})</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Review Grid */}
          <div className="lg:col-span-2 space-y-6">
            {localReviews.length === 0 ? (
              <p className="text-zinc-500 italic">No reviews yet for this product. Be the first to leave one below!</p>
            ) : (
              localReviews.map((rev) => (
                <div key={rev.id} className="bg-zinc-900/30 border border-white/[0.04] p-6 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                        {rev.user_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{rev.user_name}</h4>
                        <p className="text-[10px] text-zinc-500">{new Date(rev.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-0.5 text-accent">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-accent' : 'text-zinc-700'}`} />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-zinc-400 italic text-sm">"{rev.review_text}"</p>
                </div>
              ))
            )}
          </div>

          {/* Review Form */}
          <div className="glass-card p-6 rounded-2xl border border-white/[0.05] space-y-4">
            <h3 className="font-bold text-white text-base">Write a Review</h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Rating</label>
                <div className="flex gap-1.5 text-accent">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewReviewRating(star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star className={`h-6 w-6 ${star <= newReviewRating ? 'fill-accent' : 'text-zinc-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="name-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Your Name</label>
                <input
                  id="name-input"
                  type="text"
                  required
                  placeholder="e.g. Minhaj Raza"
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  className="w-full bg-zinc-950 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="review-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Review Message</label>
                <textarea
                  id="review-input"
                  required
                  rows={4}
                  placeholder="What did you like or dislike about these shoes?"
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  className="w-full bg-zinc-950 text-white border border-white/[0.06] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Submit Review
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>

            {reviewSuccess && (
              <p className="text-xs text-green-500 font-medium text-center animate-pulse">
                Thank you! Your review was posted successfully.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-20 border-t border-white/[0.06] pt-10">
          <h2 className="text-2xl font-extrabold text-white tracking-tight mb-8">Related Footwear</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative border border-white/[0.04] group">
                <Link href={`/product/${p.slug}`} className="block aspect-square w-full p-6 bg-zinc-950/40 relative overflow-hidden flex items-center justify-center">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="max-h-[140px] w-auto object-contain transform -rotate-6 group-hover:rotate-0 group-hover:scale-115 transition-all duration-300 drop-shadow-[0_10px_15px_rgba(0,0,0,0.4)]"
                  />
                </Link>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-bold">{p.brand_name}</span>
                    <Link href={`/product/${p.slug}`}>
                      <h3 className="font-bold text-white text-sm hover:text-primary transition-colors line-clamp-1 mt-0.5">
                        {p.title}
                      </h3>
                    </Link>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/[0.04]">
                    <span className="text-sm font-black text-white">${p.sale_price || p.price}</span>
                    <Link href={`/product/${p.slug}`} className="text-xs font-bold text-primary flex items-center gap-0.5">
                      Details <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
