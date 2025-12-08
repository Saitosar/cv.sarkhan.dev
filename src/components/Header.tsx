// src/components/Header.tsx
import Link from 'next/link';
import { Logo } from './Logo';

export function Header() {
  return (
    <header className="sticky top-0 z-50 p-4">
      <nav>
        <div className="glass-card flex items-center justify-between rounded-xl p-3 px-6">
          {/* Левая часть: Лого и Название */}
          <Link href="/" className="flex items-center space-x-4">
            <Logo />
            <span className="text-2xl font-bold text-white tracking-wider font-grotesk">
              CV Generator
            </span>
          </Link>

          {/* Правая часть: Кнопка Sign In */}
          <Link
            href="/signin"
            className="signin-button"
          >
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
}