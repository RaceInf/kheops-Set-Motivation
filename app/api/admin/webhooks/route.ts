import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: events, error } = await supabase
      .from('webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({
      events: (events || []).map(e => ({
        id: e.id,
        date: e.created_at,
        provider: e.provider,
        eventType: e.event_type,
        status: e.status,
        processedAt: e.processed_at,
        errorMessage: e.error_message,
        payload: e.payload,
      })),
    });

  } catch (error) {
    console.error('Admin webhooks error:', error);
    return NextResponse.json({ error: 'Failed to fetch webhooks' }, { status: 500 });
  }
}
