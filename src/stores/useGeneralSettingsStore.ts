'use client';

import { create } from 'zustand';

const STORAGE_KEY = 'airsend_general_settings';

export type ReadingPaneLayout = 'right' | 'bottom' | 'fillScreen' | 'popoutOnly';
export type MessageOrder = 'newestOnTop' | 'newestOnBottom';
export type AfterMoveOrDelete = 'openNext' | 'openPrevious' | 'returnToList';
export type QuickActionType = 'move' | 'read' | 'flag' | 'pin' | 'archive' | 'delete';
export type SwipeActionType = 'delete' | 'read' | 'pin' | 'archive' | 'flag' | 'none';
export type NotificationAudience = 'all' | 'direct' | 'vip' | 'high_priority';
export type TimeFormat = '12h' | '24h';
export type DisplayDensity = 'comfortable' | 'compact';
export type PreviewLines = 0 | 1 | 2 | 3;
export type FontSize = 'small' | 'medium' | 'large';
export type FontFamily = 'system' | 'serif' | 'mono';
export type HeaderTheme = 'classic' | 'sunset' | 'ocean' | 'circuit' | 'aurora';
export type SidebarMode = 'expanded' | 'compact';
export type FolderBadgeStyle = 'unread' | 'total' | 'hidden';
export type SenderProminence = 'senderFirst' | 'subjectFirst';
export type DateDisplayFormat = 'relative' | 'absolute';
export type UnreadIndicatorStyle = 'dot' | 'border' | 'bold';

export interface GeneralSettingsState {
  timeZone: string;
  dateFormat: string;
  timeFormat: TimeFormat;
  language: string;
  firstDayOfWeek: 'Sunday' | 'Monday';
  emailSignature: string;
  emailThreading: boolean;
  downloadInlineImages: boolean;
  undoSendDelaySeconds: number;
  emptyDeletedOnLogout: boolean;
  readingPaneLayout: ReadingPaneLayout;
  messageOrder: MessageOrder;
  afterMoveOrDelete: AfterMoveOrDelete;
  showDeletedItems: boolean;
  // Appearance & density
  density: DisplayDensity;
  accentColor: string;
  previewLines: PreviewLines;
  showAvatars: boolean;
  fontSize: FontSize;
  fontFamily: FontFamily;
  headerTheme: HeaderTheme;
  sidebarMode: SidebarMode;
  folderBadgeStyle: FolderBadgeStyle;
  senderProminence: SenderProminence;
  dateDisplayFormat: DateDisplayFormat;
  unreadIndicatorStyle: UnreadIndicatorStyle;
  smartDarkInvert: boolean;
  // Customize actions
  quickActions: QuickActionType[];
  swipeRightAction: SwipeActionType;
  swipeLeftAction: SwipeActionType;
  // Notification rules
  inAppNotificationsEnabled: boolean;
  inAppNotificationAudience: NotificationAudience;
  inAppMentionsOnly: boolean;
  inAppSoundEnabled: boolean;
  pushNotificationsEnabled: boolean;
  pushNotificationAudience: NotificationAudience;
  pushIncludePreview: boolean;
  badgeCountEnabled: boolean;
  calendarRemindersEnabled: boolean;
  // Offline settings
  allowOfflineAccess: boolean;
  offlineAccount: string;
  offlineFoldersToSave: string;
  offlineDaysToSave: number;
  offlineIncludeAttachments: boolean;
  offlineBackgroundSync: boolean;
  // Accessibility settings
  reduceMotion: boolean;
  highContrast: boolean;
  keyboardShortcuts: boolean;
  // Privacy & Data
  shareDiagnostics: boolean;
  connectedServices: boolean;
  // Search settings
  searchScope: 'all_folders' | 'current_folder';
  includeDeletedInSearch: boolean;
  saveSearchHistory: boolean;
  // Startup settings
  startupFolder: 'inbox' | 'last_opened' | 'calendar';
  restorePreviousWindows: boolean;
  updateSettings: (partial: Partial<Omit<GeneralSettingsState, 'updateSettings'>>) => void;
}

const DEFAULT_SETTINGS = {
  timeZone: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi',
  dateFormat: 'M/d/yyyy',
  timeFormat: '12h' as TimeFormat,
  language: 'English (United States)',
  firstDayOfWeek: 'Sunday' as const,
  emailSignature: '',
  emailThreading: true,
  downloadInlineImages: true,
  undoSendDelaySeconds: 5,
  emptyDeletedOnLogout: false,
  readingPaneLayout: 'right' as ReadingPaneLayout,
  messageOrder: 'newestOnBottom' as MessageOrder,
  afterMoveOrDelete: 'openNext' as AfterMoveOrDelete,
  showDeletedItems: true,
  // Appearance & density defaults
  density: 'comfortable' as DisplayDensity,
  accentColor: '#0078d4',
  previewLines: 1 as PreviewLines,
  showAvatars: true,
  fontSize: 'medium' as FontSize,
  fontFamily: 'system' as FontFamily,
  headerTheme: 'classic' as HeaderTheme,
  sidebarMode: 'expanded' as SidebarMode,
  folderBadgeStyle: 'unread' as FolderBadgeStyle,
  senderProminence: 'senderFirst' as SenderProminence,
  dateDisplayFormat: 'relative' as DateDisplayFormat,
  unreadIndicatorStyle: 'dot' as UnreadIndicatorStyle,
  smartDarkInvert: true,
  quickActions: ['flag', 'pin', 'delete'] as QuickActionType[],
  swipeRightAction: 'read' as SwipeActionType,
  swipeLeftAction: 'delete' as SwipeActionType,
  inAppNotificationsEnabled: true,
  inAppNotificationAudience: 'all' as NotificationAudience,
  inAppMentionsOnly: false,
  inAppSoundEnabled: true,
  pushNotificationsEnabled: true,
  pushNotificationAudience: 'direct' as NotificationAudience,
  pushIncludePreview: true,
  badgeCountEnabled: true,
  calendarRemindersEnabled: true,
  // Offline defaults
  allowOfflineAccess: true,
  offlineAccount: '',
  offlineFoldersToSave: 'default_and_favorites',
  offlineDaysToSave: 30,
  offlineIncludeAttachments: true,
  offlineBackgroundSync: true,
  // Accessibility defaults
  reduceMotion: false,
  highContrast: false,
  keyboardShortcuts: true,
  // Privacy & Data defaults
  shareDiagnostics: false,
  connectedServices: true,
  // Search defaults
  searchScope: 'all_folders' as const,
  includeDeletedInSearch: false,
  saveSearchHistory: true,
  // Startup defaults
  startupFolder: 'inbox' as const,
  restorePreviousWindows: true,
};

function loadSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export const useGeneralSettingsStore = create<GeneralSettingsState>((set) => ({
  ...loadSettings(),

  updateSettings: (partial) => {
    set((state) => {
      const next = { ...state, ...partial };
      if (typeof window !== 'undefined') {
        const { updateSettings: _ignored, ...toSave } = next;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      }
      return next;
    });
  },
}));
