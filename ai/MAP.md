# MAP.md — Arquitectura del Sistema "festejá."

> Plataforma SaaS de invitaciones digitales personalizadas para eventos (bodas, quinceañeras, cumpleaños).
> Stack: **React 19 + Vite 8 + Tailwind v4** | **NestJS 11 + TypeORM + PostgreSQL 16** | **Cloudflare R2** | **Vercel + Railway/Render**

---

## 1. FLUJO DE DATOS PRINCIPAL

```
┌─────────────────────────────────────────────────────────────────┐
│                        FLUJO COMPLETO                           │
│                                                                 │
│  [Landing /]                                                    │
│       │                                                         │
│       ▼                                                         │
│  [Solicitar /crear] ──6 pasos──► POST /v1/pedidos ──────────►  │
│       │                              │                          │
│       │                    ┌─────────▼──────────┐               │
│       │                    │  Pedido (PENDIENTE) │               │
│       │                    │  + PedidoServicios  │               │
│       │                    └─────────┬──────────┘               │
│       │                              │ Email → ADMIN            │
│       │                              ▼                          │
│  [Admin /admin/invitaciones/crear] ────multipart────►           │
│       │           POST /v1/invitaciones                         │
│       │                    │                                    │
│       │         ┌──────────▼───────────┐                        │
│       │         │ Invitacion (UUID)     │                        │
│       │         │ + InvitacionServicios │                        │
│       │         │ + FotosAnfitrion → R2 │                        │
│       │         │ + Historias → R2      │                        │
│       │         │ + Musica → R2         │                        │
│       │         │ + Invitados (bulk)    │                        │
│       │         └──────────┬───────────┘                        │
│       │                    │ Pedido → COMPLETADO                │
│       │                    ▼                                    │
│  [Guest /:eventoId] ─────GET /v1/invitaciones/:id/public──►    │
│       │  Template dinámico (slug) ← registry.ts                 │
│       │  ├── Confirmar asistencia (POST /confirmar)             │
│       │  ├── Subir fotos galería (POST /galeria)                │
│       │  └── Descargar ZIP (GET /galeria/download)              │
│       │                                                         │
│  [CRON 02:00] fecha_expiracion < hoy → Delete R2 + DB + Log    │
│  [CRON 10:00] expira en 7|3 días → Email al anfitrión          │
│  [CRON 1ero mes 03:00] LogEliminacion > 6 meses → purge        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. ESTRUCTURA DE DIRECTORIOS (Entry Points marcados con ★)

### Backend (`backend_invitaciones/`)

```
src/
├── main.ts                          ★ Entry point — bootstrap NestJS, CORS, prefix /v1
├── app.module.ts                    ★ Root module — imports, guards globales, DB config
├── app.controller.ts                  GET / health check
├── app.service.ts                     "API running" string
│
├── config/                            (vacío — config via ConfigModule.forRoot en app.module)
│
├── entities/                        ★ CRÍTICO — 16 entidades TypeORM
│   ├── index.ts                       Barrel export de todas las entidades
│   ├── usuario.entity.ts             Admin user (argon2 hash)
│   ├── tipo-evento.entity.ts         Catálogo: Boda(1), Quince(2), Cumple(3)
│   ├── template.entity.ts            Diseños visuales, slug → frontend component
│   ├── servicio.entity.ts            Add-ons con precio (incluidoEnBase flag)
│   ├── pedido.entity.ts              Orden del cliente (PENDIENTE→CONTACTADO→COMPLETADO|CANCELADO)
│   ├── pedido-servicio.entity.ts     M:N con snapshot de precio (precioAlMomento)
│   ├── invitacion.entity.ts          ★ ENTIDAD CENTRAL — UUID PK, JSONB camposEspecificos
│   ├── invitacion-servicio.entity.ts M:N servicios habilitados
│   ├── invitado.entity.ts            Lista de invitados (UNIQUE nombre+apellido por invitación)
│   ├── historia-seccion.entity.ts    Secciones de historia (máx 3, con imagen en R2)
│   ├── foto-anfitrion.entity.ts      Fotos del admin (máx 5, en R2)
│   ├── foto.entity.ts                Galería pública de invitados (máx 1000, en R2)
│   ├── musica.entity.ts              1 MP3 por invitación (UNIQUE, en R2)
│   ├── notificacion.entity.ts        Log de emails (NUEVO_PEDIDO|EXPIRACION_PROXIMA|AVISO_ELIMINACION)
│   └── log-eliminacion.entity.ts     Auditoría post-delete (soft ref)
│
├── common/
│   ├── dto/                           DTOs compartidos (class-validator)
│   └── r2/
│       ├── r2-storage.module.ts       @Global() — S3Client config
│       └── r2-storage.service.ts    ★ Subir/eliminar/listar archivos en Cloudflare R2
│
└── modules/
    ├── auth/
    │   ├── auth.module.ts             PassportModule + JwtModule
    │   ├── auth.controller.ts         POST login, POST logout, GET me
    │   ├── auth.service.ts            argon2 verify, JWT sign, blacklist en memoria
    │   ├── strategies/jwt.strategy.ts Passport JWT extraction + validate
    │   ├── guards/jwt.auth.guard.ts   Global guard, respeta @Public()
    │   └── decorators/public.decorator.ts  SetMetadata('isPublic', true)
    │
    ├── tipos-evento/                  CRUD TipoEvento (toggle activo)
    ├── templates/                     CRUD Template (preview, toggle)
    ├── servicios/                     CRUD Servicio (toggle, update precio)
    ├── precios/
    │   └── precios.controller.ts      POST /calcular — lógica: base + opcionales, ×1.5 si segundaTarjeta
    │
    ├── pedidos/
    │   ├── pedidos.controller.ts      CRUD + PATCH estado + GET resumen (WhatsApp link)
    │   └── pedidos.service.ts         Crea pedido + PedidoServicios con precio snapshot
    │
    ├── invitaciones/                ★ MÓDULO HUB
    │   ├── invitaciones.controller.ts POST crear (multipart), GET listar, GET /:id, PUT /:id, DELETE /:id
    │   ├── invitaciones.service.ts    Transacciones, cascade delete + R2 cleanup + LogEliminacion
    │   └── dto/                       CreateInvitacionDto, UpdateInvitacionDto
    │
    ├── historia/                      CRUD HistoriaSeccion (multipart, orden 1-3)
    ├── invitados/                     Bulk load JSON, confirmar (idempotente), export CSV
    ├── galeria/                       Upload público, delete c/password, download ZIP stream
    ├── musica/                        Upload/replace/delete MP3
    │
    ├── notificaciones/              @Global() — Nodemailer SMTP, guarda en DB
    │   ├── notificaciones.service.ts  enviarNuevoPedido(), enviarExpiracion()
    │   └── notificaciones.controller.ts GET listar, POST test
    │
    └── cron-jobs/
        └── cron-jobs.service.ts     ★ 3 @Cron: autoDelete(02:00), notifyExpiring(10:00), cleanLogs(1ero/03:00)
