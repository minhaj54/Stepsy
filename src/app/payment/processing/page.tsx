'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck, CreditCard, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

type PaymentState = 'loading' | 'initializing' | 'processing' | 'verifying' | 'redirecting' | 'error';

export default function PaymentProcessingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const orderId = searchParams.get('orderId');
  const cashfreeOrderId = searchParams.get('cashfreeOrderId');
  const paymentSessionId = searchParams.get('sessionId');
  const amount = searchParams.get('amount');

  const [state, setState] = useState<PaymentState>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const redirectToStatus = useCallback((status: 'success' | 'failed' | 'cancelled', orderId: string) => {
    setState('redirecting');
    router.push(`/payment/status?status=${status}&orderId=${orderId}`);
  }, [router]);

  const verifyPayment = useCallback(async (orderId: string, cashfreeOrderId?: string | null): Promise<boolean> => {
    try {
      const cfOrderId = cashfreeOrderId || orderId;
      const response = await fetch(`/api/cashfree/verify-payment?orderId=${encodeURIComponent(orderId)}&cashfreeOrderId=${encodeURIComponent(cfOrderId)}`);
      const data = await response.json();
      // The order is verified (exists / Cashfree confirms it). The authoritative
      // payment status is set asynchronously by the Cashfree webhook, so we don't
      // block on the immediate payment status (which can still read PENDING).
      return data.success === true;
    } catch {
      return false;
    }
  }, []);

  const createOrderInDb = useCallback(async () => {
    if (!user) return null;

    const raw = sessionStorage.getItem('zarwinto_pending_order');
    if (!raw) return null;

    try {
      const data = JSON.parse(raw);
      const supabase = createClient();

      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          id: data.orderId,
          user_id: user.id,
          status: 'processing',
          payment_status: 'paid',
          payment_method: data.payment_method,
          total_amount: data.total_amount,
          shipping_address: data.address,
          coupon_code: data.coupon_code,
          discount_amount: data.discount_amount,
          store_id: data.store_id,
          cashfree_order_id: data.cashfreeOrderId,
          created_at: new Date().toISOString(),
        });

      if (orderError) {
        console.error('[Payment] Failed to create order:', orderError);
        return null;
      }

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(data.cartItems);

      if (itemsError) {
        console.error('[Payment] Failed to create order items:', itemsError);
      }

      for (const item of data.cartItems) {
        const { data: vData } = await supabase
          .from('product_variants')
          .select('stock_quantity')
          .eq('id', item.variant_id)
          .single();

        if (vData) {
          await supabase
            .from('product_variants')
            .update({ stock_quantity: Math.max(0, vData.stock_quantity - item.quantity) })
            .eq('id', item.variant_id);
        }
      }

      localStorage.removeItem('zarwinto_cart');
      sessionStorage.removeItem('zarwinto_pending_order');

      window.dispatchEvent(new CustomEvent('order-created', { detail: data }));

      return data;
    } catch (e) {
      console.error('[Payment] Error creating order:', e);
      return null;
    }
  }, [user]);

  const initiateCheckout = useCallback(async () => {
    if (!orderId || !paymentSessionId) {
      setErrorMessage('Invalid payment session. Please try again.');
      setState('error');
      return;
    }

    try {
      setState('initializing');
      setProgress(30);

      const { load } = await import('@cashfreepayments/cashfree-js');
      
      const cashfree = await load({
        mode: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
      });

      if (!cashfree) {
        throw new Error('Failed to load payment gateway');
      }

      setState('processing');
      setProgress(60);

      const checkoutResult = await cashfree.checkout({
        paymentSessionId: paymentSessionId,
        redirectTarget: '_modal',
      });

      setState('verifying');
      setProgress(90);

      if (checkoutResult.error) {
        const isUserClosed = checkoutResult.error.message?.includes('closed') || 
                            checkoutResult.error.message?.includes('cancelled');
        
        if (isUserClosed) {
          sessionStorage.removeItem('zarwinto_pending_order');
          redirectToStatus('cancelled', orderId);
        } else {
          const verified = await verifyPayment(orderId, cashfreeOrderId);
          if (verified) {
            await createOrderInDb();
            redirectToStatus('success', orderId);
          } else {
            sessionStorage.removeItem('zarwinto_pending_order');
            redirectToStatus('failed', orderId);
          }
        }
        return;
      }

      if (checkoutResult.paymentDetails || checkoutResult.redirect) {
        // Cashfree confirmed the payment completed. Create the order and show
        // success; the webhook reconciles the authoritative payment status.
        await createOrderInDb();
        redirectToStatus('success', orderId);
        return;
      }

      sessionStorage.removeItem('zarwinto_pending_order');
      redirectToStatus('failed', orderId);
    } catch (error) {
      console.error('[Payment] Checkout error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed. Please try again.');
      setState('error');
    }
  }, [orderId, paymentSessionId, cashfreeOrderId, redirectToStatus, verifyPayment, createOrderInDb]);

  useEffect(() => {
    if (orderId && paymentSessionId) {
      initiateCheckout();
    } else {
      setState('error');
      setErrorMessage('Missing payment information. Please try again.');
    }
  }, [orderId, paymentSessionId, initiateCheckout]);

  const getStepMessage = () => {
    switch (state) {
      case 'loading': return 'Loading payment details...';
      case 'initializing': return 'Connecting to secure payment gateway...';
      case 'processing': return 'Waiting for payment confirmation...';
      case 'verifying': return 'Verifying payment status...';
      case 'redirecting': return 'Redirecting...';
      default: return '';
    }
  };

  if (state === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-20 w-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-10 w-10 text-red-500" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Payment Error</h1>
            <p className="text-muted-foreground text-sm">{errorMessage}</p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/checkout"
              className="bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-sm transition-colors"
            >
              Return to Checkout
            </Link>
            <Link
              href="/account?tab=orders"
              className="text-muted-foreground hover:text-foreground py-2 text-sm transition-colors"
            >
              View My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="h-24 w-24 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mx-auto relative">
            <CreditCard className="h-12 w-12 text-primary" />
            <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping opacity-25" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-foreground">Processing Payment</h1>
          <p className="text-muted-foreground text-sm">{getStepMessage()}</p>
          {amount && (
            <p className="text-lg font-bold text-primary">₹{parseFloat(amount).toFixed(2)}</p>
          )}
        </div>

        <div className="space-y-3">
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Please do not close or refresh this page</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <span>Secured with 256-bit SSL encryption</span>
        </div>

        {orderId && (
          <p className="text-[10px] text-muted-foreground/60 font-mono">
            Order: {orderId}
          </p>
        )}
      </div>
    </div>
  );
}
