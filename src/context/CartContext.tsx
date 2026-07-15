'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, ProductVariant, CartItem, Order, ShippingAddress } from '../types';
import { useAuth } from './AuthContext';
import { createClient, isSupabaseConfigured } from '../lib/supabase/client';

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
  placeOrder: (address: ShippingAddress) => Promise<Order | null>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const configured = isSupabaseConfigured();

  // Load cart, wishlist, and orders from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('whishkhu_cart');
    const savedWishlist = localStorage.getItem('whishkhu_wishlist');
    const savedOrders = localStorage.getItem('whishkhu_orders');

    if (savedCart) setCart(JSON.parse(savedCart));
    if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    if (savedOrders) setOrders(JSON.parse(savedOrders));
  }, []);

  // Fetch from Supabase when user log in
  useEffect(() => {
    if (!configured || !user) return;

    const syncWithSupabase = async () => {
      const supabase = createClient();
      
      // Sync Wishlist
      const { data: wlData, error: wlError } = await supabase
        .from('wishlist')
        .select('product_id')
        .eq('user_id', user.id);
      
      if (!wlError && wlData) {
        const dbWishlist = wlData.map((item: any) => item.product_id);
        setWishlist(dbWishlist);
        localStorage.setItem('whishkhu_wishlist', JSON.stringify(dbWishlist));
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

      console.log('[CartContext] Fetched orders from Supabase:', { ordData, ordError, userId: user.id });

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
            total_amount: Number(o.total_amount),
            shipping_address,
            created_at: o.created_at,
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

        console.log('[CartContext] Synced orders from Supabase:', dbOrders.length);
        setOrders(dbOrders);
        localStorage.setItem('whishkhu_orders', JSON.stringify(dbOrders));
      } else if (ordError) {
        console.error('[CartContext] Error fetching orders from Supabase:', ordError);
      }
    };

    syncWithSupabase();
  }, [configured, user]);

  // Save cart to localStorage
  const saveCart = (newCart: CartItem[]) => {
    setCart(newCart);
    localStorage.setItem('whishkhu_cart', JSON.stringify(newCart));
  };

  const addToCart = (product: Product, variant: ProductVariant, quantity = 1) => {
    const existingIndex = cart.findIndex(item => item.variant.id === variant.id);
    let newCart = [...cart];
    
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
    if (normalized === 'STEPZY20' || normalized === 'WHISHKHU20') {
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
    localStorage.setItem('whishkhu_wishlist', JSON.stringify(newWishlist));

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

  // Place order
  const placeOrder = async (address: ShippingAddress): Promise<Order | null> => {
    console.log('[CartContext] placeOrder called with address:', address, 'cart items:', cart.length);

    if (cart.length === 0 || !user) return null;

    const orderId = `ord_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const newOrder: Order = {
      id: orderId,
      user_id: user.id,
      status: 'processing',
      payment_status: 'paid',
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
      console.log('[CartContext] Inserting order into Supabase for user:', user.id);

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

      const { error: orderError, data: orderData } = await supabase
        .from('orders')
        .insert({
          id: orderId,
          user_id: user.id,
          status: 'processing',
          payment_status: 'paid',
          total_amount: discountedTotal,
          shipping_address: address,
          coupon_code: appliedCoupon?.code ?? null,
          discount_amount: discountAmount
        })
        .select();

      console.log('[CartContext] Order insert result:', { orderError, orderData });

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
        alert('Order placed locally but failed to sync with database. Please contact support if the order does not appear in your history.');
      }
    }

    // Only add to local state and clear cart if DB insert succeeded (or if Supabase is not configured)
    if (!configured || dbOrderCreated) {
      const newOrders = [newOrder, ...orders];
      setOrders(newOrders);
      localStorage.setItem('whishkhu_orders', JSON.stringify(newOrders));
      clearCart();
      console.log('[CartContext] Order added to local state and cart cleared');
    } else {
      console.log('[CartContext] Order NOT added to local state because DB insert failed');
    }

    return newOrder;
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
