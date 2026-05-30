# RULES.md — Convenciones y Estilo de Código

> Extraído del código fuente real del proyecto "festejá." — NO son reglas genéricas.

---

## 1. STACK EXACTO

```
Backend:  NestJS 11 | TypeORM (sin migraciones, synchronize:false) | PostgreSQL 16 | Cloudflare R2 (S3 compat)
Frontend: React 19 | Vite 8 | TypeScript 5.9 strict | Tailwind CSS v4 | React Router v7 | Axios
Auth:     JWT (Passport) + argon2 | localStorage 'inv_token'
Deploy:   Vercel (frontend SPA) | Railway/Render (backend) | Cloudflare R2 (storage)
```

---

## 2. NAMING CONVENTIONS

### Backend (NestJS)
| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos entity | `kebab-case.entity.ts` | `foto-anfitrion.entity.ts` |
| Archivos module/ctrl/service | `kebab-case.{module,controller,service}.ts` | `invitaciones.controller.ts` |
| Clases entity | `PascalCase` (singular) | `Invitacion`, `FotoAnfitrion` |
| Clases module/ctrl/service | `PascalCase` + sufijo | `InvitacionesController`, `PedidosService` |
| DTOs | `PascalCase` + `Dto` | `CreatePedidoDto`, `UpdateInvitacionDto` |
| Métodos service | `camelCase` verbo español | `crear()`, `listar()`, `obtenerPorId()`, `eliminar()` |
| Métodos controller | `camelCase` verbo español | `crear()`, `listar()`, `actualizar()` |
| Tabla SQL | `PascalCase` singular | `Invitacion`, `FotoAnfitrion`, `PedidoServicio` |
| Columna SQL | `snake_case` | `fecha_evento`, `tipo_evento_id`, `created_at` |
| Property entity (TS) | `camelCase` + `@Column({ name: 'snake_case' })` | `fechaEvento`, `tipoEventoId` |
| Enum | `PascalCase` export | `EstadoPedido`, `TipoNotificacion` |
| Rutas API | `kebab-case`, prefijo `/v1` | `/v1/tipos-evento`, `/v1/fotos-anfitrion` |
| Guard/Decorator | `PascalCase` / `camelCase` | `JwtAuthGuard`, `@Public()` |

### Frontend (React)
| Elemento | Convención | Ejemplo |
|----------|-----------|---------|
| Archivos componente | `PascalCase.tsx` | `AdminLayout.tsx`, `MetricCard.tsx` |
| Archivos page | `PascalCase + Page.tsx` | `DashboardPage.tsx`, `InvitacionPage.tsx` |
| Archivos service | `camelCase + Service.ts` | `authService.ts`, `galeriaService.ts` |
| Archivos types | `camelCase.ts` | `adminInvitacion.ts`, `crearInvitacion.ts` |
| Archivos util | `camelCase.ts` | `formatters.ts`, `validators.ts` |
| Carpetas template | `kebab-case` (= slug DB) | `boda-clasica/`, `quince-elegante/` |
| Componente principal template | `invitation-view.tsx` | siempre este nombre exacto |
| Constantes | `UPPER_SNAKE_CASE` o `camelCase` object | `TIPO_EVENTO_IDS`, `INICIAL_CAMPOS` |
| Hooks | `use` + `PascalCase` | `useAuth` |
| Interfaces/Types | `PascalCase` | `InvitacionPublica`, `WizardFormState` |

---

## 3. PATRONES DE DISEÑO USADOS

### Backend

**Módulo NestJS estándar:**
```typescript
// Cada feature: module.ts + controller.ts + service.ts
// Module importa TypeOrmModule.forFeature([Entity])
// Controller inyecta Service
// Service inyecta Repository vía @InjectRepository(Entity)
```

**Guard global con excepciones:**
```typescript
// app.module.ts → APP_GUARD: JwtAuthGuard (global)
// Endpoints públicos: @Public() decorator → SetMetadata('isPublic', true)
// JwtAuthGuard.canActivate() chequea reflector → si isPublic, skip auth
```

