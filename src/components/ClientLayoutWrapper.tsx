'use client';

import * as React from 'react';
import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import BackgroundFX from '@/components/BackgroundFX';
import { MobileNav } from '@/components/MobileNav';
import { SideNav } from '@/components/SideNav';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isTelegram = pathname.startsWith('/telegram');

  if (isTelegram) {
    return <>{children}</>;
  }

  return (
    <>
      <BackgroundFX />
      <Suspense fallback={null}>
        <SideNav />
      </Suspense>
      <main className="ml-0 md:ml-72">
        {children}
      </main>
      <MobileNav />
    </>
  );
}
