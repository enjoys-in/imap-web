import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ConfigProvider } from "@/components/providers/ConfigProvider";
import { getClientSafeConfig } from "@/config/env";
import { AppShell } from "@/components/layout/AppShell";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AirSend - Modern Web Mail, Calendar & Productivity Client",
  description:
    "AirSend is a high-performance web mail, calendar, and productivity client with seamless IMAP/SMTP support.",
  applicationName: "AirSend - by Enjoys In",
  icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
  manifest: "/manifest.json",
};

const THEME_SCRIPT = `try{const t=localStorage.getItem('airsend_theme')||'dark';if(t==='light'){document.documentElement.classList.remove('dark')}else{document.documentElement.classList.add('dark')}}catch(_){}`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
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
      </head>
      <body className="h-full overflow-hidden flex flex-col bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 transition-colors duration-150">
        <ConfigProvider initialConfig={initialConfig}>
          <QueryProvider>
            <SessionProvider>
              <AppShell>{children}</AppShell>
            </SessionProvider>
          </QueryProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
