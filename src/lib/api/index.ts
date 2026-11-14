// Core HTTP client
export * from './client';

// Handlers by domain
export * as accountsApi from './handlers/account';
export * as emailsApi from './handlers/email';
export * as foldersApi from './handlers/folder';
export * as calendarApi from './handlers/calendar';
export * as settingsApi from './handlers/settings';
export * as jobsApi from './handlers/jobs';
export * as capabilitiesApi from './handlers/capabilities';
export * as streamApi from './handlers/stream';
export * as pushApi from './handlers/push';

// All handler functions directly accessible
export * from './handlers';
