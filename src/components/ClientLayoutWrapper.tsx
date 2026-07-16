'use client';

import * as React from 'react';
import BackgroundFX from '@/components/BackgroundFX';
import { MobileNav } from '@/components/MobileNav';

export default function ClientLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isTelegram, setIsTelegram] = React.useState(false);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTelegram(window.location.pathname.startsWith('/telegram'));
    }
  }, []);

  if (isTelegram) {
    return <>{children}</>;
  }

  return (
    <>
      <BackgroundFX />
      <main className="ml-0 md:ml-72">
        {children}
      </main>
    </>
  );
}