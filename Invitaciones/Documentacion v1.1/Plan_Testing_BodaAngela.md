# Plan de Testing — Template `boda-angela`

> Doc vivo. Complementa a
> `invitaciones-frontend/src/components/invitations/boda-angela/NOTES.md`
> (que documenta el *estado de construcción*) sin duplicarlo — acá va **qué
> probar y cómo**, manual y automatizado, para darle una vuelta completa de
> calidad a la template (ya migrada a producción, ver §1.1/§10 de NOTES.md).
> Creado: 2026-09-21. Ir tildando `- [ ]` → `- [x]` a medida que se ejecuta
> cada bloque, y anotar hallazgos en la sección 8.

---

## 0. Resumen ejecutivo

- La template vive 100% en
  `invitaciones-frontend/src/components/invitations/boda-angela/` (9
  componentes activos + 2 hooks compartidos de RSVP). **No existe ningún
  test automatizado hoy** — ni en frontend (no hay Vitest/Playwright/Jest
  instalado en `invitaciones-frontend`) ni específico de esta template en
  backend (el backend sí tiene Jest configurado, con 2 specs de ejemplo en
  otros módulos).
- El template y la invitación real de Angela **ya existen en producción**
  (Railway) — confirmado por el usuario, 2026-09-21. El orden de testing es
  **primero local, después un pase en producción** (§6). No hace falta
  migrar invitados: todavía no hay ninguno real cargado en ningún entorno,
  todos los que hay hoy (local y producción) son de prueba — ver §2.
- `NOTES.md` ya está sincronizado con el código actual (reescrito
  2026-09-21, mismo día que este plan). La estructura real de secciones es:

  `HeroSection → CountdownSection(evento) → CeremoniaSection → CenaSection
  → DetallesSection → FechaLimiteSection → RsvpSection → footer`

  Los 5 archivos viejos (`event-info-section.tsx`, `gift-section.tsx`,
  `locations-section.tsx`, `map-section.tsx`, `note-section.tsx`) y los
  assets que usaban en exclusiva ya **se borraron** (2026-09-21, ver
  NOTES.md §7-8) — no hace falta testearlos ni tenerlos en cuenta.
- **Bastante contenido de esta template está hardcodeado a propósito**
  (fechas, horarios, textos) en vez de salir de `camposEspecificos`/el
  wizard — es una decisión de diseño válida al ser una template exclusiva
  de una sola clienta, no un gap a corregir. Si algo cambia, lo edita el
  desarrollador a mano en código o en la DB — la clienta no tiene
  autoservicio para eso. Este plan ya no marca esos casos como "bug" o
  "gap", solo los deja documentados como comportamiento esperado a no
  romper sin querer (§4.13, §8).
- Este plan asume que quien lo ejecute ya leyó la sección 2 (reglas de
  terreno) antes de tocar cualquier dato.

---

## 1. Alcance

### 1.1 Dentro

- Vista pública completa de `boda-angela` (los 9 componentes activos +
  `invitation-view.tsx` + `theme.ts`).
- Flujo de RSVP público, individual y grupal, incluido lo que comparte con
  el resto del sitio (`shared/useRsvpConfirmacion.ts`,
  `shared/useRsvpConfirmacionGrupo.ts`, `shared/apiError.ts`) **en la
  medida que `boda-angela` lo usa** — sin re-testear `invitation-basic` a
  fondo, pero con cuidado de no reportar como "bug de boda-angela" algo que
  en realidad viven en el hook compartido.
- Backend: endpoints que esta invitación efectivamente ejercita —
  `POST /invitaciones/:id/confirmar`, `POST /invitaciones/:id/grupos/confirmar`,
  `GET /invitaciones/:id/public`, `GET /invitaciones/:id/countdown`, y el
  bloque `/asistentes*` (panel de gestión).
- Panel `/:eventoId/asistentes` para esta invitación puntual (gestión de
  invitados/grupos, exportar, contraseña de evento).
- Wizard admin en la parte que carga `camposEspecificos` de esta template
  (`Step2Evento.tsx`, sección Boda) y la asignación del template privado
  (`Template.publico = false`).
- Estados de carga/errores de `InvitacionPage.tsx` (loading, cache
  offline, servidor caído, 404) — es código compartido, pero
  `boda-angela` tiene su **propia pantalla de loading**
  (`BodaAngelaLoadingScreen`), así que hay una rama a probar puntual.
- **Un pase de smoke test en producción** (Railway), después de cerrar el
  pase local — el template y la invitación real de Angela ya están ahí.
  Alcance reducido respecto al pase local: verificar que carga, que el
  sobre/hero/secciones se ven bien contra los datos reales, y que el RSVP
  funciona de punta a punta con 1-2 invitados de prueba creados ahí mismo
  para la ocasión (y borrados después) — no hace falta repetir las 18
  combinaciones de la matriz de §4.9 en producción si ya se validaron en
  local.

### 1.2 Fuera de alcance (y por qué)

- **MercadoPago / códigos de descuento**: la invitación real de Angela se
  cargó a mano (`pedido_id = null`, `estado_pago` seteado directo), no pasa
  por checkout. Si en el futuro se vende este template a otras clientas por
  el flujo normal, ahí sí conviene un smoke test de pago — hoy no aplica.
  Ver `[[project_mercadopago_descuentos]]` en memoria si hace falta contexto.
- **Las otras 9 templates**: solo entran si se toca código compartido
  (los 2 hooks de RSVP, `GrupoRsvpSection.tsx`, el panel de asistentes). En
  ese caso, correr como mínimo un smoke test en `invitation-basic` antes de
  dar por cerrado un cambio.
- **Pixel-perfect contra Figma**: hay un TODO abierto en NOTES.md §8 (pase
  de colores, tipos, verificación visual de fondo/textura) que es trabajo
  de *construcción*, no de testing funcional. Este plan prueba
  **comportamiento**, no maquetación fina.

---

## 2. Reglas de terreno (leer antes de tocar nada)

