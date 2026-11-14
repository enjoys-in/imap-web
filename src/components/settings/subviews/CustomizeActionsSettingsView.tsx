'use client';

import React, { useState } from 'react';
import {
  FolderInput,
  Mail,
  Flag,
  Pin,
  Archive,
  Trash2,
  Ban,
  ArrowRight,
  ArrowLeft,
  Check,
  Save,
} from 'lucide-react';
import {
  useGeneralSettingsStore,
  QuickActionType,
  SwipeActionType,
} from '@/stores/useGeneralSettingsStore';
import { useToastStore } from '@/stores/useToastStore';
import { cn } from '@/lib/utils';

interface QuickActionConfig {
  id: QuickActionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const QUICK_ACTIONS_CONFIG: QuickActionConfig[] = [
  { id: 'move', label: 'Move to a folder', icon: FolderInput },
  { id: 'pin', label: 'Pin', icon: Pin },
  { id: 'read', label: 'Mark as read or unread', icon: Mail },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'flag', label: 'Flag', icon: Flag },
  { id: 'delete', label: 'Delete', icon: Trash2 },
];

interface SwipeOptionConfig {
  id: SwipeActionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const SWIPE_OPTIONS_CONFIG: SwipeOptionConfig[] = [
  { id: 'delete', label: 'Delete', icon: Trash2 },
  { id: 'archive', label: 'Archive', icon: Archive },
  { id: 'read', label: 'Mark as read or unread', icon: Mail },
  { id: 'flag', label: 'Flag', icon: Flag },
  { id: 'pin', label: 'Pin', icon: Pin },
  { id: 'none', label: 'None', icon: Ban },
];

export function CustomizeActionsSettingsView() {
  const settings = useGeneralSettingsStore();
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);

  const [quickActions, setQuickActions] = useState<QuickActionType[]>(
    settings.quickActions || ['flag', 'pin', 'delete']
  );
  const [swipeRightAction, setSwipeRightAction] = useState<SwipeActionType>(
    settings.swipeRightAction || 'read'
  );
  const [swipeLeftAction, setSwipeLeftAction] = useState<SwipeActionType>(
    settings.swipeLeftAction || 'delete'
  );

  const toggleQuickAction = (actionId: QuickActionType) => {
    let updated: QuickActionType[];
    if (quickActions.includes(actionId)) {
      updated = quickActions.filter((a) => a !== actionId);
    } else {
      updated = [...quickActions, actionId];
    }
    setQuickActions(updated);
    updateSettings({ quickActions: updated });
    addToast({
      title: 'Quick actions updated',
      description: `${actionId} ${quickActions.includes(actionId) ? 'removed from' : 'added to'} hover actions.`,
      type: 'info',
    });
  };

  const handleSelectSwipeRight = (actionId: SwipeActionType) => {
    setSwipeRightAction(actionId);
    updateSettings({ swipeRightAction: actionId });
  };

  const handleSelectSwipeLeft = (actionId: SwipeActionType) => {
    setSwipeLeftAction(actionId);
    updateSettings({ swipeLeftAction: actionId });
  };

  const handleSaveAll = () => {
    updateSettings({
      quickActions,
      swipeRightAction,
      swipeLeftAction,
    });
    addToast({
      title: 'Settings saved',
      description: 'Your quick actions and swipe preferences are updated.',
      type: 'success',
    });
  };

