import { fileURLToPath, URL } from 'node:url'
import http from 'node:http'
import https from 'node:https'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { MongoClient, ObjectId } from 'mongodb'
import Redis from 'ioredis'
import { Kafka } from 'kafkajs'
import SnappyJS from 'snappyjs'

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
const PUBLISH_CART_PATH = '/__publish-cart'

// ── Publish-cart middleware ──────────────────────────────────────────────────
// POST /__publish-cart  { cartId: "..." }
//
// For a given cartId it:
//   1. Fetches the Cart document from local MongoDB
//   2. Builds the CartCreatedKafkaPublish payload (mirrors CartPublisherServiceImpl)
//   3. Publishes it to com.tiket.tix.flight.cart.cartCreated (key: cartCreated.<id>.<reqId>)
//   4. Snappy-compresses and writes to Redis under
//        com.tiket.tix.flight.cart.createdCart-<cartId>-zip  (TTL 1800 s)
//
// All three backing services are read from the same local defaults that the
// Spring app uses (application-local.yml).
const MONGO_URI = 'mongodb://localhost:27017/tix_flight_cart'
const KAFKA_BROKERS = ['localhost:9092']
const REDIS_HOST = 'localhost'
const REDIS_PORT = 6379
const CART_CACHE_TTL_SECONDS = 1800
const KAFKA_TOPIC = 'com.tiket.tix.flight.cart.cartCreated'
const CREATED_CART_CACHE_KEY_PREFIX = 'com.tiket.tix.flight.cart.createdCart-'

function buildCartCreatedPayload(cart, cartId) {
  const requestId = `manual-retrigger-${cartId}`
  return {
    id: cartId,
    actionKey: 'CREATE_CART',
    mandatoryRequest: {
      storeId: cart.storeId || 'TIKETCOM',
      requestId,
      username: cart.username || '',
      serviceId: 'tix-flight-cart-be',
      channelId: cart.channelId || 'mweb',
      lang: cart.language ? cart.language.toLowerCase() : 'id',
      token: '',
    },
    timestamp: new Date().toISOString(),
    cart,
    language: cart.language || 'ID',
  }
}

function publishCartPlugin() {
  return {
    name: 'publish-cart',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== PUBLISH_CART_PATH || req.method !== 'POST') {
          next()
          return
        }

        let body = ''
        req.on('data', (chunk) => (body += chunk))
        req.on('end', async () => {
          res.setHeader('content-type', 'application/json')

          let cartId
          try {
            cartId = JSON.parse(body || '{}').cartId
            if (!cartId) throw new Error('cartId is required')
          } catch (err) {
            res.statusCode = 400
            res.end(JSON.stringify({ error: err.message }))
            return
          }

          const steps = []

          // 1. Fetch from MongoDB
          let cart
          const mongo = new MongoClient(MONGO_URI)
          try {
            await mongo.connect()
            const db = mongo.db()
            cart = await db.collection('cart').findOne({ _id: new ObjectId(cartId) })
            if (!cart) throw new Error(`Cart not found: ${cartId}`)
            steps.push({ step: 'mongo', status: 'ok', cartId })
          } catch (err) {
            res.statusCode = 404
            res.end(JSON.stringify({ error: err.message, steps }))
            await mongo.close()
            return
          } finally {
            await mongo.close()
          }

          const payload = buildCartCreatedPayload(cart, cartId)
          const payloadJson = JSON.stringify(payload)

          // 2. Publish to Kafka
          const kafka = new Kafka({ brokers: KAFKA_BROKERS, clientId: 'flight-project-vite' })
          const producer = kafka.producer()
          try {
            await producer.connect()
            const kafkaKey = `cartCreated.${cartId}.${payload.mandatoryRequest.requestId}`
            await producer.send({
              topic: KAFKA_TOPIC,
              messages: [{ key: kafkaKey, value: payloadJson }],
            })
            steps.push({ step: 'kafka', status: 'ok', topic: KAFKA_TOPIC, key: kafkaKey })
          } catch (err) {
            steps.push({ step: 'kafka', status: 'error', error: err.message })
          } finally {
            await producer.disconnect()
          }

          // 3. Write to Redis (Snappy-compressed, matching CacheZipServiceStrategyImpl)
          const redis = new Redis({ host: REDIS_HOST, port: REDIS_PORT })
          try {
            const redisKey = `${CREATED_CART_CACHE_KEY_PREFIX}${cartId}-zip`
            const compressed = SnappyJS.compress(Buffer.from(payloadJson, 'utf8'))
            await redis.set(redisKey, compressed, 'EX', CART_CACHE_TTL_SECONDS)
            steps.push({ step: 'redis', status: 'ok', key: redisKey, ttl: CART_CACHE_TTL_SECONDS })
          } catch (err) {
            steps.push({ step: 'redis', status: 'error', error: err.message })
          } finally {
            redis.disconnect()
          }

          res.statusCode = 200
          res.end(JSON.stringify({ ok: true, cartId, steps }))
        })
      })
    },
  }
}

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
  plugins: [vue(), vueDevTools(), envSwitcherPlugin(), publishCartPlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
