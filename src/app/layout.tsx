import type { Metadata } from 'next';
import { Inter, Space_Grotesk as SpaceGrotesk } from 'next/font/google';
import './globals.css';
import BackgroundFX from '@/components/BackgroundFX';
import { Header } from '@/components/Header';
import { MobileNav } from '@/components/MobileNav';

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
  title: 'AI Resume Intelligence',
  description: 'Professional AI-powered resume builder with ATS optimization',
  applicationName: 'CV Builder',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'CV Builder',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'AI Resume Intelligence',
    title: 'AI Resume Intelligence',
    description: 'Professional AI-powered resume builder',
  },
  manifest: '/manifest.json',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0b0f19',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-icon-180.png" />
        <link rel="icon" type="image/png" sizes="196x196" href="/favicon-196.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/manifest-icon-192.maskable.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/manifest-icon-512.maskable.png" />
      </head>
      {/* Применяем переменные шрифтов к телу документа */}
      <body className={`${inter.variable} ${grotesk.variable} font-sans pb-20 md:pb-0`}>
        {/* Компоненты, которые будут на всех страницах */}
        <BackgroundFX />
        <Header />

        {/* Основной контент страницы */}
        <main>{children}</main>

        {/* Мобильная навигация внизу */}
        <MobileNav />
      </body>
    </html>
  );
}