**Transacciones multi-paso:**
```typescript
// Patrón: inyectar DataSource, usar queryRunner
const qr = this.dataSource.createQueryRunner();
await qr.connect();
await qr.startTransaction();
try {
  // operaciones
  await qr.commitTransaction();
} catch (e) {
  await qr.rollbackTransaction();
  throw e;
} finally {
  await qr.release();
}
```

**Módulos @Global:**
```typescript
// R2StorageModule y NotificacionesModule son @Global()
// Se importan UNA vez en AppModule, disponibles en toda la app sin re-importar
```

**Sub-rutas anidadas bajo invitaciones:**
```typescript
// Historias, Galería, Música, Invitados son controllers separados
// pero con rutas: /v1/invitaciones/:invitacionId/historias
// Cada uno es módulo independiente, NO sub-módulo de InvitacionesModule
```

**Manejo de errores:**
```typescript
// Solo excepciones built-in de NestJS:
throw new NotFoundException('Invitación no encontrada');
throw new BadRequestException('Máximo 3 secciones');
throw new UnauthorizedException('Contraseña incorrecta');
// NO hay filtros de excepción personalizados
```

**Logging con emojis:**
```typescript
this.logger.log('📧 Email enviado a admin@...');
this.logger.log('🗑️ Invitación eliminada: abc-123');
this.logger.warn('⚠️ SMTP no configurado');
this.logger.error('❌ Error al subir archivo');
```

### Frontend

**Lazy loading por ruta:**
```tsx
// App.tsx: todas las páginas admin con React.lazy() + <Suspense>
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));
```

**Template registry (glob import):**
```tsx
// components/invitations/registry.ts
const modules = import.meta.glob('./**/invitation-view.tsx');
// getInvitationComponent(slug) → lazy component o null
```

**Service layer (no hooks para fetch):**
```tsx
// Patrón: service exporta funciones async que usan apiClient
// Componentes llaman services en useEffect o handlers
// NO usan React Query, SWR, ni custom hooks para data fetching
export const getInvitacionPublica = async (id: string): Promise<InvitacionPublica> => {
  const { data } = await apiClient.get(`/invitaciones/${id}/public`);
  return data;
};
```

**Auth context pattern:**
```tsx
// AuthProvider wraps App → on mount checks localStorage token → GET /auth/me
// useAuth() hook → { user, isAuthenticated, isLoading, login, logout }
// PrivateRoute component → checks isAuthenticated, redirects to /admin/login
```

**Cache fallback (PWA):**
```tsx
// invitacionService.getInvitacionPublica():
// 1. Fetch API → si ok, guardar en localStorage(`inv_cache_${id}`)
// 2. Si falla → intentar leer de localStorage cache
// 3. Si no hay cache → throw
```

**State management:**
```
// Context API only — NO Redux, NO Zustand, NO stores externos
// Estado local con useState/useReducer en wizards
// WizardFormState = 6 steps, estado levantado al wizard container
```

---

## 4. CONVENCIONES DE CÓDIGO

### TypeScript
- **Strict mode** habilitado en ambos proyectos
- **Non-null assertion** `!` en entity properties: `titulo!: string`
- **No enums TS en frontend** — usan union types: `type EstadoPedido = 'PENDIENTE' | 'CONTACTADO' | ...`
- **Enums en backend** como string enum exportados desde entity
- **JSONB** tipado como `Record<string, any>` en backend, `Record<string, unknown>` en frontend

### Imports
- **Barrel exports** en entities (`index.ts`), NO en otros módulos
- **Path alias** `@/` → `./src/` en frontend (vite + tsconfig)
- **Imports relativos** en backend (no alias)

