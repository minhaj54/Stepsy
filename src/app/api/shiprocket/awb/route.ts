import { NextResponse } from 'next/server';
import { generateAWB } from '@/lib/shiprocket';
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

    // Call Shiprocket to generate AWB
    const awbResult = await generateAWB(Number(shipmentId));

    // Update database
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from('orders')
      .update({
        awb_code: awbResult.awb_code,
        courier_name: `Courier ID: ${awbResult.courier_company_id}`,
      })
      .eq('id', orderId);

    if (dbError) {
      console.error('Error updating order with AWB in DB:', dbError);
      return NextResponse.json(
        { error: `AWB generated (${awbResult.awb_code}) but failed to update database: ${dbError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 1,
      message: 'AWB generated and saved successfully',
      data: {
        awb_code: awbResult.awb_code,
        courier_company_id: awbResult.courier_company_id,
      },
    });
  } catch (error) {
    console.error('Error generating AWB:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate AWB' },
      { status: 500 }
    );
  }
}