1. **El backend local corre compilado, no en watch mode**
   (`node dist/src/main`, confirmado por `netstat`/proceso). Un cambio de
   código de backend no se refleja solo — hace falta `npm run build` (o
   `nest build`) y reiniciar el proceso a mano. Si algo "no aparece" al
   probar, revisar esto antes de asumir que el código está mal.
2. **Todos los invitados/grupos cargados hoy son de prueba** (confirmado
   por el usuario, 2026-09-21 — ni en local ni en producción hay todavía
   una lista real de invitados). Se puede editar/confirmar/borrar libremente
   lo que ya está cargado sin miedo a pisar datos de gente real. Igual
   conviene seguir la convención de nombres reconocibles (punto 3) y no
   dejar la DB con basura acumulada de sesiones de testing viejas.
3. **Datos de prueba: nombres reconocibles y limpieza al final.** Seguir la
   convención ya usada en el proyecto (`-test-claude`, `familia-test-qa`,
   etc.) y borrar todo por API al terminar cada bloque, no dejar residuos.
   Si hace falta forzar un campo que no tiene UI (p. ej.
   `camposEspecificos.fechaLimiteConfirmacion`), usar un `PATCH`/`UPDATE`
   **acotado** (no pisar el objeto `campos_especificos` entero) y revertirlo
   exacto al terminar, verificando con un `SELECT`/`GET` antes y después.
4. **Limitaciones conocidas del Browser pane de Claude en este repo** (ver
   memoria `feedback_verify_before_claiming`) — aplican si quien ejecuta
   este plan es un agente Claude, no un humano en su propio navegador:
   - `computer.screenshot()` puede devolver capturas viejas/"lavadas",
     sobre todo justo después de un `scroll_to` programático (que no
     dispara igual la animación `useRevealOnScroll` que un scroll real).
     Preferir `computer scroll` (rueda real) para las secciones con reveal.
   - `element.blur()` vía `javascript_tool` **no dispara el `onBlur` real
     de React** acá — para inputs blur-to-save (p. ej. el panel de
     asistentes) usar `computer` con click + type + Tab real.
   - Para verificar estado real (texto, atributos, valores de audio/inputs)
     preferir `read_page` / `get_page_text` / `javascript_tool` (leer el
     DOM) por sobre confiar solo en la imagen.
5. **La invitación real de Angela, en local**: `id =
   22325c7d-caae-490d-baac-29352a12e223`, evento `2027-02-20 17:30`, lugar
   Villa Elina. El registro de la invitación en sí (fecha, lugar, nombres de
   la pareja) es real — lo que **no** es real son los invitados/grupos
   cargados debajo (punto 2), incluido cualquier slug que parezca un
   nombre de persona. En producción existe el mismo template + invitación
   real, pero **no se verificó si comparte el mismo `id`** — no asumirlo,
   chequear en la DB de Railway antes de usarlo en un test contra
   producción (§1.1).

---

## 3. Mapa de superficie — componentes y su condición clave

| Componente | Se muestra si… | Puntos de riesgo a probar |
|---|---|---|
| `EnvelopeOverlayAngela` | `!previewMode`, `showOverlay` | auto-apertura a los 20s, click manual, doble-trigger, nombre/cantidad del titular (individual/grupo/genérico) |
| `MusicPlayerAngela` | `invitacion.musica && !showOverlay` | autoplay bloqueado por el navegador, volumen inicial 20%, loop |
| `HeroSection` | siempre | **fecha "SÁBADO 20 FEBRERO 2027" hardcodeada** (no lee `fechaEvento`); link de calendario sí es dinámico |
| `CountdownSection` (evento) | algún `servicio.nombre` incluye "cuenta regresiva"/"countdown" | 3 estados (`antes`/`hoy`/`despues`), cálculo en vivo (setInterval 1s) |
| `CeremoniaSection` | siempre | fallback `campos.horaCeremonia ?? horaEvento`, `lugarCeremonia ?? ubicacion`, `direccionCeremonia ?? direccion`; **sin UI de admin** para los overrides — solo API/DB |
| `CenaSection` | siempre | hora "21:00 HS" y texto **100% hardcodeados**; mismo patrón de fallback de lugar/dirección que Ceremonia, mismo gap de UI |
| `DetallesSection` | siempre | acordeón con 4 ítems; "Niños" y "Puntualidad" son **texto fijo** (ya no leen `soloAdultos`/`reglaPuntualidad` como decía NOTES.md — divergencia a confirmar); "Regalos" condiciona `alias`/`aliasUsd`/`cbu` |
| `FechaLimiteSection` | `estadoFechaLimite !== 'vencido'` | matriz de 3 estados × Argentina UTC-3 fijo; título "13 de febrero" **hardcodeado** |
| `RsvpSection` | `invitacion.tieneConfirmacion` | rama genérica / individual / grupo; matriz cruzada con fecha límite (§4.9); grupo **no permite sumar gente nueva** (removido a propósito, confirmar que sigue siendo lo esperado) |
| `useRsvpConfirmacion` | — | validación plus-one incompleto, límites 100/500 caracteres, reintentar tras error |
| `useRsvpConfirmacionGrupo` | — | grupo se marca "confirmado" apenas **un** submit tiene éxito, aunque no se hayan tildado todos los integrantes |

---

## 4. Plan de testing MANUAL

### 4.1 Setup

- [ ] Backend local compilado y corriendo (`npm run build && node dist/src/main` o el flujo que uses), frontend con `npm run dev`.
- [ ] Confirmar contra la DB local: `template.slug='boda-angela'` existe, `publico=false`, y la invitación de Angela (§2.5) sigue con esos IDs.
- [ ] Tener a mano la contraseña de `contrasenaAsistentes` de la invitación de prueba (para el panel `/asistentes` y crear/borrar datos de prueba vía API con el header `x-event-password`).
- [ ] Preparar 1 invitado individual de prueba (sin plus-one), 1 individual con `puedeAgregarPlusOne=true`, y 1 grupo de prueba con 2-3 integrantes precargados — todos con nombre reconocible como test.

