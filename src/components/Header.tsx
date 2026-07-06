// src/components/Header.tsx
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { Logo } from './Logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 p-2 md:p-4 pt-safe">
      <nav>
        <div className="glass-card flex items-center justify-between rounded-xl p-2 md:p-3 px-4 md:px-6">
          {/* Левая часть: Лого и Название */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-4">
            <Logo />
            <span className="text-lg md:text-2xl font-bold text-white tracking-wider font-geist">
              CV Generator
            </span>
          </Link>

          {/* Правая часть: Кнопка Sign In */}
          <Link
            href="/signin"
            className="signin-button hidden md:block"
          >
            Sign In
          </Link>

          {/* Мобильная иконка входа */}
          <Link
            href="/signin"
            aria-label="Sign In"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-[rgba(146,204,255,0.55)] text-[#cfe4fa] active:scale-95 active:opacity-80 transition-all"
          >
            <LogIn size={20} />
          </Link>
        </div>
      </nav>
    </header>
  );
}