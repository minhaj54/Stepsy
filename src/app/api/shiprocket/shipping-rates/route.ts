import { NextResponse } from 'next/server';
import { getShippingRates } from '@/lib/shiprocket';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pickupPincode, deliveryPincode, weight, length, breadth, height, declaredValue, cod } = body;

    if (!pickupPincode || !deliveryPincode || weight == null || length == null || breadth == null || height == null || declaredValue == null) {
      return NextResponse.json(
        { error: 'Missing required fields: pickupPincode, deliveryPincode, weight, length, breadth, height, declaredValue' },
        { status: 400 }
      );
    }

    const rates = await getShippingRates({
      pickupPincode,
      deliveryPincode,
      weight: Number(weight),
      length: Number(length),
      breadth: Number(breadth),
      height: Number(height),
      declaredValue: Number(declaredValue),
      cod: cod ? Number(cod) : 0,
    });

    return NextResponse.json({ status: 1, data: rates });
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch shipping rates' },
      { status: 500 }
    );
  }
}