### 4.2 Carga inicial y estados de red (`InvitacionPage.tsx`)

- [ ] URL válida (`/<eventoId>`) → aparece `BodaAngelaLoadingScreen` (pulso crema, sin texto) y no el `LoadingScreen` genérico gris.
- [ ] `eventoId` inexistente → redirige a la pantalla 404 (`NotFoundPage`).
- [ ] Cortar el backend (parar el proceso) con la invitación ya visitada antes en ese navegador → debería aparecer con el `CachedVersionBanner` ("Mostrando la última versión guardada"), servida desde `getCachedInvitacion`. Cerrar el banner con la ✕ y confirmar que no vuelve a aparecer en esa sesión.
- [ ] Cortar el backend **sin** caché previa (navegador/perfil limpio) → `ServerDownScreen` con botón "Reintentar" que recarga.
- [ ] Con `?invitado=slug-que-no-existe` → confirmar qué rama de `RsvpSection` cae (debería ser la genérica "¡Te esperamos!", igual que sin parámetro — confirmar que no rompe ni muestra error).

### 4.3 Sobre de apertura (`EnvelopeOverlayAngela`)

- [ ] Entrar con `?invitado=<slug de prueba>` → el sobre muestra nombre del titular + "2 personas" si `puedeAgregarPlusOne`, sin cantidad si no.
- [ ] Entrar con `?grupo=<slug de prueba>` → muestra el nombre del grupo + "N invitados" (`maxIntegrantesEfectivo` o cantidad de integrantes si no hay tope).
- [ ] Entrar sin parámetro (o con uno inválido) → sobre sin nombre/cantidad (bloque `titular` no se renderiza), el resto de la animación funciona igual.
- [ ] Click en el sobre → se anima y desaparece (~1.2s), el hero empieza a aparecer en simultáneo (no hay un salto brusco).
- [ ] Doble click rápido / click durante la animación → no se dispara `onOpen` dos veces (confirmar con `read_console_messages` o un breakpoint que no haya doble llamada).
- [ ] **No tocar nada durante 20s** → se abre solo (mismo timing que el click manual).
- [ ] Mientras el sobre está abierto, intentar scrollear la página de fondo → debe quedar bloqueado (`overflow: hidden` en `body`).
- [ ] Con `previewMode` (preview del wizard admin) → el sobre **no** debe aparecer en absoluto.

### 4.4 Reproductor de música (`MusicPlayerAngela`)

- [ ] Invitación **sin** música cargada → el FAB no aparece en ningún momento.
- [ ] Invitación **con** música → FAB no visible mientras el sobre está abierto; aparece apenas se cierra el sobre.
- [ ] Al cerrar el sobre, intenta autoplay a volumen inicial 20% — si el navegador lo bloquea, no debe romper nada, el botón play manual tiene que funcionar igual (probar en una pestaña donde el autoplay esté bloqueado por política del navegador).
- [ ] Abrir el panel expandido: play/pausa, seek (arrastrar la barra de progreso), skip ±10s (no debe pasarse de `0` ni de `duration`), volumen (arrastrar y confirmar `%` mostrado = valor real del `<audio>`).
- [ ] `loop`: dejar que la canción llegue al final (o forzar `currentTime` cerca de `duration`) → debe reiniciar sola, no quedar en pausa.
- [ ] Cerrar el panel (✕) y reabrir con el FAB → el estado de reproducción persiste (no se resetea).

### 4.5 Hero

- [ ] Nombres mostrados = `camposEspecificos.novio1`/`novio2` (o "Angela"/"Francisco" si faltan — caso borde, no debería pasar en producción pero probarlo con un objeto vacío).
- [ ] **Contenido fijo a propósito, no tocar**: la fecha "SÁBADO 20 FEBRERO 2027" es texto fijo en JSX — confirmado con el usuario (2026-09-21) que es intencional (template exclusiva de una sola clienta, cambios futuros se editan a mano en código/DB, no hay autoservicio). El link de calendario sí usa `fechaEvento` real. El test acá es de regresión: si alguna vez se clona esta invitación o cambia la fecha en la DB sin tocar el componente, este texto va a quedar desincronizado — vale la pena que quien edite la fecha se acuerde de este string también.
- [ ] Botón "Agendar en calendario" → abre Google Calendar con evento de **todo el día** (`dates=YYYYMMDD/YYYYMMDD+1`), texto "Boda Angie y Fran", ubicación = `ubicacion, direccion` (vacía si `ubicacion === 'multiple'`). Confirmar que la fecha en la URL generada coincide con `invitacion.fechaEvento` real, no con el texto hardcodeado de arriba.
- [ ] Imagen de la pareja: mobile (`std_mobile.png`) por debajo de 640px, desktop (`std_web.png`) en 640px+ — confirmar con `resize_window` en ambos breakpoints, no solo mirar el CSS.
- [ ] Animación `std_animated.svg` (save the date) solo dispara cuando `isOpened` pasa a `true` (después del sobre) — en `previewMode` (`isOpened` por defecto `true`) confirmar que no queda en un estado raro sin key.

### 4.6 Cuenta regresiva del evento (`CountdownSection`, 1er uso)

- [ ] Solo aparece si algún `servicio.nombre` de la invitación incluye "cuenta regresiva" o "countdown" (case-insensitive) — probar con y sin ese servicio habilitado.
- [ ] Estado `antes`: 4 cajas (Días/Horas/Min/Seg) actualizando cada segundo, `padStart(2,'0')`.
- [ ] Estado `hoy`: forzar la fecha del evento a hoy (dato de prueba, no la invitación real) → "¡Es hoy!" en vez de las cajas.
- [ ] Estado `despues`: forzar a una fecha ya pasada → "Gracias por asistir". Confirmar el corte exacto: el mismo día del evento después de la hora sigue en `hoy`/cajas en `00:00:00`, recién al día siguiente (hora Argentina) pasa a `despues` (usa `estadoFechaLimite` de `fecha-limite-section.tsx` para esto — mismo offset fijo UTC-3).
- [ ] Probar con el reloj/zona horaria del sistema operativo en otro huso (no Argentina) → el estado no debería cambiar (la lógica fija el offset a mano, no usa `Intl`/zona local).

