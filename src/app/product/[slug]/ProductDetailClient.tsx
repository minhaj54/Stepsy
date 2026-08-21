'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Star, Heart, ShoppingBag, Shield, Truck, RefreshCw, Send, Check, ArrowRight, Share2, MessageCircle, Zap, X, Ruler, Store as StoreIcon, Package, Clock, FileText, ShieldCheck, Phone } from 'lucide-react';
import { Product, ProductVariant, Review, Store } from '../../../types';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { createClient, isSupabaseConfigured } from '../../../lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useToast } from '../../../components/Toast';
import ShimmerImage from '../../../components/ShimmerImage';
import VerifiedBadge from '../../../components/VerifiedBadge';

interface ProductDetailClientProps {
  product: Product;
  store: Store | null;
  initialReviews: Review[];
  relatedProducts: Product[];
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
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

// Maps common colorway names to a swatch hex (falls back to indigo for unknown names).
const COLOR_HEX: Record<string, string> = {
  black: '#111827',
  white: '#f4f4f5',
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  navy: '#1e3a8a',
  brown: '#92400e',
  grey: '#6b7280',
  gray: '#6b7280',
  beige: '#d6c3a3',
  pink: '#ec4899',
  yellow: '#eab308',
  orange: '#ea580c',
};

const hexForColor = (name: string): string =>
  COLOR_HEX[name.toLowerCase()] || '#6366f1';

export default function ProductDetailClient({ product, store, initialReviews, relatedProducts }: ProductDetailClientProps) {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const { user } = useAuth();
  const configured = isSupabaseConfigured();
  
  // Image gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  
  // Related products carousel state
  const relatedScrollRef = useRef<HTMLDivElement>(null);
  const [relatedActiveDot, setRelatedActiveDot] = useState(0);
  
  // Selection states
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState(
    (product.colors && product.colors.length > 0 ? product.colors[0] : '') ||
    product.variants[0]?.color ||
    ''
  );
  const [quantity, setQuantity] = useState(1);
  const [cartSuccess, setCartSuccess] = useState(false);

  // Modal states
  const [showSizeChart, setShowSizeChart] = useState(false);

  // Hover zoom state (desktop only)
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Tab State
  const [activeTab, setActiveTab] = useState<'description' | 'specifications' | 'shipping'>('description');

  // Local Review State
  const [localReviews, setLocalReviews] = useState<Review[]>(initialReviews);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewName, setNewReviewName] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Hardcoded rating for all products
  const displayRating = 4.8;
  const reviewCount = localReviews.length;

  const isWishlisted = wishlist.includes(product.id);
  const price = product.price;
  const salePrice = product.sale_price;

  // Unique sizes available for this product, sorted numerically
  const availableSizes = Array.from(
    new Set(product.variants.map(v => v.size).filter(Boolean))
  ).sort((a, b) => parseFloat(a) - parseFloat(b));

  // Resolve a variant for a given size: prefer one matching the selected color,
  // otherwise fall back to any variant with that size (so selection always works
  // even when variant.color differs from the product-level colorway name).
  const variantForSize = (size: string): ProductVariant | undefined =>
    product.variants.find(v => v.size === size && v.color === selectedColor) ||
    product.variants.find(v => v.size === size);

  // Filter variants based on color (fallback to all variants when none match)
  const colorVariants = product.variants.filter(v => v.color === selectedColor);
  const matchingVariants = colorVariants.length > 0 ? colorVariants : product.variants;

  // Get active variant
  const activeVariant =
    (selectedSize ? variantForSize(selectedSize) : matchingVariants[0]) || matchingVariants[0] || null;

  const handleAddToCart = () => {
    if (!selectedSize) {
      addToast('Please select a size first.', 'warning');
      return;
    }
    if (activeVariant) {
      addToCart(product, activeVariant, quantity, selectedColor);
      setCartSuccess(true);
      setTimeout(() => setCartSuccess(false), 3000);
      addToast('Added to cart!', 'success', {
        label: 'View Cart',
        onClick: () => router.push('/cart'),
      });
    }
  };

