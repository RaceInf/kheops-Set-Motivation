import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Total revenue (PAID orders)
    const { data: paidOrders, error: paidError } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .eq('status', 'PAID');

    if (paidError) throw paidError;

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(now);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const revenueLast7Days = (paidOrders || [])
      .filter(o => new Date(o.created_at) >= sevenDaysAgo)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const revenuePrevious7Days = (paidOrders || [])
      .filter(o => new Date(o.created_at) >= fourteenDaysAgo && new Date(o.created_at) < sevenDaysAgo)
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    let revenueTrend = 0;
    if (revenuePrevious7Days > 0) {
      revenueTrend = Math.round(((revenueLast7Days - revenuePrevious7Days) / revenuePrevious7Days) * 100);
    } else if (revenueLast7Days > 0) {
      revenueTrend = 100; // Si 0 avant et ventes maintenant, on met +100%
    }

    const totalRevenue = (paidOrders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalSales = (paidOrders || []).length;
    const averageOrder = totalSales > 0 ? Math.round(totalRevenue / totalSales) : 0;

    // 2. Pending orders count
    const { count: pendingCount } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING');

    // 3. Revenue by day (last 7 days)

    const revenueByDay: { date: string; revenue: number; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = (paidOrders || []).filter(o => {
        const orderDate = new Date(o.created_at).toISOString().split('T')[0];
        return orderDate === dateStr;
      });

      revenueByDay.push({
        date: dateStr,
        revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        count: dayOrders.length,
      });
    }

    // 4. Sales by product
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('product_id, price, order_id');

    const { data: allPaidOrderIds } = await supabase
      .from('orders')
      .select('id')
      .eq('status', 'PAID');

    const paidIds = new Set((allPaidOrderIds || []).map(o => o.id));

    const productStats: Record<string, { count: number; revenue: number }> = {};
    (orderItems || []).forEach(item => {
      if (paidIds.has(item.order_id)) {
        if (!productStats[item.product_id]) {
          productStats[item.product_id] = { count: 0, revenue: 0 };
        }
        productStats[item.product_id].count++;
        productStats[item.product_id].revenue += item.price || 0;
      }
    });

    // 5. Last 5 sales
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('id, created_at, total_amount, status, users(email), order_items(product_id)')
      .eq('status', 'PAID')
      .order('created_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      kpis: {
        totalRevenue,
        totalSales,
        averageOrder,
        pendingOrders: pendingCount || 0,
        revenueTrend,
      },
      revenueByDay,
      productStats,
      recentOrders: (recentOrders || []).map(o => ({
        id: o.id,
        date: o.created_at,
        amount: o.total_amount,
        status: o.status,
        email: (o.users as any)?.email || 'N/A',
        productId: (o.order_items as any)?.[0]?.product_id || 'N/A',
      })),
    });

  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