```

### Frontend (`invitaciones-frontend/`)

```
src/
├── main.tsx                         ★ Entry point — React DOM, SW register, AuthProvider
├── App.tsx                          ★ Router principal — rutas públicas + admin(lazy+Suspense)
├── index.css                          Tailwind v4 + custom properties + animaciones
│
├── config/
│   └── env.ts                       ★ VITE_API_BASE_URL, VITE_GOOGLE_MAPS_API_KEY, VITE_WHATSAPP_NUMBER
│
├── context/
│   ├── authContext.tsx                AuthProvider (JWT en localStorage 'inv_token', GET /auth/me on mount)
│   ├── authContextInstance.ts         Tipo User + createContext
│   └── useAuth.ts                     Hook consumidor
│
├── services/                        ★ CAPA HTTP — Axios + interceptors (JWT auto-inject, 401→redirect)
│   ├── apiClient.ts                   Instancia Axios (baseURL, timeout 15s, interceptors)
│   ├── authService.ts                 login/logout/me/isAuthenticated
│   ├── invitacionService.ts           getInvitacionPublica (+ cache localStorage), confirmar, asistentes
│   ├── crearInvitacionService.ts      WizardFormState → multipart FormData → POST
│   ├── pedidoService.ts              crearPedido (público)
│   ├── galeriaService.ts             listar/subir/eliminar/getZipUrl
│   ├── adminInvitacionService.ts     CRUD admin + sub-recursos (historia/musica/fotos)
│   ├── adminPedidoService.ts         getAll(query)/getById
│   ├── dashboardService.ts           fetchDashboardData (métricas agregadas)
│   ├── templateService.ts            getAll/create/toggle
│   └── servicioService.ts            getAll/toggle/update
│
├── types/                           ★ CRÍTICO — Contratos frontend
│   ├── invitation.ts                  InvitacionPublica, Template, Servicio, FotoAnfitrion, Musica, Historia
│   ├── adminInvitacion.ts             InvitacionAdmin, InvitacionServicio, helpers (getDaysLeft, getStatus)
│   ├── adminPedido.ts                 Pedido, PedidoServicio, EstadoPedido
│   ├── crearInvitacion.ts            WizardFormState (6 steps), INICIAL_CAMPOS por tipoEvento
│   └── dashboard.ts                   DashboardData, métricas
│
├── components/
│   ├── admin/
│   │   ├── AdminLayout.tsx            Sidebar + Outlet (React Router)
│   │   ├── AdminSidebar.tsx           Nav: dashboard, pedidos, invitaciones, servicios, templates
│   │   ├── crear-invitacion/
│   │   │   ├── CrearInvitacionWizard.tsx  ★ Wizard 6 pasos (state machine local)
│   │   │   ├── Step1DatosBasicos.tsx      Template + tipo evento + título
│   │   │   ├── Step2Evento.tsx            Fecha, ubicación(es), contraseña, campos específicos
│   │   │   ├── Step3Servicios.tsx         Toggles de servicios
│   │   │   ├── Step4Contenido.tsx         Fotos, música, secciones historia
│   │   │   ├── Step5Invitados.tsx         Lista invitados
│   │   │   ├── Step6Revisar.tsx           Review + submit
│   │   │   └── ResultScreen.tsx           URL pública + QR
│   │   ├── dashboard/                     MetricGrid, MetricCard, RecentOrdersPanel, ExpiringPanel
│   │   ├── invitaciones/                  InvitacionesTable, Tabs, StatusBadge
│   │   └── pedidos/                       PedidosTable, Filters, DetailModal, StatusBadge
│   │
│   ├── invitations/                 ★ TEMPLATES DE INVITACIÓN
│   │   ├── registry.ts               import.meta.glob → lazy load por slug
│   │   ├── invitation-basic/         Componentes compartidos (envelope, music player)
│   │   ├── boda-clasica/             invitation-view.tsx + secciones
│   │   ├── boda-moderna/
│   │   ├── boda-rustica/
│   │   ├── quince-elegante/
│   │   ├── quince-moderna/
│   │   ├── quince-princesa/
│   │   ├── cumple-elegante/
│   │   ├── cumple-festivo/
│   │   └── cumple-infantil/
│   │
│   ├── landing/                       Header, Hero, Events, Features, HowItWorks, Showcase, Testimonials, FinalCTA, Footer
│   └── solicitar/                     Wizard público 6 pasos (StepEvento→StepDiseno→StepServicios→StepPreview→StepContacto→StepConfirmacion)
│
├── pages/
│   ├── public/
│   │   ├── LandingPage.tsx            /
│   │   ├── SolicitarPage.tsx          /crear (wizard solicitud)
│   │   ├── PedidoEnviadoPage.tsx      /pedido-enviado
│   │   ├── InvitacionPage.tsx       ★ /:eventoId — carga template dinámico
│   │   ├── GaleriaPage.tsx            /:eventoId/galeria
│   │   └── AsistentesPage.tsx         /:eventoId/asistentes (password-protected)
│   ├── admin/
│   │   ├── LoginPage.tsx              /admin/login
│   │   ├── DashboardPage.tsx          /admin/dashboard
│   │   ├── PedidosPage.tsx            /admin/pedidos
│   │   ├── InvitacionesPage.tsx       /admin/invitaciones
│   │   ├── CrearInvitacionPage.tsx    /admin/invitaciones/crear
│   │   ├── EditarInvitacionPage.tsx   /admin/invitaciones/:id
│   │   ├── ServiciosPage.tsx          /admin/servicios
│   │   ├── TemplatesPage.tsx          /admin/templates
│   │   └── ReportesPage.tsx           /admin/reportes (skeleton)
│   └── legal/                         Términos, Privacidad, Cookies, Disclaimer
│
├── hooks/                             Custom hooks (vacío o minimal)
├── utils/
│   ├── formatters.ts                  formatDate, formatDateLong, formatPrice, formatTime, formatFileSize (es-AR)
│   └── validators.ts                  nombre, email, telefono, imageFile, audioFile
│
└── assets/fonts/                      Cormorant Garamond + Outfit
```

### Otros

```
Invitaciones/
├── Documentacion/
│   ├── db/schema.sql                ★ DDL completo PostgreSQL 16 (16 tablas, índices, constraints)
│   ├── Diagramas/                     Diagramas de arquitectura
│   ├── Modelo de negocio y flujos/    Docs de negocio
│   └── Requerimientos/                SRS
├── boda-response.json                 Ejemplo de respuesta API
└── boda-multiples-lugares.json        Ejemplo multi-ubicación

