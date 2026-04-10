/**
 * Service Worker — festejá
 *
 * Estrategia:
 *  - App shell (HTML/JS/CSS):  network-first → cache → maintenance.html
 *  - Invitaciones públicas API: network-first → cache (última versión conocida)
 *  - Assets estáticos:          cache-first  → network
 */

const CACHE_VERSION = 'festeja-v1'
const MAINTENANCE_URL = '/maintenance.html'

// Archivos del app shell que se cachean al instalar el SW
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/maintenance.html',
]

// ── INSTALL ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  )
})

// ── ACTIVATE ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_VERSION)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

// ── FETCH ─────────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  // Solo interceptar GET
  if (event.request.method !== 'GET') return

  const url = new URL(event.request.url)

  // ── Navegación (páginas HTML) ──
  // Network-first: si el servidor no responde → maintenance.html
  if (event.request.mode === 'navigate') {
    event.respondWith(handleNavigation(event.request))
    return
  }

  // ── API pública de invitaciones ──
  // Network-first: guarda en caché la última respuesta exitosa
  if (isInvitacionPublicaApi(url)) {
    event.respondWith(handleInvitacionApi(event.request))
    return
  }

  // ── Assets estáticos (JS, CSS, imágenes, fuentes) ──
  // Cache-first: mejora rendimiento; se actualiza en background
  if (isStaticAsset(url)) {
    event.respondWith(handleStaticAsset(event.request))
    return
  }
})

// ─────────────────────────────────────────────────────────────────────────────
// Handlers
// ─────────────────────────────────────────────────────────────────────────────

async function handleNavigation(request) {
  try {
    const response = await fetch(request)
    // 5xx → el servidor está caído
    if (response.status >= 500) {
      return (await caches.match(MAINTENANCE_URL)) ?? response
    }
    // Actualiza caché del shell
    const cache = await caches.open(CACHE_VERSION)
    cache.put(request, response.clone())
    return response
  } catch {
    // Sin red → intentar caché, luego maintenance
    const cached = await caches.match(request)
    if (cached) return cached
    return (await caches.match(MAINTENANCE_URL)) ?? new Response('Sin conexión', { status: 503 })
  }
}

async function handleInvitacionApi(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function handleStaticAsset(request) {
  const url = new URL(request.url)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return fetch(request)
  }

  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    return new Response('', { status: 503 })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Utilidades
// ─────────────────────────────────────────────────────────────────────────────

function isInvitacionPublicaApi(url) {
  // Coincide con /invitaciones/<id>/public (backend en mismo origen o subdominio api.)
  return /\/invitaciones\/[^/]+\/public/.test(url.pathname)
}

function isStaticAsset(url) {
  return /\.(js|css|png|jpg|jpeg|webp|svg|woff2?|ttf|ico)(\?.*)?$/.test(url.pathname)
}
