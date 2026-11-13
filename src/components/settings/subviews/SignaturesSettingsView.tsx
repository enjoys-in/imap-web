'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Bold, Italic, Underline, Link2, Check, Save } from 'lucide-react';
import { MOCK_ACCOUNTS } from '@/lib/mock';
import { useAccounts } from '@/hooks/useEmailsQuery';
import { useToastStore } from '@/stores';

interface Signature {
  id: string;
  name: string;
  body: string;
}

const DEFAULT_SIGNATURES: Record<string, Signature[]> = {
  'acc-1': [
    { id: 'sig-1', name: 'Work', body: "Best regards,\nMulayam S\nStaff Software Engineer\nAirSend Inc." },
    { id: 'sig-2', name: 'Personal', body: "Warmly,\nMulayam\nSent from AirSend" },
  ],
};

export function SignaturesSettingsView() {
  const { data: accountsData } = useAccounts();
  const accounts = accountsData && accountsData.length > 0 ? accountsData : MOCK_ACCOUNTS;
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || 'acc-1');
  const [signatures, setSignatures] = useState<Signature[]>(DEFAULT_SIGNATURES['acc-1'] || []);
  const [activeSigId, setActiveSigId] = useState<string>(signatures[0]?.id || 'sig-1');
  const [newSigName, setNewSigName] = useState('');
  const [forNewMessages, setForNewMessages] = useState('sig-1');
  const [forReplies, setForReplies] = useState('sig-1');
  const addToast = useToastStore((s) => s.addToast);

  const activeSig = signatures.find((s) => s.id === activeSigId) || signatures[0];

  const handleUpdateBody = (body: string) => {
    if (!activeSig) return;
    setSignatures((prev) => prev.map((s) => (s.id === activeSig.id ? { ...s, body } : s)));
  };

  const handleCreateSignature = () => {
    const name = newSigName.trim() || `Signature ${signatures.length + 1}`;
    const newSig: Signature = { id: `sig-${Date.now()}`, name, body: 'Best regards,\nMulayam S' };
    setSignatures((prev) => [...prev, newSig]);
    setActiveSigId(newSig.id);
    setNewSigName('');
    addToast({ title: 'Signature created', description: `Created "${name}"`, type: 'success' });
  };

  const handleDeleteSignature = (id: string) => {
    setSignatures((prev) => prev.filter((s) => s.id !== id));
    if (activeSigId === id) setActiveSigId(signatures[0]?.id || '');
    addToast({ title: 'Signature removed', type: 'info' });
  };

  const handleSave = () => {
    addToast({ title: 'Signatures saved', description: 'Updated default signatures for this account.', type: 'success' });
  };

  return (
    <div className="max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div>
        <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Signatures</h2>
        <p className="text-neutral-500 mt-0.5">Create signatures that will be automatically added to your email messages.</p>
      </div>

      {/* Account Selector */}
      <div className="p-3 bg-neutral-50 dark:bg-[#1a1a1a] rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <label className="font-semibold text-neutral-700 dark:text-neutral-300">Select account:</label>
        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
        >
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>{a.email} ({a.accountType || 'IMAP'})</option>
          ))}
        </select>
      </div>

      {/* Signature Name & List */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="New signature name..."
            value={newSigName}
            onChange={(e) => setNewSigName(e.target.value)}
            className="h-8 px-2.5 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs flex-1"
          />
          <button
            onClick={handleCreateSignature}
            className="h-8 px-3 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /><span>Add</span>
          </button>
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {signatures.map((sig) => (
            <div
              key={sig.id}
              onClick={() => setActiveSigId(sig.id)}
              className={`px-3 py-1.5 rounded-md border flex items-center gap-2 cursor-pointer font-medium transition-colors ${
                activeSigId === sig.id
                  ? 'bg-[#c7e0f4]/50 border-[#0078d4] text-[#0078d4] dark:bg-[#252525] dark:text-white dark:border-[#0078d4]'
                  : 'bg-white dark:bg-[#202020] border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-[#252525]'
              }`}
            >
              <span>{sig.name}</span>
              {signatures.length > 1 && (
                <button onClick={(e) => { e.stopPropagation(); handleDeleteSignature(sig.id); }} className="hover:text-red-500">
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Signature Text Editor */}
      {activeSig && (
        <div className="space-y-2 border border-neutral-200 dark:border-neutral-800 rounded-lg p-3 bg-white dark:bg-[#1c1c1c]">
          <div className="flex items-center gap-1 pb-2 border-b border-neutral-200 dark:border-neutral-800 text-neutral-500">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300 mr-2">{activeSig.name}:</span>
            <button type="button" className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"><Bold className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"><Italic className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"><Underline className="w-3.5 h-3.5" /></button>
            <button type="button" className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded"><Link2 className="w-3.5 h-3.5" /></button>
          </div>
          <textarea
            value={activeSig.body}
            onChange={(e) => handleUpdateBody(e.target.value)}
            rows={5}
            className="w-full bg-transparent resize-y text-xs text-neutral-900 dark:text-neutral-100 focus:outline-none leading-relaxed font-sans"
          />
        </div>
      )}

      {/* Select Default Signatures */}
      <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Select default signatures</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-500 mb-1">For new messages:</label>
            <select
              value={forNewMessages}
              onChange={(e) => setForNewMessages(e.target.value)}
              className="w-full h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
            >
              <option value="none">(none)</option>
              {signatures.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-neutral-500 mb-1">For replies/forwards:</label>
            <select
              value={forReplies}
              onChange={(e) => setForReplies(e.target.value)}
              className="w-full h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
            >
              <option value="none">(none)</option>
              {signatures.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={handleSave}
          className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" /><span>Save</span>
        </button>
      </div>
    </div>
  );
}
