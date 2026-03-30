export const env = {
  apiBaseUrl: String(import.meta.env.VITE_API_BASE_URL ?? ''),
  googleMapsKey: String(import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''),
  whatsappNumber: String(import.meta.env.VITE_WHATSAPP_NUMBER ?? ''),
  appName: String(import.meta.env.VITE_APP_NAME ?? 'festejá.'),
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const