# Plus-ones, grupos y gestión de invitados desde /asistentes

> Estado: **plan aprobado, pendiente de implementar**. Guardado el 2026-07-30, revisado el 2026-08-05 con todas las decisiones cerradas. Vamos a implementarlo tarea por tarea (ver tracker de tasks).

## Estado al 2026-08-17 (corte de sesión)

**F5/F6/F7 completadas**: hook `useRsvpConfirmacion`, `GrupoRsvpSection`, conectado `?grupo=` en `InvitacionPage.tsx`. Probado end-to-end en navegador real: individual + plus-one + restricción alimentaria, confirmado y verificado en base de datos. El flujo de grupo (`GrupoRsvpSection`) está probado contra la API real pero **no hice el click-through de esa UI puntual en el navegador** — pendiente una pasada rápida antes de dar el plan por 100% cerrado.

**Pendiente sin empezar**: W4 (conectar `bulkFile` en los wizards), W5 (`ResultScreen` con URLs reales), W6 (prueba end-to-end del wizard).

**Feature nueva, fuera del plan original, agregada hoy**: templates privados/públicos (`Template.publico`, filtro server-side vía `OptionalJwtAuthGuard`, checkbox en `CreateTemplateModal`, badge "Privada" en `TemplateCard`). Backend y frontend completos y probados (3 casos: sin token, admin, cliente). Documentado acá porque no estaba en el plan original pero quedó en el mismo commit de trabajo.

**Nota operativa de esta sesión**: varias veces quedaron procesos `nest start --watch` zombies acumulados compitiendo por el puerto 3000 — si el backend no responde, verificar con `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*nest*' }` y matar todos antes de levantar uno nuevo. También: el service worker de la app (`public/sw.js`) puede quedar cacheando `{"error":"offline"}` en una pestaña vieja del navegador — si una prueba en browser falla con eso, abrir una pestaña nueva en vez de depurar el SW.

---

## Estado al 2026-08-07 (corte de sesión anterior)

**Backend: 17/17 completo**, probado de punta a punta contra una copia local de producción (`invitaciones_db` en `localhost:5432`, restaurada vía `pg_dump`/`psql` desde Railway; ver credenciales en `backend_invitaciones/.env`). **No se tocó Railway/producción en ningún momento** — todo el DDL (tareas 3-7 del plan) está aplicado y validado solo en local. Sigue pendiente aplicarlo en producción cuando se decida pasar a prod.

**Frontend — hecho:**
- F1: `types/asistentes.ts`, `services/asistentesService.ts`, extendido `types/invitation.ts` e `invitacionService.ts` (incluye `confirmarGrupo`).
- F2-F4 + restricciones alimentarias: panel `/asistentes` reescrito por completo (`AsistentesPage.tsx` + `components/public/asistentes/{GestionAsistentesPanel,SettingsPanel,InvitadosIndividualesList,GruposList,RestriccionInput}.tsx`). Funcional de punta a punta: alta/baja de individuales y grupos, override de plus-one, tope de integrantes, restricción alimentaria (individual y de grupo), settings globales (`permitirPlusOne`, `maxIntegrantesDefault`). Probado en navegador real contra datos reales.
- W1: bug real corregido en backend — `cargar()` (alta manual JSON del wizard) no persistía `slug`, lo que rompía la confirmación de esos invitados (creaba duplicados por auto-registro en vez de matchear). Ya arreglado y probado. De paso se corrigió `generarUrlPersonalizada` para usar el slug persistido en vez de recalcularlo (evita URLs erróneas ante colisión con sufijo `-2`).
- W2: `WizardStep5.bulkFile` reemplaza a `guestText`/`parseError`; nuevo `services/invitadosAdminService.ts` (`importarInvitados`). Se borró `components/client/crear-invitacion/Step5Invitados.tsx` (código muerto, no lo importaba nadie).
- W3: `GuestListEditor.tsx` ahora tiene `<input type="file">` (.xlsx/.csv) + link a `public/plantilla-invitados.csv`, en vez del textarea de carga masiva. La carga manual fila-por-fila se mantiene igual.

