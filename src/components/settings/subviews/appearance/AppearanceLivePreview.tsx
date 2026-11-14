'use client';

import React from 'react';
import { Eye, Star, Paperclip, Send } from 'lucide-react';
import { useGeneralSettingsStore, HeaderTheme } from '@/stores/useGeneralSettingsStore';
import { cn } from '@/lib/utils';

const HEADER_THEME_GRADIENTS: Record<HeaderTheme, string> = {
  classic: 'from-[#004578] via-[#005a9e] to-[#003056]',
  sunset: 'from-[#782800] via-[#9e3f00] to-[#560020]',
  ocean: 'from-[#004d61] via-[#006680] to-[#002f3d]',
  circuit: 'from-[#1f242b] via-[#2a303c] to-[#14171c]',
  aurora: 'from-[#004d40] via-[#00695c] to-[#00332c]',
};

export function AppearanceLivePreview() {
  const density = useGeneralSettingsStore((s) => s.density || 'comfortable');
  const accentColor = useGeneralSettingsStore((s) => s.accentColor || '#0078d4');
  const previewLines = useGeneralSettingsStore((s) => s.previewLines ?? 1);
  const showAvatars = useGeneralSettingsStore((s) => s.showAvatars ?? true);
  const headerTheme = useGeneralSettingsStore((s) => s.headerTheme || 'classic');
  const fontSize = useGeneralSettingsStore((s) => s.fontSize || 'medium');
  const fontFamily = useGeneralSettingsStore((s) => s.fontFamily || 'system');
  const senderProminence = useGeneralSettingsStore((s) => s.senderProminence || 'senderFirst');
  const dateDisplayFormat = useGeneralSettingsStore((s) => s.dateDisplayFormat || 'relative');
  const unreadIndicatorStyle = useGeneralSettingsStore((s) => s.unreadIndicatorStyle || 'dot');

  const isCompact = density === 'compact';
  const headerGradient = HEADER_THEME_GRADIENTS[headerTheme] || HEADER_THEME_GRADIENTS.classic;

  const fontClass =
    fontFamily === 'serif' ? 'font-serif' : fontFamily === 'mono' ? 'font-mono' : 'font-sans';

  const textScaleClass =
    fontSize === 'small' ? 'text-[11px]' : fontSize === 'large' ? 'text-sm' : 'text-xs';

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5">
        <Eye className="w-3.5 h-3.5 text-neutral-500" />
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-xs">
          Live Interactive Preview
        </h3>
      </div>

      <div className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-100/60 dark:bg-[#151515] p-3 space-y-2">
        {/* Header Preview Strip */}
        <div
          className={cn(
            'h-6 rounded-md bg-gradient-to-r flex items-center px-2.5 gap-2 text-white shadow-xs transition-colors duration-300',
            headerGradient
          )}
        >
          <Send className="w-2.5 h-2.5 -rotate-12" />
          <span className="text-[10px] font-semibold tracking-tight">AirSend Top Navigation</span>
        </div>

        {/* Message Item Preview */}
        <div
          className={cn(
            'rounded-md border bg-white dark:bg-[#202020] shadow-xs transition-all relative overflow-hidden',
            fontClass,
            isCompact ? 'p-2' : 'p-3'
          )}
          style={
            unreadIndicatorStyle === 'border'
              ? { borderLeftWidth: '3px', borderLeftColor: accentColor }
              : undefined
          }
        >
          <div className="flex items-start gap-2.5">
            {unreadIndicatorStyle === 'dot' && (
              <span
                className="w-2 h-2 rounded-full shrink-0 mt-1.5 animate-pulse"
                style={{ backgroundColor: accentColor }}
              />
            )}

            {showAvatars && (
              <div
                className={cn(
                  'rounded-full flex items-center justify-center font-bold text-white shrink-0 shadow-xs',
                  isCompact ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'
                )}
                style={{ backgroundColor: accentColor }}
              >
                AS
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    textScaleClass,
                    senderProminence === 'senderFirst'
                      ? 'font-bold text-neutral-900 dark:text-neutral-100'
                      : 'text-neutral-600 dark:text-neutral-400 font-normal',
                    'truncate'
                  )}
                >
                  AirSend Product Team
                </span>
                <span className="text-[10px] text-neutral-500 shrink-0">
                  {dateDisplayFormat === 'relative' ? '5m ago' : '10:42 AM'}
                </span>
              </div>

              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={cn(
                    textScaleClass,
                    senderProminence === 'subjectFirst'
                      ? 'font-bold text-neutral-900 dark:text-neutral-100'
                      : 'font-medium text-neutral-800 dark:text-neutral-200',
                    unreadIndicatorStyle === 'bold' && 'font-bold text-neutral-950 dark:text-white',
                    'truncate'
                  )}
                >
                  Welcome to your customized AirSend workspace
                </span>
                <Paperclip className="w-3 h-3 text-neutral-400 shrink-0" />
                <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
              </div>

              {previewLines > 0 && (
                <p
                  className={cn(
                    'text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 leading-snug',
                    previewLines === 1 && 'line-clamp-1',
                    previewLines === 2 && 'line-clamp-2',
                    previewLines === 3 && 'line-clamp-3'
                  )}
                >
                  Here is a preview of how your emails appear in the message list with your chosen density, accent highlight, typography, and preview lines.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
