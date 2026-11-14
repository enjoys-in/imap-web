'use client';

import React, { Suspense } from 'react';
import { MailList } from '../list/MailList';
import { ReadingPane, ReadingPaneSkeleton } from '../reading-pane';
import { ResizeHandle } from '@/components/ui/ResizeHandle';
import { ReadingPaneLayout } from '@/stores/useGeneralSettingsStore';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MailClientLayoutContentProps {
  readingPaneLayout: ReadingPaneLayout;
  hasSelectedMail: boolean;
  activeFolderId: string;
  activeMailId?: string;
  mailListWidth: number;
  mailListHeight: number;
  onSelectMail: (mailId: string) => void;
  onBackToList: () => void;
  onMailListResize: (deltaX: number) => void;
  onMailListVerticalResize: (deltaY: number) => void;
  onResetMailList: () => void;
  onResetMailListHeight: () => void;
}

export function MailClientLayoutContent({
  readingPaneLayout,
  hasSelectedMail,
  activeFolderId,
  activeMailId,
  mailListWidth,
  mailListHeight,
  onSelectMail,
  onBackToList,
  onMailListResize,
  onMailListVerticalResize,
  onResetMailList,
  onResetMailListHeight,
}: MailClientLayoutContentProps) {
  // 1. Bottom Layout: Mail list on top (wide table), reading pane on bottom (split vertically)
  if (readingPaneLayout === 'bottom') {
    return (
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-white dark:bg-neutral-900">
        {/* Top: Mail list */}
        <div
          className="w-full shrink-0 overflow-hidden flex flex-col border-b border-neutral-200 dark:border-neutral-800 min-h-[160px] max-h-[460px]"
          style={{ height: hasSelectedMail ? mailListHeight : '100%' }}
        >
          <MailList
            activeFolderId={activeFolderId}
            onSelectMail={onSelectMail}
            activeMailId={activeMailId}
            isWideLayout={true}
          />
        </div>

        {/* Horizontal Splitter */}
        {hasSelectedMail && (
          <ResizeHandle
            orientation="horizontal"
            onResize={onMailListVerticalResize}
            onDoubleClick={onResetMailListHeight}
          />
        )}

        {/* Bottom: Reading Pane */}
        {hasSelectedMail && (
          <div className="w-full flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden bg-white dark:bg-neutral-900">
            <Suspense fallback={<ReadingPaneSkeleton />}>
              <ReadingPane activeMailId={activeMailId} onBack={onBackToList} />
            </Suspense>
          </div>
        )}
      </div>
    );
  }

  // 2. Fill Screen Layout: Full width mail list OR full screen reading pane
  if (readingPaneLayout === 'fillScreen') {
    if (hasSelectedMail) {
      return (
        <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-white dark:bg-neutral-900">
          <div className="flex items-center gap-2 p-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850">
            <button
              onClick={onBackToList}
              className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to message list</span>
            </button>
          </div>
          <Suspense fallback={<ReadingPaneSkeleton />}>
            <ReadingPane activeMailId={activeMailId} onBack={onBackToList} />
          </Suspense>
        </div>
      );
    }

    return (
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-white dark:bg-neutral-900">
        <MailList
          activeFolderId={activeFolderId}
          onSelectMail={onSelectMail}
          activeMailId={undefined}
          isWideLayout={true}
        />
      </div>
    );
  }

  // 3. Popout Only Layout: Mail list always fills screen, reading happens in popout modal
  if (readingPaneLayout === 'popoutOnly') {
    return (
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-white dark:bg-neutral-900">
        <MailList
          activeFolderId={activeFolderId}
          onSelectMail={onSelectMail}
          activeMailId={activeMailId}
          isWideLayout={true}
        />
      </div>
    );
  }

  // 4. Right Layout (Default Outlook side-by-side): Mail list on left, reading pane on right
  return (
    <>
      {/* Mail List Container with max-w-[460px] */}
      <div
        className={cn(
          'flex flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 overflow-hidden min-w-[260px] max-w-[460px]',
          hasSelectedMail ? 'hidden md:flex' : 'flex w-full md:w-auto'
        )}
        style={{ width: mailListWidth }}
      >
        <MailList
          width={mailListWidth}
          activeFolderId={activeFolderId}
          onSelectMail={onSelectMail}
          activeMailId={activeMailId}
        />
      </div>

      {/* Resizer Handle between MailList and ReadingPane */}
      <ResizeHandle
        orientation="vertical"
        onResize={onMailListResize}
        onDoubleClick={onResetMailList}
        className="hidden md:block"
      />

      {/* Reading Pane Container with min-w-0 to prevent clipping/overflowing */}
      <div
        className={cn(
          'flex-1 min-w-0 flex flex-col h-full overflow-hidden bg-white dark:bg-neutral-900',
          !hasSelectedMail ? 'hidden md:flex' : 'flex'
        )}
      >
        {/* Mobile Back Button */}
        <div className="md:hidden flex items-center gap-2 p-2 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-850">
          <button
            onClick={onBackToList}
            className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-200 p-1.5 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Messages</span>
          </button>
        </div>

        <Suspense fallback={<ReadingPaneSkeleton />}>
          <ReadingPane activeMailId={activeMailId} onBack={onBackToList} />
        </Suspense>
      </div>
    </>
  );
}
