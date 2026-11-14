'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { TopHeader } from '@/components/layout/TopHeader';
import { LeftNavigationRail } from '@/components/layout/LeftNavigationRail';
import { BottomNavigationRail } from '@/components/layout/BottomNavigationRail';
import { ComposeModal } from '@/components/compose/ComposeModal';
import { UndoSendToast } from '@/components/compose/UndoSendToast';
import { CommandPaletteModal } from '@/components/palette/CommandPaletteModal';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { ToastContainer } from '@/components/notifications/ToastContainer';
import { GlobalAlertDialog } from '@/components/ui/AlertDialog';
import { LiveEmailSyncBridge } from '@/components/layout/LiveEmailSyncBridge';
import { MailActionController } from '@/components/mail/MailActionController';
import { ROUTES } from '@/constants';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === ROUTES.LOGIN;

  if (isLoginPage) {
    return (
      <main className="flex-1 flex overflow-hidden relative w-full h-full bg-neutral-50 dark:bg-[#0a0a0a]">
        {children}
        <ToastContainer />
        <GlobalAlertDialog />
      </main>
    );
  }

  return (
    <>
      <MailActionController />
      <LiveEmailSyncBridge />
      <TopHeader />
      <OfflineBanner />
      <div className="flex-1 flex overflow-hidden">
        <LeftNavigationRail />
        <main className="flex-1 flex overflow-hidden relative">{children}</main>
      </div>
      <BottomNavigationRail />
      <ComposeModal />
      <UndoSendToast />
      <CommandPaletteModal />
      <ToastContainer />
      <GlobalAlertDialog />
    </>
  );
}
