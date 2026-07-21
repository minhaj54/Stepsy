'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createClient, isSupabaseConfigured } from '../../lib/supabase/client';
import { ArrowLeft, CheckCircle, CreditCard, ShieldCheck, ShoppingBag, Landmark, Sparkles, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';
import ShimmerImage from '../../components/ShimmerImage';

export default function CheckoutPage() {
  const { cart, cartTotal, discountedTotal, placeOrder } = useCart();
  const { user } = useAuth();

  // Form State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'razorpay' | 'netbanking'>('razorpay');

  const configured = isSupabaseConfigured();

  // Fetch saved addresses
  useEffect(() => {
    if (!user) return;

    const fetchAddresses = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setSavedAddresses(data);
        // Auto-select default address if available
        const defaultAddr = data.find((addr: any) => addr.is_default);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setFullName(defaultAddr.full_name);
          setPhone(defaultAddr.phone);
          setAddressLine1(defaultAddr.address_line1);
          setCity(defaultAddr.city);
          setState(defaultAddr.state);
          setPincode(defaultAddr.pincode);
        }
      }
    };

    fetchAddresses();
  }, [user]);

  // Checkout Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  const finalTotal = discountedTotal + (cartTotal >= 150 ? 0 : 15);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);
    setProcessStep('Verifying stock levels...');

    // Simulate Payment Processing
    setTimeout(() => {
      setProcessStep('Initializing Razorpay secure portal...');
      setTimeout(() => {
        setProcessStep('Awaiting gateway payment validation...');
        setTimeout(async () => {
          const address = { fullName, phone, addressLine1, city, state, pincode };
          const order = await placeOrder(address);
          
          if (order) {
            setCompletedOrder(order);
            setIsProcessing(false);
            
            // Premium Confetti explosion!
            triggerConfetti();
          } else {
            setIsProcessing(false);
            alert('Failed to place order. Please try again.');
          }
        }, 1500);
      }, 1500);
    }, 1200);
  };

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#f97316', '#a855f7']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#f97316', '#a855f7']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  };

  // Success view
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-grow flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
        <div className="h-24 w-24 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full flex items-center justify-center text-5xl relative">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <div className="absolute inset-0 rounded-full border border-green-500 animate-ping opacity-25 pointer-events-none" />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="h-4 w-4 text-accent" /> Payment Succeeded
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Your order has been placed!</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Order Reference: <strong className="text-foreground font-bold">{completedOrder.id}</strong>. We've sent a detailed shipping breakdown to your registered email.
          </p>
        </div>

        {/* Short Order Info */}
        <div className="w-full glass-card p-6 rounded-3xl border border-border text-left space-y-4 max-w-lg">
          <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2">Shipping Destination</h3>
          <div className="text-xs space-y-1 text-muted-foreground">
            <p className="font-bold text-foreground">{completedOrder.shipping_address.fullName}</p>
            <p>{completedOrder.shipping_address.addressLine1}</p>
            <p>{completedOrder.shipping_address.city}, {completedOrder.shipping_address.state} {completedOrder.shipping_address.pincode}</p>
            <p>Phone: {completedOrder.shipping_address.phone}</p>
          </div>

          <h3 className="font-extrabold text-foreground text-sm uppercase tracking-wider border-b border-border pb-2 pt-2">Payment Details</h3>
          <div className="flex justify-between text-xs font-semibold text-muted-foreground">
            <span>Gateway Merchant</span>
            <span className="text-foreground">Razorpay Secure UPI</span>
          </div>
          <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-2">
            <span>Total Debited</span>
            <span className="text-primary font-black">₹{completedOrder.total_amount}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <Link
            href="/account?tab=orders"
            className="bg-zinc-900 border border-border hover:border-muted-foreground/50 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Track Order
          </Link>
          <Link
            href="/shop"
            className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all glow-btn"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  // Fallback empty view
  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 flex-grow flex flex-col justify-center">
        <h1 className="text-2xl font-black text-foreground">Checkout Unavailable</h1>
        <p className="text-muted-foreground text-sm">Your cart is empty. Please add items before visiting the checkout terminal.</p>
        <Link href="/shop" className="bg-primary text-white py-3 rounded-xl font-bold text-sm block">Shop Catalog</Link>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 flex-grow relative space-y-8">
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-background/90 flex flex-col items-center justify-center text-center p-4 animate-in fade-in duration-300">
          <div className="h-14 w-14 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-bold text-foreground tracking-tight">Processing Transactions</h2>
          <p className="text-muted-foreground text-xs mt-1 animate-pulse font-medium">{processStep}</p>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Link href="/cart" className="text-muted-foreground hover:text-foreground p-2 border border-border bg-card/40 rounded-xl transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Express Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Fields */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-border space-y-4">
            <h2 className="font-extrabold text-foreground text-base tracking-tight mb-2 uppercase text-primary">1. Shipping Address</h2>
            
            {/* Saved Addresses Selector */}
            {savedAddresses.length > 0 && (
              <div className="space-y-2 mb-4">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Saved Addresses</label>
                <div className="grid grid-cols-1 gap-3">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setFullName(addr.full_name);
                        setPhone(addr.phone);
                        setAddressLine1(addr.address_line1);
                        setCity(addr.city);
                        setState(addr.state);
                        setPincode(addr.pincode);
                      }}
                      className={`p-4 rounded-xl text-left transition-all cursor-pointer ${
                        selectedAddressId === addr.id
                          ? 'bg-primary/20 border border-primary'
                          : 'bg-background/40 border border-border hover:bg-card'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-bold text-foreground text-xs flex items-center gap-2">
                            {addr.full_name}
                            {addr.is_default && (
                              <span className="px-2 py-0.5 bg-primary/30 text-primary text-[8px] rounded-full font-extrabold uppercase">
                                Default
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">{addr.phone}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            {addr.address_line1}, {addr.city}, {addr.state} {addr.pincode}
                          </p>
                        </div>
                        {selectedAddressId === addr.id && <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />}
                      </div>
                    </button>
                  ))}
                </div>
                <div className="text-center text-xs text-muted-foreground my-2">
                  — OR ADD NEW ADDRESS —
                </div>
              </div>
            )}
            
            {/* Address Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="name-input" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <input
                    id="name-input"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="phone-input" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                  <input
                    id="phone-input"
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="address-input" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Address Line 1</label>
                <input
                  id="address-input"
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label htmlFor="city-input" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">City</label>
                  <input
                    id="city-input"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="state-input" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">State</label>
                  <input
                    id="state-input"
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="pincode-input" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pincode</label>
                  <input
                    id="pincode-input"
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full bg-background text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-border space-y-4">
            <h2 className="font-extrabold text-foreground text-base tracking-tight mb-2 uppercase text-primary">2. Payment Method</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Razorpay Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'razorpay'
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'border-border hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Landmark className="h-5 w-5" />
                <span className="text-xs font-bold">Razorpay UPI</span>
              </button>

              {/* Card Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'border-border hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs font-bold">Credit/Debit Card</span>
              </button>

              {/* Net Banking */}
              <button
                type="button"
                onClick={() => setPaymentMethod('netbanking')}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'netbanking'
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'border-border hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
                <span className="text-xs font-bold">Net Banking</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 rounded-2xl border border-border space-y-6">
            <h3 className="font-extrabold text-foreground text-base tracking-tight mb-2 uppercase border-b border-border pb-2">Cart Summary</h3>

            {/* Item list */}
            <div className="max-h-[220px] overflow-y-auto pr-2 divide-y divide-border space-y-3.5">
              {cart.map((item) => (
                <div key={item.variant.id} className="flex gap-4 items-center justify-between text-xs pt-3 first:pt-0">
                  <div className="flex gap-3 items-center">
                    <ShimmerImage src={item.product.images[0]} alt="" className="h-9 w-9" />
                    <div>
                      <p className="font-bold text-foreground line-clamp-1 max-w-[120px]">{item.product.title}</p>
                      <p className="text-muted-foreground mt-0.5">Size {item.variant.size} • Qty {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-foreground">₹{(item.product.sale_price || item.product.price) * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Financial breakdown */}
            <div className="border-t border-border pt-4 text-xs space-y-2">
              <div className="flex justify-between text-muted-foreground font-semibold">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground font-semibold">
                <span>Shipping</span>
                <span>{cartTotal >= 1500 ? 'Free' : '₹150'}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-foreground border-t border-border pt-3">
                <span>Grand Total</span>
                <span className="text-primary font-black">₹{finalTotal}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer glow-btn"
            >
              Pay & Place Order
            </button>
          </div>

          <div className="text-center bg-background p-4 border border-border rounded-2xl text-[10px] text-muted-foreground flex items-center justify-center gap-1.5 uppercase font-bold tracking-wider">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" /> Encrypted with 256-bit SSL Protection
          </div>
        </div>
      </form>
    </div>
  );
}
