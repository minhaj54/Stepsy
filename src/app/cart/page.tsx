'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, ShoppingBag, ArrowRight, Tag, X, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    discountedTotal,
    discountAmount,
    appliedCoupon,
    applyCouponCode,
    removeCoupon
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(false);
    setCouponSuccess(false);

    if (!couponInput.trim()) return;

    const success = applyCouponCode(couponInput);
    if (success) {
      setCouponSuccess(true);
      setCouponInput('');
    } else {
      setCouponError(true);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 py-16 flex-grow flex flex-col items-center justify-center text-center space-y-6">
        <div className="h-24 w-24 bg-zinc-900 border border-white/[0.04] rounded-full flex items-center justify-center text-4xl">
          🛒
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Cart is Empty</h1>
          <p className="text-zinc-500 text-sm max-w-sm">
            Looks like you haven't added any footwear to your cart yet. Step up your style with our latest drops.
          </p>
        </div>
        <Link
          href="/shop"
          className="bg-primary hover:bg-primary-hover text-white px-8 py-3.5 rounded-xl font-bold text-sm tracking-wide transition-all flex items-center gap-2 glow-btn"
        >
          Explore Footwear Catalog
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 flex-grow space-y-6">
      <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const itemPrice = item.product.sale_price || item.product.price;
            return (
              <div
                key={item.variant.id}
                className="glass-card p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center sm:justify-between gap-6 border border-white/[0.04] relative group"
              >
                {/* Product Image */}
                <div className="h-24 w-24 bg-zinc-950/40 rounded-xl border border-white/[0.06] p-2 flex items-center justify-center flex-shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="max-h-[70px] w-auto object-contain transform -rotate-6 group-hover:rotate-0 transition-transform duration-300"
                  />
                </div>

                {/* Details */}
                <div className="flex-grow text-center sm:text-left space-y-1">
                  <span className="text-[10px] text-primary uppercase font-bold tracking-wider">
                    {item.product.brand_name}
                  </span>
                  <Link href={`/product/${item.product.slug}`}>
                    <h3 className="font-bold text-white text-base hover:text-primary transition-colors line-clamp-1">
                      {item.product.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-zinc-500 font-medium pt-1">
                    <span>Size: <strong className="text-zinc-300">{item.variant.size}</strong></span>
                    <span className="h-3 w-[1px] bg-white/[0.08]" />
                    <span>Color: <strong className="text-zinc-300">{item.variant.color}</strong></span>
                  </div>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center bg-zinc-900 border border-white/[0.06] rounded-xl px-1">
                  <button
                    onClick={() => updateCartQuantity(item.variant.id, item.quantity - 1)}
                    className="h-9 w-7 flex items-center justify-center font-bold text-zinc-500 hover:text-white"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-black text-white">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.variant.id, item.quantity + 1)}
                    className="h-9 w-7 flex items-center justify-center font-bold text-zinc-500 hover:text-white"
                  >
                    +
                  </button>
                </div>

                {/* Price and Action */}
                <div className="flex flex-col items-center sm:items-end gap-1.5 min-w-[80px]">
                  <span className="font-black text-white text-base">₹{itemPrice * item.quantity}</span>
                  <button
                    onClick={() => removeFromCart(item.variant.id)}
                    className="text-zinc-500 hover:text-destructive transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order summary card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-white/[0.05] space-y-6">
            <h3 className="font-extrabold text-white text-lg tracking-tight">Order Summary</h3>

            {/* Subtotal, discount, shipping, total */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal</span>
                <span className="font-bold text-white">₹{cartTotal}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-500 font-medium">
                  <span className="flex items-center gap-1">
                    Discount ({appliedCoupon.code})
                  </span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="text-primary font-bold">
                  {cartTotal >= 1500 ? 'Free' : '₹150'}
                </span>
              </div>

              <div className="border-t border-white/[0.06] pt-3.5 flex justify-between text-base">
                <span className="font-bold text-white">Total</span>
                <span className="font-black text-white">
                  ₹{discountedTotal + (cartTotal >= 1500 ? 0 : 150)}
                </span>
              </div>
            </div>

            {/* Coupon Promo Block */}
            <div className="border-t border-white/[0.06] pt-5 space-y-3">
              <label htmlFor="coupon-input" className="block text-xs font-bold uppercase tracking-wider text-zinc-400">Apply Promo Code</label>
              
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 text-primary px-3 py-2 rounded-xl text-xs font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5" /> {appliedCoupon.code} Applied
                  </span>
                  <button onClick={removeCoupon} className="p-0.5 hover:bg-primary/20 rounded-full cursor-pointer">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    id="coupon-input"
                    type="text"
                    placeholder="e.g. STEPZY20"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="flex-grow bg-zinc-950 text-white placeholder-zinc-600 border border-white/[0.06] rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply
                  </button>
                </form>
              )}
              {couponError && (
                <p className="text-[10px] text-destructive font-medium animate-pulse">Invalid coupon code. Try STEPZY20 or WELCOME10.</p>
              )}
              {couponSuccess && (
                <p className="text-[10px] text-green-500 font-medium animate-pulse">Coupon code applied successfully!</p>
              )}
              <p className="text-[10px] text-zinc-500">Try coupon <strong>STEPZY20</strong> (20% off) or <strong>SHOEHEAVEN</strong> (₹300 off).</p>
            </div>

            {/* Checkout CTA */}
            <Link
              href="/checkout"
              className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-95 glow-btn text-center"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Secure badging */}
          <div className="flex items-center justify-center gap-6 text-zinc-500 text-[10px] uppercase font-bold tracking-widest bg-zinc-950 p-4 border border-white/[0.04] rounded-2xl">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-primary" /> Secure Checkout
            </span>
            <span className="flex items-center gap-1">
              <Truck className="h-4 w-4 text-primary" /> Insured Delivery
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
