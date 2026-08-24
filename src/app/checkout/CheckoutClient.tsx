'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createClient, isSupabaseConfigured } from '../../lib/supabase/client';
import { ArrowLeft, CheckCircle, CreditCard, ShieldCheck, ShoppingBag, MapPin, Truck, Loader2, Smartphone, XCircle, Plus, Edit3, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useToast } from '../../components/Toast';
import ShimmerImage from '../../components/ShimmerImage';
import { getPaymentMethodDisplay } from '../../lib/cashfree';

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
  const { cart, cartTotal, discountedTotal, discountAmount, placeOrder, redirectToCashfreePayment, clearCart } = useCart();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Buy Now support: read from sessionStorage if present
  const [buyNowItem, setBuyNowItem] = useState<any>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('zarwinto_buy_now');
    if (stored) {
      try {
        setBuyNowItem(JSON.parse(stored));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

   // Use buyNow item as cart if present, otherwise use regular cart
   const effectiveCart = React.useMemo(() => {
      if (buyNowItem) {
        return [{ product: buyNowItem.product, variant: buyNowItem.variant, quantity: buyNowItem.quantity, color: buyNowItem.color }];
      }
     return cart;
   }, [buyNowItem, cart]);
   const effectiveTotal = React.useMemo(() => {
     return effectiveCart.reduce((total: number, item: any) => {
       const price = item.product.sale_price || item.product.price;
       return total + price * item.quantity;
     }, 0);
   }, [effectiveCart]);
    const effectiveDiscountedTotal = effectiveTotal;
    const effectiveDiscountAmount = 0;

    // MRP = sum of original (non-sale) prices; discount = MRP - selling (sale) price
    const mrpTotal = React.useMemo(() => {
      return effectiveCart.reduce((total: number, item: any) => {
        const mrp = item.product.price || item.product.sale_price || 0;
        return total + mrp * item.quantity;
      }, 0);
    }, [effectiveCart]);
    const discountTotal = Math.max(0, mrpTotal - effectiveTotal);
    const discountPercent = mrpTotal > 0 ? (discountTotal / mrpTotal) * 100 : 0;

  // Clean up buyNow from sessionStorage after order is placed
  const clearBuyNow = () => {
    sessionStorage.removeItem('zarwinto_buy_now');
    setBuyNowItem(null);
  };

  // Address State
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  // Saved addresses state
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);

  // Payment Options
  const [paymentMethod, setPaymentMethod] = useState<'cashfree_upi' | 'card' | 'netbanking' | 'cod'>('cashfree_upi');

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
       if (effectiveCart.length === 0) return;
       const storeId = effectiveCart[0].product.store_id;
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
   }, [effectiveCart, configured]);

   // Package dimensions for footwear - optimized for minimal shipping cost
   // Per Shiprocket API: chargeable weight = max(actual weight, volumetric weight)
   // Volumetric weight = (L × B × H) / 5000
   // We keep volumetric weight below actual weight so actual weight is always the chargeable weight
   const FREE_SHIPPING_THRESHOLD = 999; // Free shipping for orders above ₹999

   // Fallback dimensions when product doesn't have shipping data
   const DEFAULT_LENGTH = 20;
   const DEFAULT_BREADTH = 12;
   const DEFAULT_HEIGHT = 8;
   const DEFAULT_WEIGHT = 0.5;

   const calculatePackageDetails = () => {
     let totalValue = 0;
     let totalQuantity = 0;
     let maxLength = DEFAULT_LENGTH;
     let maxBreadth = DEFAULT_BREADTH;
     let maxHeight = DEFAULT_HEIGHT;
     let totalWeight = 0;

     effectiveCart.forEach((item: any) => {
       const product = item.product;
       const qty = item.quantity || 1;

       totalValue += (product.sale_price || product.price) * qty;
       totalQuantity += qty;

       // Use per-product dimensions if available, otherwise fall back to defaults
       const pLength = product.length_cm ?? DEFAULT_LENGTH;
       const pBreadth = product.breadth_cm ?? DEFAULT_BREADTH;
       const pHeight = product.height_cm ?? DEFAULT_HEIGHT;
       const pWeight = product.weight_kg ?? DEFAULT_WEIGHT;

       // Track the largest dimensions across all products (for mixed carts)
       maxLength = Math.max(maxLength, pLength);
       maxBreadth = Math.max(maxBreadth, pBreadth);
       maxHeight = Math.max(maxHeight, pHeight);

       // Sum weights across all items
       totalWeight += pWeight * qty;
     });

     // Scale dimensions based on quantity (stack along length for efficiency)
     // Cap at Shiprocket max dimensions: 60cm length, 45cm breadth, 45cm height
     const MAX_LENGTH = 60;
     const MAX_BREADTH = 45;
     const MAX_HEIGHT = 45;

     const length = Math.min(maxLength * totalQuantity, MAX_LENGTH);
     const breadth = Math.min(maxBreadth, MAX_BREADTH);
     const height = Math.min(maxHeight, MAX_HEIGHT);

     // Ensure minimum weight
     const weight = Math.max(totalWeight, 0.1);

     return {
       weight,
       length,
       breadth,
       height,
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
       // Skip fetching rates when free shipping threshold is met
       if (effectiveDiscountedTotal >= FREE_SHIPPING_THRESHOLD) {
         setShippingRates([]);
         setSelectedShipping(null);
         setIsLoadingRates(false);
         return;
       }

       setIsLoadingRates(true);
       setShippingError(null);
       setSelectedShipping(null);

        // Shiprocket shipping-rates lookup DISABLED.
        // The implementation below is preserved as a comment for re-enablement.
        /*
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
        */

        // No-op while Shiprocket is disabled: keep no shipping options selected (shipping is free).
        setShippingRates([]);
        setIsLoadingRates(false);
     };

     // Debounce the API call
     const timeoutId = setTimeout(fetchShippingRates, 500);
     return () => clearTimeout(timeoutId);
   }, [pincode, effectiveCart, paymentMethod]);

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
        } else if (data.length > 0) {
          // Select first address if no default
          setSelectedAddressId(data[0].id);
          setFullName(data[0].full_name);
          setPhone(data[0].phone);
          setAddressLine1(data[0].address_line1);
          setCity(data[0].city);
          setState(data[0].state);
          setPincode(data[0].pincode);
        }
      }
    };

    fetchAddresses();
  }, [user]);

  // Address modal for adding/editing
  const [addrForm, setAddrForm] = useState({ fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' });

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setAddrForm({ fullName: '', phone: '', addressLine1: '', city: '', state: '', pincode: '' });
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (addr: any) => {
    setEditingAddress(addr);
    setAddrForm({
      fullName: addr.full_name || '',
      phone: addr.phone || '',
      addressLine1: addr.address_line1 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
    });
    setIsAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const supabase = createClient();
    const addressData = {
      user_id: user.id,
      full_name: addrForm.fullName,
      phone: addrForm.phone,
      address_line1: addrForm.addressLine1,
      city: addrForm.city,
      state: addrForm.state,
      pincode: addrForm.pincode,
      is_default: savedAddresses.length === 0,
    };

    if (editingAddress) {
      const { error } = await supabase
        .from('addresses')
        .update(addressData)
        .eq('id', editingAddress.id);

      if (error) {
        addToast('Failed to update address', 'error');
        return;
      }

      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (data) {
        setSavedAddresses(data);
        setSelectedAddressId(editingAddress.id);
        setFullName(addrForm.fullName);
        setPhone(addrForm.phone);
        setAddressLine1(addrForm.addressLine1);
        setCity(addrForm.city);
        setState(addrForm.state);
        setPincode(addrForm.pincode);
      }
      addToast('Address updated successfully', 'success');
    } else {
      const { data, error } = await supabase
        .from('addresses')
        .insert(addressData)
        .select()
        .single();

      if (error || !data) {
        addToast('Failed to save address', 'error');
        return;
      }

      const { data: newData } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (newData) {
        setSavedAddresses(newData);
        setSelectedAddressId(data.id);
        setFullName(addrForm.fullName);
        setPhone(addrForm.phone);
        setAddressLine1(addrForm.addressLine1);
        setCity(addrForm.city);
        setState(addrForm.state);
        setPincode(addrForm.pincode);
      }
      addToast('Address added successfully', 'success');
    }

    setIsAddressModalOpen(false);
    setEditingAddress(null);
  };

  const handleDeleteAddress = async (addrId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    if (!user) return;

    const supabase = createClient();
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addrId);

    if (error) {
      addToast('Failed to delete address', 'error');
      return;
    }

    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (data) {
      setSavedAddresses(data);
      if (selectedAddressId === addrId) {
        setSelectedAddressId(data.length > 0 ? data[0].id : null);
        if (data.length > 0) {
          setFullName(data[0].full_name);
          setPhone(data[0].phone);
          setAddressLine1(data[0].address_line1);
          setCity(data[0].city);
          setState(data[0].state);
          setPincode(data[0].pincode);
        } else {
          setFullName('');
          setPhone('');
          setAddressLine1('');
          setCity('');
          setState('');
          setPincode('');
        }
      }
    }
    addToast('Address deleted', 'success');
  };

  // Checkout Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);

   // Free shipping for orders above the threshold
   const isFreeShipping = effectiveDiscountedTotal >= FREE_SHIPPING_THRESHOLD;
   const shippingCost = isFreeShipping ? 0 : (selectedShipping ? Number(selectedShipping.total_charges.toFixed(2)) : 0);
   const finalTotal = Number((effectiveDiscountedTotal + shippingCost).toFixed(2));

   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (effectiveCart.length === 0) return;

     if (!isFreeShipping && !selectedShipping && shippingRates.length > 0) {
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
          const order = await placeOrder(address, 'cod', effectiveCart);
          
          if (order) {
            try {
              setProcessStep('Syncing with Shiprocket...');
              // await syncOrderWithShiprocket(order); // Shiprocket sync disabled
            } catch (error) {
              console.error('Failed to sync with Shiprocket:', error);
            }

             setCompletedOrder(order);
             clearCart();
             setIsProcessing(false);
             triggerConfetti();
             clearBuyNow();
          } else {
            setIsProcessing(false);
            addToast('Failed to place order. Please try again.', 'error');
          }
        }, 1500);
      } else if (paymentMethod === 'cashfree_upi') {
        // Cashfree UPI flow - redirect to payment processing page
        setProcessStep('Initializing secure payment gateway...');
        
        const success = await redirectToCashfreePayment(address, effectiveCart, finalTotal);
        
        if (!success) {
          setIsProcessing(false);
          addToast('Failed to initialize payment. Please try again.', 'error');
        }
        // On success, page will redirect - no need to set isProcessing to false
      } else {
        // Card/Netbanking - simulated for now
        setTimeout(async () => {
          const order = await placeOrder(address, 'prepaid', effectiveCart);
          
          if (order) {
            try {
              setProcessStep('Syncing with Shiprocket...');
              // await syncOrderWithShiprocket(order); // Shiprocket sync disabled
            } catch (error) {
              console.error('Failed to sync with Shiprocket:', error);
            }

             setCompletedOrder(order);
             clearCart();
             setIsProcessing(false);
             triggerConfetti();
             clearBuyNow();
          } else {
            setIsProcessing(false);
            addToast('Failed to place order. Please try again.', 'error');
          }
        }, 2000);
      }
   };

   // ===== Shiprocket order sync DISABLED (commented out) =====
  // The implementation is preserved below as a comment so it can be re-enabled later.
  /*
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
       total_discount: Math.max(0, effectiveTotal - effectiveDiscountedTotal),
       sub_total: Number(effectiveDiscountedTotal),
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
  */
  // No-op replacement so existing call sites don't break while Shiprocket is disabled.
  const syncOrderWithShiprocket = async () => null;

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

   // Fallback empty view (skip when an order was just completed, so the
   // confirmation box below is shown even though the cart is now cleared)
   if (effectiveCart.length === 0 && !completedOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4 flex-grow flex flex-col justify-center">
        <h1 className="text-2xl font-black text-foreground">Checkout Unavailable</h1>
        <p className="text-muted-foreground text-sm">Your cart is empty. Please add items before visiting the checkout terminal.</p>
        <Link href="/shop" className="bg-primary text-white py-3 rounded-xl font-bold text-sm block">Shop Catalog</Link>
      </div>
    );
  }

    // Order placed successfully (COD / prepaid) — show confirmation instead of the form.
    if (completedOrder) {
      return (
        <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-8 flex-grow">
          <div className="relative">
            <div className="h-24 w-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto relative">
              <CheckCircle className="h-14 w-14 text-green-500" />
              <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping opacity-25" />
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-1">
              <Sparkles className="h-4 w-4 text-accent" /> Order Confirmed
            </span>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Order Placed Successfully!</h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              {completedOrder.payment_method === 'cod'
                ? 'Your Cash on Delivery order has been placed. Please keep the amount ready.'
                : 'Your order has been placed and we’ll start processing it soon.'}
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border border-border space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Details</span>
              <span className="text-xs font-mono text-muted-foreground/60">{completedOrder.id}</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-bold">{getPaymentMethodDisplay(completedOrder.payment_method)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Date</span>
                <span className="text-foreground">{new Date(completedOrder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>

              <div className="border-t border-border pt-3 space-y-2">
                {completedOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center gap-3 text-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <ShimmerImage src={item.product_image} alt="" className="h-9 w-9" />
                      <span className="font-medium text-foreground line-clamp-1">{item.product_title}</span>
                    </div>
                    <span className="text-muted-foreground text-xs flex-shrink-0">×{item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3 flex justify-between text-base font-bold">
                <span className="text-foreground">Total Amount</span>
                <span className="text-primary">₹{Number(completedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/account?tab=orders" className="bg-zinc-900 border border-border hover:border-muted-foreground/50 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors">
              View My Orders
            </Link>
            <Link href="/shop" className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all glow-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      );
    }

    return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-grow relative space-y-6 sm:space-y-8">
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
        <h1 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">Express Checkout</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left: Fields */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          <div className="glass-card p-4 sm:p-6 rounded-2xl border border-border space-y-4">
            <h2 className="font-extrabold text-foreground text-base tracking-tight mb-2 uppercase text-primary">1. Shipping Address</h2>
            
            {/* Saved Addresses Selector */}
            {savedAddresses.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Select Delivery Address</label>
                  <button
                    type="button"
                    onClick={openAddAddressModal}
                    className="text-[10px] font-bold text-primary hover:text-primary-hover flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="h-3 w-3" /> Add New
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddressId(addr.id);
                        setFullName(addr.full_name);
                        setPhone(addr.phone);
                        setAddressLine1(addr.address_line1);
                        setCity(addr.city);
                        setState(addr.state);
                        setPincode(addr.pincode);
                      }}
                      className={`p-4 rounded-xl text-left transition-all cursor-pointer relative group ${
                        selectedAddressId === addr.id
                          ? 'bg-primary/10 border border-primary'
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
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditAddressModal(addr);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-primary bg-secondary/50 hover:bg-primary/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            title="Edit address"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          {selectedAddressId === addr.id && <CheckCircle className="h-4 w-4 text-primary flex-shrink-0" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <MapPin className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground mb-3">No saved addresses found</p>
                <button
                  type="button"
                  onClick={openAddAddressModal}
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Your First Address
                </button>
              </div>
            )}
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
               {effectiveCart.map((item: any) => (
                <div key={item.variant.id} className="flex gap-4 items-center justify-between text-xs pt-3 first:pt-0">
                  <div className="flex gap-3 items-center">
                    <ShimmerImage src={item.product.images[0]} alt="" className="h-9 w-9" />
                    <div>
                      <p className="font-bold text-foreground line-clamp-1 max-w-[120px]">{item.product.title}</p>
                      <p className="text-muted-foreground mt-0.5">Size {item.variant.size} • Color {item.color || item.variant.color} • Qty {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-bold text-foreground">₹{(item.product.sale_price || item.product.price) * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Shipping Options — DISABLED (Shiprocket off)
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
            */} {/* Shipping Options block disabled (Shiprocket off) */}

            {/* Financial breakdown */}
            <div className="border-t border-border pt-4 text-xs space-y-2">
              <div className="flex justify-between text-muted-foreground font-semibold">
                <span>MRP</span>
                <span>₹{mrpTotal.toFixed(2)}</span>
              </div>
              {discountTotal > 0 && (
                <div className="flex justify-between text-muted-foreground font-semibold">
                  <span>Discount ({discountPercent.toFixed(0)}%)</span>
                  <span className="text-green-400">-₹{discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground font-semibold">
                <span>Shipping</span>
                <span className="text-green-400">{shippingCost === 0 ? 'Free' : `₹${shippingCost.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-foreground border-t border-border pt-3">
                <span>Total</span>
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

      {/* Address Add/Edit Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-background border border-border rounded-2xl p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-extrabold text-foreground">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary cursor-pointer"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    value={addrForm.fullName}
                    onChange={e => setAddrForm({ ...addrForm, fullName: e.target.value })}
                    className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={addrForm.phone}
                    onChange={e => setAddrForm({ ...addrForm, phone: e.target.value })}
                    className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Address Line 1</label>
                <input
                  type="text"
                  required
                  value={addrForm.addressLine1}
                  onChange={e => setAddrForm({ ...addrForm, addressLine1: e.target.value })}
                  className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">City</label>
                  <input
                    type="text"
                    required
                    value={addrForm.city}
                    onChange={e => setAddrForm({ ...addrForm, city: e.target.value })}
                    className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">State</label>
                  <input
                    type="text"
                    required
                    value={addrForm.state}
                    onChange={e => setAddrForm({ ...addrForm, state: e.target.value })}
                    className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pincode</label>
                  <input
                    type="text"
                    required
                    value={addrForm.pincode}
                    onChange={e => setAddrForm({ ...addrForm, pincode: e.target.value })}
                    className="w-full bg-card text-foreground border border-border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary hover:bg-primary-hover text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  {editingAddress ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAddressModalOpen(false); setEditingAddress(null); }}
                  className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-muted-foreground rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
