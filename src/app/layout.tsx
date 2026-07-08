import type { Metadata } from 'next';
import { Inter, Geist } from 'next/font/google';
import './globals.css';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import { ThemeProvider } from '@/components/ThemeProvider';

// Body font - Inter for excellent readability
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Alternative body font - Geist (modern, clean)
const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
});

// Display font - Inter Tight for headings (powerful, modern)
const interTight = Inter({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/apple-icon-180.png" />
        <link rel="icon" type="image/png" sizes="196x196" href="/favicon-196.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/manifest-icon-192.maskable.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/manifest-icon-512.maskable.png" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      {/* Применяем переменные шрифтов к телу документа */}
      <body className={`${inter.variable} ${geist.variable} ${interTight.variable} font-sans pb-20 md:pb-0`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="cv-theme"
        >
          <ClientLayoutWrapper>{children}</ClientLayoutWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
