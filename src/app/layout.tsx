import type { Metadata } from 'next';
import { Inter, Space_Grotesk as SpaceGrotesk } from 'next/font/google';
import './globals.css';
import BackgroundFX from '@/components/BackgroundFX';
import { Header } from '@/components/Header';

// Настройка шрифтов с CSS переменными
const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter' 
});

const grotesk = SpaceGrotesk({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-grotesk', // Используем '--font-grotesk' для консистентности
});

export const metadata: Metadata = {
  title: 'Resume Generator',
  description: 'AI CV builder',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Применяем переменные шрифтов к телу документа */}
      <body className={`${inter.variable} ${grotesk.variable} font-sans`}>
        {/* Компоненты, которые будут на всех страницах */}
        <BackgroundFX />
        <Header />
        
        {/* Основной контент страницы */}
        <main>{children}</main>
      </body>
    </html>
  );
}