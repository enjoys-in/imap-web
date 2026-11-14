'use client';

import React, { useMemo, useEffect, useRef, useState } from 'react';
import { sanitizeEmailHtml } from '@/lib/sanitizeHtml';
import { useUiStore } from '@/stores';
import { Sun, Moon } from 'lucide-react';

interface SandboxedEmailBodyProps {
  bodyHtml?: string;
  bodyText?: string;
  allowExternalImages?: boolean;
}

export function SandboxedEmailBody({
  bodyHtml,
  bodyText,
  allowExternalImages = false,
}: SandboxedEmailBodyProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const theme = useUiStore((s) => s.theme);
  const [invertLight, setInvertLight] = useState(false);

  // Sync properly with store theme
  const isDark = theme === 'dark' ? !invertLight : invertLight;

  const sanitizedContent = useMemo(() => {
    if (bodyHtml) {
      return sanitizeEmailHtml(bodyHtml, { allowExternalImages });
    }
    if (bodyText) {
      return `<pre style="font-family: inherit; white-space: pre-wrap; word-break: break-word;">${bodyText}</pre>`;
    }
    return '<p style="color: #888; font-style: italic;">No body content</p>';
  }, [bodyHtml, bodyText, allowExternalImages]);

  const srcDoc = useMemo(() => {
    const bg = isDark ? '#1f1f1f' : '#ffffff';
    const text = isDark ? '#e5e5e5' : '#242424';
    const link = isDark ? '#5599dd' : '#0078d4';
    const quote = isDark ? '#404040' : '#d1d5db';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
            * { box-sizing: border-box; }
            html, body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              font-size: 13.5px;
              line-height: 1.6;
              color: ${text} !important;
              background-color: ${bg} !important;
              margin: 0;
              padding: 16px;
              word-break: break-word;
              overflow-x: auto;
            }
            img { max-width: 100%; height: auto; }
            table { max-width: 100% !important; border-collapse: collapse; }
            pre { max-width: 100%; white-space: pre-wrap; word-break: break-word; }
            a { color: ${link} !important; text-decoration: underline; }
            blockquote { border-left: 3px solid ${quote}; margin-left: 0; padding-left: 12px; }
            p { margin: 0 0 12px 0; }
          </style>
        </head>
        <body>
          ${sanitizedContent}
        </body>
      </html>
    `;
  }, [sanitizedContent, isDark]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          const height = doc.documentElement.scrollHeight || doc.body.scrollHeight;
          iframe.style.height = `${Math.max(height + 24, 180)}px`;
        }
      } catch {
        // Fallback
      }
    };

    iframe.addEventListener('load', handleLoad);
    return () => iframe.removeEventListener('load', handleLoad);
  }, [srcDoc]);

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#1f1f1f] p-2 relative group select-text transition-colors">
      <button
        onClick={() => setInvertLight((v) => !v)}
        className="absolute top-3 right-4 z-10 px-2 py-1 text-[11px] bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300 dark:bg-[#292929] dark:hover:bg-[#383838] dark:text-neutral-300 dark:border-neutral-700 rounded border shadow-xs flex items-center gap-1 transition-opacity opacity-70 hover:opacity-100 cursor-pointer select-none"
        title={isDark ? 'View on light background' : 'View on dark background'}
      >
        {isDark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
        <span>{isDark ? 'Light' : 'Dark'}</span>
      </button>

      <iframe
        ref={iframeRef}
        title="Email content"
        srcDoc={srcDoc}
        sandbox="allow-popups allow-popups-to-escape-sandbox"
        className="w-full border-0 min-h-[260px] bg-white dark:bg-[#1f1f1f] transition-colors"
      />
    </div>
  );
}
