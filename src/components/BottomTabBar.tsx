'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Home, FileText, User } from 'lucide-react';

type TabItem = {
  label: string;
  href: string;
  icon: typeof Home;
  isActive: (pathname: string, search: string) => boolean;
};

const tabs: TabItem[] = [
  {
    label: 'Главная',
    href: '/',
    icon: Home,
    isActive: (pathname) => pathname === '/',
  },
  {
    label: 'Резюме',
    href: '/workspace',
    icon: FileText,
    isActive: (pathname, search) => pathname.startsWith('/workspace') && !search.includes('tab='),
  },
  {
    label: 'Профиль',
    href: '/pricing',
    icon: User,
    isActive: (pathname) => pathname === '/pricing',
  },
];

// Вакансии (Jobs) таб удалён — см. задачу 1/3.

export default function BottomTabBar() {
  const [pathname, setPathname] = React.useState('/');
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
      setSearch(window.location.search);
    }
  }, []);

  // Update on popstate (back/forward navigation)
  React.useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
      setSearch(window.location.search);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe"
      style={{ touchAction: 'manipulation' }}
    >
      <div className="glass mx-2 mb-2 glow">
        <div
          role="tablist"
          aria-label="Mobile navigation"
          className="flex items-center justify-around py-2"
        >
          {tabs.map((tab) => {
            const isActive = tab.isActive(pathname, search);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                role="tab"
                aria-selected={isActive}
                className={cn(
                  'flex flex-col items-center justify-center gap-1',
                  'px-4 py-2 rounded-xl',
                  'min-w-[64px] min-h-[56px] active:scale-95 active:opacity-80',
                  isActive
                    ? 'text-[#6001d1] drop-shadow-[0_0_8px_rgba(96,1,209,0.6)]'
                    : 'text-[#c4c7c7] active:bg-white/5'
                )}
              >
                <Icon size={24} strokeWidth={isActive ? 2 : 1.5} className={cn(isActive && 'animate-bounce-in')} />
                <span className={cn("text-xs font-medium transition-colors", isActive ? "text-[#6001d1]" : "text-[#c4c7c7]")}>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
