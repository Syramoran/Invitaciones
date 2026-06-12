# Plan de Implementación — Backend v2: Usuarios Cliente + Mercado Pago

## Descripción

La v1 del backend opera con un único rol `ADMIN` (el propietario) que gestiona todo manualmente. La v2 introduce el rol `CLIENTE`: usuarios registrados que pueden solicitar, pagar y autogestionar sus invitaciones sin intervención del admin. El admin mantiene acceso total a todo. Se minimizan los cambios de schema para proteger los datos existentes.

---

## User Review Required

> [!IMPORTANT]
> **Decisión de diseño: Flujo post-pago**
> Luego de que Mercado Pago confirma el pago, el sistema crea automáticamente una `Invitacion` en estado **borrador** (`activa = false`) vinculada al pedido. El cliente luego la completa (título, fecha, fotos, etc.) a través del portal cliente. ¿Estás de acuerdo con este flujo, o preferís que el cliente llene todos los datos *antes* de pagar?

> [!IMPORTANT]
> **Verificación de email de clientes**
> ¿Querés que los clientes deban verificar su email antes de poder crear un pedido? Propongo implementarlo (envío de token por SMTP) ya que protege contra pedidos falsos y es exigible por la Ley 25.326 (LPPD). Se puede desactivar con un flag de config si lo querés más simple inicialmente.

> [!WARNING]
> **Breaking change en `EstadoPedido`**
> Se agrega el valor `PAGADO` al enum. En PostgreSQL esto requiere `ALTER TYPE`. No afecta datos existentes (todos están en estados anteriores), pero sí es un cambio de schema. Confirmar antes de ejecutar.

> [!WARNING]
> **`client-invitaciones.controller.ts` existente**
> Este archivo es un borrador incompleto que ya existe en el repo. El plan lo reemplaza completamente. Se eliminará ese archivo y se recreará como módulo `ClientModule` estructurado.

---

## Open Questions

1. **¿El cliente puede eliminar su invitación permanentemente** (hard delete) o solo desactivarla (`activa = false`)? El hard delete purgaría archivos de R2 y es irreversible.
2. **¿El admin puede ver/gestionar las invitaciones de clientes** desde su panel existente, o se mantienen separadas? (Propongo que sí, con filtro por `usuarioId` en el panel admin).
3. **¿Cuánto tiempo tiene el cliente para completar su invitación post-pago?** (ej. 30 días, o sin límite hasta el evento).
4. **¿Mercado Pago en modo Sandbox** para desarrollo primero? (el `.env` ya tiene el Access Token real — conviene tener tokens de prueba separados).

---

## Propuesta de Cambios

### Resumen Visual del Nuevo Flujo Cliente

```
[Landing Page]
    ↓ Elige template + servicios
POST /v1/auth/register          ← NUEVO: se registra (con email de verificación)
POST /v1/auth/login             ← igual que antes

POST /v1/client/pedidos         ← NUEVO: crea su pedido (autenticado como CLIENTE)
    ↓
POST /v1/client/pedidos/:id/checkout  ← NUEVO: obtiene URL de pago MP
    ↓
[Mercado Pago Checkout — externo]
    ↓ pago aprobado
POST /v1/pagos/webhook          ← NUEVO: MP notifica → crea Invitacion borrador
    ↓
GET  /v1/client/invitaciones          ← NUEVO: cliente ve su lista
PUT  /v1/client/invitaciones/:id      ← NUEVO: completa los datos
POST /v1/client/invitaciones/:id/fotos-anfitrion  ← reutiliza lógica existente
DELETE /v1/client/invitaciones/:id    ← NUEVO: cliente elimina la suya
```

---

## Cambios de Base de Datos (SQL — 4 ALTER + 1 CREATE)

> [!NOTE]
> `synchronize: false` — todos los cambios se aplican vía scripts SQL manuales. Se proveerá un archivo `migrations/v2.sql` con todas las sentencias necesarias.

