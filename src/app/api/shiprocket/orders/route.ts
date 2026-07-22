import { NextResponse } from 'next/server';
import { createShiprocketOrder, getShiprocketOrders } from '@/lib/shiprocket';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order, pickupLocation } = body;

    if (!order) {
      return NextResponse.json(
        { error: 'Missing order data' },
        { status: 400 }
      );
    }

    // Log the full payload we are sending to Shiprocket for debugging
    console.log('[Shiprocket] Creating order with payload:', JSON.stringify(order, null, 2));

    const result = await createShiprocketOrder(order, pickupLocation || order.pickup_location);

    // Log the full response from Shiprocket
    console.log('[Shiprocket] Order creation result:', JSON.stringify(result, null, 2));

    return NextResponse.json({ status: 1, data: result });
  } catch (error) {
    console.error('Error creating Shiprocket order:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create Shiprocket order' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '50');

    const result = await getShiprocketOrders(page, perPage);

    return NextResponse.json({ status: 1, data: result.data });
  } catch (error) {
    console.error('Error fetching Shiprocket orders:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch Shiprocket orders' },
      { status: 500 }
    );
  }
}
