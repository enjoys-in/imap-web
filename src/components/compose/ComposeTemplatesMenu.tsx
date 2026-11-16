'use client';

import React, { useState, useRef, useEffect } from 'react';
import { LayoutTemplate, Plus, Trash2, Check, Sparkles, FileText, X } from 'lucide-react';
import { useEmailTemplatesStore, replaceTemplateVariables, EmailTemplate } from '@/stores/useEmailTemplatesStore';
import { useComposeStore } from '@/stores';
import { useSession } from '@/components/providers/SessionProvider';
import { useToastStore } from '@/stores/useToastStore';

export function ComposeTemplatesMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSavingCustom, setIsSavingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  const templates = useEmailTemplatesStore((s) => s.templates);
  const addTemplate = useEmailTemplatesStore((s) => s.addTemplate);
  const deleteTemplate = useEmailTemplatesStore((s) => s.deleteTemplate);

  const to = useComposeStore((s) => s.to);
  const subject = useComposeStore((s) => s.subject);
  const body = useComposeStore((s) => s.body);
  const updateFields = useComposeStore((s) => s.updateFields);

  const { user, account } = useSession();
  const addToast = useToastStore((s) => s.addToast);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsSavingCustom(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleApplyTemplate = (tmpl: EmailTemplate) => {
    // Extract first name from recipient
    const recipientRaw = to.split(/[,;<]/)[0].replace(/['"]/g, '').trim();
    const recipientName = recipientRaw.includes('@') ? recipientRaw.split('@')[0] : recipientRaw;
    const senderName = user?.display_name || account?.displayName || account?.email?.split('@')[0] || '';

    const filledBody = replaceTemplateVariables(tmpl.body, {
      recipientName: recipientName || undefined,
      senderName,
      subject: subject || undefined,
    });

    const newBody = body ? `${body.trimEnd()}\n\n${filledBody}` : filledBody;
    updateFields({
      body: newBody,
      subject: subject || tmpl.subject || subject,
    });

    addToast({
      title: 'Template inserted',
      description: `Applied "${tmpl.name}" with personalized placeholders.`,
      type: 'success',
    });

    setIsOpen(false);
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !body.trim()) return;

    addTemplate(customName.trim(), body, customDesc.trim(), subject);
    addToast({
      title: 'Template saved',
      description: `Saved "${customName}" to your template library.`,
      type: 'success',
    });
    setCustomName('');
    setCustomDesc('');
    setIsSavingCustom(false);
  };

  return (
    <div ref={menuRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        title="Email templates & quick parts"
        className="h-7 px-2.5 rounded bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
      >
        <LayoutTemplate className="w-3.5 h-3.5 text-indigo-500" />
        <span className="hidden sm:inline">Templates</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-1 w-80 bg-white dark:bg-[#222222] border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-2xl p-3 z-50 text-xs text-neutral-800 dark:text-neutral-200 animate-in fade-in zoom-in-95 duration-100 space-y-2.5">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-bold text-neutral-900 dark:text-neutral-100 text-[11px] uppercase tracking-wider">
                Email Templates
              </span>
            </div>
            {!isSavingCustom && (
              <button
                type="button"
                onClick={() => setIsSavingCustom(true)}
                disabled={!body.trim()}
                title={body.trim() ? 'Save current message as template' : 'Type message first to save'}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-3 h-3" />
                <span>Save Draft as Template</span>
              </button>
            )}
          </div>

          {isSavingCustom ? (
            <form onSubmit={handleSaveCustom} className="space-y-2 p-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                  Save Template
                </span>
                <button
                  type="button"
                  onClick={() => setIsSavingCustom(false)}
                  className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Template name (e.g. Sales Intro)"
                className="w-full text-xs px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                required
              />
              <input
                type="text"
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Brief description (optional)"
                className="w-full text-xs px-2.5 py-1.5 bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsSavingCustom(false)}
                  className="px-2.5 py-1 rounded text-xs text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {templates.map((tmpl) => (
                <div
                  key={tmpl.id}
                  className="group relative p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700/60 bg-neutral-50/70 dark:bg-neutral-800/40 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 hover:border-indigo-200 dark:hover:border-indigo-800/80 transition-all cursor-pointer flex items-start justify-between gap-2"
                  onClick={() => handleApplyTemplate(tmpl)}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100 truncate">
                        {tmpl.name}
                      </span>
                      {tmpl.isCustom && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                      {tmpl.description}
                    </p>
                  </div>

                  {tmpl.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTemplate(tmpl.id);
                      }}
                      title="Delete template"
                      className="opacity-0 group-hover:opacity-100 p-1 text-neutral-400 hover:text-red-600 rounded transition-opacity cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