**Frontend — pendiente para mañana:**
- **F5**: hook `useRsvpConfirmacion` reutilizable + conectar en `invitation-basic/rsvp-section.tsx`: campo de plus-one condicional (`puedeAgregarPlusOne`), campo de restricción alimentaria, estado `yaConfirmado`.
- **F6**: `GrupoRsvpSection.tsx` nuevo (checkbox de integrantes precargados + alta de nuevos + restricción de grupo), conectado a `?grupo=` en `InvitacionPage.tsx` y `invitation-basic/invitation-view.tsx`.
- **F7**: prueba end-to-end en navegador real de todo el flujo RSVP (individual + plus-one + grupo) — **este es el paso que faltaba para completar lo que pediste probar hoy** ("cargar un invitado y un grupo, acceder a su link, confirmar asistencia del invitado/plus-one/integrantes").
- **W4**: conectar `bulkFile` en ambos wizards (admin y cliente) — tras crear la invitación, si hay `bulkFile` llamar a `invitadosAdminService.importarInvitados()`; si hay `guests` manuales, mantener el POST JSON actual (ya corregido en W1).
- **W5**: `ResultScreen.tsx` deja de recalcular el slug en el cliente — traer la lista real desde `GET /invitaciones/:id/invitados` (ya devuelve slugs/URLs correctos post-W1).
- **W6**: prueba end-to-end del wizard completo (carga por archivo + manual, admin y cliente).