### 4.7 Ceremonia y Cena

- [ ] Sin ningún override (`horaCeremonia`, `lugarCeremonia`, etc. ausentes en `camposEspecificos`) → Ceremonia cae a `horaEvento`/`ubicacion`/`direccion` generales; Cena cae a los mismos `ubicacion`/`direccion` (mismo lugar que Ceremonia si no se especifica otro).
- [ ] Con overrides seteados (forzar por API/DB, **no hay campo en el wizard** — ver §8) → cada sección usa su propio valor, independiente del otro.
- [ ] `mapsLink`: si no hay `linkUbicacion`/`linkUbicacionCena` explícito, se arma un link de Google Maps con `lugar + direccion` — probar que el link abre y busca algo razonable (no vacío) incluso si falta `lugar` o `direccion` (pero no ambos).
- [ ] Si `lugar`/`direccion`/`mapsLink` faltan los tres → el bloque entero de "Grupo 2" queda solo con la ilustración, sin quebrar el layout.
- [ ] Cena: "21:00 HS" y el texto "¡Después del sí... nos espera una noche inolvidable!" están fijos a propósito, sin importar la hora real del evento (confirmado con el usuario, 2026-09-21 — si la hora cambia, se edita el componente a mano). No es un gap a resolver, solo confirmar que sigue mostrando ese texto sin romperse.
- [ ] Animaciones `pendulum`/`pendulum-strong` (SVG novios/brindis) → deben oscilar 2 veces y quedar estáticas (`animation-iteration-count: 2`, `fill-mode: both`), **no** loopear infinito. Verificar con `getComputedStyle` o simplemente cronometrar.

### 4.8 Detalles (acordeón)

- [ ] Los 4 ítems (Niños, Regalos, Puntualidad, Dresscode) abren/cierran independientemente, con `aria-expanded`/`aria-controls` correctos (probar con lector de pantalla o al menos inspeccionar el DOM).
- [ ] "Niños" y "Puntualidad": texto fijo siempre visible, sin condicionar a ningún campo — **confirmar con el usuario si esto es intencional** (NOTES.md §4 describe una versión vieja donde estos textos dependían de `soloAdultos`/`reglaPuntualidad`; el componente actual (`detalles-section.tsx`) no lee esos campos en absoluto).
- [ ] "Regalos": con `alias` solo, con `alias`+`aliasUsd`, con `cbu`, con los tres, y sin ninguno → el bloque de "Info de cuenta" completo debe aparecer/desaparecer según corresponda, y cada `CopyField` debe copiar el valor correcto al portapapeles (confirmar leyendo `navigator.clipboard` o el cambio de texto del botón a "Copiado" por 2s).
- [ ] "Dresscode": paleta de colores Mujeres (10 swatches, incluye el `#58422d` agregado el 2026-09-21) y Hombres (4 swatches) se renderizan completas.

### 4.9 Fecha límite + RSVP — matriz de estados (la parte más crítica)

Esta es la lógica más retocada del proyecto (ver memoria `project_plusones_grupos_asistentes`, actualización 2026-09-18). Probar **los 6 casos exactos**, para invitado individual **y** para grupo (misma lógica, `deadlinePassed` se calcula una sola vez en `RsvpSection`):

| `estadoFechaLimite` | ¿Ya confirmó? | `FechaLimiteSection` | `RsvpSection` |
|---|---|---|---|
| `antes` | No | Completa (encabezado + "1 de febrero" + "Faltan N días") | Formulario activo + "¡Te esperamos!" + "Angie y Fran" |
| `antes` | Sí | Completa (con contador) | "¡Confirmado!" + "¡Te esperamos!" + "Angie y Fran" |
| `hoy` (el día límite en sí) | No | Encabezado + fecha, **sin** el contador | Formulario activo + "¡Te esperamos!" + "Angie y Fran" |
| `hoy` | Sí | Encabezado + fecha, sin contador | "¡Confirmado!" + "¡Te esperamos!" + "Angie y Fran" |
| `vencido` (desde el día siguiente) | No | Sección oculta por completo | "Ya no se puede confirmar tu asistencia" + "Angie y Fran" (**sin** "Te esperamos") |
| `vencido` | Sí | Sección oculta por completo | "¡Confirmado!" + "¡Te esperamos!" + "Angie y Fran" (sin cambios) |

- [ ] Los 6 casos con invitado individual de prueba (forzar `camposEspecificos.fechaLimiteConfirmacion` por API/UPDATE acotado, revertir después).
- [ ] Los 6 casos con grupo de prueba.
- [ ] Confirmado **siempre gana** sobre vencido — verificar explícitamente el caso "confirmó antes de la fecha límite, después pasa la fecha" (no re-simular el submit, solo cambiar la fecha con el invitado ya confirmado).
- [ ] Borde de zona horaria: fijar `fechaLimiteConfirmacion` a **hoy** y probar cerca de medianoche Argentina (23:59 vs 00:01) para confirmar que el corte respeta UTC-3 fijo y no la hora del navegador/servidor.
- [ ] Link genérico (sin `?invitado=`/`?grupo=` válido) → siempre "¡Te esperamos!" + "Angie y Fran", **sin importar la fecha límite** (esta rama no computa `deadlinePassed` en absoluto — confirmar que no cambia si se fuerza una fecha vencida).

#### RSVP individual — validaciones

