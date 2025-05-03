import "./globals.css";

import { Suspense } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import NextTopLoader from 'nextjs-toploader';

import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { ModeToggle } from "@/components/themes/mode-toggle";

import { SiteConfig } from "@/constants/site";
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { ReportButton } from "@/components/common/report-feature";
import { Plus_Jakarta_Sans } from "next/font/google";

import ProviderTree from "@/components/ProviderTree";

const jakarta = Plus_Jakarta_Sans({
  weight: ['600',],
  style: ['normal'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta'
});


export const metadata = {
  title: SiteConfig.ServerName,
  description: SiteConfig.description,
  keywords: SiteConfig.Keywords,
  authors: [{ name: "airsend", url: "https://airsend.in" }],
  creator: "enjoys.in",
  metadataBase: new URL("https://enjoys.in"),
  openGraph: {
    title: SiteConfig.ServerName,
    description: SiteConfig.description,
    url: "https://airsend.in",
    siteName: SiteConfig.ServerName,
    images: [
      {
        url: "/navbar-logo.png",
        width: 1200,
        height: 630,
        alt: SiteConfig.ServerName,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SiteConfig.ServerName,
    description: SiteConfig.description,
    // site: "@",
    // creator: "@YourTwitterHandle",
    images: ["/navbar-logo.png"],
  },
  icons: {
    // icon: "/favicon/favicon-32x32.png",
    // shortcut: "/favicon/favicon-32x32.png",
    // apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/favicon/site.webmanifest",
  // themeColor: "#000000",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon/favicon-16x16.png" />
      <link rel="manifest" href="/favicon/site.webmanifest"></link>
      <body
        className={cn(jakarta.className,)} >
        <NextTopLoader color="#5a61ff" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <ProviderTree >

            <Suspense>
              <TooltipProvider delayDuration={0}>{children}</TooltipProvider>
            </Suspense>

            <SonnerToaster visibleToasts={5} />
            <Toaster />
            <ModeToggle />
            <ReportButton />
          </ProviderTree>
        </ThemeProvider>
      </body>
    </html>
  );
}
