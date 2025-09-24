// src/components/Header.tsx
import Link from 'next/link';
import { Logo } from './Logo';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="mx-auto my-6 max-w-7xl p-4 rounded-2xl bg-black/20 backdrop-blur-lg border border-white/10">
        <div className="flex items-center justify-between px-4">
          {/* Левая часть: Лого и Название */}
          <Link href="/" className="flex items-center space-x-4">
            <Logo />
            <span className="text-2xl font-bold text-white tracking-wider font-grotesk">
              Resume Generator
            </span>
          </Link>

          {/* Правая часть: Кнопка Sign In */}
          <Link
            href="/signin"
            className="px-6 py-2.5 text-base font-medium text-white bg-white/10 rounded-full hover:bg-white/20 transition-colors duration-300"
          >
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  );
}