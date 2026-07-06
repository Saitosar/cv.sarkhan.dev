import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CV Builder — Telegram',
  description: 'Build and optimize your resume inside Telegram',
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
    title: 'CV Builder — Telegram',
    description: 'Build and optimize your resume inside Telegram',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0b0f19',
};

export default function TelegramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // No header, no nav, no background effects — full-height Telegram WebView wrapper.
    <div className="h-screen w-screen overflow-hidden" style={{ backgroundColor: 'var(--tg-bg, #0b0f19)' }}>
      {children}
    </div>
  );
}
