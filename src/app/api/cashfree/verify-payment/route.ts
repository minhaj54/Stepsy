import { NextResponse } from 'next/server';
import { getCashfreeOrder, mapCashfreeStatus } from '@/lib/cashfree';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const cashfreeOrderId = searchParams.get('cashfreeOrderId');

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'Missing orderId parameter' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    let supabaseOrder = null;
    if (supabaseUrl && supabaseKey) {
      const supabase = await createClient();
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();
      
      if (data) {
        supabaseOrder = data;
      }
    }

    const cfOrderId = cashfreeOrderId || supabaseOrder?.cashfree_order_id || orderId;
    const result = await getCashfreeOrder(cfOrderId);

    if (!result.success && !supabaseOrder) {
      return NextResponse.json(
        { success: false, error: result.error || 'Order not found' },
        { status: 400 }
      );
    }

    // If we have Supabase order but Cashfree fetch failed, return Supabase data
    if (!result.success && supabaseOrder) {
      return NextResponse.json({
        success: true,
        order: {
          id: supabaseOrder.id,
          total_amount: supabaseOrder.total_amount,
          payment_method: supabaseOrder.payment_method,
          payment_status: supabaseOrder.payment_status,
          status: supabaseOrder.status,
          cashfree_payment_id: supabaseOrder.cashfree_payment_id,
          cashfree_payment_method: supabaseOrder.cashfree_payment_method,
          created_at: supabaseOrder.created_at,
          shipping_address: supabaseOrder.shipping_address,
        },
        mappedPaymentStatus: supabaseOrder.payment_status,
        mappedOrderStatus: supabaseOrder.status,
      });
    }

    const order = result.order;
    const payment = order.payments?.[0] || order.latest_payment || {};
    
    // CRITICAL: Only use payment.payment_status - NEVER fall back to order.order_status
    // order.order_status can be 'SUCCESS' even when no payment is made
    // payment.payment_status is only set when an actual payment occurs
    const paymentStatus = payment.payment_status || 'PENDING';
    const { paymentStatus: mappedPaymentStatus, orderStatus: mappedOrderStatus } = mapCashfreeStatus(paymentStatus);

    // Update order in Supabase with latest status
    if (supabaseUrl && supabaseKey && supabaseOrder) {
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
        .eq('id', orderId);

      if (error) {
        console.error('[Cashfree] Failed to update order status:', error);
      }

      // Fetch updated order
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (updatedOrder) {
        return NextResponse.json({
          success: true,
          order: {
            id: updatedOrder.id,
            total_amount: updatedOrder.total_amount,
            payment_method: updatedOrder.payment_method,
            payment_status: updatedOrder.payment_status,
            status: updatedOrder.status,
            cashfree_payment_id: updatedOrder.cashfree_payment_id,
            cashfree_payment_method: updatedOrder.cashfree_payment_method,
            created_at: updatedOrder.created_at,
            shipping_address: updatedOrder.shipping_address,
          },
          mappedPaymentStatus,
          mappedOrderStatus,
          paymentId: payment.payment_id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      order: supabaseOrder ? {
        id: supabaseOrder.id,
        total_amount: supabaseOrder.total_amount,
        payment_method: supabaseOrder.payment_method,
        payment_status: supabaseOrder.payment_status,
        status: supabaseOrder.status,
        cashfree_payment_id: supabaseOrder.cashfree_payment_id,
        cashfree_payment_method: supabaseOrder.cashfree_payment_method,
        created_at: supabaseOrder.created_at,
        shipping_address: supabaseOrder.shipping_address,
      } : null,
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
