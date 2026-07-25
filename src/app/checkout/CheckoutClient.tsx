'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createClient, isSupabaseConfigured } from '../../lib/supabase/client';
import { ArrowLeft, CheckCircle, CreditCard, ShieldCheck, ShoppingBag, Landmark, Sparkles, MapPin, Truck, Loader2, Smartphone, XCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../../components/Toast';
import ShimmerImage from '../../components/ShimmerImage';

interface ShippingRate {
  courier_company_id: number;
  courier_name: string;
  rate: number;
  estimated_delivery_days: string;
  is_surface: boolean;
  is_air: boolean;
  cod_charges: number;
  other_charges: number;
  freight_charges: number;
  total_charges: number;
}

export default function CheckoutPage() {
  const { cart, cartTotal, discountedTotal, discountAmount, placeOrder, initiateCashfreePayment, verifyCashfreePayment } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

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
  const [paymentMethod, setPaymentMethod] = useState<'cashfree_upi' | 'card' | 'netbanking' | 'cod'>('cashfree_upi');

  // Cashfree payment state
  const [isCashfreeProcessing, setIsCashfreeProcessing] = useState(false);
  const [cashfreeOrder, setCashfreeOrder] = useState<any>(null);
  const [paymentVerifying, setPaymentVerifying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Shipping Options
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingRate | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  const configured = isSupabaseConfigured();

  // Pickup pincode state (defaults to env or Delhi)
  const [pickupPincode, setPickupPincode] = useState(
    process.env.NEXT_PUBLIC_SHIPROCKET_PICKUP_PINCODE || '110001'
  );

  // Fetch pickup pincode from the store of the first product in the cart
  useEffect(() => {
    const fetchStorePickupPincode = async () => {
      if (cart.length === 0) return;
      const storeId = cart[0].product.store_id;
      if (!storeId) return;

      try {
        const supabase = createClient();
        const { data: storeData } = await supabase
          .from('stores')
          .select('pickup_pincode')
          .eq('id', storeId)
          .single();

        if (storeData?.pickup_pincode) {
          setPickupPincode(storeData.pickup_pincode);
        }
      } catch (err) {
        console.error('Error fetching store pickup pincode:', err);
      }
    };

    if (configured) {
      fetchStorePickupPincode();
    }
  }, [cart, configured]);

  // Calculate total weight and dimensions from cart using standard shoe box sizes
  const calculatePackageDetails = () => {
    let totalWeight = 0; // in kg
    let totalValue = 0;
    
    // Standard shoe box dimensions: 33 x 20 x 12 cm
    const boxLength = 33;
    const boxBreadth = 20;
    let totalHeight = 0; // stack height

    cart.forEach((item) => {
      totalWeight += item.quantity * 0.8; // Assume average shoe weight is 0.8kg per pair
      totalHeight += item.quantity * 12; // Each box adds 12cm to the stack
      totalValue += (item.product.sale_price || item.product.price) * item.quantity;
    });

    return {
      weight: Math.max(totalWeight, 0.8), // Minimum 0.8kg
      length: boxLength,
      breadth: boxBreadth,
      height: Math.max(totalHeight, 12),
      declaredValue: totalValue || 1, // ensure it is never 0
    };
  };

  // Fetch shipping rates when pincode changes
  useEffect(() => {
    if (!pincode || pincode.length !== 6) {
      setShippingRates([]);
      setSelectedShipping(null);
      return;
    }

    const fetchShippingRates = async () => {
      setIsLoadingRates(true);
      setShippingError(null);
      setSelectedShipping(null);

      try {
        const { weight, length, breadth, height, declaredValue } = calculatePackageDetails();
        
        const response = await fetch('/api/shiprocket/shipping-rates', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pickupPincode: pickupPincode,
            deliveryPincode: pincode,
            weight,
            length,
            breadth,
            height,
            declaredValue,
            cod: paymentMethod === 'cod' ? 1 : 0,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.status !== 1) {
          throw new Error(data.error || 'Failed to fetch shipping rates');
        }

        setShippingRates(data.data);
        
        // Auto-select the cheapest option
        if (data.data.length > 0) {
          const cheapest = data.data.reduce((min: ShippingRate, rate: ShippingRate) => 
            rate.total_charges < min.total_charges ? rate : min
          );
          setSelectedShipping(cheapest);
        }
      } catch (error) {
        console.error('Error fetching shipping rates:', error);
        setShippingError(error instanceof Error ? error.message : 'Failed to fetch shipping rates');
        setShippingRates([]);
      } finally {
        setIsLoadingRates(false);
      }
    };

    // Debounce the API call
    const timeoutId = setTimeout(fetchShippingRates, 500);
    return () => clearTimeout(timeoutId);
  }, [pincode, cart, paymentMethod]);

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

  const shippingCost = selectedShipping ? Number(selectedShipping.total_charges.toFixed(2)) : 0;
  const finalTotal = Number((discountedTotal + shippingCost).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    if (!selectedShipping && shippingRates.length > 0) {
      addToast('Please select a shipping method', 'warning');
      return;
    }

    setIsProcessing(true);
    setProcessStep('Verifying stock levels...');

    const address = { fullName, phone, addressLine1, city, state, pincode };

    if (paymentMethod === 'cod') {
      // COD flow - direct order placement
      setProcessStep('Preparing your Cash on Delivery order...');
      setTimeout(async () => {
        const order = await placeOrder(address, 'cod');
        
        if (order) {
          try {
            setProcessStep('Syncing with Shiprocket...');
            await syncOrderWithShiprocket(order);
          } catch (error) {
            console.error('Failed to sync with Shiprocket:', error);
          }

          setCompletedOrder(order);
          setIsProcessing(false);
          triggerConfetti();
        } else {
          setIsProcessing(false);
          addToast('Failed to place order. Please try again.', 'error');
        }
      }, 1500);
    } else if (paymentMethod === 'cashfree_upi') {
      // Cashfree UPI flow - using payment link
      setProcessStep('Initializing secure payment gateway...');
      
      try {
        const result = await initiateCashfreePayment(address);
        
        if (result && result.paymentLink) {
          setCashfreeOrder(result);
          setIsProcessing(false);
          
          // Open Cashfree payment link in iframe modal
          openCashfreePaymentLink(result.paymentLink, result.order.id);
        } else {
          setIsProcessing(false);
          addToast('Failed to initialize payment. Please try again.', 'error');
        }
      } catch (error) {
        console.error('Cashfree payment initiation error:', error);
        setIsProcessing(false);
        addToast('Failed to initialize payment. Please try again.', 'error');
      }
    } else {
      // Card/Netbanking - simulated for now
      setTimeout(async () => {
        const order = await placeOrder(address, 'prepaid');
        
        if (order) {
          try {
            setProcessStep('Syncing with Shiprocket...');
            await syncOrderWithShiprocket(order);
          } catch (error) {
            console.error('Failed to sync with Shiprocket:', error);
          }

          setCompletedOrder(order);
          setIsProcessing(false);
          triggerConfetti();
        } else {
          setIsProcessing(false);
          addToast('Failed to place order. Please try again.', 'error');
        }
      }, 2000);
    }
  };

  // Open Cashfree payment link in a popup window
  const openCashfreePaymentLink = (paymentLink: string, orderId: string) => {
    console.log('[Checkout] Opening Cashfree payment link:', paymentLink);
    
    // Open payment link in a popup window
    const paymentWindow = window.open(paymentLink, 'cashfree-payment', 'width=500,height=700,scrollbars=yes');
    
    if (!paymentWindow) {
      addToast('Please allow popups for this site to complete payment', 'warning');
      return;
    }
    
    // Poll for payment completion
    const pollInterval = setInterval(async () => {
      try {
        // Check if window was closed manually
        if (paymentWindow.closed) {
          clearInterval(pollInterval);
          // Verify payment status when window closes
          setPaymentVerifying(true);
          const result = await verifyCashfreePayment(orderId);
          setPaymentVerifying(false);
          
          if (result.success && result.paymentStatus === 'paid') {
            const order = cashfreeOrder?.order;
            if (order) {
              try {
                await syncOrderWithShiprocket(order);
              } catch (error) {
                console.error('Failed to sync with Shiprocket:', error);
              }
              // Show payment success first
              setPaymentSuccess(true);
              triggerConfetti();
              
              // Show order success after a delay
              setTimeout(() => {
                setCompletedOrder({ ...order, payment_status: 'paid', status: 'processing' });
                setPaymentSuccess(false);
              }, 2000);
            }
          } else if (result.success && result.paymentStatus === 'unpaid') {
            addToast('Payment was not completed. Please try again.', 'error');
          }
          return;
        }
        
        // Also check via webhook - the webhook will update the order status
        // We can poll our own API to check
        const verifyResult = await verifyCashfreePayment(orderId);
        if (verifyResult.success && verifyResult.paymentStatus === 'paid') {
          clearInterval(pollInterval);
          // Close popup
          paymentWindow.close();
          
          const order = cashfreeOrder?.order;
          if (order) {
            try {
              await syncOrderWithShiprocket(order);
            } catch (error) {
              console.error('Failed to sync with Shiprocket:', error);
            }
            // Show payment success first
            setPaymentSuccess(true);
            triggerConfetti();
            
            // Show order success after a delay
            setTimeout(() => {
              setCompletedOrder({ ...order, payment_status: 'paid', status: 'processing' });
              setPaymentSuccess(false);
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Payment verification error:', error);
      }
    }, 3000);

    // Cleanup after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      if (!paymentWindow.closed) {
        paymentWindow.close();
      }
    }, 10 * 60 * 1000);
  };

  const syncOrderWithShiprocket = async (order: any) => {
    const { weight, length, breadth, height, declaredValue } = calculatePackageDetails();

    // Sanitize phone: Shiprocket requires exactly 10 digits
    const sanitizedPhone = (phone || '').replace(/\D/g, '').slice(-10);

    const shiprocketOrder = {
      order_id: order.id,
      order_date: new Date().toISOString().split('T')[0],
      pickup_location: process.env.NEXT_PUBLIC_SHIPROCKET_PICKUP_LOCATION || 'Home',
      channel_id: '',
      comment: '',
      billing_customer_name: fullName.split(' ')[0] || fullName,
      billing_last_name: fullName.split(' ').slice(1).join(' ') || '',
      billing_address: addressLine1,
      billing_address_2: '',
      billing_city: city,
      billing_pincode: String(pincode),
      billing_state: state,
      billing_country: 'India',
      billing_email: user?.email || 'customer@example.com',
      billing_phone: sanitizedPhone,
      shipping_is_billing: 1,
      order_items: order.items.map((item: any) => ({
        name: item.product_title,
        sku: String(item.variant_id || item.product_id),
        units: Number(item.quantity),
        selling_price: Number(item.price),
        discount: 0,
        tax: 0,
      })),
      payment_method: paymentMethod === 'cod' ? 'COD' : 'Prepaid',
      shipping_charges: Number(shippingCost) || 0,
      giftwrap_charges: 0,
      transaction_charges: 0,
      total_discount: Math.max(0, cartTotal - discountedTotal),
      sub_total: Number(discountedTotal),
      length: Number(length),
      breadth: Number(breadth),
      height: Number(height),
      weight: Number(weight),
    };

    const response = await fetch('/api/shiprocket/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ order: shiprocketOrder }),
    });

    const data = await response.json();
    console.log('[Checkout] Shiprocket order API response:', JSON.stringify(data));

    if (!response.ok) {
      throw new Error(data.error || 'Failed to sync order with Shiprocket');
    }

    // Store Shiprocket order ID in the order in database
    if (isSupabaseConfigured()) {
      const supabase = createClient();
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          shiprocket_order_id: data.data.order_id,
          shipment_id: data.data.shipment_id,
        })
        .eq('id', order.id);

      if (updateError) {
        console.error('Failed to update order with Shiprocket ID:', updateError);
      }
    }
    
    console.log('Order synced with Shiprocket:', data.data);
    return data.data;
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

  // Payment success view
  if (paymentSuccess && !completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-grow flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
        <div className="h-24 w-24 bg-green-500/10 border border-green-500/20 text-green-500 rounded-full flex items-center justify-center text-5xl relative">
          <CheckCircle className="h-16 w-16 text-green-500" />
          <div className="absolute inset-0 rounded-full border border-green-500 animate-ping opacity-25 pointer-events-none" />
        </div>

        <div className="space-y-3">
          <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-1">
            <Sparkles className="h-4 w-4 text-accent" /> Payment Successful
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Payment Received!</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your payment has been processed successfully. Preparing your order details...
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading order details...</span>
        </div>
      </div>
    );
  }

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
          <Sparkles className="h-4 w-4 text-accent" /> Order Confirmed
        </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">Your order has been placed!</h1>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Order Reference: <strong className="text-foreground font-bold">{completedOrder.id}</strong>. {completedOrder.payment_method === 'cod' ? 'Pay cash at the time of delivery.' : "We've sent a detailed shipping breakdown to your registered email."}
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
          {completedOrder.payment_method === 'cod' ? (
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Payment Method</span>
              <span className="text-foreground">Cash on Delivery</span>
            </div>
          ) : completedOrder.payment_method?.startsWith('cashfree') ? (
            <>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Payment Gateway</span>
                <span className="text-foreground">Cashfree Payments</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Payment Method</span>
                <span className="text-foreground">{completedOrder.payment_method === 'cashfree_upi' ? 'UPI' : completedOrder.payment_method === 'cashfree_card' ? 'Card' : 'Net Banking'}</span>
              </div>
              {completedOrder.cashfree_payment_id && (
                <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                  <span>Transaction ID</span>
                  <span className="text-foreground font-mono text-[10px]">{completedOrder.cashfree_payment_id}</span>
                </div>
              )}
            </>
          ) : (
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>Payment Method</span>
              <span className="text-foreground">Online Payment</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold text-foreground border-t border-border pt-2">
            <span>{completedOrder.payment_method === 'cod' ? 'Amount to Pay' : 'Total Debited'}</span>
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
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-grow relative space-y-6 sm:space-y-8">
      {/* Loading Overlay */}
      {(isProcessing || paymentVerifying) && (
        <div className="fixed inset-0 z-50 bg-background/90 flex flex-col items-center justify-center text-center p-4 animate-in fade-in duration-300">
          <div className="h-14 w-14 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            {paymentVerifying ? 'Verifying Payment' : 'Processing Transactions'}
          </h2>
          <p className="text-muted-foreground text-xs mt-1 animate-pulse font-medium">{processStep}</p>
          {paymentVerifying && (
            <p className="text-muted-foreground text-[10px] mt-2">Please wait while we confirm your payment with Cashfree...</p>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Link href="/cart" className="text-muted-foreground hover:text-foreground p-2 border border-border bg-card/40 rounded-xl transition-all">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Express Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Fields */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-border space-y-4">
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
            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
              {/* Cashfree UPI Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cashfree_upi')}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'cashfree_upi'
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'border-border hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Smartphone className="h-5 w-5" />
                <span className="text-xs font-bold">UPI Payment</span>
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

              {/* COD Option */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-4 border rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                  paymentMethod === 'cod'
                    ? 'border-primary bg-primary/10 text-primary shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                    : 'border-border hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Truck className="h-5 w-5" />
                <span className="text-xs font-bold">Cash on Delivery</span>
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

            {/* Shipping Options */}
            {pincode && pincode.length === 6 && (
              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Shipping Options
                </h4>
                
                {isLoadingRates && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                    <span className="text-xs text-muted-foreground">Calculating shipping rates...</span>
                  </div>
                )}

                {shippingError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                    <p className="text-xs text-red-400">{shippingError}</p>
                  </div>
                )}

                {!isLoadingRates && !shippingError && shippingRates.length > 0 && (
                  <div className="space-y-2">
                    {selectedShipping && (
                      <div className="w-full p-3 rounded-xl text-left bg-primary/10 border border-primary">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-bold text-foreground">{selectedShipping.courier_name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {selectedShipping.estimated_delivery_days} • {selectedShipping.is_air ? 'Air' : 'Surface'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-foreground">₹{Number(selectedShipping.total_charges.toFixed(2))}</p>
                            {selectedShipping.cod_charges > 0 && (
                              <p className="text-[10px] text-muted-foreground">+₹{Number(selectedShipping.cod_charges.toFixed(2))} COD</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!isLoadingRates && !shippingError && shippingRates.length === 0 && pincode && (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No shipping options available for this pincode
                  </p>
                )}
              </div>
            )}

            {/* Financial breakdown */}
            <div className="border-t border-border pt-4 text-xs space-y-2">
              <div className="flex justify-between text-muted-foreground font-semibold">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground font-semibold">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-muted-foreground font-semibold">
                  <span>Discount</span>
                  <span className="text-green-400">-₹{discountAmount}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-foreground border-t border-border pt-3">
                <span>Grand Total</span>
                <span className="text-primary font-black">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              type="submit"
              disabled={isProcessing || (pincode.length === 6 && !selectedShipping && shippingRates.length > 0)}
              className="w-full bg-primary hover:bg-primary-hover text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer glow-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : paymentMethod === 'cod' ? 'Place Order (COD)' : paymentMethod === 'cashfree_upi' ? 'Pay with UPI' : 'Pay & Place Order'}
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