```sql
-- 1. Nuevo valor en el enum de estado de pedido
ALTER TYPE IF EXISTS pedido_estado ADD VALUE 'PAGADO' AFTER 'CONTACTADO';
-- (si no es un tipo enum de Postgres, sino varchar, no es necesario)

-- 2. Columnas en tabla `usuario`
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS verificado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS token_verificacion VARCHAR(255) NULL;
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS token_recuperacion VARCHAR(255) NULL;

-- 3. Columna en tabla `pedido`  
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS usuario_id INT NULL REFERENCES usuario(id) ON DELETE SET NULL;
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS mp_preference_id VARCHAR(255) NULL;
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS mp_payment_id VARCHAR(255) NULL;

-- 4. Columna en tabla `invitacion`
ALTER TABLE invitacion ADD COLUMN IF NOT EXISTS usuario_id INT NULL REFERENCES usuario(id) ON DELETE SET NULL;

-- 5. Nueva tabla: pago (registro de eventos del webhook MP)
CREATE TABLE IF NOT EXISTS pago (
    id            SERIAL PRIMARY KEY,
    pedido_id     INT NOT NULL REFERENCES pedido(id) ON DELETE CASCADE,
    mp_payment_id VARCHAR(255) NOT NULL,
    mp_status     VARCHAR(50)  NOT NULL,
    monto         DECIMAL(12,2) NOT NULL,
    raw_data      JSONB,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_pago_pedido_id ON pago(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pago_mp_payment_id ON pago(mp_payment_id);
```

**Total: 3 tablas modificadas + 1 tabla nueva. Cero datos existentes afectados.**

---

## Propuesta de Cambios por Componente

---

### Componente 1 — Entidades (TypeORM)

#### [MODIFY] [usuario.entity.ts](file:///c:/Users/acer/Desktop/Trabajo/Invitaciones digitales/backend_invitaciones/src/entities/usuario.entity.ts)
- Agregar `role: UserRole` como enum (valores: `ADMIN`, `CLIENTE`)
- Agregar `verificado: boolean`
- Agregar `tokenVerificacion?: string`
- Agregar `tokenRecuperacion?: string`
- Agregar relaciones `@OneToMany` hacia `Pedido` e `Invitacion`

#### [MODIFY] [pedido.entity.ts](file:///c:/Users/acer/Desktop/Trabajo/Invitaciones digitales/backend_invitaciones/src/entities/pedido.entity.ts)
- Agregar `usuarioId?: number` (nullable FK)
- Agregar `mpPreferenceId?: string`
- Agregar `mpPaymentId?: string`
- Agregar `PAGADO = 'PAGADO'` al enum `EstadoPedido`
- Agregar `@ManyToOne` relación hacia `Usuario`

#### [MODIFY] [invitacion.entity.ts](file:///c:/Users/acer/Desktop/Trabajo/Invitaciones digitales/backend_invitaciones/src/entities/invitacion.entity.ts)
- Agregar `usuarioId?: number` (nullable FK)
- Agregar `@ManyToOne` relación hacia `Usuario`

#### [NEW] `pago.entity.ts`
```typescript
@Entity('pago')
export class Pago {
  @PrimaryGeneratedColumn() id: number;
  @Column({ name: 'pedido_id' }) pedidoId: number;
  @Column({ name: 'mp_payment_id' }) mpPaymentId: string;
  @Column({ name: 'mp_status' }) mpStatus: string;
  @Column({ type: 'decimal', precision: 12, scale: 2 }) monto: number;
  @Column({ type: 'jsonb', nullable: true }) rawData: Record<string, any>;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @ManyToOne(() => Pedido) @JoinColumn({ name: 'pedido_id' }) pedido: Pedido;
}
```

#### [MODIFY] [index.ts](file:///c:/Users/acer/Desktop/Trabajo/Invitaciones digitales/backend_invitaciones/src/entities/index.ts)
- Exportar `Pago`, `UserRole`

---

### Componente 2 — Auth (Modificaciones)

