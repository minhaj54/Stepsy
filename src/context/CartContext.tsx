'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, Order, ShippingAddress } from '../types';
import { useAuth } from './AuthContext';
import { createClient, isSupabaseConfigured, checkSupabaseConnectivity } from '../lib/supabase/client';
import { useToast } from '../components/Toast';

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
  removeFromCart: (variantId: string) => void;
  updateCartQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  discountedTotal: number;
  discountAmount: number;
  appliedCoupon: Coupon | null;
  applyCouponCode: (code: string) => boolean;
  removeCoupon: () => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  orders: Order[];
  placeOrder: (address: ShippingAddress, paymentMethod: 'prepaid' | 'cod' | 'cashfree') => Promise<Order | null>;
  initiateCashfreePayment: (address: ShippingAddress) => Promise<{ order: Order; paymentLink?: string; checkoutUrl?: string; paymentSessionId?: string } | null>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  verifyCashfreePayment: (orderId: string) => Promise<{ success: boolean; paymentStatus?: string; orderStatus?: string }>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  const { user, supabaseReachable } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const configured = isSupabaseConfigured();

  // Load cart, wishlist, and orders from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('zarwinto_cart');
    const savedWishlist = localStorage.getItem('zarwinto_wishlist');
    const savedOrders = localStorage.getItem('zarwinto_orders');

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Check Supabase connectivity on mount
  useEffect(() => {
    if (!configured) return;

    checkSupabaseConnectivity()
      .then((reachable) => {
        if (!reachable) {
          console.warn('[CartContext] Supabase project appears to be unreachable. Check if the project is paused or the URL is correct.');
        }
      })
      .catch((err) => {
        console.error('[CartContext] Connectivity check failed:', err);
      });
  }, [configured]);

  // Fetch from Supabase when user log in
  useEffect(() => {
    if (!configured || !user) return;

    const syncWithSupabase = async () => {
      const supabase = createClient();

      // If we already know Supabase is unreachable, skip the sync
      if (!supabaseReachable) {
        console.warn('[CartContext] Skipping Supabase sync - project appears unreachable');
        return;
      }
      
      // Sync Wishlist
      const { data: wlData, error: wlError } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);
      
      if (!wlError && wlData) {
        const dbWishlist = wlData.map((item: any) => item.product_id);
        setWishlist(dbWishlist);
        localStorage.setItem('zarwinto_wishlist', JSON.stringify(dbWishlist));
      } else if (wlError) {
        const isNetworkError = wlError.message === 'Failed to fetch' || wlError.details?.includes('Failed to fetch');
        if (isNetworkError) {
          console.error('[CartContext] Network error syncing wishlist - Supabase may be unreachable:', wlError);
        } else {
          console.error('[CartContext] Error syncing wishlist:', wlError);
        }
      }

      // Sync Orders
      const { data: ordData, error: ordError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(
            *,
            products(
              title,
              product_images(image_url, sort_order)
            ),
            product_variants(size, color)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!ordError && ordData) {
        const dbOrders: Order[] = ordData.map((o: any) => {
          const shipping_address = typeof o.shipping_address === 'string'
            ? JSON.parse(o.shipping_address)
            : o.shipping_address;

          return {
            id: o.id,
            user_id: o.user_id,
            status: o.status,
            payment_status: o.payment_status,
            payment_method: o.payment_method,
            total_amount: Number(o.total_amount),
            shipping_address,
            created_at: o.created_at,
            shiprocket_order_id: o.shiprocket_order_id,
            awb_code: o.awb_code,
            courier_name: o.courier_name,
            shipment_id: o.shipment_id,
            cashfree_order_id: o.cashfree_order_id,
            cashfree_payment_id: o.cashfree_payment_id,
            cashfree_payment_status: o.cashfree_payment_status,
            cashfree_payment_method: o.cashfree_payment_method,
            cashfree_payment_message: o.cashfree_payment_message,
            cashfree_webhook_received: o.cashfree_webhook_received,
            items: (o.order_items || []).map((item: any) => {
              const images = (item.products?.product_images || [])
                .sort((a: any, b: any) => a.sort_order - b.sort_order)
                .map((img: any) => img.image_url);
              return {
                product_id: item.product_id,
                product_title: item.products?.title ?? 'Product',
                product_image: images[0] ?? '',
                variant_id: item.variant_id,
                size: item.product_variants?.size ?? '',
                color: item.product_variants?.color ?? '',
                quantity: item.quantity,
                price: Number(item.price)
              };
            })
          };
        });

        setOrders(dbOrders);
        localStorage.setItem('zarwinto_orders', JSON.stringify(dbOrders));
      } else if (ordError) {
        const isNetworkError = ordError.message === 'Failed to fetch' || ordError.details?.includes('Failed to fetch');
        if (isNetworkError) {
          console.error('[CartContext] Network error fetching orders - Supabase may be unreachable:', ordError);
        } else {
          console.error('[CartContext] Error fetching orders from Supabase:', ordError);
        }
      }
    };

    syncWithSupabase();
  }, [configured, user, supabaseReachable]);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('zarwinto_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    const existingIndex = cart.findIndex(item => item.variant.id === variant.id);
    const newCart = [...cart];
    
    if (existingIndex > -1) {
      newCart[existingIndex].quantity += quantity;
    } else {
      newCart.push({ product, variant, quantity });
    }
    saveCart(newCart);
  };

  const removeFromCart = (variantId: string) => {
    const newCart = cart.filter(item => item.variant.id !== variantId);
    saveCart(newCart);
  };

  const updateCartQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(variantId);
      return;
    }
    const newCart = cart.map(item => 
      item.variant.id === variantId ? { ...item, quantity } : item
    );
    saveCart(newCart);
  };

  const clearCart = () => {
    saveCart([]);
    setAppliedCoupon(null);
  };

  const cartTotal = cart.reduce((total, item) => {
    const price = item.product.sale_price || item.product.price;
    return total + price * item.quantity;
  }, 0);

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  // Coupon handling
  const applyCouponCode = (code: string): boolean => {
    const normalized = code.toUpperCase().trim();
    if (normalized === 'STEPZY20' || normalized === 'ZARWINTO20') {
      setAppliedCoupon({ code: 'STEPZY20', type: 'percentage', value: 20 });
      return true;
    }
    if (normalized === 'WELCOME10') {
      setAppliedCoupon({ code: 'WELCOME10', type: 'percentage', value: 10 });
      return true;
    }
    if (normalized === 'SHOEHEAVEN') {
      setAppliedCoupon({ code: 'SHOEHEAVEN', type: 'fixed', value: 30 });
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? (cartTotal * appliedCoupon.value) / 100
      : Math.min(appliedCoupon.value, cartTotal)
    : 0;

  const discountedTotal = Math.max(0, cartTotal - discountAmount);

  // Wishlist handling
  const toggleWishlist = async (productId: string) => {
    const isWishlisted = wishlist.includes(productId);
    let newWishlist: string[];
    if (isWishlisted) {
      newWishlist = wishlist.filter(id => id !== productId);
    } else {
      newWishlist = [...wishlist, productId];
    }
    setWishlist(newWishlist);
    localStorage.setItem('zarwinto_wishlist', JSON.stringify(newWishlist));

    if (configured && user) {
      const supabase = createClient();
      if (isWishlisted) {
        await supabase
          .from('wishlist')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);
      } else {
        await supabase
          .from('wishlist')
          .insert({ user_id: user.id, product_id: productId });
      }
    }
  };

  // Place order (for COD or direct prepaid without Cashfree)
  const placeOrder = async (address: ShippingAddress, paymentMethod: 'prepaid' | 'cod' | 'cashfree' = 'prepaid'): Promise<Order | null> => {
    if (cart.length === 0 || !user) return null;

    const orderId = `ord_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const isCashfree = paymentMethod === 'cashfree';
    const internalPaymentMethod = isCashfree ? 'cashfree_upi' : paymentMethod;

    const newOrder: Order = {
      id: orderId,
      user_id: user.id,
      status: isCashfree ? 'pending' : 'processing',
      payment_status: isCashfree ? 'unpaid' : (paymentMethod === 'cod' ? 'cod_pending' : 'paid'),
      payment_method: internalPaymentMethod,
      total_amount: discountedTotal,
      shipping_address: address,
      items: cart.map(item => ({
        product_id: item.product.id,
        product_title: item.product.title,
        product_image: item.product.images[0],
        variant_id: item.variant.id,
        size: item.variant.size,
        color: item.variant.color,
        quantity: item.quantity,
        price: item.product.sale_price || item.product.price
      })),
      created_at: new Date().toISOString()
    };

    let dbOrderCreated = false;

    if (configured) {
      const supabase = createClient();

      // Save address to addresses table first
      try {
        const { data: existingAddresses } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', user.id)
          .eq('full_name', address.fullName)
          .eq('address_line1', address.addressLine1)
          .eq('city', address.city)
          .eq('pincode', address.pincode);

        if (!existingAddresses || existingAddresses.length === 0) {
          const { count: existingCount } = await supabase
            .from('addresses')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);

          await supabase.from('addresses').insert({
            user_id: user.id,
            full_name: address.fullName,
            phone: address.phone,
            address_line1: address.addressLine1,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            is_default: !existingCount || existingCount === 0
          });
        }
      } catch (addrError) {
        console.error('Error saving address:', addrError);
      }

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: user.id,
          status: newOrder.status,
          payment_status: newOrder.payment_status,
          payment_method: newOrder.payment_method,
          total_amount: discountedTotal,
          shipping_address: address,
          coupon_code: appliedCoupon?.code ?? null,
          discount_amount: discountAmount
        })
        .select();

      if (!orderError) {
        dbOrderCreated = true;

        const itemsToInsert = cart.map(item => ({
          order_id: orderId,
          product_id: item.product.id,
          variant_id: item.variant.id,
          quantity: item.quantity,
          price: item.product.sale_price || item.product.price
        }));

        const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
        if (itemsError) {
          console.error('Error creating order items in database:', itemsError);
        }

        // Update variant stocks
        for (const item of cart) {
          const { data: vData } = await supabase
            .from('product_variants')
            .select('stock_quantity')
            .eq('id', item.variant.id)
            .single();

          if (vData) {
            await supabase
              .from('product_variants')
              .update({ stock_quantity: Math.max(0, vData.stock_quantity - item.quantity) })
              .eq('id', item.variant.id);
          }
        }
      } else {
        console.error('Error creating order in database:', orderError);
        addToast('Order placed locally but failed to sync with database. Please contact support if the order does not appear in your history.', 'error');
      }
    }

    // Only add to local state and clear cart if DB insert succeeded (or if Supabase is not configured)
    if (!configured || dbOrderCreated) {
      const newOrders = [newOrder, ...orders];
      setOrders(newOrders);
      localStorage.setItem('zarwinto_orders', JSON.stringify(newOrders));
      // Don't clear cart for Cashfree - wait for payment confirmation
      if (!isCashfree) {
        clearCart();
      }
    }

    // Send order alert notifications (non-blocking) - only for non-Cashfree orders
    if (dbOrderCreated && orderId && !isCashfree) {
      sendOrderAlert(orderId).catch(err => {
        console.error('Failed to send order alert notification:', err);
      });
    }

    return newOrder;
  };

  // Initiate Cashfree payment using payment link (with fallback to hosted checkout)
  const initiateCashfreePayment = async (address: ShippingAddress): Promise<{ order: Order; paymentLink?: string; checkoutUrl?: string; paymentSessionId?: string } | null> => {
    if (cart.length === 0 || !user) return null;

    // First create the order in pending state
    const order = await placeOrder(address, 'cashfree');
    if (!order) return null;

    try {
      // Try payment link API first
      const response = await fetch('/api/cashfree/create-payment-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: order.id,
          amount: Math.round(order.total_amount * 100) / 100,
          customerDetails: {
            name: address.fullName,
            email: user.email || 'customer@example.com',
            phone: address.phone,
          },
          returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout/payment-close`,
        }),
      });

      const data = await response.json();

      if (response.ok && data.paymentLink) {
        return {
          order,
          paymentLink: data.paymentLink,
        };
      }

      // If payment link fails, check if it's because the API is not enabled
      const errorMessage = data.error || '';
      if (errorMessage.includes('link_creation_api') || errorMessage.includes('not enabled') || errorMessage.includes('not approved')) {
        console.log('[Cashfree] Payment Link API not enabled, falling back to hosted checkout');
        
        // Fallback: Create order directly and use hosted checkout
        try {
          const orderResponse = await fetch('/api/cashfree/create-order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              orderId: order.id,
              amount: Math.round(order.total_amount * 100) / 100,
              customerDetails: {
                name: address.fullName,
                email: user.email || 'customer@example.com',
                phone: address.phone,
              },
            }),
          });

          const orderData = await orderResponse.json();

          if (orderResponse.ok && orderData.paymentSessionId) {
            const checkoutUrl = `https://payments.cashfree.com/checkout#/${orderData.paymentSessionId}`;
            return {
              order,
              checkoutUrl,
              paymentSessionId: orderData.paymentSessionId,
            };
          }
        } catch (fallbackError) {
          console.error('[Cashfree] Fallback to hosted checkout failed:', fallbackError);
        }
      }

      addToast(data.error || 'Failed to initiate payment. Please try again.', 'error');
      return null;
    } catch (error) {
      console.error('Error initiating Cashfree payment:', error);
      addToast('Failed to initiate payment. Please try again.', 'error');
      return null;
    }
  };

  // Verify Cashfree payment status
  const verifyCashfreePayment = async (orderId: string): Promise<{ success: boolean; paymentStatus?: string; orderStatus?: string }> => {
    try {
      const response = await fetch(`/api/cashfree/verify-payment?orderId=${encodeURIComponent(orderId)}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        return { success: false };
      }

      return {
        success: true,
        paymentStatus: data.mappedPaymentStatus,
        orderStatus: data.mappedOrderStatus,
      };
    } catch (error) {
      console.error('Error verifying Cashfree payment:', error);
      return { success: false };
    }
  };

  const sendOrderAlert = async (orderId: string) => {
    try {
      const response = await fetch('/api/notifications/order-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const responseText = await response.text();
      console.log('[CartContext] Order alert response:', response.status, responseText);

      if (!response.ok) {
        console.error('[CartContext] Order alert API error:', response.status, responseText);
      }
    } catch (error) {
      console.error('[CartContext] Error calling order alert API:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    // Update local state immediately for responsive UI
    setOrders(prev =>
      prev.map(o => (o.id === orderId ? { ...o, status } : o))
    );
    localStorage.setItem('zarwinto_orders', JSON.stringify(
      orders.map(o => (o.id === orderId ? { ...o, status } : o))
    ));

    if (configured && user) {
      const supabase = createClient();
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating order status:', error);
        addToast('Failed to update order status. Please try again.', 'error');
        // Revert local state on error
        setOrders(prev =>
          prev.map(o => (o.id === orderId ? { ...o, status: orders.find(o => o.id === orderId)?.status || 'pending' } : o))
        );
      } else {
        addToast('Order status updated successfully!', 'success');
      }
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      cartTotal,
      cartCount,
      discountedTotal,
      discountAmount,
      appliedCoupon,
      applyCouponCode,
      removeCoupon,
      wishlist,
      toggleWishlist,
      orders,
      placeOrder,
      initiateCashfreePayment,
      updateOrderStatus,
      verifyCashfreePayment,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
