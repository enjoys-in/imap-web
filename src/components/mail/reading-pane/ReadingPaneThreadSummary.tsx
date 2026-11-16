'use client';

import React, { useState, useMemo } from 'react';
import { Sparkles, ChevronDown, CheckSquare, ListOrdered, Copy, Check } from 'lucide-react';
import { extractThreadSummary, ThreadSummaryResult } from '@/lib/threadSummary';
import { useToastStore } from '@/stores/useToastStore';
import { cn } from '@/lib/utils';

interface ReadingPaneThreadSummaryProps {
  emailId: string;
  subject?: string;
  bodyText?: string;
  bodyHtml?: string;
  threadCount?: number;
}

export function ReadingPaneThreadSummary({
  emailId,
  subject,
  bodyText,
  bodyHtml,
  threadCount,
}: ReadingPaneThreadSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const addToast = useToastStore((s) => s.addToast);

  const summary = useMemo<ThreadSummaryResult | null>(() => {
    return extractThreadSummary(subject, bodyText, bodyHtml);
  }, [subject, bodyText, bodyHtml]);

  if (!summary) return null;

  const handleCopy = () => {
    const textToCopy = `📋 Summary for "${subject || 'Email'}":\n\nKey Points:\n${summary.summaryPoints
      .map((p) => `• ${p}`)
      .join('\n')}\n\nAction Items:\n${summary.actionItems
      .map((a) => `[ ] ${a}`)
      .join('\n')}`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    addToast({
      title: 'Summary copied',
      description: 'Copied key points and action items to clipboard.',
      type: 'success',
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="mx-4 my-2.5 rounded-xl border border-indigo-200/80 dark:border-indigo-900/60 bg-gradient-to-r from-indigo-50/80 via-purple-50/40 to-neutral-50/80 dark:from-indigo-950/30 dark:via-purple-950/20 dark:to-neutral-900/60 overflow-hidden shadow-2xs transition-all duration-200">
      {/* Header bar */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="p-3 flex items-center justify-between cursor-pointer hover:bg-black/2 dark:hover:bg-white/2 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Key Points &amp; Action Items
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                {summary.actionItems.length} tasks
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
              {summary.summaryPoints[0]}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer px-2 py-1 rounded"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <ChevronDown
            className={cn(
              'w-4 h-4 text-neutral-400 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-indigo-100/80 dark:border-indigo-900/40 space-y-3 animate-in fade-in duration-150">
          {summary.summaryPoints.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                <ListOrdered className="w-3 h-3 text-indigo-500" />
                <span>Discussion Highlights</span>
              </div>
              <ul className="space-y-1 pl-4 list-disc text-xs text-neutral-700 dark:text-neutral-300">
                {summary.summaryPoints.map((pt, idx) => (
                  <li key={idx} className="leading-relaxed">
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.actionItems.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                <CheckSquare className="w-3 h-3 text-emerald-500" />
                <span>Detected Action Items</span>
              </div>
              <div className="space-y-1.5">
                {summary.actionItems.map((act, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-white/70 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/50 flex items-start gap-2 text-xs text-neutral-800 dark:text-neutral-200"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span className="flex-1 leading-snug">{act}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
