'use client';

import React from 'react';
import { AppearanceLivePreview } from './appearance/AppearanceLivePreview';
import { ThemeModeSelector } from './appearance/ThemeModeSelector';
import { AccentColorPicker } from './appearance/AccentColorPicker';
import { HeaderThemeSelector } from './appearance/HeaderThemeSelector';
import { DisplayDensitySelector } from './appearance/DisplayDensitySelector';
import { TypographySelector } from './appearance/TypographySelector';
import { MessageListAppearanceSection } from './appearance/MessageListAppearanceSection';
import { MessageListStylingSection } from './appearance/MessageListStylingSection';
import { SidebarAppearanceSection } from './appearance/SidebarAppearanceSection';
import { EmailReaderAppearanceSection } from './appearance/EmailReaderAppearanceSection';
import { ReadingPaneQuickSelector } from './appearance/ReadingPaneQuickSelector';

export function AppearanceSettingsView() {
  return (
    <div className="space-y-7 max-w-4xl text-neutral-800 dark:text-neutral-100 pb-16">
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b]">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Appearance & Themes
        </h2>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
          Customize themes, colors, typography, density, and layout styling across AirSend.
        </p>
      </div>

      {/* Live Preview */}
      <AppearanceLivePreview />

      {/* 1. Theme Mode */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80">
        <ThemeModeSelector />
      </div>

      {/* 2. Accent Color Palette */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80">
        <AccentColorPicker />
      </div>

      {/* 3. Top Header Theme */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80">
        <HeaderThemeSelector />
      </div>

      {/* 4. Display Density */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80">
        <DisplayDensitySelector />
      </div>

      {/* 5. Typography & Font Scale */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80">
        <TypographySelector />
      </div>

      {/* 6. Message List Snippets & Avatars */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80">
        <MessageListAppearanceSection />
      </div>

      {/* 7. Message List Styling & Prominence */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80">
        <MessageListStylingSection />
      </div>

      {/* 8. Folder Sidebar Mode & Badges */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80">
        <SidebarAppearanceSection />
      </div>

      {/* 9. Email Reader HTML View */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80">
        <EmailReaderAppearanceSection />
      </div>

      {/* 10. Reading Pane Layout */}
      <div className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-[#1a1a1a]/80">
        <ReadingPaneQuickSelector />
      </div>
    </div>
  );
}