#### [MODIFY] [auth.controller.ts](file:///c:/Users/acer/Desktop/Trabajo/Invitaciones digitales/backend_invitaciones/src/modules/auth/auth.controller.ts)
- **Nuevo endpoint**: `POST /auth/register` — `@Public()`, recibe `RegisterDto`, crea usuario CLIENTE, envía email de verificación
- **Nuevo endpoint**: `GET /auth/verify-email?token=xxx` — `@Public()`, activa `verificado = true`

#### [MODIFY] [auth.service.ts](file:///c:/Users/acer/Desktop/Trabajo/Invitaciones digitales/backend_invitaciones/src/modules/auth/auth.service.ts)
- Agregar `register(dto: RegisterDto)`: hashea password, crea usuario con `role: CLIENTE`, genera token de verificación, envía email via `NotificacionesService`
- Agregar `verifyEmail(token: string)`: activa cuenta

#### [NEW] DTOs en `auth/dto/`
- `register.dto.ts`: `{ username, email, password, nombreCompleto }`

#### [MODIFY] [usuario.service.ts](file:///c:/Users/acer/Desktop/Trabajo/Invitaciones digitales/backend_invitaciones/src/modules/entities-modules/usuario-module/usuario.service.ts)
- Agregar `findByEmail(email: string)`
- Agregar `create(data: Partial<Usuario>)`
- Agregar `findByToken(token: string)`
- Agregar `activar(id: number)`

---

### Componente 3 — Guards y Decoradores

#### [NEW] `auth/guards/roles.guard.ts`
```typescript
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [...]);
    if (!roles) return true; // sin @Roles() → solo requiere estar autenticado
    const user = context.switchToHttp().getRequest().user;
    return roles.includes(user.role);
  }
}
```

#### [NEW] `auth/decorators/roles.decorator.ts`
```typescript
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```
- `@Roles(UserRole.ADMIN)` → solo admin
- `@Roles(UserRole.CLIENTE)` → solo clientes
- Sin `@Roles()` → cualquier usuario autenticado

#### [MODIFY] [app.module.ts](file:///c:/Users/acer/Desktop/Trabajo/Invitaciones digitales/backend_invitaciones/src/app.module.ts)
- Registrar `RolesGuard` como `APP_GUARD` global (después de `JwtAuthGuard`)

---

### Componente 4 — Módulo de Pagos (NUEVO)

#### [NEW] `modules/pagos/pagos.module.ts`
#### [NEW] `modules/pagos/pagos.controller.ts`
Endpoints:
```
POST /pagos/webhook          @Public() — recibe notificaciones de MP
```

#### [NEW] `modules/pagos/pagos.service.ts`
Responsabilidades:
- `crearPreferencia(pedidoId, usuarioId)` → llama API MP, retorna `init_point` (URL de pago)
- `procesarWebhook(body, signature)` → valida firma HMAC-SHA256 del webhook, consulta pago a MP, actualiza `Pedido.estado = PAGADO`, guarda `Pago`, crea `Invitacion` borrador via `InvitacionesService.crearBorrador()`
- `obtenerEstadoPago(pedidoId, usuarioId)` → retorna estado actual del pedido/pago

**Integración con la SDK de Mercado Pago:**
- Usar el paquete `mercadopago` (ya instalado, tokens en `.env`)
- `MercadoPagoConfig` + `Preference` + `Payment` de la SDK oficial
- Signature validation con `HMAC-SHA256` usando `MP_WEBHOOK_SECRET` (nueva variable de entorno)

#### [NEW] `modules/pagos/dto/webhook.dto.ts`
- DTO tipado para el payload de notificación MP

---

### Componente 5 — Módulo Cliente (NUEVO - reemplaza borrador existente)

#### [DELETE] [client-invitaciones.controller.ts](file:///c:/Users/acer/Desktop/Trabajo/Invitaciones digitales/backend_invitaciones/src/modules/invitaciones/client-invitaciones.controller.ts) ← borrador incompleto, se elimina

