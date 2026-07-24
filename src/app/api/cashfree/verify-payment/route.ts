import { NextResponse } from 'next/server';
import { getCashfreeOrder, mapCashfreeStatus } from '@/lib/cashfree';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId parameter' },
        { status: 400 }
      );
    }

    // Fetch order details from Cashfree
    const result = await getCashfreeOrder(orderId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    const order = result.order;
    const payment = order.payments?.[0] || order.latest_payment || {};
    
    const paymentStatus = payment.payment_status || order.order_status || 'PENDING';
    const { paymentStatus: mappedPaymentStatus, orderStatus: mappedOrderStatus } = mapCashfreeStatus(paymentStatus);

    // Update order in Supabase with latest status
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = await createClient();

      const { error } = await supabase
        .from('orders')
        .update({
          cashfree_payment_status: paymentStatus,
          cashfree_payment_id: payment.payment_id || '',
          cashfree_payment_method: payment.payment_method || '',
          cashfree_payment_message: payment.payment_message || '',
          payment_status: mappedPaymentStatus,
          status: mappedOrderStatus,
        })
        .eq('cashfree_order_id', orderId);

      if (error) {
        console.error('[Cashfree] Failed to update order status:', error);
      }
    }

    return NextResponse.json({
      success: true,
      orderStatus: order.order_status,
      paymentStatus: paymentStatus,
      mappedPaymentStatus,
      mappedOrderStatus,
      amount: order.order_amount,
      currency: order.order_currency,
      paymentMethod: payment.payment_method,
      paymentMessage: payment.payment_message,
      paymentId: payment.payment_id,
      createdAt: order.order_time,
    });
  } catch (error) {
    console.error('[Cashfree] Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
