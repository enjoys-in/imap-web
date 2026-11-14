'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Volume2,
  Save,
  Check,
  Send,
  Sparkles,
  ShieldCheck,
  Laptop,
  MessageSquare,
  Star,
  AlertCircle,
  AtSign,
} from 'lucide-react';
import {
  useGeneralSettingsStore,
  NotificationAudience,
} from '@/stores/useGeneralSettingsStore';
import { useToastStore } from '@/stores/useToastStore';
import {
  requestWebPushPermission,
  dispatchNotification,
} from '@/lib/notificationDispatcher';
import { enablePush, sendTestNotification } from '@/lib/webPush';
import { cn } from '@/lib/utils';

export function NotificationsSettingsView() {
  const settings = useGeneralSettingsStore();
  const updateSettings = useGeneralSettingsStore((s) => s.updateSettings);
  const addToast = useToastStore((s) => s.addToast);

  // In-app notifications state
  const [inAppEnabled, setInAppEnabled] = useState(
    settings.inAppNotificationsEnabled ?? true
  );
  const [inAppAudience, setInAppAudience] = useState<NotificationAudience>(
    settings.inAppNotificationAudience ?? 'all'
  );
  const [inAppSound, setInAppSound] = useState(
    settings.inAppSoundEnabled ?? true
  );
  const [inAppMentions, setInAppMentions] = useState(
    settings.inAppMentionsOnly ?? false
  );

  // Push notifications state
  const [pushEnabled, setPushEnabled] = useState(
    settings.pushNotificationsEnabled ?? true
  );
  const [pushAudience, setPushAudience] = useState<NotificationAudience>(
    settings.pushNotificationAudience ?? 'direct'
  );
  const [pushIncludePreview, setPushIncludePreview] = useState(
    settings.pushIncludePreview ?? true
  );
  const [badgeCount, setBadgeCount] = useState(
    settings.badgeCountEnabled ?? true
  );
  const [calendarReminders, setCalendarReminders] = useState(
    settings.calendarRemindersEnabled ?? true
  );

  const [browserPermission, setBrowserPermission] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const handleTestPush = async () => {
    try {
      const result = await sendTestNotification();
      if (!result) {
        addToast({
          title: 'No push subscription yet',
          description: 'Allow notifications and save your settings first.',
          type: 'warning',
        });
        return;
      }
      addToast(
        result.sent > 0
          ? {
              title: 'Test notification sent',
              description: 'It should appear in a moment, even when AirSend is closed.',
              type: 'success',
            }
          : {
              title: 'Test notification failed',
              description: 'The push service did not accept it. Try again in a moment.',
              type: 'warning',
            }
      );
    } catch (error) {
      addToast({
        title: 'Push is not available',
        description: error instanceof Error ? error.message : 'Try again later.',
        type: 'warning',
      });
    }
  };

  const handleRequestPermission = async () => {
    const granted = await requestWebPushPermission();
    if (granted) {
      setBrowserPermission('granted');
      const setup = await enablePush({
        audience: pushAudience,
        includePreview: pushIncludePreview,
      }).catch(() => null);
      addToast(
        setup === 'on'
          ? {
              title: 'Push Permission Granted',
              description: 'AirSend will notify you about new mail, even when it is closed.',
              type: 'success',
            }
          : {
              title: 'Permission Granted',
              description:
                setup === 'unconfigured'
                  ? 'Notifications work while AirSend is open. Background push is not set up on the server yet.'
                  : 'AirSend can now send desktop notifications.',
              type: 'info',
            }
      );
    } else {
      setBrowserPermission('denied');
      addToast({
        title: 'Permission Denied',
        description: 'Push notifications are blocked in your browser settings.',
        type: 'warning',
      });
    }
  };

  const handlePlaySound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {}
    addToast({
      title: 'Sound test',
      description: 'Playing default chime',
      type: 'info',
    });
  };

  const handleSave = () => {
    updateSettings({
      inAppNotificationsEnabled: inAppEnabled,
      inAppNotificationAudience: inAppAudience,
      inAppSoundEnabled: inAppSound,
      inAppMentionsOnly: inAppMentions,
      pushNotificationsEnabled: pushEnabled,
      pushNotificationAudience: pushAudience,
      pushIncludePreview,
      badgeCountEnabled: badgeCount,
      calendarRemindersEnabled: calendarReminders,
    });
    addToast({
      title: 'Notification Settings Saved',
      description: 'Your in-app and push notification rules have been applied.',
      type: 'success',
    });
  };

  const handleTestInApp = () => {
    dispatchNotification({
      title: 'Test In-App Notification',
      body: 'This is an example notification based on your custom rules.',
      type: 'info',
      isDirect: true,
      isVip: true,
      isHighPriority: true,
    });
  };

  return (
    <div className="max-w-4xl space-y-6 text-xs text-neutral-800 dark:text-neutral-200 pb-12">
      {/* Header */}
      <div className="pb-3 border-b border-neutral-200 dark:border-[#2b2b2b] flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Notifications
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Choose how you receive notifications and select what kind of messages trigger in-app banners and push notifications.
          </p>
        </div>
        <button
          onClick={handleSave}
          className="h-8 px-4 bg-[#0078d4] hover:bg-[#106ebe] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save</span>
        </button>
      </div>

      {/* SECTION 1: IN-APP NOTIFICATIONS */}
      <div className="space-y-4 p-5 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] shadow-xs">
        <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[#0078d4]/10 text-[#0078d4] mt-0.5">
              <Laptop className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 block">
                In-app notification banners
              </span>
              <span className="text-neutral-500 text-xs">
                Display alert toasts inside AirSend while the application is active on screen.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={inAppEnabled}
            onChange={(e) => setInAppEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#0078d4] rounded mt-1 cursor-pointer"
          />
        </div>

        {inAppEnabled && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-150">
            {/* What kind of messages for in-app */}
            <div>
              <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block mb-2">
                What kind of messages do you want to see in-app notifications for?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. All */}
                <label
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all',
                    inAppAudience === 'all'
                      ? 'border-[#0078d4] bg-[#0078d4]/5 dark:bg-[#0078d4]/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  )}
                >
                  <input
                    type="radio"
                    name="inAppAudience"
                    value="all"
                    checked={inAppAudience === 'all'}
                    onChange={() => setInAppAudience('all')}
                    className="w-4 h-4 accent-[#0078d4] mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      All new messages
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Show in-app banner for every incoming email across all folders.
                    </span>
                  </div>
                </label>

                {/* 2. Direct (To: me) */}
                <label
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all',
                    inAppAudience === 'direct'
                      ? 'border-[#0078d4] bg-[#0078d4]/5 dark:bg-[#0078d4]/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  )}
                >
                  <input
                    type="radio"
                    name="inAppAudience"
                    value="direct"
                    checked={inAppAudience === 'direct'}
                    onChange={() => setInAppAudience('direct')}
                    className="w-4 h-4 accent-[#0078d4] mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      Messages sent directly to me
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Only show banners when your email address is on the &apos;To&apos; line.
                    </span>
                  </div>
                </label>

                {/* 3. VIP / Favorite */}
                <label
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all',
                    inAppAudience === 'vip'
                      ? 'border-[#0078d4] bg-[#0078d4]/5 dark:bg-[#0078d4]/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  )}
                >
                  <input
                    type="radio"
                    name="inAppAudience"
                    value="vip"
                    checked={inAppAudience === 'vip'}
                    onChange={() => setInAppAudience('vip')}
                    className="w-4 h-4 accent-[#0078d4] mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      Favorite & VIP contacts only
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Only show banners for emails received from starred contacts.
                    </span>
                  </div>
                </label>

                {/* 4. High Priority */}
                <label
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all',
                    inAppAudience === 'high_priority'
                      ? 'border-[#0078d4] bg-[#0078d4]/5 dark:bg-[#0078d4]/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  )}
                >
                  <input
                    type="radio"
                    name="inAppAudience"
                    value="high_priority"
                    checked={inAppAudience === 'high_priority'}
                    onChange={() => setInAppAudience('high_priority')}
                    className="w-4 h-4 accent-[#0078d4] mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      High priority & Important only
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Only show banners for messages flagged with high importance (!).
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Sub options */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200 block">
                    Play sound chime for in-app notifications
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    Audible sound alert when a qualified email arrives.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={inAppSound}
                  onChange={(e) => setInAppSound(e.target.checked)}
                  className="w-4 h-4 accent-[#0078d4] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200 block">
                    Notify me when someone mentions me (@me)
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    Always notify when your name is tagged in message body or thread.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={inAppMentions}
                  onChange={(e) => setInAppMentions(e.target.checked)}
                  className="w-4 h-4 accent-[#0078d4] rounded cursor-pointer"
                />
              </label>

              <div className="pt-1 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePlaySound}
                  className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Play test sound</span>
                </button>
                <button
                  type="button"
                  onClick={handleTestInApp}
                  className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                  <span>Preview in-app toast</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: DESKTOP & PUSH NOTIFICATIONS */}
      <div className="space-y-4 p-5 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] shadow-xs">
        <div className="flex items-start justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 block">
                  Desktop & Web Push notifications
                </span>
                {browserPermission === 'granted' ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/10 text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                    <Check className="w-3 h-3" /> Permission active
                  </span>
                ) : (
                  <button
                    onClick={handleRequestPermission}
                    className="px-2 py-0.5 text-[10px] bg-[#0078d4] text-white rounded hover:bg-[#106ebe] transition-colors"
                  >
                    Enable browser permission
                  </button>
                )}
              </div>
              <span className="text-neutral-500 text-xs">
                Send operating system push notifications when AirSend is minimized or in the background.
              </span>
            </div>
          </div>
          <input
            type="checkbox"
            checked={pushEnabled}
            onChange={(e) => setPushEnabled(e.target.checked)}
            className="w-4 h-4 accent-[#0078d4] rounded mt-1 cursor-pointer"
          />
        </div>

        {pushEnabled && (
          <div className="space-y-4 pt-1 animate-in fade-in duration-150">
            {/* What kind of messages for push notifications */}
            <div>
              <label className="text-xs font-semibold text-neutral-900 dark:text-neutral-200 block mb-2">
                What kind of messages do you want to receive push notifications for?
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* 1. All */}
                <label
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all',
                    pushAudience === 'all'
                      ? 'border-[#0078d4] bg-[#0078d4]/5 dark:bg-[#0078d4]/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  )}
                >
                  <input
                    type="radio"
                    name="pushAudience"
                    value="all"
                    checked={pushAudience === 'all'}
                    onChange={() => setPushAudience('all')}
                    className="w-4 h-4 accent-[#0078d4] mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      All new messages
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Send push notifications for every incoming email.
                    </span>
                  </div>
                </label>

                {/* 2. Direct (To: me) */}
                <label
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all',
                    pushAudience === 'direct'
                      ? 'border-[#0078d4] bg-[#0078d4]/5 dark:bg-[#0078d4]/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  )}
                >
                  <input
                    type="radio"
                    name="pushAudience"
                    value="direct"
                    checked={pushAudience === 'direct'}
                    onChange={() => setPushAudience('direct')}
                    className="w-4 h-4 accent-[#0078d4] mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      Messages sent directly to me
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Only push when your address is in the &apos;To&apos; recipient line.
                    </span>
                  </div>
                </label>

                {/* 3. VIP / Favorite */}
                <label
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all',
                    pushAudience === 'vip'
                      ? 'border-[#0078d4] bg-[#0078d4]/5 dark:bg-[#0078d4]/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  )}
                >
                  <input
                    type="radio"
                    name="pushAudience"
                    value="vip"
                    checked={pushAudience === 'vip'}
                    onChange={() => setPushAudience('vip')}
                    className="w-4 h-4 accent-[#0078d4] mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      Favorite & VIP contacts only
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Only push for messages from your key contacts.
                    </span>
                  </div>
                </label>

                {/* 4. High Priority */}
                <label
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-md border cursor-pointer transition-all',
                    pushAudience === 'high_priority'
                      ? 'border-[#0078d4] bg-[#0078d4]/5 dark:bg-[#0078d4]/10'
                      : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                  )}
                >
                  <input
                    type="radio"
                    name="pushAudience"
                    value="high_priority"
                    checked={pushAudience === 'high_priority'}
                    onChange={() => setPushAudience('high_priority')}
                    className="w-4 h-4 accent-[#0078d4] mt-0.5 cursor-pointer"
                  />
                  <div>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
                      High priority & Important only
                    </span>
                    <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                      Only push when marked with urgent or high priority.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            {/* Sub options */}
            <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/60 space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200 block">
                    Include message preview in push notification
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    Display sender name and email subject line in the system notification.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={pushIncludePreview}
                  onChange={(e) => setPushIncludePreview(e.target.checked)}
                  className="w-4 h-4 accent-[#0078d4] rounded cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-neutral-800 dark:text-neutral-200 block">
                    Unread badge count
                  </span>
                  <span className="text-neutral-500 text-[11px]">
                    Display real-time unread message counter badge on the app icon and tab.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={badgeCount}
                  onChange={(e) => setBadgeCount(e.target.checked)}
                  className="w-4 h-4 accent-[#0078d4] rounded cursor-pointer"
                />
              </label>

              {browserPermission === 'granted' && (
                <div className="pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTestPush}
                    className="px-2.5 py-1 rounded bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Send className="w-3.5 h-3.5 text-blue-500" />
                    <span>Send test push</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: CALENDAR REMINDERS */}
      <div className="space-y-4 p-5 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-[#1c1c1c] shadow-xs">
        <label className="flex items-start justify-between cursor-pointer">
          <div>
            <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 block">
              Calendar & meeting reminders
            </span>
            <span className="text-neutral-500 text-xs">
              Receive 15-minute advance popups and alert chimes for upcoming events.
            </span>
          </div>
          <input
            type="checkbox"
            checked={calendarReminders}
            onChange={(e) => setCalendarReminders(e.target.checked)}
            className="w-4 h-4 accent-[#0078d4] rounded mt-1 cursor-pointer"
          />
        </label>
      </div>

      {/* Save Button */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          className="h-9 px-5 bg-[#0078d4] hover:bg-[#106ebe] text-white rounded font-medium flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors text-xs"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>
    </div>
  );
}
