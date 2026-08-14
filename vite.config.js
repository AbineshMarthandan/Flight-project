import { fileURLToPath, URL } from 'node:url'
import http from 'node:http'
import https from 'node:https'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Each service can be pointed at 'local' or 'k8s' at runtime (see SettingsView.vue)
// without restarting the dev server. Vite's declarative `server.proxy` fixes its
// target when the config loads, so switching on the fly needs a hand-rolled proxy
// middleware that re-reads the current selection on every request instead.
const SERVICES = {
  flight: {
    prefix: '/api/flight',
    backendPrefix: '/tix-flight-search',
    label: 'Flight Search',
    envs: {
      local: 'http://localhost:8581',
      k8s: 'http://flight-search-v2.flight-ns.svc.tiket',
    },
  },
  cart: {
    prefix: '/api/cart',
    backendPrefix: '/tix-flight-cart',
    label: 'Cart',
    envs: {
      local: 'http://localhost:8880',
      k8s: 'http://flight-cart.flight-ns.svc.tiket',
    },
  },
  ancillaryBaggage: {
    prefix: '/api/ancillary-baggage',
    backendPrefix: '/tix-flight-ancillary',
    label: 'Ancillary — Baggage',
    envs: {
      local: 'http://localhost:8888',
      k8s: 'http://flight-ancillary.flight-ns.svc.tiket',
    },
  },
  ancillaryMeal: {
    prefix: '/api/ancillary-meal',
    backendPrefix: '/tix-flight-ancillary',
    label: 'Ancillary — Meal',
    envs: {
      local: 'http://localhost:8888',
      k8s: 'http://flight-ancillary.flight-ns.svc.tiket',
    },
  },
  ancillarySeat: {
    prefix: '/api/ancillary-seat',
    backendPrefix: '/tix-flight-ancillary',
    label: 'Ancillary — Seat',
    envs: {
      local: 'http://localhost:8888',
      k8s: 'http://flight-ancillary.flight-ns.svc.tiket',
    },
  },
  bookingV6: {
    prefix: '/api/booking-v6',
    backendPrefix: '/tix-flight-core/v6',
    label: 'Booking v6',
    envs: {
      local: 'http://localhost:8765',
    },
  },
  bookingV7: {
    prefix: '/api/booking-v7',
    backendPrefix: '/tix-flight-core/v7',
    label: 'Booking v7',
    envs: {
      local: 'http://localhost:8765',
    },
  },
  bookingTrace: {
    prefix: '/api/booking-trace',
    backendPrefix: '/tix-flight-core/log/booking-internal-api-trace',
    label: 'Booking — Internal API Trace',
    envs: {
      local: 'http://localhost:8765',
    },
  },
}

// The base64 decode endpoint always hits this fixed host — it must NOT follow
// the local/k8s switcher above, and must NOT be listed as a switchable option.
const FLIGHT_DECODE_PREFIX = '/api/flight-decode'
const FLIGHT_DECODE_BACKEND_PREFIX = '/tix-flight-search'
const FLIGHT_DECODE_TARGET = 'http://flight-search.flight-ns.svc.tiket'

const ENV_CONFIG_PATH = '/__env-config'

// http-proxy-middleware/http-proxy aren't directly resolvable as project
// dependencies (Vite vendors its own copy internally), so requests are
// forwarded by hand here to allow re-picking the target per request.
function forward(req, res, targetBase, backendPrefix, prefix) {
  const target = new URL(targetBase)
  const rewrittenPath = req.url.replace(prefix, backendPrefix)
  const client = target.protocol === 'https:' ? https : http

  const proxyReq = client.request(
    {
      protocol: target.protocol,
      hostname: target.hostname,
      port: target.port || (target.protocol === 'https:' ? 443 : 80),
      path: rewrittenPath,
      method: req.method,
      headers: {
        ...req.headers,
        host: target.host,
        origin: targetBase,
        referer: `${targetBase}/`,
      },
    },
    (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers)
      proxyRes.pipe(res, { end: true })
    },
  )
  proxyReq.on('error', (err) => {
    res.statusCode = 502
    res.end(`Proxy error: ${err.message}`)
  })
  req.pipe(proxyReq, { end: true })
}

function envSwitcherPlugin() {
  const currentEnv = Object.fromEntries(Object.keys(SERVICES).map((key) => [key, 'local']))

  return {
    name: 'env-switcher',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === ENV_CONFIG_PATH) {
          if (req.method === 'GET') {
            res.setHeader('content-type', 'application/json')
            res.end(JSON.stringify({ services: SERVICES, current: currentEnv }))
            return
          }
          if (req.method === 'POST') {
            let body = ''
            req.on('data', (chunk) => (body += chunk))
            req.on('end', () => {
              try {
                const { service, env } = JSON.parse(body || '{}')
                if (!SERVICES[service] || !SERVICES[service].envs[env]) {
                  res.statusCode = 400
                  res.end(JSON.stringify({ error: 'Unknown service or environment' }))
                  return
                }
                currentEnv[service] = env
                res.setHeader('content-type', 'application/json')
                res.end(JSON.stringify({ current: currentEnv }))
              } catch {
                res.statusCode = 400
                res.end(JSON.stringify({ error: 'Invalid request body' }))
              }
            })
            return
          }
        }

        if (req.url.startsWith(FLIGHT_DECODE_PREFIX)) {
          forward(req, res, FLIGHT_DECODE_TARGET, FLIGHT_DECODE_BACKEND_PREFIX, FLIGHT_DECODE_PREFIX)
          return
        }

        const match = Object.entries(SERVICES).find(([, svc]) => req.url.startsWith(svc.prefix))
        if (!match) {
          next()
          return
        }
        const [key, svc] = match
        forward(req, res, svc.envs[currentEnv[key]], svc.backendPrefix, svc.prefix)
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools(), envSwitcherPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
