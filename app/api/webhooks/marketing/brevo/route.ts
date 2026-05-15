import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Brevo envoie parfois un tableau d'événements
    const events = Array.isArray(body) ? body : [body];

    for (const brevoEvent of events) {
      const { event, email, tags, status } = brevoEvent;
      
      const orderTag = (tags || []).find((t: string) => t.startsWith('order_'));
      const orderId = orderTag ? orderTag.replace('order_', '') : 'NO_ORDER_ID';

      let mappedStatus = 'PROCESSED';
      if (event === 'deferred' || event === 'soft_bounce' || event === 'hard_bounce' || event === 'error') {
        mappedStatus = 'FAILED';
      }

      const { error } = await supabase.from('webhook_events').insert([{
        provider: 'tara',
        event_type: `marketing_brevo_${event}`,
        payload: { 
          orderId, 
          email, 
          brevoEvent: event,
          brevoStatus: status,
          rawPayload: brevoEvent, // Capture everything to diagnose
          receivedAt: new Date().toISOString()
        },
        status: mappedStatus
      }]);
      
      if (error) throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Brevo Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
