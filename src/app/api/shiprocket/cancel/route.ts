import { NextResponse } from 'next/server';
import { cancelShiprocketOrder } from '@/lib/shiprocket';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shipmentId, orderId } = body;

    if (!shipmentId || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields: shipmentId, orderId' },
        { status: 400 }
      );
    }

    // Call Shiprocket to cancel shipment
    await cancelShiprocketOrder(Number(shipmentId));

    // Update database to reset shiprocket fields
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from('orders')
      .update({
        shiprocket_order_id: null,
        awb_code: null,
        courier_name: null,
        shipment_id: null,
      })
      .eq('id', orderId);

    if (dbError) {
      console.error('Error updating order on cancel in DB:', dbError);
      return NextResponse.json(
        { error: `Shipment cancelled in Shiprocket but failed to update database: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 1,
      message: 'Shiprocket shipment cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling shipment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel shipment' },
      { status: 500 }
    );
  }
}