prototipo/                             HTML estáticos (landing, admin, crear)
```

---

## 3. MODELO DE DATOS — RELACIONES

```
Usuario (1) ──── auth ────── JWT tokens

TipoEvento (1) ─┬── (N) Template
                 └── (N) Invitacion
                          │
Template (1) ────────── (N) Invitacion
                          │
Pedido (1) ──┬── (N) PedidoServicio ──── (1) Servicio
             └── (0..N) Invitacion      ★ Un pedido puede no tener invitación aún
                          │
Invitacion (1) ─┬── (N) InvitacionServicio ──── (1) Servicio
   [UUID PK]    ├── (N) Invitado          [UNIQUE(invitacion_id, nombre, apellido)]
                ├── (N) HistoriaSeccion   [máx 3, orden 1-3]
                ├── (N) FotoAnfitrion     [máx 5, almacenadas en R2]
                ├── (N) Foto              [máx 1000, subidas por invitados]
                └── (1) Musica            [UNIQUE invitacion_id, 1 MP3]

Notificacion ──── log independiente (no FK a invitación)
LogEliminacion ── audit post-delete (referencia blanda al UUID)
```

### Campos JSONB dinámicos (`campos_especificos`)

| tipoEventoId | Evento | Campos |
|---|---|---|
| 1 | Boda | `novio1, novio2, tipoCeremonia, dressCode, mostrarLluviaSobres, alias, cbu` |
| 2 | Quinceañera | `nombre, colorTematico, horaPresentacion, valsPareja, padrinos, dressCode` |
| 3 | Cumpleaños | `nombre, edad, tipo, actividades, dressCode` |

---

## 4. API — MAPA DE ENDPOINTS

Prefijo global: `/v1`. Guard global: JWT + Throttle (100 req/min).

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| `POST` | `/auth/login` | PUBLIC | Login → JWT |
| `POST` | `/auth/logout` | JWT | Blacklist token (in-memory) |
| `GET` | `/auth/me` | JWT | Perfil usuario |
| `GET/POST/PUT/PATCH` | `/tipos-evento[/:id]` | mixto | CRUD tipos evento |
| `GET/POST` | `/templates` | mixto | CRUD templates |
| `GET` | `/templates/:id/preview` | PUBLIC | Preview template |
| `GET/POST` | `/servicios` | mixto | CRUD servicios |
| `POST` | `/precios/calcular` | PUBLIC | Calcular precio (base + opcionales, ×1.5 si 2da tarjeta) |
| `POST` | `/pedidos` | PUBLIC | Crear pedido desde landing |
| `GET` | `/pedidos` | JWT | Listar pedidos (paginado) |
| `GET` | `/pedidos/:id` | JWT | Detalle pedido |
| `PATCH` | `/pedidos/:id/estado` | JWT | Cambiar estado |
| `GET` | `/pedidos/:id/resumen` | PUBLIC | Resumen + link WhatsApp |
| `POST` | `/invitaciones` | JWT | Crear invitación (multipart) |
| `GET` | `/invitaciones` | JWT | Listar (paginado) |
| `GET` | `/invitaciones/:id` | JWT | Detalle con relaciones |
| `PUT` | `/invitaciones/:id` | JWT | Actualizar |
| `DELETE` | `/invitaciones/:id` | JWT | Hard delete + R2 cleanup + audit |
| `GET` | `/invitaciones/:id/public` | PUBLIC | Vista guest (template render) |
| `GET` | `/invitaciones/:id/countdown` | PUBLIC | Countdown al evento |
| `POST/DELETE` | `/invitaciones/:id/fotos-anfitrion` | JWT | CRUD fotos admin |
| `GET/POST/PUT/DELETE` | `/invitaciones/:id/historias` | mixto | CRUD secciones historia |
| `GET/POST/DELETE` | `/invitaciones/:id/galeria` | PUBLIC* | Galería invitados (*delete con password header) |
| `GET` | `/invitaciones/:id/galeria/download` | PUBLIC | ZIP stream |
| `GET` | `/invitaciones/:id/galeria/stats` | JWT | Storage stats |
| `GET/POST/DELETE` | `/invitaciones/:id/musica` | mixto | CRUD MP3 |
| `POST` | `/invitaciones/:id/invitados` | JWT | Bulk load JSON |
| `GET` | `/invitaciones/:id/invitados` | JWT | Listar + estado |
| `GET` | `/invitaciones/:id/invitados/export` | JWT | CSV export |
| `POST` | `/invitaciones/:id/confirmar` | PUBLIC | RSVP (idempotente) |
| `GET` | `/invitaciones/:id/asistentes` | PUBLIC* | Lista asistentes (*password header) |
| `GET` | `/notificaciones` | JWT | Listar notificaciones |
| `POST` | `/notificaciones/test` | JWT | Email de prueba |

---

## 5. ARCHIVOS CRÍTICOS (SIEMPRE EN CONTEXTO)

Estos archivos contienen la lógica central. Un agente debe leer estos antes de cualquier cambio:

### Tier 1 — Imprescindibles (modelos + tipos + config)
| Archivo | Razón |
|---------|-------|
| `backend_invitaciones/src/entities/index.ts` | Barrel de todas las entidades |
| `backend_invitaciones/src/entities/invitacion.entity.ts` | Entidad central, todas las relaciones |
| `backend_invitaciones/src/app.module.ts` | Grafo de dependencias, env vars, DB config |
| `invitaciones-frontend/src/types/invitation.ts` | Contrato público frontend |
| `invitaciones-frontend/src/types/crearInvitacion.ts` | WizardFormState completo + INICIAL_CAMPOS |
| `invitaciones-frontend/src/config/env.ts` | Variables de entorno frontend |
| `invitaciones-frontend/src/services/apiClient.ts` | Interceptors, base URL, auth header |
| `Invitaciones/Documentacion/db/schema.sql` | DDL canónico (source of truth del esquema) |

### Tier 2 — Contexto frecuente
| Archivo | Razón |
|---------|-------|
| `backend_invitaciones/src/modules/invitaciones/invitaciones.service.ts` | Lógica central: crear, update, delete con transacciones |
| `backend_invitaciones/src/modules/invitaciones/invitaciones.controller.ts` | Endpoints hub |
| `backend_invitaciones/src/common/r2/r2-storage.service.ts` | Toda interacción con R2 |
| `backend_invitaciones/src/modules/auth/auth.service.ts` | JWT + argon2 |
| `backend_invitaciones/src/modules/cron-jobs/cron-jobs.service.ts` | Auto-delete + notificaciones |
| `invitaciones-frontend/src/types/adminInvitacion.ts` | Modelo admin + helpers estado |
| `invitaciones-frontend/src/types/adminPedido.ts` | Pedido + EstadoPedido |
| `invitaciones-frontend/src/App.tsx` | Routing completo |
| `invitaciones-frontend/src/components/invitations/registry.ts` | Carga dinámica de templates |
| `invitaciones-frontend/src/services/crearInvitacionService.ts` | FormData builder complejo |

### Tier 3 — Según tarea
| Área | Archivos clave |
|------|---------------|
| Nuevo template | `components/invitations/registry.ts`, cualquier `invitation-view.tsx` existente, `types/invitation.ts` |
| Galería | `modules/galeria/`, `services/galeriaService.ts`, `pages/public/GaleriaPage.tsx` |
| Pedidos | `modules/pedidos/`, `services/pedidoService.ts`, `components/solicitar/` |
| Email/Notif | `modules/notificaciones/`, `modules/cron-jobs/` |
| Styling | `index.css` (design tokens), cualquier template `invitation-view.tsx` |

---

## 6. ALMACENAMIENTO R2 — ESTRUCTURA

```
{R2_BUCKET}/
└── invitaciones/
    └── {invitacion-uuid}/
        ├── galeria/{uuid}.{ext}          ← Fotos invitados (público)
        ├── anfitrion/{orden}-foto.{ext}  ← Fotos admin (máx 5)
        ├── historias/{orden}-{uuid}.{ext} ← Imágenes historia
        └── musica/musica.mp3             ← Único MP3 (overwrite)