- [ ] Sin `puedeAgregarPlusOne` → solo título + restricción alimentaria + botón (sin contador ni campo de nombre).
- [ ] Con `puedeAgregarPlusOne` → contador 1↔2; al pasar a 2, "Invitado 1" se autocompleta (disabled) con `invitadoNombre`/`invitadoApellido` reales si existen, "Invitado 2" queda editable.
- [ ] Subir el contador a 2 y dejar nombre/apellido del acompañante vacíos → el submit se bloquea con el mensaje "Completá el nombre y apellido de tu acompañante, o volvé el contador a 1." (no debe confirmar solo al titular en silencio — este era justamente un bug ya corregido, es un buen candidato a test de regresión automatizado).
- [ ] Nombre/apellido del acompañante al límite de 100 caracteres → el input corta en 100 (`maxLength`), el contador de caracteres de la restricción (no del nombre) muestra `n/500` correctamente.
- [ ] Restricción alimentaria a 500 caracteres exactos → no se puede seguir escribiendo, el backend tampoco debería rechazar (mismo límite en `ConfirmarAsistenciaDto`).
- [ ] Reenvío/edición: confirmar, después volver a entrar al mismo link (invitado ya confirmado) → estado `confirmado`, no se puede volver a editar desde acá (ver §8, es un comportamiento a propósito, no un bug — "una vez confirmado no se puede volver a tocar el plus-one/integrantes desde el link público").
- [ ] Simular un error del backend (cortar el servidor, o un slug inexistente) → aparece `EstadoError` con mensaje y botón "Intentar de nuevo" que vuelve al formulario sin perder lo tipeado.

#### RSVP de grupo — validaciones

- [ ] Tildar 1, 2, y todos los integrantes precargados → checkboxes reflejan el estado, textarea de restricción es compartida (una sola, no por integrante).
- [ ] **Confirmar que NO existe forma de sumar gente nueva no listada** (el hook `useRsvpConfirmacionGrupo` sigue soportándolo — `agregarNuevo`/`nuevos` — pero `RsvpGrupo` de `boda-angela` no lo expone desde el 2026-09-18, a propósito). Si un grupo tiene `maxIntegrantesEfectivo` mayor a la cantidad de integrantes precargados, hoy no hay manera de usar ese margen desde el link. Confirmar con el usuario que sigue siendo el comportamiento deseado antes de cerrar este test.
- [ ] **Comportamiento a propósito, probarlo igual como regresión**: crear un grupo de prueba con 3 integrantes. Tildar **solo 1** y confirmar. Volver a entrar al mismo link → el grupo entero debe quedar en estado "confirmado" (bloqueado), sin poder seguir tildando a los otros 2. Confirmado con el usuario (2026-09-21): **es intencional** — el encargado/titular del grupo es responsable de tildar a todos los que van antes de confirmar, no es un flujo pensado para que cada integrante entre por separado. El test acá es de regresión (que se mantenga así), no una validación de si es correcto.
- [ ] Error de backend en grupo → mismo `EstadoError`/reintentar que individual.

### 4.10 Panel `/:eventoId/asistentes`

- [ ] Entrar sin contraseña / con contraseña incorrecta → bloqueado (403), mensaje claro, no expone datos.
- [ ] Entrar con la contraseña correcta → panel completo: listado de individuales + grupos, contadores `totalEsperados`/`totalConfirmados`.
- [ ] Crear invitado individual de prueba, editar (`puedeAgregarPlusOne`, `invitacionEnviada`), eliminar — con el diálogo de confirmación antes de las acciones destructivas.
- [ ] Crear grupo de prueba, agregar/quitar integrante, editar nombre/tope, eliminar (cascada) — con confirmación previa.
- [ ] Exportar Excel (individuales y el general de `/asistentes/export`) → el archivo descarga y abre sin errores, con los datos de prueba reflejados.
- [ ] Botón "Copiar URL" en un individual y en un grupo → copia la URL del **titular** (`?invitado=`/`?grupo=`), nunca la del plus-one ni de un integrante suelto.
- [ ] Restricción alimentaria de individuales y grupos: confirmar que es **de solo lectura** para el anfitrión (no hay input para editarla desde el panel, ver memoria 2026-09-15/18) — si alguien intenta "arreglarla" agregando un input, es una regresión respecto a la decisión de producto ya tomada.
- [ ] **Regresión de bug ya corregido**: crear una invitación de prueba dejando la contraseña de asistentes en blanco → debe defaultear a `'festeja123'` (`invitaciones.service.ts:~100`) y el panel debe quedar accesible con esa contraseña, no bloqueado para siempre.
- [ ] Mobile: fila nombre + botones (Copiar URL + Eliminar) no debe desbordar el ancho de la tarjeta (bug de layout ya corregido, confirmar que sigue arreglado).

### 4.11 Wizard admin — campos específicos de `boda-angela`

Importante: de todos los `camposEspecificos` que leen los componentes
(§3), **solo `novio1`, `novio2`, `alias`, `cbu` y `aliasUsd` tienen input en
el wizard** (`Step2Evento.tsx`). El resto (`horaCeremonia`,
`lugarCeremonia`, `direccionCeremonia`, `linkUbicacion`, `lugarCena`,
`direccionCena`, `linkUbicacionCena`, `fechaLimiteConfirmacion`, `cvu`) **no
tiene UI, a propósito** — la clienta no va a autogestionar estos campos;
si hace falta cambiarlos, el usuario los carga directo por API/DB. No es
un gap a resolver ni algo que el wizard tenga que terminar de cubrir. Ajustar
las expectativas del test a esto, no asumir que falta construir esa UI.

- [ ] Crear/editar una invitación con `templateSlug = 'boda-angela'` → el campo "Alias en USD" aparece en el wizard.
- [ ] Con cualquier otro template de boda (moderna/rústica/clásica) → el campo "Alias en USD" **no** debe aparecer (gateado explícitamente, confirmar que el gate sigue funcionando tras cualquier cambio al wizard).
- [ ] Asignación del template privado: desde el admin, crear una invitación nueva y asignarle `boda-angela` manualmente (no debe aparecer en el catálogo público del wizard de cliente — confirmar en `/client/create-invitation` que `boda-angela` no está listada ahí).
- [ ] Preview del wizard (`WizardLivePreview.tsx`, `previewMode`) → confirmar que el sobre no se muestra (ya cubierto en 4.3) y que el resto de la invitación renderiza con los datos que se van tipeando en vivo.

### 4.12 Responsive / cross-browser / accesibilidad rápida

