import { NextResponse } from 'next/server';
import { generateShippingLabel } from '@/lib/shiprocket';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const shipmentId = searchParams.get('shipmentId');

    if (!shipmentId) {
      return NextResponse.json(
        { error: 'Missing required query parameter: shipmentId' },
        { status: 400 }
      );
    }

    const labelBlob = await generateShippingLabel(Number(shipmentId));
    const arrayBuffer = await labelBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=shipping_label_${shipmentId}.pdf`,
      },
    });
  } catch (error) {
    console.error('Error generating label:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate shipping label' },
      { status: 500 }
    );
  }
}
