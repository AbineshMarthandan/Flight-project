import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// The browser always attaches its real `Origin`/`Referer` (http://localhost:5173)
// to POST requests, even ones that are same-origin from the page's own point of
// view. Some backends reject that outright with a 403 because it doesn't match
// their own host, as an origin/CSRF check unrelated to standard CORS. Rewriting
// those headers to the proxy target before forwarding keeps the backend happy.
function trustOrigin(target) {
  return (proxy) => {
    proxy.on('proxyReq', (proxyReq) => {
      proxyReq.setHeader('origin', target)
      proxyReq.setHeader('referer', `${target}/`)
    })
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Browser calls same-origin '/api/flight/*' so no CORS preflight ever
      // happens; Vite forwards the request server-side to the internal
      // backend, which never sees (or needs to allow) a cross-origin call.
      '/api/flight': {
        target: 'http://flight-search-v2.flight-ns.svc.tiket',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/flight/, '/tix-flight-search'),
        configure: trustOrigin('http://flight-search-v2.flight-ns.svc.tiket'),
      },
      // Cart API runs on a separate host/port, so it needs its own proxy
      // entry even though it hits the same browser-side CORS problem.
      '/api/cart': {
        target: 'http://localhost:8880',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cart/, '/tix-flight-cart'),
        configure: trustOrigin('http://localhost:8880'),
      },
      // Ancillary API — baggage. Named '-baggage' (not the bare '/api/ancillary')
      // because Vite's proxy matches by string prefix in definition order: a
      // bare '/api/ancillary' key is also a prefix of '/api/ancillary-meal' and
      // '/api/ancillary-seat' below, so it would intercept their requests first
      // and mangle the rewritten path (e.g. '/tix-flight-ancillary-meal/...').
      '/api/ancillary-baggage': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ancillary-baggage/, '/tix-flight-ancillary'),
        configure: trustOrigin('http://localhost:8888'),
      },
      // Ancillary API — meals. Separate port from baggage above.
      '/api/ancillary-meal': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ancillary-meal/, '/tix-flight-ancillary'),
        configure: trustOrigin('http://localhost:8888'),
      },
      // Ancillary API — seats. Same host as meals (confirmed by matching
      // "X-Currency cannot be blank" behavior), kept as its own entry so each
      // ancillary feature can point elsewhere independently if that changes.
      '/api/ancillary-seat': {
        target: 'http://localhost:8888',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/ancillary-seat/, '/tix-flight-ancillary'),
        configure: trustOrigin('http://localhost:8888'),
      },
    },
  },
})
