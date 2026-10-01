/*
 * THE LAST TRAIN: offline cache.
 *
 * - Content-hashed build output under <base>/assets/: cache-first. Hashed file
 *   names are immutable, so this can never mix builds.
 * - Everything else same-origin (HTML, manifest, icons): network-first, cached
 *   copy only when offline, so a new deploy is picked up on the next load
 *   whenever the network is available.
 * - Cross-origin requests (e.g. Google Fonts) are not intercepted.
 *
 * __BUILD_ID__ is replaced at build time (see vite.config.ts). Each new build
 * installs a new worker, and activation deletes every older cache.
 */
const CACHE_PREFIX = 'last-train-'
const CACHE_NAME = `${CACHE_PREFIX}__BUILD_ID__`

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      )
      await self.clients.claim()
    })(),
  )
})

function isCacheable(response) {
  return response && response.ok && response.type === 'basic'
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  try {
    const response = await fetch(request)
    if (isCacheable(response)) cache.put(request, response.clone())
    return response
  } catch (error) {
    const cached = (await cache.match(request)) || (await cache.match(self.registration.scope))
    if (cached) return cached
    throw error
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME)
  const cached = await cache.match(request)
  if (cached) return cached
  const response = await fetch(request)
  if (isCacheable(response)) cache.put(request, response.clone())
  return response
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return
  if (url.pathname.endsWith('/sw.js')) return

  // Only Vite's content-hashed output under <base>/assets/ is immutable.
  // Everything else (HTML, manifest, icons) must reflect the latest deploy.
  const isHashedAsset = url.pathname.startsWith(new URL('assets/', self.registration.scope).pathname)

  event.respondWith(isHashedAsset ? cacheFirst(request) : networkFirst(request))
})
