'use client';

import { useEffect } from 'react';
import * as fpixel from '@/lib/fpixel';

interface TrackPurchaseProps {
  orderId: string;
  value: number;
  currency: string;
  productName: string;
}

export default function TrackPurchase({ orderId, value, currency, productName }: TrackPurchaseProps) {
  useEffect(() => {
    // Only track if orderId exists
    if (!orderId) return;

    if (process.env.NODE_ENV === 'development') {
      console.log('[FB_PIXEL] TrackPurchase mounting for order:', orderId);
    }

    fpixel.event('Purchase', {
      value: value,
      currency: currency,
      content_name: productName,
      content_ids: [orderId],
      content_type: 'product',
      transaction_id: orderId
    });
  }, [orderId, value, currency, productName]);

  return null;
}
