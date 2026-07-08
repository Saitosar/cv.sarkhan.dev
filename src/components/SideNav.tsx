'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavItem = {
  label: string;
  icon: string;
  href: string;
  isActive: (pathname: string, searchParams: URLSearchParams) => boolean;
};

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: 'dashboard',
    href: '/',
    isActive: (pathname) => pathname === '/',
  },
  {
    label: 'Resumes',
    icon: 'description',
    href: '/workspace',
    isActive: (pathname, searchParams) => pathname.startsWith('/workspace') && !searchParams.get('tab'),
  },
  {
    label: 'Jobs',
    icon: 'work',
    href: '/workspace?tab=jobs',
    isActive: (pathname, searchParams) => pathname.startsWith('/workspace') && searchParams.get('tab') === 'jobs',
  },
  {
    label: 'Insights',
    icon: 'insights',
    href: '/workspace?tab=insights',
    isActive: (pathname, searchParams) => pathname.startsWith('/workspace') && searchParams.get('tab') === 'insights',
  },
];

export function SideNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <nav
      className="fixed left-0 top-0 z-50 hidden h-screen w-72 flex-col gap-4 border-r border-[rgba(255,255,255,0.08)] bg-[#1c1b1b] py-8 shadow-2xl backdrop-blur-xl md:flex"
      aria-label="Main navigation"
    >
      <div className="mb-8 px-6">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-[#6001d1] to-[#4F46E5]">
            <span className="text-lg font-bold text-white">AI</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e1]">Career AI</h1>
            <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#d2bbff]">
              Expert Mode
            </span>
          </div>
        </div>
        <button
          type="button"
          className="shimmer-bg flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold text-[#e5e2e1] transition-transform active:scale-[0.98]"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            add
          </span>
          New Resume
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-2 px-2">
        {navItems.map((item) => {
          const active = item.isActive(pathname, searchParams);
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                'mx-2 flex items-center gap-3 rounded-lg px-4 py-3 transition-all',
                active
                  ? 'bg-[#6001d1] text-white'
                  : 'text-[#c4c7c7] hover:bg-[#353434] hover:text-[#e5e2e1]'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <span
                className="material-symbols-outlined"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {item.icon}
              </span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.1em]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