  const router = useRouter();
  const { addToast } = useToast();

  const handleBuyNow = () => {
    if (!selectedSize) {
      addToast('Please select a size first.', 'warning');
      return;
    }
    if (activeVariant) {
      // Store buy-now item in sessionStorage so checkout uses only this item
      sessionStorage.setItem('zarwinto_buy_now', JSON.stringify({
        product,
        variant: activeVariant,
        quantity,
        color: selectedColor,
      }));
      // Redirect directly to checkout page
      router.push('/checkout');
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
        addToast('Product link copied to clipboard!', 'success');
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

    // Generate a proper UUID for the review
    const reviewId = crypto.randomUUID ? crypto.randomUUID() : `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newReview: Review = {
      id: reviewId,
      user_id: user?.id || 'usr_local',
      user_name: newReviewName,
      product_id: product.id,
      rating: newReviewRating,
      review_text: newReviewText,
      created_at: new Date().toISOString(),
      approved: true
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
          approved: true
        });

      if (error) {
        console.error('Error submitting review:', error);
        // Revert local state on error
        setLocalReviews(prev => prev.filter(r => r.id !== reviewId));
        addToast('Failed to submit review. Please try again.', 'error');
      } else {
        addToast('Review submitted successfully!', 'success');
        // Recalculate product rating after successful review
        // Note: In a real app, you might want to call an API to update the product rating
      }
    } else if (!user) {
      // Revert local state if not logged in
      setLocalReviews(prev => prev.filter(r => r.id !== reviewId));
      addToast('Please log in to submit a review.', 'error');
    }

    setNewReviewName('');
    setNewReviewText('');
    setNewReviewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 4000);
  };

  // Available colors: prefer the seller-curated list, fall back to variant colors
  const uniqueColors = (product.colors && product.colors.length > 0)
    ? product.colors
    : Array.from(new Set(product.variants.map(v => v.color)));

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
         <div className="lg:col-span-5 flex lg:flex-row flex-col gap-3 sm:gap-4">
           {/* Thumbnails - vertical on desktop, hidden on mobile */}
           {product.images.length > 1 && (
             <div className="hidden lg:flex flex-col gap-2 sm:gap-3">
               {product.images.map((img, idx) => (
                 <button
                   key={idx}
                   onClick={() => setActiveImageIndex(idx)}
                   className={`aspect-square w-14 sm:w-16 bg-background/40 border rounded-2xl p-1.5 sm:p-2 flex items-center justify-center transition-all cursor-pointer ${
                     activeImageIndex === idx ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-muted-foreground/50'
                   }}`}
                 >
                   <ShimmerImage src={img} alt="" className="max-h-[30px] sm:max-h-[40px] w-auto" />
                 </button>
               ))}
             </div>
           )}
           
             {/* Main Image with Hover Zoom (desktop only) */}
             <div className="w-full lg:flex-1">
                <div
                className="aspect-[3/4] sm:aspect-[4/5] bg-background/40 rounded-2xl sm:rounded-3xl overflow-hidden border border-border relative"
                {...(isDesktop ? {
                  onMouseEnter: () => setIsHovering(true),
                  onMouseLeave: () => setIsHovering(false),
                  onMouseMove: (e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setMousePos({ x, y });
                  },
                } : {})}
              >
                <div
                  className="w-full h-full transition-transform duration-200 ease-out"
                  style={{
                    transform: isDesktop && isHovering ? 'scale(1.8)' : 'scale(1)',
                    transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  }}
                >
                  <ShimmerImage
                    src={product.images[activeImageIndex]}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {isDesktop && !isHovering && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-xs font-medium flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><path d="M11 8v6"/><path d="M8 11h6"/></svg>
                      Hover to zoom
                    </div>
                  </div>
                )}
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
                {[1, 2, 3, 4, 5].map((star) => {
                  const fillRatio = displayRating - (star - 1);
                  if (fillRatio >= 1) {
                    return <Star key={star} className="h-4 w-4 fill-accent" />;
                  } else if (fillRatio > 0) {
                    return (
                      <div key={star} className="relative h-4 w-4">
                        <Star className="h-4 w-4 text-zinc-700" />
                        <div className="absolute inset-0 overflow-hidden">
                          <Star className="h-4 w-4 fill-accent" />
                        </div>
                      </div>
                    );
                  } else {
                    return <Star key={star} className="h-4 w-4 text-zinc-700" />;
                  }
                })}
                <span className="text-foreground font-semibold ml-1">{displayRating}</span>
                <span className="text-muted-foreground font-semibold ml-1">({reviewCount} reviews)</span>
              </div>
             <span className="text-muted-foreground">|</span>
             <span className="text-xs text-muted-foreground font-semibold">SKU: {product.sku}</span>
           </div>

          {/* Stock Status */}
          {selectedSize && activeVariant && activeVariant.stock_quantity === 0 && (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-red-500">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              Out of Stock
            </span>
          )}
          {selectedSize && activeVariant && activeVariant.stock_quantity > 0 && activeVariant.stock_quantity <= 5 && (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-500">
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
              Only {activeVariant.stock_quantity} left
            </span>
          )}
          {!selectedSize && (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground">
              <span className="w-2 h-2 bg-muted-foreground rounded-full" />
              Select a size to check availability
            </span>
          )}

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
                  Save {Math.round((1 - salePrice / price) * 100)}%
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
                  className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedColor === color
                      ? 'bg-primary text-white border-primary shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                      : 'bg-card border-border hover:border-muted-foreground/50 text-muted-foreground'
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10"
                    style={{ backgroundColor: hexForColor(color) }}
                  />
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
               {availableSizes.map((size) => {
                 const variant = variantForSize(size);
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
                         : 'bg-background border-border text-muted-foreground cursor-not-allowed opacity-50'
                     }`}
                   >
                     <span>{size}</span>
                     {!hasStock && variant && (
                       <span className="text-[10px] mt-0.5 text-red-400 font-semibold">
                         Out of Stock
                       </span>
                     )}
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
               className={`w-full py-4 px-6 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-all duration-300 ${
                 cartSuccess
                   ? 'bg-green-600 text-white'
                   : 'bg-primary hover:bg-primary-hover text-white shadow-lg shadow-primary/25 cursor-pointer'
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
               className="w-full py-4 px-6 rounded-xl font-bold text-sm text-center flex items-center justify-center gap-2 transition-all duration-300 bg-accent hover:bg-orange-600 text-white shadow-lg shadow-accent/25 cursor-pointer"
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
                <p className="text-muted-foreground mt-0.5">Arrives in 2-4 business days via our trusted delivery partners.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start text-xs">
              <RefreshCw className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">Easy Returns & Exchanges</p>
                <p className="text-muted-foreground mt-0.5">7-day exchange window with free return label. Refunds processed within 5-7 business days after inspection.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start text-xs">
              <Shield className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">Authenticity Guaranteed</p>
                <p className="text-muted-foreground mt-0.5">Every pair is checked manually by our experts before shipping. 100% genuine products or your money back.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start text-xs">
              <Phone className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-bold text-foreground">Delivery Partner</p>
                <p className="text-muted-foreground mt-0.5">Shipped via Shiprocket with real-time tracking. You'll receive SMS and email updates at every step.</p>
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
              <VerifiedBadge className="ml-1" />
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
      <section className="mt-8 sm:mt-12 border-t border-border pt-6 sm:pt-8">
        <div className="flex gap-3 sm:gap-6 border-b border-border pb-2 text-xs sm:text-sm overflow-x-auto">
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
                  <div key={key} className="grid grid-cols-1 sm:grid-cols-2 p-3 sm:p-4">
                    <span className="font-semibold text-foreground text-xs sm:text-sm">{key}</span>
                    <span className="text-xs sm:text-sm">{val}</span>
                  </div>
                ))
              ) : (
                <p className="p-4 text-muted-foreground italic text-sm">No specifications available for this product.</p>
              )}
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="max-w-2xl space-y-6">
              {/* Shipping Info */}
              <div className="space-y-3">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  Shipping & Delivery
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We provide fast and secure shipping across India. Standard shipping is completely free for all orders above ₹1500.
                  Orders are processed within 1-2 business days and delivered within 2-4 business days via our trusted logistics partner, Shiprocket.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  You will receive real-time tracking updates via SMS and email at every step — from dispatch to delivery.
                  Our delivery partners are carefully selected for reliability and careful handling of footwear.
                </p>
              </div>

              {/* Return & Exchange Policy */}
              <div className="space-y-3">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-primary" />
                  Returns & Exchanges
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Every Zarwinto order comes with a hassle-free 7-day return or exchange window.
                  If your shoes don't fit perfectly or aren't what you expected, we make it easy to return or exchange them.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Items must be unworn, in original condition, and returned with the box and tags.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Footwear can be tried on indoors on a clean surface to check the fit.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Sale and final-clearance items are eligible for exchange only, not refund.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Custom-made and personalized footwear cannot be returned unless defective.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                    <span>Defective or wrong items are replaced free of charge, no questions asked.</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Once our inspection team validates the returned item, a refund is processed back to your original payment method within 5-7 business days.
                  Exchanges ship out as soon as we receive your return.
                </p>
              </div>

              {/* Policy Links */}
              <div className="space-y-3">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Our Policies
                </h4>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/returns"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Returns & Exchanges Policy
                  </Link>
                  <Link
                    href="/terms"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Terms of Service
                  </Link>
                  <Link
                    href="/privacy"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Tab */}
      <section className="mt-10 sm:mt-16 border-t border-border pt-8 sm:pt-10">
        <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mb-6 sm:mb-8">Customer Reviews ({reviewCount})</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10 items-start">
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
        <section className="mt-10 sm:mt-20 border-t border-border pt-6 sm:pt-10">
          <h2 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight mb-4 sm:mb-8">Related Footwear</h2>
          
          {/* Mobile Carousel */}
          <div className="lg:hidden">
            <div
              ref={relatedScrollRef}
              onScroll={() => {
                const el = relatedScrollRef.current;
                if (!el) return;
                const step = el.scrollWidth / relatedProducts.length;
                setRelatedActiveDot(Math.round(el.scrollLeft / step));
              }}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden -mx-4 px-4"
            >
              {relatedProducts.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-[70%] snap-center">
                  <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full relative border border-border group">
                    <Link href={`/product/${p.slug}`} className="block aspect-square w-full bg-background/40 relative overflow-hidden">
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="p-3 flex-grow flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{p.brand_name}</span>
                        <Link href={`/product/${p.slug}`}>
                          <h3 className="font-bold text-foreground text-sm hover:text-primary transition-colors line-clamp-1 mt-0.5">
                            {p.title}
                          </h3>
                        </Link>
                      </div>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-border">
                        <span className="text-sm font-black text-foreground">₹{p.sale_price || p.price}</span>
                        <Link href={`/product/${p.slug}`} className="text-xs font-bold text-primary flex items-center gap-0.5">
                          Details <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Carousel Dots */}
            <div className="flex justify-center gap-1.5 mt-4">
              {relatedProducts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const el = relatedScrollRef.current;
                    if (el) el.scrollTo({ left: (el.scrollWidth / relatedProducts.length) * i, behavior: 'smooth' });
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 ${i === relatedActiveDot ? 'w-4 bg-primary' : 'w-1.5 bg-muted'}`}
                />
              ))}
            </div>
          </div>
          
          {/* Desktop Grid */}
          <div className="hidden lg:grid grid-cols-4 gap-6">
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

      {/* Image Zoom Modal removed — hover zoom is now enabled on the main image above */}

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
