'use client';

import { usePathname } from 'next/navigation';

export default function AnalyticsWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  if (pathname?.startsWith('/chantier-ksm7') || pathname?.startsWith('/api')) {
    return null;
  }
  
  return <>{children}</>;
}
