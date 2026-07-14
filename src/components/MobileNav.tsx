'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Sparkles } from 'lucide-react';

export function MobileNav() {
  const pathname = usePathname();

  // Workspace has its own MobileTabBar inside SplitScreen; avoid double bottom bars.
  if (pathname.startsWith('/workspace')) {
    return null;
  }

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/workspace', label: 'Workspace', icon: Sparkles },
    { href: '/pricing', label: 'Pricing', icon: Briefcase },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 pb-safe">
      <div className="glass mx-2 mb-2 glow">
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
                    ? 'text-[#6001d1] drop-shadow-[0_0_8px_rgba(96,1,209,0.6)]'
                    : 'text-[#c4c7c7] active:bg-white/5'
                  }
                `}
              >
                <Icon
                  size={24}
                  strokeWidth={isActive ? 2 : 1.5}
                  className={isActive ? 'animate-bounce-in' : ''}
                />
                <span className={`text-xs font-medium transition-colors ${isActive ? 'text-[#6001d1]' : 'text-[#c4c7c7]'}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
