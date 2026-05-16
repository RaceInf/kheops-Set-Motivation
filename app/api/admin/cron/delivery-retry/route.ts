import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { deliverProductByEmail } from '@/lib/fulfillment';

/**
 * CRON : Retry automatique des livraisons email échouées.
 *
 * Trouve toutes les commandes PAID dont delivery_status != 'SENT'
 * et tente de renvoyer l'email de livraison.
 *
 * Fréquence conseillée : toutes les heures (même cron que les relances marketing).
 * Appel : GET /api/admin/cron/delivery-retry?key=CRON_SECRET
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');

  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // On ne retente QUE les orders où le nouveau système a explicitement enregistré un échec.
    // Critère : delivery_error IS NOT NULL (= le code a tenté et Brevo/storage a échoué).
    //
    // On exclut volontairement les orders avec delivery_sent_at IS NULL ET delivery_error IS NULL :
    // ce sont soit des anciennes commandes livrées par l'ancien code (backfill à faire via SQL),
    // soit des commandes PENDING qui ne sont pas encore payées.
    //
    // Fenêtre : 30 jours pour éviter de traiter des orders très anciennes.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: undelivered, error } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'PAID')
      .eq('delivery_status', 'FAILED')         // uniquement les échecs explicites du nouveau système
      .not('delivery_error', 'is', null)        // double-sécurité : delivery_error renseigné
      .gt('created_at', thirtyDaysAgo.toISOString());

    if (error) throw error;
    if (!undelivered || undelivered.length === 0) {
      return NextResponse.json({ message: 'No undelivered orders', retried: 0 });
    }

    const results: { orderId: string; success: boolean }[] = [];

    for (const order of undelivered) {
      const success = await deliverProductByEmail(order.id);
      results.push({ orderId: order.id, success });
    }

    const succeeded = results.filter(r => r.success).length;
    console.log(`[delivery-retry] ${succeeded}/${results.length} livraisons réussies`);

    return NextResponse.json({
      retried: results.length,
      succeeded,
      failed: results.length - succeeded,
      details: results,
    });
  } catch (err: any) {
    console.error('[delivery-retry] Erreur cron:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
