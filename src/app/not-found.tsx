'use client';

import { Suspense } from 'react';
import Link from 'next/link';

function NotFoundContent() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="font-display text-6xl md:text-8xl text-white mb-4">404</h1>
      <h2 className="font-display text-2xl md:text-3xl text-[#e5e2e1] mb-4">
        Page not found
      </h2>
      <p className="text-[#e0e0e0] max-w-md mb-8 leading-relaxed">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="shimmer-bg inline-flex items-center gap-2 rounded-lg px-6 py-3 text-white font-semibold tap-feedback"
      >
        Back to home
      </Link>
    </main>
  );
}

export default function NotFound() {
  return (
    <Suspense fallback={<div className="flex min-h-[70vh] items-center justify-center text-white">Loading...</div>}>
      <NotFoundContent />
    </Suspense>
  );
}
