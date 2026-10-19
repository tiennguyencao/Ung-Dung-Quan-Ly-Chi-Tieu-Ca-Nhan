import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Dev-server proxy forwards /api to the Express backend (architecture-baseline §1),
// so the browser never needs CORS configured for local development.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // autoUpdate, not prompt: a stale app shell talking to a live financial
      // API is a correctness risk, so the SW always activates the newest build
      // rather than waiting for the user to accept an update.
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Sổ Chi Tiêu — Personal Expense Manager',
        short_name: 'Sổ Chi Tiêu',
        description: 'Track income, expenses and budgets, and see where your money goes.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#F4F6F2', // paper — matches the app's own background
        theme_color: '#0E4B3F', // ink — matches the brand color already in use
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Precache the app shell only — JS/CSS/HTML/icons. Never user data.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: 'index.html',
        // Client-side routes resolve offline; /api must never be answered
        // from the HTML shell, or a failed request would look like a page.
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            // DELIBERATE: financial data is never cached and writes are never
            // queued for later replay. Offline means "this request fails and
            // the UI says so", never "we'll sync it later" — a replayed
            // transaction could double-post or overwrite newer server state.
            urlPattern: ({ url }) => url.pathname.startsWith('/api'),
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