- [ ] `resize_window` (o dispositivos reales) en mobile (375px), tablet (768px) y desktop (1440px) para las secciones más sensibles a layout: Hero, Ceremonia/Cena (fondo + imagen), RSVP (grupo con muchos integrantes), panel de Detalles.
- [ ] Un pase en un navegador real (no el Browser pane, ver §2.4) para juzgar la textura de fondo y el `mix-blend-mode` — es justamente el punto que NOTES.md marca como "no confiable en el preview de Claude".
- [ ] Contraste de texto sobre `COLOR.parchment`/`COLOR.crema` (paleta clara) — pasar al menos un chequeo automático de contraste (Lighthouse / axe) en Hero y RSVP, que son los bloques con más texto sobre fondo claro.
- [ ] Navegación por teclado: abrir/cerrar el acordeón de Detalles y el reproductor de música solo con teclado (Tab + Enter/Space).
- [ ] `prefers-reduced-motion`: esta template tiene bastantes animaciones (`useRevealOnScroll`, pendulum, fade-in-up, sello pulsante) — confirmar si hay algún manejo de esa media query (probablemente no) y decidir si vale la pena para esta clienta puntual o se anota como gap conocido.

### 4.13 Checklist de regresión de quirks ya conocidos (no reportar como bug nuevo)

Estos son comportamientos **ya documentados** en NOTES.md/memoria — el
objetivo de listarlos acá es no perder tiempo re-descubriéndolos, y
detectar si alguno cambió sin querer en un commit futuro:

- [ ] Hero: fecha "SÁBADO 20 FEBRERO 2027" hardcodeada (no lee `fechaEvento`).
- [ ] `FechaLimiteSection`: título "1 de febrero" hardcodeado (no lee `fechaLimiteConfirmacion`, solo el contador de días sí es dinámico).
- [ ] `CenaSection`: hora "21:00 HS" y texto descriptivo hardcodeados.
- [ ] Grupo RSVP: no se puede sumar gente nueva no precargada (removido a propósito el 2026-09-18).
- [ ] Una vez confirmado (individual o grupo), no hay forma de editar la confirmación desde el link público.
- [ ] Justo después de confirmar sin recargar, `FechaLimiteSection` puede mostrar el contador viejo un instante (no comparte estado con `RsvpSection`) — se resuelve solo al recargar.

---

## 5. Plan de testing AUTOMATIZADO

### 5.1 Estado actual

| | Framework | Config | Specs hoy |
|---|---|---|---|
| Backend (`backend_invitaciones`) | Jest + ts-jest + Supertest | ya en `package.json` (`npm test`, `npm run test:e2e`) | `app.controller.spec.ts`, `pedidos.e2e.spec.ts`, `test/app.e2e-spec.ts` — ninguno toca RSVP/grupos/asistentes |
| Frontend (`invitaciones-frontend`) | **ninguno instalado** | — | — |

Antes de escribir tests de frontend hace falta una decisión de setup (no
implementada en este plan, solo propuesta):

- **Vitest + React Testing Library** para unit/component (se integra nativo
  con Vite, cero config extra de bundler).
- **Playwright** para E2E de navegador real (necesario acá en particular
  porque buena parte del riesgo — animaciones, `setInterval`, audio,
  `localStorage`/caché offline — vive en comportamiento de navegador real,
  no en lógica de componente aislada).

### 5.2 Prioridad 1 — funciones puras de fecha (alto ROI, cero setup de DOM)

Son el corazón de la matriz de §4.9 y ya están exportadas o son fáciles de
exportar sin tocar el comportamiento:

- `fecha-limite-section.tsx`: `estadoFechaLimite`, `calcularDiasRestantes`,
  `haPasadoFechaLimite`, `obtenerFechaLimiteStr` — **ya exportadas**.
- `countdown-section.tsx`: `calcularDiferenciaMs`, `calcularTiempoRestante`,
  `calcularEstadoCountdown` — hoy **no exportadas**, exportarlas (cambio de
  una palabra, sin efecto en runtime) para poder testearlas igual que las
  de fecha límite.

Ejemplo de arranque (`fecha-limite-section.test.ts`, Vitest):

```ts
import { describe, it, expect, vi } from 'vitest'
import { estadoFechaLimite, calcularDiasRestantes } from './fecha-limite-section'

describe('estadoFechaLimite', () => {
  it('día límite completo cuenta como "hoy", no "vencido"', () => {
    vi.setSystemTime(new Date('2027-02-13T23:59:00-03:00'))
    expect(estadoFechaLimite('2027-02-13')).toBe('hoy')
  })

  it('pasa a "vencido" recién al empezar el día siguiente en Argentina', () => {
    vi.setSystemTime(new Date('2027-02-14T00:01:00-03:00'))
    expect(estadoFechaLimite('2027-02-13')).toBe('vencido')
  })

  it('es independiente de la zona horaria del entorno de ejecución', () => {
    vi.setSystemTime(new Date('2027-02-13T23:59:00-03:00')) // 02:59 UTC del día 14
    expect(estadoFechaLimite('2027-02-13')).toBe('hoy')
  })
})
```

Cubrir con esto los 6 casos de la matriz de §4.9 (estado × confirmado se
prueba a nivel componente/E2E, pero el cálculo de fecha en sí se prueba acá
sin levantar React).

### 5.3 Prioridad 2 — hooks de RSVP (Vitest + RTL, con `confirmarAsistencia`/`confirmarGrupo` mockeados)

- `useRsvpConfirmacion`:
  - bloquea el submit si `agregarPlusOne` y falta nombre/apellido del
    acompañante (el bug real ya corregido — este es el test de regresión
    más valioso de todo el plan).
  - `confirmar()` exitoso → `estado='success'`, `confirmado=true`.
  - `confirmar()` con error de API → `estado='error'`, `mensaje` viene de
    `extraerMensajeError`; `reintentar()` vuelve a `idle`.
  - trims de nombre/apellido/restricción antes de mandar el payload.
