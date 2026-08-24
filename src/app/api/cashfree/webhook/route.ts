import { NextResponse } from 'next/server';
import { verifyCashfreeWebhook, resolveCashfreePaymentStatus } from '@/lib/cashfree';
import { createClient, createServiceClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-webhook-signature') || '';

    // Verify webhook signature
    const isValid = await verifyCashfreeWebhook(rawBody, signature);
    if (!isValid) {
      console.error('[Cashfree] Webhook signature verification failed');
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
    }

    const data = JSON.parse(rawBody);
    console.log('[Cashfree] Webhook received:', JSON.stringify(data, null, 2));

    // Extract order and payment details
    const { order, payment } = data;
    
    if (!order) {
      return NextResponse.json({ success: false, error: 'Missing order data' }, { status: 400 });
    }

    const orderId = order.order_id;
    const cashfreeOrderId = order.order_id;
    const cashfreePaymentId = payment?.payment_id || '';
    const paymentStatus = payment?.payment_status || order?.order_status || 'PENDING';
    const paymentMethod = payment?.payment_method || '';
    const paymentMessage = payment?.payment_message || '';
    const amount = order.order_amount;

    // Resolve to a definitive status. Null means non-final (PENDING/unknown) —
    // we then only refresh Cashfree metadata and never downgrade a paid order.
    const resolution = resolveCashfreePaymentStatus(paymentStatus);

    // Update order in Supabase (prefer service-role to bypass RLS; fall back to anon)
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && (serviceKey || supabaseKey)) {
      const supabase = serviceKey ? createServiceClient()! : await createClient();

      const orderUpdate: Record<string, unknown> = {
        cashfree_order_id: cashfreeOrderId,
        cashfree_payment_id: cashfreePaymentId,
        cashfree_payment_status: paymentStatus,
        cashfree_payment_method: paymentMethod,
        cashfree_payment_message: paymentMessage,
        cashfree_webhook_received: true,
      };
      if (resolution) {
        orderUpdate.payment_status = resolution.paymentStatus;
        orderUpdate.status = resolution.orderStatus;
      }

      // Update the order
      const { error: orderError } = await supabase
        .from('orders')
        .update(orderUpdate)
        .eq('cashfree_order_id', cashfreeOrderId);

      if (orderError) {
        console.error('[Cashfree] Failed to update order:', orderError);
      }

      // Create payment transaction record
      const { error: txError } = await supabase
        .from('payment_transactions')
        .upsert({
          order_id: orderId,
          cashfree_order_id: cashfreeOrderId,
          cashfree_payment_id: cashfreePaymentId,
          amount: amount,
          currency: order.order_currency || 'INR',
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          payment_message: paymentMessage,
          customer_details: order.customer_details || {},
          transaction_data: data,
        }, {
          onConflict: 'cashfree_order_id',
        });

      if (txError) {
        console.error('[Cashfree] Failed to create payment transaction:', txError);
      }
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('[Cashfree] Webhook processing error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
