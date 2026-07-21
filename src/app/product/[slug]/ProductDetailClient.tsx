'use client';

import React, { useState } from 'react';
import { Star, Heart, ShoppingBag, Shield, Truck, RefreshCw, Send, Check, ArrowRight, Share2, MessageCircle, Zap, X, ZoomIn, Ruler, Store as StoreIcon } from 'lucide-react';
import { Product, ProductVariant, Review, Store } from '../../../types';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import Link from 'next/link';
import ShimmerImage from '../../../components/ShimmerImage';

interface ProductDetailClientProps {
  product: Product;
  store: Store | null;
  initialReviews: Review[];
  relatedProducts: Product[];
}

// Standard shoe size chart (US to EU/UK/CM)
const SIZE_CHART = [
  { us: '6', uk: '5.5', eu: '38.5', cm: '24.1' },
  { us: '6.5', uk: '6', eu: '39', cm: '24.6' },
  { us: '7', uk: '6.5', eu: '40', cm: '25.1' },
  { us: '7.5', uk: '7', eu: '40.5', cm: '25.6' },
  { us: '8', uk: '7.5', eu: '41', cm: '26.0' },
  { us: '8.5', uk: '8', eu: '42', cm: '26.5' },
  { us: '9', uk: '8.5', eu: '42.5', cm: '27.0' },
  { us: '9.5', uk: '9', eu: '43', cm: '27.5' },
  { us: '10', uk: '9.5', eu: '44', cm: '28.0' },
  { us: '10.5', uk: '10', eu: '44.5', cm: '28.5' },
  { us: '11', uk: '10.5', eu: '45', cm: '29.0' },
  { us: '11.5', uk: '11', eu: '45.5', cm: '29.5' },
  { us: '12', uk: '11.5', eu: '46', cm: '30.0' },
];

