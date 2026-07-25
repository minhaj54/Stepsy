import { NextResponse } from 'next/server';
import { createCashfreePaymentLink } from '@/lib/cashfree';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, customerDetails, returnUrl } = body;

    if (!orderId || !amount || !customerDetails) {
      return NextResponse.json(
        { error: 'Missing required fields: orderId, amount, customerDetails' },
        { status: 400 }
      );
    }

    const result = await createCashfreePaymentLink(
      orderId,
      amount,
      customerDetails,
      returnUrl || `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/checkout`
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create payment link' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentLink: result.paymentLink,
    });
  } catch (error) {
    console.error('[Cashfree] Create payment link API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
