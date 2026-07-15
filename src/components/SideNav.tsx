'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { X, Menu, LayoutDashboard, FileText, Briefcase, BarChart3 } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

type NavItem = {
  label: string;
  icon: React.ReactNode;
  href: string;
  isActive: (pathname: string, tab: string | null) => boolean;
};

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <LayoutDashboard size={18} />,
    href: '/',
    isActive: (pathname) => pathname === '/',
  },
  {
    label: 'Resumes',
    icon: <FileText size={18} />,
    href: '/workspace',
    isActive: (pathname, tab) => pathname.startsWith('/workspace') && !tab,
  },
  {
    label: 'Jobs',
    icon: <Briefcase size={18} />,
    href: '/workspace?tab=jobs',
    isActive: (pathname, tab) => pathname.startsWith('/workspace') && tab === 'jobs',
  },
  {
    label: 'Insights',
    icon: <BarChart3 size={18} />,
    href: '/workspace?tab=insights',
    isActive: (pathname, tab) => pathname.startsWith('/workspace') && tab === 'insights',
  },
];

export function SideNav() {
  const [pathname, setPathname] = React.useState('/');
  // Parse search params manually to avoid useSearchParams() Suspense boundary delay
  const [tab, setTab] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
      setTab(new URLSearchParams(window.location.search).get('tab'));
    }
  }, []);
  // Also update on popstate (back/forward navigation)
  React.useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
      setTab(new URLSearchParams(window.location.search).get('tab'));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
  const [isOpen, setIsOpen] = React.useState(false);

  // Close SideNav on route change (mobile)
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Prevent body scroll when SideNav is open on mobile
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger button — visible on mobile only */}
      <button
        type="button"
        aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className={cn("fixed top-4 left-4 z-[60] flex md:hidden items-center justify-center w-10 h-10 rounded-xl bg-[#1c1b1b] border border-[rgba(255,255,255,0.08)] text-[#e5e2e1] hover:bg-[#353434] shadow-lg touch-manipulation", isOpen && 'opacity-0 pointer-events-none')}
      >
        {<Menu size={20} />}
      </button>

      {/* Overlay backdrop — visible on mobile when SideNav is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* SideNav */}
      <nav
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-72 flex-col gap-4 border-r border-[rgba(255,255,255,0.08)] bg-[#1c1b1b] py-8 shadow-2xl will-change-transform',
          // Desktop: always visible
          'md:flex',
          // Mobile: slide in/out — use hidden for instant hide, flex for show
          isOpen ? 'flex translate-x-0' : 'hidden -translate-x-full md:flex md:translate-x-0'
        )}
        aria-label="Main navigation"
      >
        <div className="mb-8 px-6">
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[rgba(255,255,255,0.08)] bg-gradient-to-br from-[#6001d1] to-[#4F46E5]">
              <span className="text-lg font-bold text-white">AI</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold tracking-tight text-[#e5e2e1]">Career AI</h1>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
          {/* New Resume button hidden for now */}
        </div>

        {/* Close button — visible on mobile only */}
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 flex md:hidden items-center justify-center w-8 h-8 rounded-lg text-[#c4c7c7] hover:text-[#e5e2e1] hover:bg-[#353434] touch-manipulation"
        >
          <X size={18} />
        </button>

        <div className="flex flex-1 flex-col gap-2 px-2">
          {navItems.map((item) => {
            const active = item.isActive(pathname, tab);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'mx-2 flex items-center gap-3 rounded-lg px-4 py-3',
                  active
                    ? 'bg-[#6001d1] text-white'
                    : 'text-[#c4c7c7] hover:bg-[#353434] hover:text-[#e5e2e1]'
                )}
                aria-current={active ? 'page' : undefined}
              >
                <span className={active ? 'text-white' : 'text-[#c4c7c7]'}>
                  {item.icon}
                </span>
                <span className="text-[12px] font-semibold uppercase tracking-[0.1em]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}