**Nota de continuidad**: hay un tracker de tasks vivo en la sesión (ids #1-30) con este mismo detalle tarea por tarea — si se restaura la sesión, seguir desde ahí. Si se abre una sesión nueva, este bloque es la fuente de verdad.

**Dato importante detectado hoy, no resuelto**: el modelo de autorización actual permite que un `ADMIN` (superadmin) gestione totalmente las invitaciones de cualquier usuario `CLIENT`, no solo verlas. El usuario mencionó que a futuro un superadmin debería poder *ver* pero no *gestionar* lo ajeno — eso es un cambio de autorización a nivel de toda la app (afecta módulos ya existentes: fotos, música, historias, galería, invitación misma), **no está en el alcance de este plan** y quedó pendiente de decidir si se aborda como tarea aparte.

## Contexto

Hoy `Invitado` es minimalista (`id, invitacionId, nombre, apellido, confirmado, fechaConfirmacion`), el "slug" del link personalizado se calcula en runtime (nunca se persiste) y `/asistentes` es una pantalla de solo lectura protegida por la contraseña del evento (`contrasenaAsistentes`), que solo muestra a los que ya confirmaron. No existe gestión de invitados después de crear la invitación, ni concepto de acompañante o grupo, ni campo de restricción alimentaria.

El negocio necesita tres cosas nuevas:
1. Que un invitado pueda sumar un **plus one** al confirmar.
2. Invitaciones dirigidas a un **grupo**, donde quien recibe el link agrega a los integrantes (con nombre y apellido cada uno).
3. Que se pueda declarar una restricción alimentaria (texto libre, **una por titular/grupo, no por persona**), y que el panel `/asistentes` pase de ser una vista de solo lectura a la herramienta de gestión completa que usan los novios (agregar/quitar gente, marcar "invitación enviada", configurar permisos de plus-one y tope de integrantes por grupo, ver quienes confirmaron asistencia de los invitados agregados por los novios y los acompañantes de estos invitados, exportar XLS).

**Decisiones cerradas** (no volver a preguntar):
- Carga masiva del admin: pasa de textarea pegado a **archivo Excel/CSV real subido**.
- Auth de `/asistentes`: se sigue enviando la contraseña del evento en cada request (header `x-event-password`), **sin** token de sesión.
- Terminología: **"Grupo"** en todo el código (entidad, tabla, columnas, endpoints, componentes), no usar el término "Familia".
- Invitados/integrantes de grupo/plus-ones precargados por el admin quedan **pendientes de confirmar** (`confirmado=false`) hasta que el destinatario abre el link — mismo comportamiento que hoy, no se dan por confirmados solo por estar cargados.
- **Restricción alimentaria**: texto libre, **una sola por titular** (individual) **o por grupo**, no por persona. El titular la completa por todo su grupo/acompañante al confirmar. Este texto que describe la restriccion alimentaria quedará asociado al titular, deberá haber un placeholder que indique que se debe escribir el nombre de la persona con la restriccion, por ejemplo: "Nombre -Descripcion de la restriccion alimentaria".
- **Nombre y apellido siguen siendo obligatorios por cada acompañante/integrante agregado** — Cada plus-one y cada integrante de grupo sigue creando su propia fila `Invitado` real. No se permiten personas sin nombre y apellido,ni en la carga inicial ni en la carga mediante el link de invitación. Si se permite crear una invitacion sin invitados (como está ahora).
- **Tope de plus-one individual = exactamente 1** (booleano on/off vía `permitirPlusOne` global + override por invitado, no un número). El contador de la UI para individuales va de 1 (solo el titular) a 2 (titular + 1 acompañante); puede implementarse como stepper o como checkbox, es indistinto a nivel backend.
- **Tope de integrantes por grupo = número configurable por los novios** desde `/asistentes` (`maxIntegrantesDefault` global de la invitación + override opcional por grupo). No se permite poner 0.
- **XLSX: un solo export en todo el sistema**, el que descargan los novios desde `/asistentes`. No existe un export separado para el admin. Columnas: nombre, si es plus-one (y de quién), si es parte de un grupo (y cuál), confirmó o no, y conteo total de confirmados. Hoja aparte con conteo de personas con alguna restriccion alimentaria, indicar el invitado asociado y el texto descripción que se insertó. 
- **Alcance de frontend**: el hook/componentes de RSVP se construyen como pieza reutilizable (no atada a un template puntual), porque a futuro se van a sumar templates nuevas (incluida una personalizada para una pareja específica, que hoy **no existe en el código** — es tarea aparte). Para este plan, se conecta en los templates existentes de tipo boda/quinceañera: `invitation-basic`, `boda-clasica`, `boda-moderna`, `boda-rustica`, `quince-elegante`, `quince-moderna`, `quince-princesa` (7 de 10). Los 3 de cumpleaños (`cumple-elegante`, `cumple-festivo`, `cumple-infantil`) no se tocan en esta etapa. PERO: inicialmente vamos a conectarlo a invitation basic para probarlo. 
- **Backend agnóstico al tipo de evento**: no se restringe por `tipoEventoId` — el dato queda disponible aunque hoy no haya UI para cumpleaños; si en el futuro se agrega esa UI, no hace falta tocar el backend.
- Priorizar terminar y validar el backend completo antes de empezar el frontend.

Diseño validado contra el código real: guard global `JwtAuthGuard` vía `APP_GUARD` en `backend_invitaciones/src/app.module.ts` (con `@Public()` para desactivarlo puntualmente), entidades registradas por barrel `backend_invitaciones/src/entities/index.ts` (no hace falta tocar `app.module.ts` al agregar una entidad), y confirmado que `backend_invitaciones/src/modules/invitaciones/helpers/invitacion.mapper.ts` hoy **no** consulta la tabla `invitado` (el saludo se arma solo con el primer segmento del slug de la URL) — esto tiene que cambiar para poder decidir si mostrar la opción de plus-one.

---

## 1. Schema de base de datos

`synchronize: false`, no hay TypeORM migrations — todo cambio se aplica a mano vía SQL (igual que hoy) y luego se refleja en las entidades TypeORM.

### `Grupo` — entidad nueva (contenedor, no es una persona)

El grupo **no** se modela como un `Invitado` representante, porque el requisito "el grupo no cuenta como 1, se cuentan los integrantes" exige que sea un contenedor aparte. Consecuencia directa: **"cantidad de invitados" = `COUNT(*) FROM invitado`**, sin exclusiones especiales.

```sql
CREATE TABLE grupo (
  id                      SERIAL       PRIMARY KEY,
  invitacion_id           UUID         NOT NULL REFERENCES invitacion(id) ON DELETE CASCADE,
  nombre                  VARCHAR(150) NOT NULL,       -- ej. "Familia Pérez"
  slug                    VARCHAR(150) NOT NULL,        -- link: ?grupo=<slug>
  max_integrantes         INT,                          -- NULL = usa el default global de la invitación
  restriccion_alimentaria VARCHAR(500),                 -- una sola nota para todo el grupo
  invitacion_enviada      BOOLEAN      NOT NULL DEFAULT FALSE,
  UNIQUE (invitacion_id, slug)
);
CREATE INDEX idx_grupo_invitacion ON grupo(invitacion_id);
```

Archivo nuevo: `backend_invitaciones/src/entities/grupo.entity.ts` (mismo estilo que `invitado.entity.ts`). Registrar en `entities/index.ts`.

### `Invitado` — extender, tipo derivado por FK (sin columna `tipo` explícita)

```sql
ALTER TABLE invitado
  ADD COLUMN slug                     VARCHAR(150),
  ADD COLUMN grupo_id                  INT REFERENCES grupo(id) ON DELETE CASCADE,
  ADD COLUMN invitado_principal_id      INT REFERENCES invitado(id) ON DELETE CASCADE,
  ADD COLUMN restriccion_alimentaria    VARCHAR(500),
  ADD COLUMN puede_agregar_plus_one     BOOLEAN,              -- NULL = hereda el global; TRUE/FALSE = override individual
  ADD COLUMN invitacion_enviada         BOOLEAN NOT NULL DEFAULT FALSE;
```

Tipo derivado (regla de servicio, no persistida):
- `grupoId` seteado → **INTEGRANTE DE GRUPO**
- `invitadoPrincipalId` seteado → **PLUS_ONE**
- ninguno → **INDIVIDUAL / TITULAR** (recibe link propio)

`slug` solo se puebla para invitados INDIVIDUALES/TITULARES. Integrantes de grupo y plus-ones no tienen link propio (se gestionan a través del link de su grupo/principal), así que su `slug` queda `NULL` — un `UNIQUE` en Postgres no considera dos `NULL` como iguales, no hay conflicto.

`restriccion_alimentaria` **solo se puebla en la fila titular** (`grupoId IS NULL AND invitadoPrincipalId IS NULL`) y representa la nota de todo su grupo/acompañante. Las filas de plus-one e integrantes de grupo dejan este campo vacío — su restricción, si la hay, ya está en la nota del titular o del `Grupo`.

El `UNIQUE(invitacionId, nombre, apellido)` actual deja de ser válido (dos grupos distintos pueden tener cada uno un "Juan Pérez"). Se reemplaza por unicidad de slug + índices de lookup:

```sql
ALTER TABLE invitado DROP CONSTRAINT uq_invitado_inv_nombre;
ALTER TABLE invitado ADD CONSTRAINT uq_invitado_inv_slug UNIQUE (invitacion_id, slug);
CREATE INDEX idx_invitado_grupo     ON invitado(grupo_id);
CREATE INDEX idx_invitado_principal ON invitado(invitado_principal_id);
ALTER TABLE invitado ADD CONSTRAINT chk_invitado_grupo_xor_principal
  CHECK (grupo_id IS NULL OR invitado_principal_id IS NULL);
```

Reglas de elegibilidad para plus-one (validación en servicio, no en DB):
```
puedeAgregarPlusOne(invitado, invitacion) =
  invitado.grupoId === null
  && invitado.invitadoPrincipalId === null      -- un plus-one no tiene su propio plus-one
  && (invitado.puedeAgregarPlusOne ?? invitacion.permitirPlusOne)
```
Cuando es elegible, el tope es siempre 1 acompañante (no configurable por cantidad, solo on/off).

### `Invitacion` — settings globales

```sql
ALTER TABLE invitacion
  ADD COLUMN permitir_plus_one       BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN max_integrantes_default INT;  -- NULL = sin límite, aplica a los grupos de esta invitación
```

Editar `invitacion.entity.ts`: agregar `permitirPlusOne: boolean`, `maxIntegrantesDefault: number | null`, y `@OneToMany(() => Grupo, (g) => g.invitacion) grupos!: Grupo[]`.

### Orden de aplicación (no romper links en producción)

1. `CREATE TABLE grupo`.
2. `ALTER TABLE invitacion ADD COLUMN permitir_plus_one, max_integrantes_default` (default `FALSE`/`NULL` — plus-one apagado por defecto en invitaciones existentes, seguro).
3. `ALTER TABLE invitado ADD COLUMN slug, grupo_id, invitado_principal_id, restriccion_alimentaria, puede_agregar_plus_one, invitacion_enviada` (todas nullable o con default, no rompen filas existentes).
4. Correr el script de backfill de `slug` (sección 6) — **antes** del siguiente paso.
5. `DROP CONSTRAINT uq_invitado_inv_nombre` → `ADD CONSTRAINT uq_invitado_inv_slug` + índices + `CHECK`.
6. Actualizar `Invitaciones/Documentacion/db/schema.sql` (o su equivalente vigente) con el DDL nuevo — ya estaba desactualizado respecto a columnas como `usuario_id`/`edit_count`, aprovechar para ponerlo al día.

---

## 2. Slug/links

- Extraer `toSlug()` de `invitados.service.ts` a `backend_invitaciones/src/common/utils/slug.util.ts` (nuevo), agregando `generarSlugUnico(base, yaUsados)` que sufija `-2`, `-3`... ante colisión. Debe ser el **mismo algoritmo exacto** (NFD, sin tildes, minúsculas, espacios→guiones) para que el backfill reproduzca los links ya compartidos.
- Esquema de URL: individual `?invitado=<slug>` (sin cambios), grupo `?grupo=<slug>` (nuevo). Namespaces de slug separados (invitado vs grupo), sin cruce.
- Plus-ones e integrantes de grupo no tienen slug ni link propio.

---

## 3. Endpoints backend

Nuevo guard `backend_invitaciones/src/modules/invitados/guards/event-password.guard.ts` (`EventPasswordGuard implements CanActivate`): lee `:id` + header `x-event-password`, compara contra `invitacion.contrasenaAsistentes`. Reemplaza la validación manual hoy inline en `obtenerAsistentes()`, reutilizable en los ~10 endpoints nuevos de `/asistentes`.

### A. Admin (JWT) — `invitados.controller.ts`

| Verbo | Ruta | Body | Notas |
|---|---|---|---|
| POST | `invitaciones/:id/invitados/importar` | multipart `archivo` (.xlsx/.csv) | Nuevo. `FileInterceptor` + `memoryStorage()` (mismo patrón que ya usa `invitaciones.controller.ts` para fotos). Columnas esperadas: Nombre, Apellido, Grupo, PuedePlusOne, MaxIntegrantesGrupo. Devuelve `{totalCreados, totalGrupos, duplicadosOmitidos, errores:[{fila,motivo}]}`. |
| GET | `invitaciones/:id/invitados` | — | Listado extendido: individuales (+ `plusOne` anidado si existe) + grupos (+ `integrantes`). |

No hay export XLSX del lado admin — el único export vive en `/asistentes` (sección B). El CSV admin que existe hoy (`GET /invitaciones/:id/invitados/export`, usado en `InvitacionesTable.tsx`) queda **fuera de alcance**, no se toca en este plan.

Nota: agregar `@RequireAdmin()` a estos endpoints nuevos (hoy el controller solo tiene `JwtAuthGuard`, sin `RequireAdmin` — gap preexistente, no hace falta arreglar los endpoints viejos pero sí no repetirlo en los nuevos).

### B. Panel `/asistentes` (password, `EventPasswordGuard`)

En `invitados.controller.ts`:

| Verbo | Ruta | Body | Notas |
|---|---|---|---|
| GET | `invitaciones/:id/asistentes` | — | Response extendido: individuales+plusOne, grupos+integrantes, settings globales, confirmados **y** pendientes (hoy solo confirmados). |
| POST | `invitaciones/:id/asistentes/invitados` | `{nombre, apellido, puedeAgregarPlusOne?}` | Alta manual. |
| PATCH | `invitaciones/:id/asistentes/invitados/:invitadoId` | `{invitacionEnviada?, puedeAgregarPlusOne?, restriccionAlimentaria?}` | |
| DELETE | `invitaciones/:id/asistentes/invitados/:invitadoId` | — | Cascada borra su plus-one. |
| PATCH | `invitaciones/:id/asistentes/settings` | `{permitirPlusOne, maxIntegrantesDefault}` | |
| GET | `invitaciones/:id/asistentes/export` | — | **Único** export XLSX del sistema (ver sección 4). |

Módulo nuevo `backend_invitaciones/src/modules/grupos/` (`grupos.module.ts`, `grupos.controller.ts` con `@Controller('invitaciones/:id')`, `grupos.service.ts`, `dto/grupo.dto.ts`):

| Verbo | Ruta | Body |
|---|---|---|
| POST | `asistentes/grupos` | `{nombre, maxIntegrantes?, integrantes?:[{nombre,apellido}]}` |
| PATCH | `asistentes/grupos/:grupoId` | `{nombre?, maxIntegrantes?, invitacionEnviada?, restriccionAlimentaria?}` |
| DELETE | `asistentes/grupos/:grupoId` | — |
| POST | `asistentes/grupos/:grupoId/integrantes` | `{nombre, apellido}` |
| DELETE | `asistentes/grupos/:grupoId/integrantes/:invitadoId` | — |

`GruposModule` importa `TypeOrmModule.forFeature([Grupo, Invitado])` directo (no depende de `InvitadosModule`); `InvitadosModule` importa `GruposModule` para el listado/export combinado (evita ciclo).

### C. Público (sin auth, vía slug)

- `GET /invitaciones/:id/public?invitado=slug` — editar `invitaciones-public.service.ts` + `invitacion.mapper.ts`: ahora resuelve el `Invitado` real por slug persistido y agrega al DTO `puedeAgregarPlusOne`, `plusOneExistente`, `restriccionAlimentariaExistente`, `yaConfirmado`. Sin match (invitado aún no precargado) → fallback `puedeAgregarPlusOne = invitacion.permitirPlusOne`.
- `GET /invitaciones/:id/public?grupo=slug` (nuevo) — mismo shape + `grupo:{nombre,slug,maxIntegrantesEfectivo,restriccionAlimentaria,integrantes:[{id,nombre,apellido,confirmado}]}`.
- `POST /invitaciones/:id/confirmar` — editar `invitados.service.ts` + `dto/invitado.dto.ts`: `ConfirmarAsistenciaDto` suma `restriccionAlimentaria?` (nota del titular, cubre también a su plus-one si trae), `plusOne?:{nombre,apellido}` (sin campo de restricción propio). Cambia el lookup de `Array.find` en memoria (hoy O(n) sin índice) a `findOne({invitacionId, slug})`. Si mandan `plusOne` y el invitado no es elegible → 400. Guard anti-duplicado: si el titular ya tiene un plus-one creado, un segundo `POST /confirmar` con `plusOne` **actualiza** esa fila existente en vez de crear una nueva.
- `POST /invitaciones/:id/grupos/confirmar` (nuevo, en `grupos.service.ts`) — body `{grupoSlug, integrantesConfirmados: number[], integrantesNuevos:[{nombre,apellido}], restriccionAlimentaria?}` (la restricción es un solo campo para todo el grupo, se guarda en `Grupo.restriccion_alimentaria`). Marca confirmado a los precargados seleccionados, crea los nuevos ya confirmados, valida contra el máximo efectivo (400 si excede).

---

## 4. El único XLSX del sistema

Vive en `GET /invitaciones/:id/asistentes/export`, lo descargan los novios desde `/asistentes`. Como `Grupo` no es una fila de `Invitado`, el conteo de personas sale correcto por diseño: es el total de filas de `invitado`.

Una fila por persona (individuales + integrantes de grupo + plus-ones), columnas:

| Nombre | Plus-one de | Grupo | Confirmó |
|---|---|---|---|---|

Más una celda o fila final con el **conteo total de confirmados**. Sin columnas de link ni de "invitación enviada" (eso queda solo en la UI del panel, no en el export).
Otra hoja con las restricciones alimentarias asociadas a un titular y la descripción.

Archivos nuevos: `backend_invitaciones/src/modules/invitados/helpers/excel-export.helper.ts` (un solo formato) y `excel-import.helper.ts` (para la importación del admin, sección 3A). Dependencia nueva: **`exceljs`** en `backend_invitaciones/package.json`.

---

## 5. Frontend (`invitaciones-frontend/src/`)

**Prioridad: terminar y validar todo el backend antes de arrancar acá.**

### Wizard de creación

- `types/crearInvitacion.ts`: `WizardStep5` cambia `guestText`/`parseError` por `bulkFile: File | null`. `GuestEntry` se mantiene para la carga manual fila-por-fila.
- `components/shared/crear-invitacion/GuestListEditor.tsx`: reemplazar el textarea de carga masiva por un `<input type="file" accept=".xlsx,.csv">` + link "Descargar plantilla" (`public/plantilla-invitados.xlsx` estático). La carga manual fila-por-fila individual se mantiene igual.
- Nuevo `services/invitadosAdminService.ts`: `importarInvitados(invitacionId, file)`.
- `components/admin/crear-invitacion/CrearInvitacionWizard.tsx` y el equivalente en `pages/client/`: tras crear la invitación, si hay `bulkFile` llamar a `importarInvitados()`; si hay `guests` manuales, mantener el POST JSON actual.
- `components/admin/crear-invitacion/ResultScreen.tsx`: usar el `slug`/URL que devuelve el backend en vez de recalcularlo en el cliente (deja de ser confiable una vez que puede llevar sufijo `-2` por colisión).

### `/asistentes` — de solo lectura a panel de gestión

- `pages/public/AsistentesPage.tsx`: conserva el form de contraseña; al loguear, guarda el password en estado y renderiza el panel de gestión (se reenvía en cada request, según lo decidido).
- Nuevos componentes en `components/public/asistentes/`: `GestionAsistentesPanel.tsx` (orquestador), `InvitadosIndividualesList.tsx` (tabla: nombre, confirmado, plus-one asociado, restricción del titular, checkbox "enviada", copiar link, eliminar, override de plus-one, alta), `GruposList.tsx` (cards con integrantes anidados + restricción del grupo), `SettingsPanel.tsx` (switch plus-one global + tope de integrantes), `ExportButton.tsx` (mismo patrón blob-download que ya usa `InvitacionesTable.tsx`).
- Nuevo `services/asistentesService.ts` (mueve `getAsistentes` desde `invitacionService.ts`, agrega el resto de las acciones de la sección 3B) y `types/asistentes.ts`.

### RSVP público

Pieza reutilizable, pensada para conectarse en templates existentes y futuras (incluida la template nueva personalizada que se construya más adelante — esa es tarea aparte, no incluida acá).

- Nuevo hook compartido `components/invitations/shared/useRsvpConfirmacion.ts`: estado idle/loading/success/error, campo de restricción alimentaria del titular (uno solo, cubre a su plus-one si trae), campo plus-one (nombre+apellido) condicional a `puedeAgregarPlusOne`.
- Nuevo `components/invitations/shared/GrupoRsvpSection.tsx`: variante para `?grupo=`, lista de integrantes precargados con checkbox + form para sumar nuevos (nombre+apellido cada uno) hasta el máximo, más un solo campo de restricción alimentaria para todo el grupo.
- Conectar el hook y `GrupoRsvpSection` en los **7** templates existentes de boda/quinceañera: `invitation-basic`, `boda-clasica`, `boda-moderna`, `boda-rustica`, `quince-elegante`, `quince-moderna`, `quince-princesa` (cada uno edita su propio `rsvp-section.tsx` e `invitation-view.tsx` para consumir el hook, aportando solo su markup — se preserva la diversidad visual). Los 3 templates de cumpleaños no se tocan.
- `pages/public/InvitacionPage.tsx`: leer también `?grupo=` de `searchParams`.
- `services/invitacionService.ts`: `getInvitacionPublica` acepta `grupo` como alternativa a `invitado`; `confirmarAsistencia` extendido con `plusOne`/`restriccionAlimentaria`.
- Nuevo `services/grupoService.ts` + `types/grupo.ts`.
- `types/invitation.ts`: `InvitacionPublica` extendido con `puedeAgregarPlusOne`, `plusOneExistente`, `restriccionAlimentariaExistente`, `grupo?`.

---

## 6. Compatibilidad (no romper links ya enviados a invitados reales)

- Extraer `toSlug()` **antes** de tocar cualquier otra cosa, para que el backfill use el algoritmo idéntico al que generó las URLs ya compartidas.
- Script nuevo, one-off, no forma parte del runtime: `backend_invitaciones/scripts/backfill-invitado-slug.ts`. Recorre `invitado ORDER BY id ASC`, calcula `toSlug(nombre-apellido)`, sufija `-2`, `-3`... si colisiona con otro de la misma `invitacion_id`. Reproduce el comportamiento actual del `Array.find` (determinístico por orden de `id`).
- Orden obligatorio: correr el backfill después de agregar la columna `slug` (nullable) y antes del `UNIQUE(invitacion_id, slug)`.
- Invitaciones existentes quedan con `permitir_plus_one = FALSE`, `max_integrantes_default = NULL` — no se activa nada nuevo solo, los novios lo prenden desde `/asistentes`.
- **Antes de aplicar en producción**: backup de la tabla `invitado`, y probar el backfill contra una copia de datos reales en staging — hay invitaciones activas con links ya distribuidos a invitados reales.

---

## Orden de implementación (tarea por tarea, ver tracker)

**Backend — schema**
1. `common/utils/slug.util.ts`
2. Entidad `Grupo` + extender `Invitado`/`Invitacion`
3. DDL: `CREATE TABLE grupo`
4. DDL: `ALTER TABLE invitacion` (settings globales)
5. DDL: `ALTER TABLE invitado` (columnas nullable)
6. Backfill de `slug` (staging primero)
7. DDL: constraints finales en `invitado`
8. Agregar `exceljs`

**Backend — endpoints**
9. `EventPasswordGuard`
10. Módulo `grupos/` completo
11. Extender listado de invitados (admin + asistentes)
12. Endpoint de importación por archivo (admin)
13. Endpoint de export XLSX (único, en asistentes)
14. CRUD de invitados desde `/asistentes` + settings globales
15. Extender `GET /public`
16. Extender `POST /confirmar` (+ guard anti-duplicado de plus-one)
17. Nuevo `POST /grupos/confirmar`

**Frontend** 
No avanzar hasta terminar el back.


## Verificación

Manual, a medida que avancemos por etapas (no hay una suite automatizada prevista para esto todavía).
