import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  console.log('[OrderAlert] Received request for order notification');
  
  try {
    const { orderId } = await request.json();
    console.log('[OrderAlert] Order ID:', orderId);

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    console.log('[OrderAlert] Supabase client created');

    // Fetch order to verify it exists
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, total_amount, created_at')
      .eq('id', orderId)
      .single();

    console.log('[OrderAlert] Order query result:', { order: order?.id, error: orderError });

    if (orderError || !order) {
      console.error('Error fetching order for notification:', orderError);
      return NextResponse.json({ error: 'Order not found', details: orderError?.message }, { status: 404 });
    }

    // Get admin phone from environment
    const adminPhone = process.env.ADMIN_PHONE_NUMBER;
    console.log('[OrderAlert] Admin phone configured:', !!adminPhone);

    if (!adminPhone) {
      console.warn('[OrderAlert] ADMIN_PHONE_NUMBER not configured. Skipping SMS notification.');
      return NextResponse.json({ success: true, notified: 0, message: 'Admin phone not configured' });
    }

    // Build the tracking URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const trackingUrl = `${baseUrl}/admin/orders`;

    const messageBody = `New Order Alert! Order #${orderId} has been placed. Amount: ₹${Number(order.total_amount).toFixed(2)}. Click here to view details and process it: ${trackingUrl}`;

    // Send notification to admin only
    console.log('[OrderAlert] Sending SMS to admin:', adminPhone);
    await sendSms(adminPhone, messageBody);

    return NextResponse.json({ success: true, notified: 1 });
  } catch (error) {
    console.error('[OrderAlert] Error sending order alert:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to send notification', details: message }, { status: 500 });
  }
}

async function sendSms(to: string, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromPhone = process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromPhone) {
    console.warn('[OrderAlert] Twilio credentials not configured. Skipping SMS notification.');
    return;
  }

  const twilio = await import('twilio');
  const client = twilio.default(accountSid, authToken);

  try {
    const result = await client.messages.create({
      body,
      from: fromPhone,
      to,
    });
    console.log(`[OrderAlert] SMS sent successfully to ${to}, SID: ${result.sid}`);
  } catch (error) {
    console.error(`[OrderAlert] Failed to send SMS to ${to}:`, error);
    // Don't throw - we don't want SMS failures to break the order flow
  }
}
