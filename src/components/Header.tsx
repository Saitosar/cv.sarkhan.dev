// src/components/Header.tsx
import Link from 'next/link';
import { Logo } from './Logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 p-2 md:p-4 pt-safe">
      <nav>
        <div className="glass-card flex items-center justify-between rounded-xl p-2 md:p-3 px-4 md:px-6">
          {/* Левая часть: Лого и Название */}
          <Link href="/" className="flex items-center space-x-2 md:space-x-4">
            <Logo />
            <span className="text-lg md:text-2xl font-bold text-white tracking-wider font-grotesk">
              CV Generator
            </span>
          </Link>

          {/* Правая часть: Кнопка Sign In - скрыта на мобильных */}
          <Link
            href="/signin"
            className="signin-button hidden md:block"
          >
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
}