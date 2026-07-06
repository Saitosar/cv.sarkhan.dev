'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import BackgroundFX from '@/components/BackgroundFX';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isWorkspace = pathname.startsWith('/workspace');
  const isTelegram = pathname.startsWith('/telegram');

  if (isTelegram) {
    return <>{children}</>;
  }

  return (
    <>
      <BackgroundFX />
      {!isWorkspace && <Header />}
      <main className={isWorkspace ? 'h-screen overflow-hidden' : undefined}>
        {children}
      </main>
      {!isWorkspace && <MobileNav />}
    </>
  );
}
