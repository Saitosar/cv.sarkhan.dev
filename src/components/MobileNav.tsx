'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PenLine, FolderUp } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/create', label: 'Create', icon: PenLine },
    { href: '/update', label: 'Update', icon: FolderUp },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="glass-card mx-2 mb-2 rounded-2xl">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center justify-center gap-1
                  px-4 py-2 rounded-xl transition-all duration-200
                  min-w-[64px] min-h-[56px]
                  ${isActive
                    ? 'bg-white/10 text-cyan-400'
                    : 'text-gray-400 active:bg-white/5'
                  }
                `}
              >
                <Icon
                  size={24}
                  strokeWidth={1.5}
                  className={isActive ? 'animate-bounce-in' : ''}
                />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