export default function ProductDetailClient({ product, store, initialReviews, relatedProducts }: ProductDetailClientProps) {
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

  // Modal states
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'shipping'>('description');

  // Local Review State
  const [localReviews, setLocalReviews] = useState<Review[]>(initialReviews);
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

  const handleBuyNow = () => {
    if (!selectedSize) {
      alert('Please select a size first.');
      return;
    }
    if (activeVariant) {
      addToCart(product, activeVariant, quantity);
      // Redirect to cart page
      window.location.href = '/cart';
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${product.title} | ${product.brand_name}`,
      text: `Check out ${product.title} by ${product.brand_name} - ₹${salePrice || price}`,
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert('Product link copied to clipboard!');
      }
    } catch (err) {
      console.error('Share failed:', err);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `Hi! I'm interested in ${product.title} by ${product.brand_name}.\n\nPrice: ₹${salePrice || price}\n\nProduct Link: ${typeof window !== 'undefined' ? window.location.href : ''}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
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

  // Related products are provided by the server (getRelatedProducts)
  const uniqueColors = Array.from(new Set(product.variants.map(v => v.color)));

  // Format description with line breaks
  const formatDescription = (desc: string) => {
    return desc.split('\n').map((line, i) => (
      <p key={i} className={i > 0 ? 'mt-3' : ''}>{line}</p>
    ));
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 flex-grow">
      {/* Product Top Half */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* Left: Images */}
        <div className="lg:col-span-5 flex gap-3 sm:gap-4">
          {/* Thumbnails - vertical on desktop, horizontal on mobile */}
          {product.images.length > 1 && (
            <div className="hidden lg:flex flex-col gap-2 sm:gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`aspect-square w-14 sm:w-16 bg-background/40 border rounded-2xl p-1.5 sm:p-2 flex items-center justify-center transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/50'
                  }`}
                >
                  <ShimmerImage src={img} alt="" className="max-h-[30px] sm:max-h-[40px] w-auto" />
                </button>
              ))}
            </div>
          )}
          
          {/* Main Image */}
          <div className="flex-1">
            <div
              className="aspect-[3/4] sm:aspect-[4/5] bg-background/40 rounded-2xl sm:rounded-3xl overflow-hidden border border-border relative group cursor-zoom-in"
              onClick={() => setShowImageZoom(true)}
            >
              <ShimmerImage
                src={product.images[activeImageIndex]}
                alt={product.title}
                className="w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/20">
                <div className="bg-white/10 backdrop-blur-sm rounded-full p-2 sm:p-3">
                  <ZoomIn className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
            </div>
            
            {/* Mobile thumbnails */}
            {product.images.length > 1 && (
              <div className="flex lg:hidden gap-2 sm:gap-3 overflow-x-auto pb-2 mt-3 sm:mt-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`flex-shrink-0 aspect-square w-16 sm:w-20 bg-background/40 border rounded-xl sm:rounded-2xl p-1.5 sm:p-2 flex items-center justify-center transition-all cursor-pointer ${
                      activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <ShimmerImage src={img} alt="" className="max-h-[40px] sm:max-h-[50px] w-auto" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          {/* Brand & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-sm font-bold text-primary uppercase tracking-wider">{product.brand_name}</span>
            <div className="flex gap-2">
              <button
                onClick={handleShare}
                className="p-2.5 rounded-full border bg-card border-border transition-colors cursor-pointer text-muted-foreground hover:text-foreground hover:border-muted-foreground/50"
                aria-label="Share"
                title="Share"
              >
                <Share2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleWhatsApp}
                className="p-2.5 rounded-full border bg-card border-border transition-colors cursor-pointer text-muted-foreground hover:text-green-500 hover:border-green-500/30"
                aria-label="WhatsApp"
                title="Chat on WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </button>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-2.5 rounded-full border bg-card border-border transition-colors cursor-pointer ${
                  isWishlisted ? 'text-accent border-accent/40' : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label="Toggle Wishlist"
              >
                <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-accent' : ''}`} />
              </button>
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">{product.title}</h1>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <div className="flex items-center gap-0.5 text-accent font-bold text-sm">
              <Star className="h-4 w-4 fill-accent" />
              <span>{product.rating}</span>
              <span className="text-muted-foreground font-semibold ml-1">({localReviews.length} reviews)</span>
            </div>
            <span className="text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground font-semibold">SKU: {product.sku}</span>
          </div>

          {/* Pricing */}
          <div className="p-5 bg-card border border-border rounded-2xl">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground font-bold block mb-1 uppercase tracking-wider">Price</span>
                {salePrice ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-foreground">₹{salePrice}</span>
                    <span className="text-sm line-through text-muted-foreground">₹{price}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-black text-foreground">₹{price}</span>
                )}
              </div>
              {salePrice && (
                <span className="px-2.5 py-1 bg-accent/20 border border-accent/30 text-accent rounded-lg text-xs font-bold uppercase tracking-wide">
                  Save ₹{price - salePrice}
                </span>
              )}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Color</h3>
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setSelectedSize('');
                  }}
                  className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedColor === color
                      ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                      : 'bg-card border-border hover:border-muted-foreground/50 text-muted-foreground'
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
              <h3 className="font-bold uppercase tracking-wider text-muted-foreground">Select Size (US)</h3>
              <button 
                onClick={() => setShowSizeChart(true)}
                className="text-primary hover:underline font-semibold flex items-center gap-1"
              >
                <Ruler className="h-3.5 w-3.5" />
                Size Guide
              </button>
            </div>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {['8', '9', '10', '11', '12'].map((size) => {
                const variant = product.variants.find(v => v.color === selectedColor && v.size === size);
                const hasStock = variant ? variant.stock_quantity > 0 : false;
                const isSelected = selectedSize === size;

                return (
                  <button
                    key={size}
                    disabled={!hasStock}
                    onClick={() => setSelectedSize(size)}
                    className={`h-12 rounded-xl font-bold text-sm flex flex-col items-center justify-center border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                        : hasStock
                        ? 'bg-card border-border hover:border-muted-foreground/50 text-muted-foreground'
                        : 'bg-background border-border text-muted-foreground cursor-not-allowed line-through'
                    }`}
                  >
                    <span>{size}</span>
                    {hasStock && variant && (
                      <span className={`text-[10px] mt-0.5 ${isSelected ? 'text-foreground/60' : 'text-muted-foreground'}`}>
                        {variant.stock_quantity} left
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Quantity</h3>
            <div className="flex items-center bg-card border border-border rounded-xl px-3 w-fit">
              <button
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="h-10 w-8 flex items-center justify-center font-bold text-muted-foreground hover:text-foreground"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-extrabold text-foreground">{quantity}</span>
              <button
                onClick={() => setQuantity(prev => prev + 1)}
                className="h-10 w-8 flex items-center justify-center font-bold text-muted-foreground hover:text-foreground"
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <button
              onClick={handleAddToCart}
              className={`w-full py-4 px-6 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 ${
                cartSuccess
                  ? 'bg-green-600 text-white'
                  : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25'
              }`}
            >
              {cartSuccess ? (
                <>
                  <Check className="h-5 w-5" /> Added to Cart
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" /> Add to Cart
                </>
              )}
            </button>
            
            <button
              onClick={handleBuyNow}
              className="w-full py-4 px-6 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 bg-accent hover:bg-orange-600 text-white shadow-lg shadow-accent/25"
            >
              <Zap className="h-5 w-5" /> Buy Now
            </button>
          </div>

          {/* Delivery & Warranty */}
          <div className="border-t border-border pt-6 space-y-4">
            <div className="flex gap-3 items-start text-xs">
              <Truck className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">Free Express Delivery</p>
                <p className="text-muted-foreground mt-0.5">Arrives in 2-4 business days.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start text-xs">
              <RefreshCw className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">Easy Returns</p>
                <p className="text-muted-foreground mt-0.5">30-day exchange window with free return label.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start text-xs">
              <Shield className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">Authenticity Guaranteed</p>
                <p className="text-muted-foreground mt-0.5">Checked manually by our experts before shipping.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Store badge — like a YouTube channel, below images / above description */}
      {store && (
        <div className="mt-8 flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <Link
            href={`/store/${store.slug}`}
            className="flex-shrink-0 h-14 w-14 rounded-full overflow-hidden border border-border bg-background flex items-center justify-center"
            aria-label={store.name}
          >
            {store.logo_url ? (
              <ShimmerImage src={store.logo_url} alt={store.name} className="w-full h-full" />
            ) : (
              <StoreIcon className="h-6 w-6 text-muted-foreground" />
            )}
          </Link>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Sold by</p>
            <Link
              href={`/store/${store.slug}`}
              className="text-base font-bold text-foreground hover:text-primary transition-colors truncate block"
            >
              {store.name}
            </Link>
            {store.description && (
              <p className="text-xs text-muted-foreground truncate mt-0.5">{store.description}</p>
            )}
          </div>
          <Link
            href={`/store/${store.slug}`}
            className="flex-shrink-0 hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-secondary hover:bg-primary hover:text-foreground border border-border hover:border-primary text-sm font-semibold text-muted-foreground transition-all"
          >
            Visit Store
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Details Tabs */}
      <section className="mt-12 border-t border-border pt-8">
        <div className="flex gap-6 border-b border-border pb-2 text-sm">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3.5 font-bold tracking-wide transition-all ${
              activeTab === 'description' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab('specifications')}
            className={`pb-3.5 font-bold tracking-wide transition-all ${
              activeTab === 'specifications' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`pb-3.5 font-bold tracking-wide transition-all ${
              activeTab === 'shipping' ? 'text-foreground border-b-2 border-primary' : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            Shipping & Returns
          </button>
        </div>

        <div className="py-6 text-sm leading-relaxed text-muted-foreground">
          {activeTab === 'description' && (
            <div className="max-w-3xl prose prose-invert prose-sm">
              {formatDescription(product.description)}
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="max-w-xl bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
              {product.specifications ? (
                Object.entries(product.specifications).map(([key, val]) => (
                  <div key={key} className="grid grid-cols-2 p-4">
                    <span className="font-semibold text-white">{key}</span>
                    <span>{val}</span>
                  </div>
                ))
              ) : (
                <p className="p-4 text-muted-foreground italic">No specifications available for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-2xl space-y-4">
              <p>We provide fast and secure shipping worldwide. Standard shipping is completely free for all orders above ₹1500.</p>
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider">Return Rules</h4>
              <p>Items must be returned in their original packaging, unworn, and with tags attached. Once our inspection team validates the returned item, a refund is processed back to your original payment method within 5-7 business days.</p>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Tab */}
      <section className="mt-16 border-t border-border pt-10">
        <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-8">Customer Reviews ({localReviews.length})</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Review Grid */}
          <div className="lg:col-span-2 space-y-6">
            {localReviews.length === 0 ? (
              <p className="text-muted-foreground italic">No reviews yet for this product. Be the first to leave one below!</p>
            ) : (
              localReviews.map((rev) => (
                <div key={rev.id} className="bg-card border border-border p-6 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                        {rev.user_name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{rev.user_name}</h4>
                        <p className="text-[10px] text-muted-foreground">{new Date(rev.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-0.5 text-accent">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-3 w-3 ${i < rev.rating ? 'fill-accent' : 'text-zinc-700'}`} />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground italic text-sm">"{rev.review_text}"</p>
                </div>
              ))
            )}
          </div>

          {/* Review Form */}
          <div className="glass-card p-6 rounded-2xl border border-border space-y-4">
            <h3 className="font-bold text-foreground text-base">Write a Review</h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Rating</label>
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
                <label htmlFor="name-input" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Your Name</label>
                <input
                  id="name-input"
                  type="text"
                  required
                  placeholder="e.g. Minhaj Raza"
                  value={newReviewName}
                  onChange={(e) => setNewReviewName(e.target.value)}
                  className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="review-input" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Review Message</label>
                <textarea
                  id="review-input"
                  required
                  rows={4}
                  placeholder="What did you like or dislike about these shoes?"
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
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
        <section className="mt-20 border-t border-border pt-10">
          <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-8">Related Footwear</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <div key={p.id} className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative border border-border group">
                <Link href={`/product/${p.slug}`} className="block aspect-square w-full bg-background/40 relative overflow-hidden">
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="p-4 flex-grow flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">{p.brand_name}</span>
                    <Link href={`/product/${p.slug}`}>
                      <h3 className="font-bold text-foreground text-sm hover:text-primary transition-colors line-clamp-1 mt-0.5">
                        {p.title}
                      </h3>
                    </Link>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-border">
                    <span className="text-sm font-black text-foreground">₹{p.sale_price || p.price}</span>
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

      {/* Image Zoom Modal */}
      {showImageZoom && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setShowImageZoom(false)}
        >
          <button
            onClick={() => setShowImageZoom(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <ShimmerImage
            src={product.images[activeImageIndex]}
            alt={product.title}
            className="max-w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          />
          {/* Thumbnail navigation */}
          {product.images.length > 1 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveImageIndex(idx);
                  }}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden transition-all ${
                    activeImageIndex === idx ? 'border-primary scale-110' : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                >
                  <ShimmerImage src={img} alt="" className="w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Size Chart Modal */}
      {showSizeChart && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowSizeChart(false)}
        >
          <div 
            className="bg-card border border-border rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Ruler className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Size Chart</h3>
              </div>
              <button
                onClick={() => setShowSizeChart(false)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <p className="text-xs text-muted-foreground mb-4">All measurements are in centimeters (CM). Please refer to this chart when selecting your size.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">US</th>
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">UK</th>
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">EU</th>
                      <th className="text-left py-3 px-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">CM</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_CHART.map((row) => (
                      <tr key={row.us} className="border-b border-border hover:bg-secondary transition-colors">
                        <td className="py-3 px-4 font-bold text-foreground">{row.us}</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.uk}</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.eu}</td>
                        <td className="py-3 px-4 text-muted-foreground">{row.cm}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-xl">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-foreground">Tip:</strong> If you're between sizes, we recommend going up half a size for a more comfortable fit.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
