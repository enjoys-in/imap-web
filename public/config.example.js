// ==============================================================================
// AirSend Web - Client Runtime Configuration Template (public/config.example.js)
// ==============================================================================
// Copy this file to `public/config.js` or mount it at runtime in Docker/Kubernetes.
// Values here are read directly by the browser via `window.__RUNTIME_CONFIG__`.
// No Next.js rebuild or restart is required when changing these values.
// ==============================================================================

window.__RUNTIME_CONFIG__ = {
  // Normal origin / base domain without path
  baseUrl: 'http://localhost:9503',

  // Full API URL used by the browser client (e.g., http://localhost:9503/api/v1/imap)
  apiUrl: 'http://localhost:9503/api/v1/imap',

  // Active API version
  apiVersion: 'v1',

  // Branding & display settings
  appName: 'AirSend',
  appVersion: '1.0.0',
  defaultTheme: 'dark',

  // Feature flags
  enableWebPush: true,
};
