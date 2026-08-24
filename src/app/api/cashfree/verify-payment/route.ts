import { NextResponse } from 'next/server';
import { getCashfreeOrder, resolveCashfreePaymentStatus } from '@/lib/cashfree';
import { createClient, createServiceClient } from '@/lib/supabase/server';

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
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Prefer the service-role client (bypasses RLS) so we can reliably read the
    // order regardless of the caller's session. Falls back to the anon client.
    let supabaseOrder: any = null;
    const serviceClient = serviceKey ? createServiceClient() : null;

    if (serviceClient) {
      const { data } = await serviceClient
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      if (data) supabaseOrder = data;
    }

    if (!supabaseOrder && supabaseUrl && anonKey) {
      const supabase = await createClient();
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle();
      if (data) supabaseOrder = data;
    }

    const cfOrderId = cashfreeOrderId || supabaseOrder?.cashfree_order_id || orderId;
    const result = await getCashfreeOrder(cfOrderId);

    if (!result.success && !supabaseOrder) {
      return NextResponse.json(
        { success: false, error: result.error || 'Order not found' },
        { status: 400 }
      );
    }

    // Build a unified order object (prefer DB data; fall back to Cashfree).
    const buildOrder = (
      cfOrder: any,
      mappedPaymentStatus: string,
      mappedOrderStatus: string,
      payment: any
    ) => ({
      id: supabaseOrder?.id || cfOrder?.order_id || orderId,
      total_amount: supabaseOrder?.total_amount ?? cfOrder?.order_amount ?? 0,
      payment_method: supabaseOrder?.payment_method || payment?.payment_method || 'Online Payment',
      payment_status: supabaseOrder?.payment_status || mappedPaymentStatus,
      status: supabaseOrder?.status || mappedOrderStatus,
      cashfree_payment_id: supabaseOrder?.cashfree_payment_id || payment?.payment_id || '',
      cashfree_payment_method: supabaseOrder?.cashfree_payment_method || payment?.payment_method || '',
      created_at: supabaseOrder?.created_at || cfOrder?.order_time || new Date().toISOString(),
      shipping_address: supabaseOrder?.shipping_address || null,
    });

    // Cashfree fetch succeeded — update the row (best effort) and return details.
    if (result.success) {
      const cfOrder = result.order;
      const payment = cfOrder?.payments?.[0] || cfOrder?.latest_payment || {};

      // Resolve to a definitive status. Null means non-final (PENDING/unknown) —
      // we then only refresh Cashfree metadata and never downgrade a paid order.
      const resolution = resolveCashfreePaymentStatus(payment?.payment_status || cfOrder?.order_status);
      const mappedPaymentStatus = resolution?.paymentStatus ?? 'unpaid';
      const mappedOrderStatus = resolution?.orderStatus ?? 'pending';

      if (supabaseOrder) {
        const updater = serviceClient || (supabaseUrl && anonKey ? await createClient() : null);
        if (updater) {
          const orderUpdate: Record<string, unknown> = {
            cashfree_order_id: cfOrderId,
            cashfree_payment_status: payment?.payment_status || cfOrder?.order_status || 'PENDING',
            cashfree_payment_id: payment?.payment_id || '',
            cashfree_payment_method: payment?.payment_method || '',
            cashfree_payment_message: payment?.payment_message || '',
          };
          if (resolution) {
            orderUpdate.payment_status = resolution.paymentStatus;
            orderUpdate.status = resolution.orderStatus;
          }

          const { error } = await updater
            .from('orders')
            .update(orderUpdate)
            .eq('id', orderId);

          if (error) {
            console.error('[Cashfree] Failed to update order status:', error);
          }

          const { data: updatedOrder } = await updater
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .maybeSingle();
          if (updatedOrder) supabaseOrder = updatedOrder;
        }
      }

      return NextResponse.json({
        success: true,
        order: buildOrder(cfOrder, mappedPaymentStatus, mappedOrderStatus, payment),
        mappedPaymentStatus,
        mappedOrderStatus,
        paymentId: payment.payment_id,
      });
    }

    // Cashfree fetch failed, but we have the DB order — return its data.
    if (supabaseOrder) {
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

    return NextResponse.json(
      { success: false, error: 'Order not found' },
      { status: 400 }
    );
  } catch (error) {
    console.error('[Cashfree] Verify payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
