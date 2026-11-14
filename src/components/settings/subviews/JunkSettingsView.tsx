'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useToastStore } from '@/stores';

type SpamSensitivity = 'low' | 'standard' | 'high' | 'exclusive';
type SpamAction = 'move_to_junk' | 'delete_permanently' | 'mark_subject';

export function JunkSettingsView() {
  const [sensitivity, setSensitivity] = useState<SpamSensitivity>('standard');
  const [spamAction, setSpamAction] = useState<SpamAction>('move_to_junk');
  const [verifyAuth, setVerifyAuth] = useState(true);
  const [blockLookalikes, setBlockLookalikes] = useState(true);
  const [trustHeaders, setTrustHeaders] = useState(true);
  const [trustContacts, setTrustContacts] = useState(true);
  const [isTraining, setIsTraining] = useState(false);

  const [blocked, setBlocked] = useState<string[]>([]);
  const [safe, setSafe] = useState<string[]>([]);
  const [newBlocked, setNewBlocked] = useState('');
  const [newSafe, setNewSafe] = useState('');
  const addToast = useToastStore((s) => s.addToast);

  const handleAddBlocked = () => {
    if (!newBlocked.trim() || blocked.includes(newBlocked.trim())) return;
    setBlocked((prev) => [...prev, newBlocked.trim()]);
    setNewBlocked('');
    addToast({
      title: 'Sender blocked',
      description: 'Incoming emails will be routed straight to Junk or deleted.',
      type: 'info',
    });
  };

  const handleRemoveBlocked = (email: string) => {
    setBlocked((prev) => prev.filter((b) => b !== email));
    addToast({ title: 'Sender unblocked', description: `${email} removed from blocklist.`, type: 'info' });
  };

  const handleAddSafe = () => {
    if (!newSafe.trim() || safe.includes(newSafe.trim())) return;
    setSafe((prev) => [...prev, newSafe.trim()]);
    setNewSafe('');
    addToast({
      title: 'Safe sender added',
      description: 'Emails from this sender will bypass spam filters.',
      type: 'success',
    });
  };

  const handleRemoveSafe = (email: string) => {
    setSafe((prev) => prev.filter((s) => s !== email));
  };

  const handleTrainClassifier = () => {
    setIsTraining(true);
    setTimeout(() => {
      setIsTraining(false);
      addToast({
        title: 'Spam Classifier Trained',
        description: 'Analyzed recent messages in Junk to refine machine-learning detection accuracy.',
        type: 'success',
      });
    }, 800);
  };

  const handleResetClassifier = () => {
    addToast({
      title: 'Classifier Reset',
      description: 'Spam model restored to default baseline heuristics.',
      type: 'info',
    });
  };

  return (
    <div className="max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 pb-12">
      {/* Page Title & Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
              Spam & Junk Filter Control
            </h2>
          </div>
          <p className="text-neutral-500 mt-0.5">
            Manage real-time spam detection heuristics, sensitivity thresholds, and trusted/blocked sender lists.
          </p>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium shrink-0 self-start sm:self-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Spam Engine Active</span>
        </div>
      </div>

      {/* ⭐ SPECIAL CORNER: Spam Filter Handling Hub ⭐ */}
      <div className="p-4 sm:p-5 border-2 border-emerald-500/40 dark:border-emerald-500/30 rounded-xl bg-gradient-to-br from-emerald-50/50 via-white to-blue-50/30 dark:from-emerald-950/20 dark:via-[#1c1c1c] dark:to-blue-950/20 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-emerald-200/60 dark:border-emerald-900/40 pb-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white shadow-2xs">
                Special Handling Corner
              </span>
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                Spam Filter Threshold & Handling Rules
              </h3>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Set sensitivity cutoffs, automated triage actions, and Bayesian classifier training.
            </p>
          </div>
          <Sliders className="w-4 h-4 text-emerald-600 dark:text-emerald-400 hidden sm:block" />
        </div>

        {/* Sensitivity Levels */}
        <div className="space-y-2">
          <label className="font-bold text-neutral-900 dark:text-neutral-100 block">
            Filter Sensitivity Level
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Standard */}
            <div
              onClick={() => setSensitivity('standard')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                sensitivity === 'standard'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500/50'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Standard (Recommended)
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Score 5+
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                Filters obvious spam, bulk unverified mail, known phishing signatures, and malicious links.
              </p>
            </div>

            {/* High / Strict */}
            <div
              onClick={() => setSensitivity('high')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                sensitivity === 'high'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500/50'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Strict / Aggressive
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  Score 3+
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                Aggressively quarantines unknown marketing lists, tracking pixels, and unfamiliar domains.
              </p>
            </div>

            {/* Low */}
            <div
              onClick={() => setSensitivity('low')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                sensitivity === 'low'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500/50'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Low Sensitivity
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                  Score 7+
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                Minimal interference. Only intercepts confirmed mass spam bots and virus threats.
              </p>
            </div>

            {/* Exclusive */}
            <div
              onClick={() => setSensitivity('exclusive')}
              className={`p-3 rounded-lg border cursor-pointer transition-all ${
                sensitivity === 'exclusive'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-xs ring-1 ring-emerald-500/50'
                  : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020] hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                  Exclusive / Safe Senders Only
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-900/60 dark:text-red-300">
                  Whitelist
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                Only accept mail from your Safe Senders list and address book. Everything else is junked.
              </p>
            </div>
          </div>
        </div>

        {/* Handling Action for Flagged Spam */}
        <div className="space-y-2 pt-2 border-t border-emerald-100 dark:border-neutral-800">
          <label className="font-bold text-neutral-900 dark:text-neutral-100 block">
            Automated Action for Suspected Spam
          </label>
          <div className="space-y-1.5 bg-white/70 dark:bg-[#202020]/70 p-3 rounded-lg border border-neutral-200/80 dark:border-neutral-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="spamAction"
                checked={spamAction === 'move_to_junk'}
                onChange={() => setSpamAction('move_to_junk')}
                className="accent-emerald-600"
              />
              <span className="font-medium text-neutral-900 dark:text-neutral-100">
                Move spam automatically to Junk Email folder (Default)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="spamAction"
                checked={spamAction === 'delete_permanently'}
                onChange={() => setSpamAction('delete_permanently')}
                className="accent-emerald-600"
              />
              <span className="text-neutral-700 dark:text-neutral-300">
                Permanently purge high-confidence phishing & scam emails without delivery
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="spamAction"
                checked={spamAction === 'mark_subject'}
                onChange={() => setSpamAction('mark_subject')}
                className="accent-emerald-600"
              />
              <span className="text-neutral-700 dark:text-neutral-300">
                Prefix subject line with <code className="text-red-600 dark:text-red-400 font-mono">[SPAM]</code> and deliver to folder
              </span>
            </label>
          </div>
        </div>

        {/* Adaptive Bayesian Classifier Controls */}
        <div className="p-3.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                Bayesian Machine-Learning Classifier
              </span>
            </div>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
              Trained on 248 junk patterns and 1,420 valid messages. Auto-adapts when you report spam.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleTrainClassifier}
              disabled={isTraining}
              className="h-7 px-2.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
              title="Train model on messages currently in Junk folder"
            >
              <RefreshCw className={`w-3 h-3 ${isTraining ? 'animate-spin' : ''}`} />
              <span>{isTraining ? 'Training...' : 'Train on Junk'}</span>
            </button>
            <button
              onClick={handleResetClassifier}
              className="h-7 px-2 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#252525] text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-[#2f2f2f] transition-colors cursor-pointer"
              title="Reset training weights to defaults"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Heuristic Safety Checks */}
        <div className="pt-2 border-t border-emerald-100 dark:border-neutral-800 space-y-2">
          <label className="font-bold text-neutral-900 dark:text-neutral-100 block">
            Heuristic Safeguards
          </label>
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verifyAuth}
                onChange={(e) => setVerifyAuth(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              <span>Verify SPF, DKIM, and DMARC cryptographic email authentication records</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={blockLookalikes}
                onChange={(e) => setBlockLookalikes(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              <span>Detect character spoofing & lookalike domain names (Homoglyph protection)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trustHeaders}
                onChange={(e) => setTrustHeaders(e.target.checked)}
                className="accent-emerald-600 rounded"
              />
              <span>Trust upstream IMAP spam score headers (SpamAssassin / ClamAV / Defender)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Blocked Senders Section */}
      <div className="space-y-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c]">
        <div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span>Blocked senders and domains</span>
          </h3>
          <p className="text-[11px] text-neutral-500">
            Messages from these email addresses or whole domains (@domain.com) will be blocked immediately.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. spammer@domain.com or @bulkmarketing.net"
            value={newBlocked}
            onChange={(e) => setNewBlocked(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddBlocked()}
            className="h-8 px-2.5 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs flex-1 focus:outline-none focus:border-[#0078d4]"
          />
          <button
            onClick={handleAddBlocked}
            className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Block</span>
          </button>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded divide-y divide-neutral-200 dark:divide-neutral-800 max-h-44 overflow-y-auto">
          {blocked.map((item) => (
            <div
              key={item}
              className="p-2 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#222222]"
            >
              <span className="font-mono text-[11px] text-red-600 dark:text-red-400">{item}</span>
              <button
                onClick={() => handleRemoveBlocked(item)}
                className="p-1 text-neutral-400 hover:text-red-500 cursor-pointer"
                title="Remove from blocklist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Safe Senders Section */}
      <div className="space-y-3 p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c]">
        <div>
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-500" />
            <span>Safe senders and trusted domains</span>
          </h3>
          <p className="text-[11px] text-neutral-500">
            Messages from these senders will never be sent to Junk or quarantined.
          </p>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. colleague@trusted.com or @company.com"
            value={newSafe}
            onChange={(e) => setNewSafe(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSafe()}
            className="h-8 px-2.5 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs flex-1 focus:outline-none focus:border-[#0078d4]"
          />
          <button
            onClick={handleAddSafe}
            className="h-8 px-3 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Safe</span>
          </button>
        </div>

        <div className="border border-neutral-200 dark:border-neutral-800 rounded divide-y divide-neutral-200 dark:divide-neutral-800 max-h-44 overflow-y-auto">
          {safe.map((item) => (
            <div
              key={item}
              className="p-2 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#222222]"
            >
              <span className="font-mono text-[11px] text-emerald-600 dark:text-emerald-400">
                {item}
              </span>
              <button
                onClick={() => handleRemoveSafe(item)}
                className="p-1 text-neutral-400 hover:text-red-500 cursor-pointer"
                title="Remove from safelist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={trustContacts}
            onChange={(e) => setTrustContacts(e.target.checked)}
            className="accent-[#0078d4] rounded"
          />
          <span className="text-[11px] text-neutral-600 dark:text-neutral-400">
            Trust email from all contacts in my AirSend People & Address Book automatically
          </span>
        </label>
      </div>
    </div>
  );
}