- `useRsvpConfirmacionGrupo`:
  - `toggleIntegrante` agrega/saca del `Set` de seleccionados.
  - `llegoAlTope`/`agregarNuevo` (aunque `boda-angela` no los use desde la
    UI, siguen siendo parte del contrato del hook que sí usa
    `GrupoRsvpSection` de `invitation-basic` — no dejar de cubrirlos solo
    porque un consumidor no los expone).

### 5.4 Prioridad 3 — componentes con lógica condicional (Vitest + RTL)

Con `invitacion` mockeada (fixture reutilizable tipo
`makeInvitacionFixture({ overrides })`), cubrir por `render` + assertions
de texto/presencia, sin snapshot completo (los snapshots grandes se
desactualizan solos con cada ajuste visual y no avisan de nada útil acá):

- `RsvpSection`: las 3 ramas (genérica/individual/grupo) × los 6 estados de
  fecha de §4.9 = hasta 18 combinaciones, pero muchas comparten aserción
  (alcanza con parametrizar con `it.each`).
- `DetallesSection`: combinaciones de `alias`/`aliasUsd`/`cbu` presentes/ausentes.
- `CeremoniaSection`/`CenaSection`: fallback a `ubicacion`/`direccion` generales vs. overrides.
- `EnvelopeOverlayAngela`: `getTitularInfo` con invitado/grupo/genérico (es una función pura adentro del archivo — exportarla igual que se hizo con las de fecha facilita testearla sin montar el componente entero).

### 5.5 Prioridad 4 — E2E (Playwright), contra el backend local real

A diferencia de lo anterior, acá vale la pena ir contra un backend real de
test (mismo patrón que ya usa el proyecto: datos descartables, limpiar al
final), porque lo que se quiere probar es la integración real, no lógica
aislada:

- `boda-angela-envelope.spec.ts`: auto-apertura a los 20s (usar
  `page.clock` de Playwright para no esperar 20s reales en CI), click
  manual, bloqueo de doble-trigger.
- `boda-angela-rsvp-individual.spec.ts`: flujo completo contra un invitado
  de prueba creado por API en el `beforeAll` y borrado en el `afterAll` —
  confirmar sin plus-one, confirmar con plus-one incompleto (ver el error),
  confirmar con plus-one completo, recargar y verificar estado
  `confirmado` persistente.
- `boda-angela-rsvp-grupo.spec.ts`: mismo patrón con un grupo de prueba —
  incluir el caso de "confirmar tildando solo 1 de 3" y verificar el
  estado del grupo entero al recargar (§4.9, el caso de riesgo marcado).
- `boda-angela-offline.spec.ts`: usar `page.route()` para simular caída del
  backend después de una primera visita exitosa → verificar
  `CachedVersionBanner`; y sin visita previa → `ServerDownScreen`.
- `boda-angela-asistentes.spec.ts`: login con contraseña de evento, crear/
  editar/eliminar invitado y grupo de prueba, exportar Excel (verificar que
  la descarga dispara, no hace falta parsear el archivo).

Ejemplo de arranque (`boda-angela-rsvp-individual.spec.ts`):

```ts
import { test, expect } from '@playwright/test'
// helpers propios: crear/borrar invitado de prueba por API antes/después

test('bloquea el submit si falta el nombre del acompañante', async ({ page }) => {
  await page.goto(`/${INVITACION_ID_TEST}?invitado=${SLUG_TEST}`)
  await page.getByRole('button', { name: 'Sumar invitado' }).click()
  await page.getByRole('button', { name: 'Confirmar asistencia' }).click()
  await expect(
    page.getByText('Completá el nombre y apellido de tu acompañante')
  ).toBeVisible()
})
```

### 5.6 Backend — specs a agregar (Jest, mismo patrón que `pedidos.e2e.spec.ts`)

- `invitados.rsvp.e2e.spec.ts` (`POST /invitaciones/:id/confirmar`):
  - 201/200 con payload válido, sin plus-one y con plus-one.
  - 400 si `plusOne` viene con `nombre`/`apellido` vacíos (el objeto es
    opcional, pero si está presente sus campos son obligatorios).
  - 400 si `invitadoSlug` o `restriccionAlimentaria` exceden `MaxLength`
    (250 y 500 respectivamente).
  - Idempotencia: confirmar dos veces el mismo slug no duplica filas,
    actualiza.
- `grupos.rsvp.e2e.spec.ts` (`POST /invitaciones/:id/grupos/confirmar`):
  - confirmar con `integrantesConfirmados` parcial (subset de los IDs del
    grupo) → verificar en la respuesta/DB si el grupo queda "confirmado"
    aunque falten integrantes por tildar (mismo caso de riesgo de §4.9,
    pero verificado a nivel API/DB en vez de UI).
  - `grupoSlug` inválido → 404, no 500.
- `event-password.guard.spec.ts`:
  - sin header `x-event-password` → 403.
  - header con password incorrecta → 403.
  - `invitacion.contrasenaAsistentes` vacío/null → 403 siempre (no debería
    poder pasar en la práctica porque el service defaultea a
    `'festeja123'` al crear, pero vale la pena blindar el guard en sí).
  - password correcta → 200, y el handler puede leer `request.invitacion`.
- Nota de alcance: los endpoints `asistentes/*` y `grupos/confirmar` no
  tienen ningún test hoy — son de los endpoints más nuevos y más
  retocados del proyecto (ver memoria), tienen el ROI más alto de todo
  este plan del lado backend.

### 5.7 Qué NO conviene automatizar acá

- Verificación visual pixel-perfect contra Figma (tipografías, colores,
  espaciados) — es trabajo de revisión manual/diseño, no de test
  automatizado; un screenshot-diff acá generaría más ruido que señal
  mientras la template sigue en construcción (NOTES.md §8 todavía tiene
  pases de color/tipografía pendientes).
- Animaciones puramente cosméticas (fade-in-up, pendulum) más allá de "no
  quedan loopeando infinito" — ya cubierto como caso puntual en §4.7/E2E,
  no hace falta un test por cada `animationDelay`.
- MercadoPago/checkout (fuera de alcance, §1.2).

---