#### [NEW] `modules/client/client.module.ts`
#### [NEW] `modules/client/client-pedidos.controller.ts`
```
POST /client/pedidos                    @Roles(CLIENTE) — crea pedido autenticado
GET  /client/pedidos                    @Roles(CLIENTE) — lista sus pedidos
GET  /client/pedidos/:id                @Roles(CLIENTE) — ver su pedido
GET  /client/pedidos/:id/pago           @Roles(CLIENTE) — estado del pago
POST /client/pedidos/:id/checkout       @Roles(CLIENTE) — genera URL de pago MP
```

#### [NEW] `modules/client/client-invitaciones.controller.ts`
```
GET    /client/invitaciones             @Roles(CLIENTE) — lista sus invitaciones
GET    /client/invitaciones/:id         @Roles(CLIENTE) — ver la suya
PUT    /client/invitaciones/:id         @Roles(CLIENTE) — editar datos
DELETE /client/invitaciones/:id         @Roles(CLIENTE) — eliminar la suya
POST   /client/invitaciones/:id/fotos-anfitrion   @Roles(CLIENTE) — subir fotos
DELETE /client/invitaciones/:id/fotos-anfitrion/:fotoId  @Roles(CLIENTE)
```

#### [NEW] `modules/client/client.service.ts`
- `crearPedidoCliente(usuarioId, dto)` — wrapper de `PedidosService.crear()` inyectando `usuarioId`
- `listarPedidosCliente(usuarioId)` — filtra por `pedido.usuarioId`
- `obtenerPedidoCliente(id, usuarioId)` — valida ownership antes de retornar
- `generarCheckout(pedidoId, usuarioId)` — llama `PagosService.crearPreferencia()`
- `listarInvitacionesCliente(usuarioId)` — filtra por `invitacion.usuarioId`
- `obtenerInvitacionCliente(id, usuarioId)` — valida ownership
- `actualizarInvitacionCliente(id, usuarioId, dto)` — valida ownership, llama `InvitacionesService.actualizar()`
- `eliminarInvitacionCliente(id, usuarioId)` — valida ownership, llama `InvitacionesService.eliminar()`

> [!NOTE]
> **Principio de ownership**: Todo método del `ClientService` valida que `invitacion.usuarioId === usuarioId` (del JWT) antes de operar. Si no coincide → `ForbiddenException`. El ADMIN no pasa por esta validación.

---

### Componente 6 — Modificaciones a Servicios Existentes

#### [MODIFY] [invitaciones.service.ts](file:///c:/Users/acer/Desktop/Trabajo/Invitaciones digitales/backend_invitaciones/src/modules/invitaciones/invitaciones.service.ts)
- Mejorar `crearBorrador(usuarioId, pedidoId, templateId, tipoEventoId, serviciosIds)`:
  - Actualmente es un borrador incompleto. Se reescribe completamente.
  - Crea `Invitacion` con `activa = false`, `usuarioId`, `pedidoId`, servicios habilitados, sin datos del evento.
  - Retorna el `id` de la invitación creada (para que el cliente la complete luego).
- Agregar `listarPorUsuario(usuarioId)` para el portal cliente.
- Agregar `buscarInvitacionDeUsuario(id, usuarioId)` — valida ownership.

#### [MODIFY] [pedidos.service.ts](file:///c:/Users/acer/Desktop/Trabajo/Invitaciones digitales/backend_invitaciones/src/modules/pedidos/pedidos.service.ts)
- Agregar `usuarioId?: number` al proceso de creación (cuando viene del portal cliente)
- Agregar `PAGADO` como nuevo estado válido al mapa `TRANSICIONES_VALIDAS`
- Agregar `listarPorUsuario(usuarioId)` para el portal cliente

#### [MODIFY] [notificaciones.service.ts](file:///c:/Users/acer/Desktop/Trabajo/Invitaciones digitales/backend_invitaciones/src/modules/notificaciones/notificaciones.service.ts)
- Agregar `notificarRegistroCliente(email, tokenVerificacion)` — email de bienvenida + link de verificación
- Agregar `notificarPagoConfirmado(email, pedidoId, invitacionId)` — email post-pago con link al portal

---

### Componente 7 — Variables de Entorno Nuevas

