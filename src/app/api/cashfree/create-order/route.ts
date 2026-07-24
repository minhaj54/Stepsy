import { NextResponse } from 'next/server';
import { createCashfreeOrder } from '@/lib/cashfree';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, customerDetails, items } = body;

    if (!orderId || !amount || !customerDetails) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: orderId, amount, customerDetails' },
        { status: 400 }
      );
    }

    // Create order on Cashfree
    const cashfreeResult = await createCashfreeOrder(orderId, amount, customerDetails);

    if (!cashfreeResult.success) {
      return NextResponse.json(
        { success: false, error: cashfreeResult.error },
        { status: 400 }
      );
    }

    // Update order in Supabase with Cashfree order ID
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = await createClient();
      const { error } = await supabase
        .from('orders')
        .update({
          cashfree_order_id: cashfreeResult.orderId,
          payment_status: 'unpaid',
          status: 'pending',
        })
        .eq('id', orderId);

      if (error) {
        console.error('[Cashfree] Failed to update order in Supabase:', error);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: cashfreeResult.orderId,
      paymentSessionId: cashfreeResult.paymentSessionId,
      orderToken: cashfreeResult.orderToken,
    });
  } catch (error) {
    console.error('[Cashfree] Create order API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
