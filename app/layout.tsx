import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AppProvider } from '@/components/AppProvider';

export const metadata: Metadata = {
  title: 'PRESCRIBE FIT',
  description: 'OpenAIが夕食と筋トレを提案するフィットネスWebアプリ',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/icons/icon-192.png']
  },
  appleWebApp: {
    capable: true,
    title: 'PRESCRIBE FIT',
    statusBarStyle: 'default'
  },
  openGraph: {
    title: 'PRESCRIBE FIT',
    description: 'OpenAIが夕食と筋トレを提案するフィットネスWebアプリ',
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: '#0891b2'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