```

**Limpieza:** `R2StorageService.eliminarCarpetaInvitacion()` → ListObjects + DeleteObjects recursivo.

---

## 7. SEGURIDAD

| Capa | Mecanismo |
|------|-----------|
| Auth | JWT (8h exp) + argon2 hash + blacklist in-memory en logout |
| Rate limit | ThrottlerGuard 100 req/60s por IP (global) |
| Rutas | `@Public()` decorator marca endpoints públicos; resto requiere JWT |
| Galería delete | Header `x-password` comparado contra `invitacion.contrasenaAsistentes` |
| Validación | class-validator en todos los DTOs (backend), validators.ts (frontend) |
| Uploads | MIME type verificado en backend (no solo extensión), límites: 15MB fotos, 20MB audio |
| XSS | DOMPurify en frontend para HTML dinámico |
| CORS | Configurado en main.ts (`FRONTEND_URL`) |
| PWA | Service Worker cache-first assets, network-first API + HTML |

---

## 8. CRON JOBS (timezone: America/Argentina/Buenos_Aires)

| Cron | Horario | Acción |
|------|---------|--------|
| Auto-delete | 02:00 diario | `fecha_expiracion < hoy` → R2 delete → DB hard delete → LogEliminacion |
| Notify expiring | 10:00 diario | `fecha_expiracion` en 7 o 3 días → email al anfitrión con CTA descarga |
| Log cleanup | 03:00 1ero/mes | `LogEliminacion.createdAt` > 6 meses → purge |
