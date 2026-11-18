// ==============================================================================
// AirSend Web - Client Runtime Configuration Template (public/config.example.js)
// ==============================================================================
// `pnpm dev` and `pnpm build` generate public/config.js from the environment.
// Values here are public and are read by the browser via `window.__RUNTIME_CONFIG__`.
// ==============================================================================

window.__RUNTIME_CONFIG__ = {
  // Normal origin / base domain without path
  baseUrl: 'http://localhost:9503',

  // Full API URL used by the browser client (e.g., http://localhost:9503/api/v1/imap)
  apiUrl: 'http://localhost:9503/api/v1/imap',

  // Calendar service origin
  calendarApiUrl: 'http://localhost:8443',
  calendarUrl: 'http://localhost:8443',

  // Active API version
  apiVersion: 'v1',

  // Branding & display settings
  appName: 'AirSend',
  appVersion: '1.0.0',
  nodeEnv: 'development',
  defaultTheme: 'dark',

  // Feature flags
  enableWebPush: true,
};
