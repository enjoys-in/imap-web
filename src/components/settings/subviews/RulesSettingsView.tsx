'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Check, ArrowRight } from 'lucide-react';
import { useToastStore } from '@/stores';

interface EmailRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
}

const DEFAULT_RULES: EmailRule[] = [
  { id: 'rule-1', name: 'Move recruitment outreach', condition: 'Sender contains "recruitment"', action: 'Move to Archive', enabled: true },
  { id: 'rule-2', name: 'Flag contract proposals', condition: 'Subject contains "Contract"', action: 'Flag message', enabled: true },
  { id: 'rule-3', name: 'Mark automated newsletters as read', condition: 'Sender contains "no-reply"', action: 'Mark as read', enabled: false },
];

export function RulesSettingsView() {
  const [rules, setRules] = useState<EmailRule[]>(DEFAULT_RULES);
  const [isAdding, setIsAdding] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [conditionType, setConditionType] = useState('sender');
  const [conditionValue, setConditionValue] = useState('');
  const [actionType, setActionType] = useState('archive');
  const addToast = useToastStore((s) => s.addToast);

  const handleToggle = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
    addToast({ title: 'Rule updated', type: 'info' });
  };

  const handleDelete = (id: string, name: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
    addToast({ title: 'Rule deleted', description: `Removed "${name}"`, type: 'info' });
  };

  const handleCreate = () => {
    if (!ruleName.trim() || !conditionValue.trim()) return;
    const condText = conditionType === 'sender' ? `Sender contains "${conditionValue}"` : `Subject contains "${conditionValue}"`;
    const actionText = actionType === 'archive' ? 'Move to Archive' : actionType === 'flag' ? 'Flag message' : 'Mark as read';

    const newRule: EmailRule = {
      id: `rule-${Date.now()}`,
      name: ruleName.trim(),
      condition: condText,
      action: actionText,
      enabled: true,
    };

    setRules((prev) => [...prev, newRule]);
    setIsAdding(false);
    setRuleName('');
    setConditionValue('');
    addToast({ title: 'Rule created', description: `Rule "${newRule.name}" is now active.`, type: 'success' });
  };

  return (
    <div className="max-w-3xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 select-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Rules</h2>
          <p className="text-neutral-500 mt-0.5">Automate how incoming email messages are organized, moved, or tagged.</p>
        </div>

        <button
          onClick={() => setIsAdding((v) => !v)}
          className="h-8 px-3 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" /><span>Add new rule</span>
        </button>
      </div>

      {/* Add Rule Drawer */}
      {isAdding && (
        <div className="p-4 border border-[#0078d4] rounded-lg bg-neutral-50 dark:bg-[#1a1a1a] space-y-3">
          <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Create new rule</h3>
          <div>
            <label className="block text-neutral-500 mb-1">Rule name:</label>
            <input
              type="text"
              placeholder="e.g. Move recruitment notices"
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              className="w-full h-8 px-2.5 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-neutral-500 mb-1">If message matches:</label>
              <div className="flex gap-2">
                <select
                  value={conditionType}
                  onChange={(e) => setConditionType(e.target.value)}
                  className="h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
                >
                  <option value="sender">Sender contains</option>
                  <option value="subject">Subject contains</option>
                </select>
                <input
                  type="text"
                  placeholder="Keyword or address..."
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  className="h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs flex-1"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-500 mb-1">Perform action:</label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                className="w-full h-8 px-2 bg-white dark:bg-[#252525] border border-neutral-300 dark:border-neutral-700 rounded text-xs"
              >
                <option value="archive">Move to Archive</option>
                <option value="flag">Flag message</option>
                <option value="read">Mark as read</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setIsAdding(false)} className="h-8 px-3 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800">Cancel</button>
            <button onClick={handleCreate} className="h-8 px-4 bg-[#0078d4] text-white rounded font-medium cursor-pointer">Save rule</button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-[#1c1c1c] overflow-hidden">
        {rules.map((rule) => (
          <div key={rule.id} className="p-3.5 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-[#222222] transition-colors">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 dark:text-neutral-100">{rule.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${rule.enabled ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'}`}>
                  {rule.enabled ? 'Active' : 'Paused'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-neutral-500 text-[11px]">
                <span>{rule.condition}</span>
                <ArrowRight className="w-3 h-3 opacity-60" />
                <span className="font-medium text-[#0078d4]">{rule.action}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handleToggle(rule.id)} className="px-2.5 py-1 text-xs rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer">
                {rule.enabled ? 'Pause' : 'Activate'}
              </button>
              <button onClick={() => handleDelete(rule.id, rule.name)} className="p-1.5 text-neutral-400 hover:text-red-500 rounded cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