## 6. Orden sugerido de ejecución

1. **Manual, bloque §4.9 (fecha límite + RSVP)** primero — es la lógica más
   compleja y más retocada, y el resto de la template depende poco de ella.
   Incluye el caso de riesgo de grupo parcial: si el comportamiento actual
   no es el esperado, mejor detectarlo antes de automatizar tests que lo
   den por "correcto".
2. **Manual, resto de la vista pública** (§4.2 a 4.8, 4.12) — un pase
   completo en navegador real, no en el Browser pane (§2.4).
3. **Manual, panel de asistentes + wizard admin** (§4.10, 4.11).
4. **Automatizado, Prioridad 1** (funciones de fecha) — rápido, sin
   dependencias, y evita que alguien "optimice" `calcularDiasRestantes` sin
   darse cuenta de que rompe el borde de medianoche Argentina otra vez.
5. **Automatizado backend** (§5.6) — protege los endpoints públicos sin
   auth (`confirmar`, `grupos/confirmar`) que cualquiera puede pegarle.
6. **Automatizado Prioridad 2/3** (hooks y componentes) — a medida que se
   toque cada archivo, no hace falta escribir los 9 de una sentada.
7. **Playwright E2E** — al final, cuando el resto ya esté estable (si se
   escribe primero, cada ajuste visual en curso lo rompe y genera ruido).
8. **Smoke test en producción** (§1.1) — último paso, una vez que el pase
   local esté cerrado y sin sorpresas. Alcance reducido: carga de la
   página, RSVP de punta a punta con invitados de prueba propios creados
   ahí (borrados después), y un vistazo visual general.

---

## 7. Cómo correr cada suite

```bash
# Backend — specs existentes + las que se agreguen en 5.6
cd backend_invitaciones
npm test               # unit
npm run test:e2e       # e2e (requiere DB local levantada)
```

```bash
# Frontend — una vez agregado el setup de 5.1 (no instalado todavía)
cd invitaciones-frontend
npm run test           # Vitest, a agregar al package.json
npx playwright test    # E2E, a agregar
```

---

## 8. Hallazgos de esta revisión / a confirmar con el usuario

La mayoría de estos ya se resolvieron en la misma sesión en que se detectaron
(quedan marcados ✅). Lo que sigue abierto son puntos donde vale una
confirmación explícita antes de tratarlos como "correctos" en los tests
automatizados:

1. ✅ **Resuelto (2026-09-21)** — `NOTES.md` §3 y §9 estaban desactualizados
   (documentaban la estructura vieja de secciones). Reescrito por completo
   el mismo día, ya sincronizado con `invitation-view.tsx` actual.
2. ✅ **Resuelto (2026-09-21)** — los 5 archivos huérfanos
   (`event-info-section.tsx`, `gift-section.tsx`, `locations-section.tsx`,
   `map-section.tsx`, `note-section.tsx`) y los assets que usaban en
   exclusiva (`icon-civil.svg`, `icon-celebracion.svg`, `icon-heart.svg`,
   más `fondo-hero.png`/`foto-novios.png`/`divisor*.svg`/`foto-frame.svg`/
   `foto-mask.svg`/`rec-std.svg`/`SVG/pruebasvg*.svg`, ya pre-flagueados o
   sin referencias) se borraron.
3. ✅ **Resuelto (2026-09-21)** — "Niños"/"Puntualidad" en texto fijo en
   `DetallesSection`, sin leer `camposEspecificos`: confirmado con el
   usuario que es intencional (mismo criterio que el resto del contenido
   hardcodeado de esta template, ver punto 7).
4. **Grupo RSVP sin opción de sumar gente nueva** — remoción intencional
   (memoria 2026-09-18).
5. ✅ **Resuelto (2026-09-21)** — un solo integrante confirmando cierra
   todo el grupo (ver §4.9): **confirmado como intencional** por el
   usuario. El encargado/titular del grupo es responsable de tildar a
   todos los que van antes de confirmar; no es un flujo pensado para que
   cada integrante entre por separado. Queda como test de regresión, no
   como pregunta abierta.
6. ✅ **Resuelto (2026-09-21)** — varios `camposEspecificos` sin UI en el
   wizard (`horaCeremonia`, `lugarCeremonia`, `direccionCeremonia`,
   `linkUbicacion`, `lugarCena`, `direccionCena`, `linkUbicacionCena`,
   `cvu`), solo cargables por API/DB directa: confirmado que es a
   propósito — la clienta no autogestiona nada, el usuario edita a mano
   cuando haga falta. No hay que construir esa UI.
   **Actualizado (2026-09-23)**: `fechaLimiteConfirmacion` pasó a tener UI
   propia en el wizard (input `type="date"` en `Step2Evento.tsx`, sección
   "Fecha límite de confirmación", gateada a `templateSlug === 'boda-angela'`)
   porque no se venía seteando en ningún lado y dependía 100% del fallback
   hardcodeado en código.
7. ✅ **Resuelto (2026-09-21), queda solo como nota operativa** — textos
   hardcodeados que dependen de que la fecha/hora real no cambie: Hero ("20
   FEBRERO 2027"), `FechaLimiteSection` ("1 de febrero"), `CenaSection`
   ("21:00 HS" + texto). Confirmado que es intencional (punto 6). Sigue
   siendo útil un test de regresión (§5.4, comparando el texto renderizado
   contra `invitacion.fechaEvento`) para que, el día que el usuario edite la
   fecha en la DB, se acuerde de actualizar estos strings también — no
   como bug, sino como recordatorio operativo del propio flujo manual.

---

## Referencias

- `invitaciones-frontend/src/components/invitations/boda-angela/NOTES.md` — estado de construcción y decisiones de diseño.
- Memoria de proyecto: `project_template_boda_angela`, `project_plusones_grupos_asistentes`, `feedback_verify_before_claiming`.
- `Invitaciones/Documentacion v1.1/Plan_Invitados_PlusOne_Familias.md` — plan original de la feature de plus-ones/grupos/asistentes (ya completado, referencia de contexto).
