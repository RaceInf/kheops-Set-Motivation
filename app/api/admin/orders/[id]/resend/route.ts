import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { tools } from '@/lib/data';
import { sendProductDeliveryEmail } from '@/lib/email';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;

    // 1. Fetch order with items and user
    const { data: order, error } = await supabase
      .from('orders')
      .select('id, status, users(email), order_items(product_id)')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'PAID') {
      return NextResponse.json({ error: 'Order is not paid' }, { status: 400 });
    }

    const customerEmail = (order.users as any)?.email;
    const productId = (order.order_items as any)?.[0]?.product_id;
    const tool = tools.find(t => t.id === productId);

    if (!customerEmail || !tool || !tool.filePath) {
      return NextResponse.json({ error: 'Missing data for resend' }, { status: 400 });
    }

    // 2. Generate new signed URL (24h)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('arsenal')
      .createSignedUrl(tool.filePath, 86400);

    if (signedUrlError || !signedUrlData?.signedUrl) {
      return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 });
    }

    // 3. Send email
    const emailResult = await sendProductDeliveryEmail(
      customerEmail,
      tool.title,
      signedUrlData.signedUrl
    );

    if (!emailResult.success) {
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Lien renvoyé à ${customerEmail}` 
    });

  } catch (error) {
    console.error('Resend error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
