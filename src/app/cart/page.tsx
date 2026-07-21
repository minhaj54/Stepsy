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
        <div className="h-24 w-24 bg-card border border-border rounded-full flex items-center justify-center text-4xl">
          🛒
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Your Cart is Empty</h1>
          <p className="text-muted-foreground text-sm max-w-sm">
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
      <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Your Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cart items list */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map((item) => {
            const itemPrice = item.product.sale_price || item.product.price;
            return (
              <div
                key={item.variant.id}
                className="glass-card p-4 sm:p-6 rounded-2xl flex flex-col sm:flex-row items-center sm:justify-between gap-6 border border-border relative group"
              >
                {/* Product Image */}
                <div className="h-24 w-24 bg-background/40 rounded-xl border border-border p-2 flex items-center justify-center flex-shrink-0">
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
                    <h3 className="font-bold text-foreground text-base hover:text-primary transition-colors line-clamp-1">
                      {item.product.title}
                    </h3>
                  </Link>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs text-muted-foreground font-medium pt-1">
                    <span>Size: <strong className="text-foreground">{item.variant.size}</strong></span>
                    <span className="h-3 w-[1px] bg-border" />
                    <span>Color: <strong className="text-foreground">{item.variant.color}</strong></span>
                  </div>
                </div>

                {/* Quantity Control */}
                <div className="flex items-center bg-card border border-border rounded-xl px-1">
                  <button
                    onClick={() => updateCartQuantity(item.variant.id, item.quantity - 1)}
                    className="h-9 w-7 flex items-center justify-center font-bold text-muted-foreground hover:text-foreground"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-black text-foreground">{item.quantity}</span>
                  <button
                    onClick={() => updateCartQuantity(item.variant.id, item.quantity + 1)}
                    className="h-9 w-7 flex items-center justify-center font-bold text-muted-foreground hover:text-foreground"
                  >
                    +
                  </button>
                </div>

                {/* Price and Action */}
                <div className="flex flex-col items-center sm:items-end gap-1.5 min-w-[80px]">
                  <span className="font-black text-foreground text-base">₹{itemPrice * item.quantity}</span>
                  <button
                    onClick={() => removeFromCart(item.variant.id)}
                    className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1 text-xs font-semibold cursor-pointer"
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
          <div className="glass-card p-6 rounded-2xl border border-border space-y-6">
            <h3 className="font-extrabold text-foreground text-lg tracking-tight">Order Summary</h3>

            {/* Subtotal, discount, shipping, total */}
            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-bold text-foreground">₹{cartTotal}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-500 font-medium">
                  <span className="flex items-center gap-1">
                    Discount ({appliedCoupon.code})
                  </span>
                  <span>-₹{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-primary font-bold">
                  {cartTotal >= 1500 ? 'Free' : '₹150'}
                </span>
              </div>

              <div className="border-t border-border pt-3.5 flex justify-between text-base">
                <span className="font-bold text-foreground">Total</span>
                <span className="font-black text-foreground">
                  ₹{discountedTotal + (cartTotal >= 1500 ? 0 : 150)}
                </span>
              </div>
            </div>

            {/* Coupon Promo Block */}
            <div className="border-t border-border pt-5 space-y-3">
              <label htmlFor="coupon-input" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Apply Promo Code</label>
              
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
                    className="flex-grow bg-background text-foreground placeholder:text-muted-foreground border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    className="bg-muted hover:bg-muted-foreground/20 text-foreground px-4 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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
              <p className="text-[10px] text-muted-foreground">Try coupon <strong>STEPZY20</strong> (20% off) or <strong>SHOEHEAVEN</strong> (₹300 off).</p>
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
          <div className="flex items-center justify-center gap-6 text-muted-foreground text-[10px] uppercase font-bold tracking-widest bg-background p-4 border border-border rounded-2xl">
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