  // Helper to render icon for swipe preview
  const renderSwipeIcon = (actionId: SwipeActionType) => {
    switch (actionId) {
      case 'read':
        return <Mail className="w-4 h-4 text-white" />;
      case 'delete':
        return <Trash2 className="w-4 h-4 text-white" />;
      case 'pin':
        return <Pin className="w-4 h-4 text-white" />;
      case 'archive':
        return <Archive className="w-4 h-4 text-white" />;
      case 'flag':
        return <Flag className="w-4 h-4 text-white" />;
      case 'none':
      default:
        return <Ban className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl text-neutral-800 dark:text-neutral-100 select-none pb-12">
      {/* Header */}
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Customize actions
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Personalize hover buttons, message list quick actions, and touch swipe gestures.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>

      {/* Quick Actions Section */}
      <section className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Quick actions
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Customize your most frequently used actions. Quick actions appear beside sender names and subject lines in your message list.
          </p>
        </div>

        {/* Interactive Preview Card */}
        <div className="border border-neutral-300 dark:border-neutral-700/80 bg-neutral-100 dark:bg-[#161616] rounded-md p-4 relative overflow-hidden max-w-xl shadow-xs transition-all">
          {/* Active selection blue stripe on left edge */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#0078d4]" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Light Avatar placeholder */}
              <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-300 shrink-0" />

              {/* Skeleton lines */}
              <div className="space-y-2 pt-1">
                <div className="w-28 h-3.5 bg-neutral-300 dark:bg-neutral-300 rounded-full" />
                <div className="w-44 h-3.5 bg-neutral-300 dark:bg-neutral-300 rounded-full" />
                <div className="w-64 h-3.5 bg-neutral-300 dark:bg-neutral-300 rounded-full" />
              </div>
            </div>

            {/* Hover Action Preview Box */}
            <div className="bg-black/85 dark:bg-[#0c0c0c] border border-neutral-600/70 dark:border-neutral-700/80 rounded px-2.5 py-1.5 flex items-center gap-2 text-neutral-200 shadow-lg shrink-0">
              {quickActions.length === 0 ? (
                <span className="text-[10px] text-neutral-400">No actions</span>
              ) : (
                quickActions.map((act) => {
                  switch (act) {
                    case 'move':
                      return (
                        <div key={act} title="Move to folder" className="p-0.5 text-blue-400">
                          <FolderInput className="w-3.5 h-3.5" />
                        </div>
                      );
                    case 'read':
                      return (
                        <div key={act} title="Mark as read/unread" className="p-0.5 text-blue-400">
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                      );
                    case 'flag':
                      return (
                        <div key={act} title="Flag" className="p-0.5 text-[#0078d4]">
                          <Flag className="w-3.5 h-3.5 fill-current" />
                        </div>
                      );
                    case 'pin':
                      return (
                        <div key={act} title="Pin" className="p-0.5 text-[#0078d4]">
                          <Pin className="w-3.5 h-3.5" />
                        </div>
                      );
                    case 'archive':
                      return (
                        <div key={act} title="Archive" className="p-0.5 text-amber-400">
                          <Archive className="w-3.5 h-3.5" />
                        </div>
                      );
                    case 'delete':
                      return (
                        <div key={act} title="Delete" className="p-0.5 text-blue-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </div>
                      );
                    default:
                      return null;
                  }
                })
              )}
            </div>
          </div>
        </div>

        {/* Checkbox Grid (2 columns) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3.5 gap-x-12 max-w-xl pt-2">
          {/* Column 1 */}
          <div className="space-y-3.5">
            {/* Move to folder */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
              <input
                type="checkbox"
                checked={quickActions.includes('move')}
                onChange={() => toggleQuickAction('move')}
                className="w-4 h-4 rounded border-neutral-400 dark:border-neutral-600 accent-[#0078d4] cursor-pointer"
              />
              <FolderInput className="w-4 h-4 text-[#0078d4] shrink-0" />
              <span className="text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                Move to a folder
              </span>
            </label>

            {/* Mark as read or unread */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
              <input
                type="checkbox"
                checked={quickActions.includes('read')}
                onChange={() => toggleQuickAction('read')}
                className="w-4 h-4 rounded border-neutral-400 dark:border-neutral-600 accent-[#0078d4] cursor-pointer"
              />
              <Mail className="w-4 h-4 text-[#0078d4] shrink-0" />
              <span className="text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                Mark as read or unread
              </span>
            </label>

            {/* Flag */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
              <input
                type="checkbox"
                checked={quickActions.includes('flag')}
                onChange={() => toggleQuickAction('flag')}
                className="w-4 h-4 rounded border-neutral-400 dark:border-neutral-600 accent-[#0078d4] cursor-pointer"
              />
              <Flag className="w-4 h-4 text-[#0078d4] shrink-0" />
              <span className="text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                Flag
              </span>
            </label>
          </div>

          {/* Column 2 */}
          <div className="space-y-3.5">
            {/* Pin */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
              <input
                type="checkbox"
                checked={quickActions.includes('pin')}
                onChange={() => toggleQuickAction('pin')}
                className="w-4 h-4 rounded border-neutral-400 dark:border-neutral-600 accent-[#0078d4] cursor-pointer"
              />
              <Pin className="w-4 h-4 text-[#0078d4] shrink-0" />
              <span className="text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                Pin
              </span>
            </label>

            {/* Archive */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
              <input
                type="checkbox"
                checked={quickActions.includes('archive')}
                onChange={() => toggleQuickAction('archive')}
                className="w-4 h-4 rounded border-neutral-400 dark:border-neutral-600 accent-[#0078d4] cursor-pointer"
              />
              <Archive className="w-4 h-4 text-[#0078d4] shrink-0" />
              <span className="text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                Archive
              </span>
            </label>

            {/* Delete */}
            <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
              <input
                type="checkbox"
                checked={quickActions.includes('delete')}
                onChange={() => toggleQuickAction('delete')}
                className="w-4 h-4 rounded border-neutral-400 dark:border-neutral-600 accent-[#0078d4] cursor-pointer"
              />
              <Trash2 className="w-4 h-4 text-[#0078d4] shrink-0" />
              <span className="text-neutral-800 dark:text-neutral-200 group-hover:text-black dark:group-hover:text-white transition-colors">
                Delete
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-neutral-200 dark:border-neutral-800 my-8 max-w-xl" />

      {/* Swipe Section */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            Swipe
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Customize your swipe actions when you use a touchscreen to interact with emails in your message list.
          </p>
        </div>

        {/* Swipe Right */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Swipe right
          </h4>

          {/* Interactive Visual Pill */}
          <div className="w-44 h-11 rounded border border-neutral-700/80 bg-neutral-900 overflow-hidden flex items-stretch shadow-inner">
            <div
              className={cn(
                'w-1/2 flex items-center justify-center transition-colors',
                swipeRightAction === 'delete'
                  ? 'bg-red-800/80'
                  : swipeRightAction === 'none'
                  ? 'bg-neutral-800'
                  : 'bg-[#00284d] dark:bg-[#003366]'
              )}
            >
              {renderSwipeIcon(swipeRightAction)}
            </div>
            <div className="w-1/2 flex items-center justify-center bg-[#1c1c1c] text-neutral-400 border-l border-neutral-700/50">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Radio Options Grid (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-12 max-w-xl pt-1">
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
                <input
                  type="radio"
                  name="swipeRight"
                  checked={swipeRightAction === 'delete'}
                  onChange={() => handleSelectSwipeRight('delete')}
                  className="w-4 h-4 accent-[#0078d4] cursor-pointer"
                />
                <Trash2 className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
                  Delete
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
                <input
                  type="radio"
                  name="swipeRight"
                  checked={swipeRightAction === 'read'}
                  onChange={() => handleSelectSwipeRight('read')}
                  className="w-4 h-4 accent-[#0078d4] cursor-pointer"
                />
                <Mail className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
                  Mark as read or unread
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
                <input
                  type="radio"
                  name="swipeRight"
                  checked={swipeRightAction === 'pin'}
                  onChange={() => handleSelectSwipeRight('pin')}
                  className="w-4 h-4 accent-[#0078d4] cursor-pointer"
                />
                <Pin className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
                  Pin
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
                <input
                  type="radio"
                  name="swipeRight"
                  checked={swipeRightAction === 'archive'}
                  onChange={() => handleSelectSwipeRight('archive')}
                  className="w-4 h-4 accent-[#0078d4] cursor-pointer"
                />
                <Archive className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
                  Archive
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
                <input
                  type="radio"
                  name="swipeRight"
                  checked={swipeRightAction === 'flag'}
                  onChange={() => handleSelectSwipeRight('flag')}
                  className="w-4 h-4 accent-[#0078d4] cursor-pointer"
                />
                <Flag className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
                  Flag
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
                <input
                  type="radio"
                  name="swipeRight"
                  checked={swipeRightAction === 'none'}
                  onChange={() => handleSelectSwipeRight('none')}
                  className="w-4 h-4 accent-[#0078d4] cursor-pointer"
                />
                <Ban className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
                  None
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Swipe Left */}
        <div className="space-y-3 pt-6">
          <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
            Swipe left
          </h4>

          {/* Interactive Visual Pill */}
          <div className="w-44 h-11 rounded border border-neutral-700/80 bg-neutral-900 overflow-hidden flex items-stretch shadow-inner">
            <div className="w-1/2 flex items-center justify-center bg-[#1c1c1c] text-neutral-400 border-r border-neutral-700/50">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <div
              className={cn(
                'w-1/2 flex items-center justify-center transition-colors',
                swipeLeftAction === 'delete'
                  ? 'bg-red-800/80'
                  : swipeLeftAction === 'none'
                  ? 'bg-neutral-800'
                  : 'bg-[#00284d] dark:bg-[#003366]'
              )}
            >
              {renderSwipeIcon(swipeLeftAction)}
            </div>
          </div>

          {/* Radio Options Grid (2 columns) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-12 max-w-xl pt-1">
            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
                <input
                  type="radio"
                  name="swipeLeft"
                  checked={swipeLeftAction === 'delete'}
                  onChange={() => handleSelectSwipeLeft('delete')}
                  className="w-4 h-4 accent-[#0078d4] cursor-pointer"
                />
                <Trash2 className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
                  Delete
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
                <input
                  type="radio"
                  name="swipeLeft"
                  checked={swipeLeftAction === 'read'}
                  onChange={() => handleSelectSwipeLeft('read')}
                  className="w-4 h-4 accent-[#0078d4] cursor-pointer"
                />
                <Mail className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
                  Mark as read or unread
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
                <input
                  type="radio"
                  name="swipeLeft"
                  checked={swipeLeftAction === 'pin'}
                  onChange={() => handleSelectSwipeLeft('pin')}
                  className="w-4 h-4 accent-[#0078d4] cursor-pointer"
                />
                <Pin className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
                  Pin
                </span>
              </label>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
                <input
                  type="radio"
                  name="swipeLeft"
                  checked={swipeLeftAction === 'archive'}
                  onChange={() => handleSelectSwipeLeft('archive')}
                  className="w-4 h-4 accent-[#0078d4] cursor-pointer"
                />
                <Archive className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
                  Archive
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
                <input
                  type="radio"
                  name="swipeLeft"
                  checked={swipeLeftAction === 'flag'}
                  onChange={() => handleSelectSwipeLeft('flag')}
                  className="w-4 h-4 accent-[#0078d4] cursor-pointer"
                />
                <Flag className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
                  Flag
                </span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer text-xs group">
                <input
                  type="radio"
                  name="swipeLeft"
                  checked={swipeLeftAction === 'none'}
                  onChange={() => handleSelectSwipeLeft('none')}
                  className="w-4 h-4 accent-[#0078d4] cursor-pointer"
                />
                <Ban className="w-4 h-4 text-neutral-400 group-hover:text-neutral-200" />
                <span className="text-neutral-700 dark:text-neutral-300 group-hover:text-black dark:group-hover:text-white">
                  None
                </span>
              </label>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