### CSS/Styling
- **Tailwind v4 utility-only** — NO CSS modules, NO styled-components
- **Custom properties** en `index.css` para el brand: `--champagne`, `--gold`, `--cream`, `--charcoal`, `--warm-gray`, `--sage`, `--blush`
- **Fonts:** `font-display` (Cormorant Garamond/serif), `font-body` (Outfit/sans-serif)
- **Animaciones** definidas en `index.css` con `@keyframes`: `heroFadeIn`, `heroPhoneIn`, `emShimmer`, `stepFadeIn`
- **Mobile-first** con breakpoint `md:` para desktop

### API
- **Prefijo global:** `/v1`
- **Paginación:** query params `?page=1&limit=10`
- **Respuestas:** objetos planos, NO wrapper tipo `{ success: true, data: ... }`
- **Multipart** para uploads (FileInterceptor de NestJS)
- **Password en galería:** header `x-password`

### Validación
- **Backend:** `class-validator` decoradores en DTOs (`@IsNotEmpty()`, `@IsString()`, `@IsOptional()`)
- **Frontend:** objeto `validators` en `utils/validators.ts` con funciones puras
- **Uploads:** MIME type check server-side (no solo extensión)
- **Límites:** fotos 15MB, audio 20MB, historia máx 3 secciones, fotos anfitrión máx 5, galería máx 1000

### Errores
- **Backend:** excepciones NestJS nativas (NotFoundException, BadRequestException, etc.)
- **Frontend:** try/catch en event handlers, muestra mensaje user-friendly
- **401 interceptor:** limpia token y redirige a `/admin/login`

---

## 5. IDIOMA

- **Código:** mixto español/inglés
  - Nombres de entidades, métodos, variables en **español**: `crear`, `listar`, `obtenerPorId`, `pedido`, `invitado`
  - Decoradores, tipos TS, imports en **inglés** (propio del framework)
  - Comentarios en **español**
  - Separadores visuales con `// ── Título ──` (box drawing chars)
- **API paths:** español kebab-case (`/invitaciones`, `/tipos-evento`, `/fotos-anfitrion`)
- **UI/copy:** español argentino (voseo: "festejá", "creá", "compartí")
- **Errores/mensajes:** español

---

## 6. GIT & PROYECTO

- **Monorepo** informal (3 carpetas en mismo directorio, sin workspaces)
- **No hay CI/CD** configurado visible
- Backend: `npm run start:dev` (nest start --watch)
- Frontend: `npm run dev` (vite)
- DB: `synchronize: false` — schema gestionado manualmente via `schema.sql`
- Seeds: `test/reset-y-seed.sql`
- Tests: solo e2e skeleton (`app.e2e-spec.ts`)

---

## 7. REGLAS PARA AGENTES IA

1. **Antes de cualquier cambio**, leer `ai/MAP.md` sección 5 (Archivos Críticos) y cargar los Tier 1.
2. **No crear abstracciones innecesarias.** El proyecto usa patrones directos: service → repository → response. No agregar capas.
3. **Mantener el idioma español** en nombres de métodos, variables, rutas y comentarios.
4. **Usar Tailwind utility classes.** No crear archivos CSS nuevos salvo tokens en `index.css`.
5. **Nuevos templates** de invitación: crear carpeta `kebab-case/` en `components/invitations/` con `invitation-view.tsx`. El registry los detecta automáticamente via glob.
6. **Nuevas entidades**: agregar en `src/entities/`, exportar en `index.ts`. TypeORM las registra automáticamente desde el barrel.
7. **Nuevos endpoints**: seguir el patrón módulo NestJS (module + controller + service). Si son sub-recurso de invitación, montarlos como `/v1/invitaciones/:invitacionId/recurso`.
8. **Validación**: siempre `class-validator` en DTOs del backend. Frontend: funciones en `validators.ts`.
9. **Uploads**: usar `R2StorageService` (ya inyectado globalmente). Seguir la estructura de carpetas R2 existente.
10. **No usar React Query, SWR, Redux, Zustand.** El patrón actual es services directos con Axios + estado local/Context.
