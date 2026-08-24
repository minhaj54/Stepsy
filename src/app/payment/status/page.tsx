'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, AlertTriangle, Loader2, Package, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import confetti from 'canvas-confetti';

interface OrderDetails {
  id: string;
  total_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  cashfree_payment_id?: string;
  cashfree_payment_method?: string;
  created_at: string;
  shipping_address: {
    full_name: string;
    address_line1: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
}

type StatusType = 'success' | 'failed' | 'cancelled' | 'pending';

export default function PaymentStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const status = searchParams.get('status') as StatusType;
  const orderId = searchParams.get('orderId');
  
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchOrderDetails = useCallback(async () => {
    if (!orderId) {
      setError('Order not found');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/cashfree/verify-payment?orderId=${encodeURIComponent(orderId)}`);
      const data = await response.json();

      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError('Could not fetch order details');
      }
    } catch {
      setError('Failed to load order details');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  useEffect(() => {
    if (status === 'success') {
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
    }
  }, [status]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-20 w-20 bg-yellow-500/10 border border-yellow-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="h-10 w-10 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Something went wrong</h1>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
          <Link
            href="/account?tab=orders"
            className="inline-block bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          iconColor: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          title: 'Payment Successful!',
          subtitle: 'Your order has been confirmed and will be shipped soon.',
          message: 'Thank you for your purchase!',
        };
      case 'cancelled':
        return {
          icon: XCircle,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          title: 'Payment Cancelled',
          subtitle: 'You cancelled the payment. Your order is still pending.',
          message: 'You can try again anytime.',
        };
      case 'failed':
        return {
          icon: XCircle,
          iconColor: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          title: 'Payment Failed',
          subtitle: 'We couldn\'t process your payment. No amount was charged.',
          message: 'Please try again or use a different payment method.',
        };
      default:
        return {
          icon: AlertTriangle,
          iconColor: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          title: 'Payment Pending',
          subtitle: 'Your payment is being processed.',
          message: 'Please check back later.',
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-8">
        <div className="text-center space-y-4">
          <div className={`h-24 w-24 ${config.bgColor} border ${config.borderColor} rounded-full flex items-center justify-center mx-auto relative`}>
            <StatusIcon className={`h-14 w-14 ${config.iconColor}`} />
            {status === 'success' && (
              <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping opacity-25" />
            )}
          </div>

          <div className="space-y-2">
            {status === 'success' && (
              <span className="text-xs font-bold text-primary uppercase tracking-widest flex items-center justify-center gap-1">
                <Sparkles className="h-4 w-4 text-accent" /> Order Confirmed
              </span>
            )}
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{config.title}</h1>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">{config.subtitle}</p>
          </div>
        </div>

        {order && (
          <div className="glass-card p-6 rounded-2xl border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Order Details</span>
              <span className="text-xs font-mono text-muted-foreground/60">{order.id}</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Status</span>
                <span className={`font-bold ${status === 'success' ? 'text-green-500' : status === 'failed' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {status === 'success' ? 'Paid' : status === 'failed' ? 'Failed' : 'Pending'}
                </span>
              </div>

              {order.cashfree_payment_id && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Transaction ID</span>
                  <span className="font-mono text-xs text-foreground">{order.cashfree_payment_id}</span>
                </div>
              )}

              {order.cashfree_payment_method && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <span className="text-foreground">{order.cashfree_payment_method}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Order Date</span>
                <span className="text-foreground">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-base font-bold">
                  <span className="text-foreground">Total Amount</span>
                  <span className="text-primary">₹{order.total_amount?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {order.shipping_address && status === 'success' && (
              <div className="border-t border-border pt-4 space-y-2">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Shipping Address</h4>
                <div className="text-sm text-muted-foreground space-y-0.5">
                  <p className="font-bold text-foreground">{order.shipping_address.full_name}</p>
                  <p>{order.shipping_address.address_line1}</p>
                  <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.pincode}</p>
                  <p>Phone: {order.shipping_address.phone}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {status === 'success' ? (
            <>
              <Link
                href="/account?tab=orders"
                className="bg-zinc-900 border border-border hover:border-muted-foreground/50 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
              >
                <Package className="h-4 w-4" /> Track Order
              </Link>
              <Link
                href="/shop"
                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all glow-btn flex items-center justify-center gap-2"
              >
                Continue Shopping <ArrowRight className="h-4 w-4" />
              </Link>
            </>
          ) : (
            <>
              <Link
                href={`/checkout?orderId=${orderId}`}
                className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all glow-btn"
              >
                Try Again
              </Link>
              <Link
                href="/account?tab=orders"
                className="bg-zinc-900 border border-border hover:border-muted-foreground/50 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors"
              >
                View Orders
              </Link>
            </>
          )}
        </div>

        {status === 'success' && (
          <p className="text-center text-xs text-muted-foreground">
            A confirmation email has been sent to your registered email address.
          </p>
        )}
      </div>
    </div>
  );
}
