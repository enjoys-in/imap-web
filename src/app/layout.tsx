import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ConfigProvider } from '@/components/providers/ConfigProvider';
import { getClientSafeConfig } from '@/config/env';
import { TopHeader } from '@/components/layout/TopHeader';
import { LeftNavigationRail } from '@/components/layout/LeftNavigationRail';
import { BottomNavigationRail } from '@/components/layout/BottomNavigationRail';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { ToastContainer } from '@/components/notifications/ToastContainer';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AirSend — Modern Web Mail, Calendar & Productivity Client',
  description:
    'AirSend is a high-performance web mail, calendar, and productivity client with seamless IMAP/SMTP and Microsoft 365 support.',
  applicationName: 'AirSend',
  authors: [{ name: 'AirSend Team', url: 'https://airsend.in' }],
  keywords: [
    'AirSend',
    'Web Mail',
    'IMAP Client',
    'SMTP',
    'Outlook Alternative',
    'Email Client',
    'Webmail',
    'Calendar',
    'Email Threading',
  ],
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  manifest: '/manifest.json',
};

const THEME_SCRIPT = `try{const t=localStorage.getItem('airsend_theme')||'dark';if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(_){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialConfig = getClientSafeConfig();

  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script src="/config.js" />
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <link rel="canonical" href="https://airsend.in" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="AirSend" />
        <meta property="og:title" content="AirSend — Modern Web Mail, Calendar & Productivity Client" />
        <meta property="og:description" content="High-performance, privacy-first web mail and calendar client with full IMAP/SMTP synchronization." />
        <meta property="og:url" content="https://airsend.in" />
        <meta property="og:image" content="https://airsend.in/icon.svg" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@airsend_in" />
        <meta name="twitter:title" content="AirSend — Modern Web Mail & Productivity" />
        <meta name="twitter:description" content="High-performance web mail and calendar with IMAP/SMTP synchronization." />
        <meta name="twitter:image" content="https://airsend.in/icon.svg" />
      </head>
      <body className="h-full overflow-hidden flex flex-col bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-150">
        <ConfigProvider initialConfig={initialConfig}>
          <QueryProvider>
            <SessionProvider>
              <TopHeader />
              <div className="flex-1 flex overflow-hidden">
                <LeftNavigationRail />
                <main className="flex-1 flex overflow-hidden relative">{children}</main>
              </div>
              <BottomNavigationRail />
              <ComposeModal />
              <ToastContainer />
            </SessionProvider>
          </QueryProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
