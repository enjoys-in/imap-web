export interface IncomingMailSettings {
  appIconPreferences: boolean;
  showAlert: boolean;
  useSystemNotification: boolean;
  showTrayIconForUnread: boolean;
  playSound: boolean;
  soundType: 'default' | 'custom';
  customSoundPath: string;
}

export interface AccountAppearanceSettings {
  hideSystemTitlebar: boolean;
  autoHideTabBar: boolean;
  messageListView: 'cards' | 'table';
  cardsViewRows: 2 | 3;
  threadingMode: 'unthreaded' | 'threaded' | 'grouped';
  defaultSortBy: 'date' | 'sender' | 'subject' | 'size';
  defaultSortOrder: 'ascending' | 'descending';
  propagateToFolders: 'all' | 'choose';
}

export interface AccountCompositionSettings {
  addExtensionToFileName: boolean;
  autoSaveEveryMinutes: number;
  confirmKeyboardSend: boolean;
  addLinkPreviews: boolean;
  checkSpellingBeforeSending: boolean;
  enableSpellcheckAsYouType: boolean;
  dictionaryLanguage: string;
  useReaderDefaultColors: boolean;
  useParagraphFormat: boolean;
  sendingFormat: 'auto' | 'both' | 'html' | 'plaintext';
  lookInLocalAddressBooks: boolean;
  lookInDirectoryServer: boolean;
  autoAddOutgoingToCollected: boolean;
  checkMissingAttachments: boolean;
  missingAttachmentKeywords: string;
  offerShareLargerThanMb: number;
  placeCopyInSent: boolean;
  sentFolderAccount: string;
  placeRepliesInCurrentFolder: boolean;
  defaultCc: string;
  defaultBcc: string;
  archiveFolderAccount: string;
  draftsFolderAccount: string;
  templatesFolderAccount: string;
  showConfirmOnSave: boolean;
  composeInHtml: boolean;
  autoQuoteOnReply: boolean;
  includeSignatureForReplies: boolean;
  includeSignatureForForwards: boolean;
}

export interface AccountJunkSettings {
  enableAdaptiveJunkControls: boolean;
  whitelistCollectedAddresses: boolean;
  whitelistPersonalAddressBook: boolean;
  trustSpamHeaders: boolean;
  spamClassifier: string;
  moveJunkToFolder: 'junk' | 'other';
  junkFolderAccount: string;
  autoDeleteJunkDays: number;
}

export interface AccountSyncQuotaSettings {
  keepAllMessagesLocally: boolean;
  syncAgeMode: 'all' | 'recent';
  syncRecentDays: number;
  dontDownloadLargerThanKb: number;
  deletionRecoveryMode: 'none' | 'keep_recent' | 'older_than';
  keepRecentMessagesCount: number;
  deleteOlderThanDays: number;
  alwaysKeepStarred: boolean;
}

export interface AccountReturnReceiptsSettings {
  receiptMode: 'global' | 'custom';
  alwaysRequestReceipt: boolean;
  onReceiptArrival: 'inbox' | 'sent';
  onRequestAction: 'never' | 'allow_some' | 'ask';
}

export interface AccountOutgoingSmtpSettings {
  description: string;
  serverName: string;
  port: number;
  userName: string;
  authMethod: string;
  connectionSecurity: 'STARTTLS' | 'SSL/TLS' | 'None';
  isDefault: boolean;
}

export interface PerAccountSettings {
  accountId: string;
  incoming: IncomingMailSettings;
  appearance: AccountAppearanceSettings;
  composition: AccountCompositionSettings;
  junk: AccountJunkSettings;
  syncQuota: AccountSyncQuotaSettings;
  receipts: AccountReturnReceiptsSettings;
  outgoingSmtp: AccountOutgoingSmtpSettings;
}