#### [MODIFY] `.env` + validación en `app.module.ts`
```env
# Mercado Pago (ya existían — ahora se usan)
MP_ACCESS_TOKEN=...
MP_PUBLIC_KEY=...

# NUEVO: Secret para validar firma del webhook de MP
MP_WEBHOOK_SECRET=...

# NUEVO: URL base del portal cliente (para links en emails)
CLIENT_PORTAL_URL=http://localhost:5173/portal
```

---

### Componente 8 — Script de Migración SQL

#### [NEW] `migrations/v2.sql`
Script SQL completo con todas las sentencias `ALTER TABLE` y `CREATE TABLE` documentadas en la sección "Cambios de Base de Datos", listo para ejecutar en producción.

---

### Componente 9 — Documentación

#### [MODIFY] `documentacion_v1.2.md` → `documentacion_v2.md`
- Actualizar diagrama de flujos
- Documentar nuevos endpoints
- Actualizar reglas de roles

---

## Nuevos Endpoints — Resumen Completo v2

### Auth
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | 🌐 Público | Registro de cliente |
| GET | `/auth/verify-email?token=` | 🌐 Público | Verificar email |

### Portal Cliente (`/v1/client/`)
| Método | Ruta | Rol | Descripción |
|--------|------|-----|-------------|
| POST | `/client/pedidos` | CLIENTE | Crear pedido |
| GET | `/client/pedidos` | CLIENTE | Listar mis pedidos |
| GET | `/client/pedidos/:id` | CLIENTE | Ver mi pedido |
| POST | `/client/pedidos/:id/checkout` | CLIENTE | Generar URL de pago MP |
| GET | `/client/pedidos/:id/pago` | CLIENTE | Estado del pago |
| GET | `/client/invitaciones` | CLIENTE | Listar mis invitaciones |
| GET | `/client/invitaciones/:id` | CLIENTE | Ver mi invitación |
| PUT | `/client/invitaciones/:id` | CLIENTE | Actualizar mi invitación |
| DELETE | `/client/invitaciones/:id` | CLIENTE | Eliminar mi invitación |
| POST | `/client/invitaciones/:id/fotos-anfitrion` | CLIENTE | Subir fotos |
| DELETE | `/client/invitaciones/:id/fotos-anfitrion/:fotoId` | CLIENTE | Eliminar foto |

### Pagos
| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/pagos/webhook` | 🌐 Público* | Webhook MP (firma HMAC validada) |

---

## Impacto en Endpoints Existentes (v1)

> [!NOTE]
> **Cero breaking changes para el flujo admin existente.** Todos los endpoints de `/v1/pedidos`, `/v1/invitaciones`, `/v1/auth`, etc. se mantienen intactos. El `RolesGuard` global solo restringe cuando hay `@Roles()` explícito; sin él, cualquier JWT válido (ADMIN o CLIENTE) pasa.

> [!WARNING]
> **Excepción**: Los endpoints admin actuales (ej. `GET /pedidos`, `DELETE /invitaciones/:id`) deberán decorarse con `@Roles(UserRole.ADMIN)` para que un CLIENTE autenticado no pueda acceder a recursos de otros. Esto es un cambio de seguridad necesario, no un breaking change funcional para el admin.

---

## Verificación del Plan

### Pruebas funcionales a ejecutar
1. `POST /auth/register` → usuario creado con `role: CLIENTE`, email enviado
2. `POST /auth/login` (cliente) → JWT con `role: CLIENTE` en payload
3. `POST /client/pedidos` → pedido con `usuarioId` correcto
4. `POST /client/pedidos/:id/checkout` → retorna `init_point` de MP
5. `POST /pagos/webhook` (mock MP) → `Pedido.estado = PAGADO`, `Invitacion` borrador creada
6. `PUT /client/invitaciones/:id` → cliente completa su invitación
7. `GET /pedidos` (con JWT de CLIENTE) → `403 Forbidden`
8. Ownership: cliente A no puede editar invitación de cliente B → `403 Forbidden`

### Manual
- Flujo completo en Sandbox de Mercado Pago
- Verificar que el admin sigue funcionando normalmente tras los cambios
