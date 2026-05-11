'use client';

import { useEffect } from 'react';
import * as fpixel from '@/lib/fpixel';

interface TrackViewContentProps {
  contentName: string;
  contentId: string;
  value: number;
}

export default function TrackViewContent({ contentName, contentId, value }: TrackViewContentProps) {
  useEffect(() => {
    fpixel.event('ViewContent', {
      content_name: contentName,
      content_ids: [contentId],
      content_type: 'product',
      value: value,
      currency: 'XAF',
    });
  }, [contentName, contentId, value]);

  return null;
}
