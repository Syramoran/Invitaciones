# Template `boda-angela` — Notas de construcción

> Doc de trabajo. Vamos anotando acá las decisiones clave, el estado de cada
> componente y lo que queda pendiente mientras revisamos la template de a poco.
> Última actualización: 2026-09-21 (reescritura completa contra el código
> actual — la versión anterior de §3/§4/§7/§9/§10 estaba desactualizada,
> describía una estructura de secciones que ya no existe).
>
> **Plan de testing (manual + automatizado) en:**
> `Invitaciones/Documentacion v1.1/Plan_Testing_BodaAngela.md`.

---

## 1. Qué es esta template

- Invitación **privada, a medida, para una sola clienta** ("Angie y Fran",
  boda). Diseño de origen: Figma **"Wedding angela"**.
- **No aparece en el catálogo público** del wizard: usa el flag
  `Template.publico = false` (backend). Solo se asigna manualmente desde el admin.
- Registro en DB local: `id = 14`, `slug = boda-angela`, `publico = false`,
  `tipo_evento_id = 1` (Boda).
- **Ya está migrada a producción** (Railway) — tanto el `template` como la
  `invitacion` real de Angela existen ahí (confirmado por el usuario,
  2026-09-21; no se verificó el id exacto en la DB de producción en esta
  pasada — ver §10). No hace falta migrar invitados: **todavía no hay
  ninguno real cargado**, ni en local ni en producción, todos los que hay
  hoy son de prueba (ver §10).
- Carpeta de componentes: `invitaciones-frontend/src/components/invitations/boda-angela/`
- Assets estáticos: `invitaciones-frontend/public/boda-angela/`
- El código de esta template está commiteado (dejó de ser el caso "todo sin
  commitear" de versiones anteriores de este doc).
- **Filosofía de la template, importante para no confundir "hardcodeado" con
  "bug"**: al ser exclusiva de una sola clienta, es una decisión consciente
  tener bastante contenido fijo en el JSX (fechas, horarios, textos) en vez
  de cablearlo a `camposEspecificos`/el wizard — da igual si un dato "debería"
  salir del backend o vive hardcodeado en el front. Si algo cambia (p. ej. la
  hora de un evento), lo edita el desarrollador a mano en código o en la DB;
  la clienta no tiene ni va a tener un flujo de autoservicio para eso. No
  reportar esto como gap/bug — ver el detalle marcado igual en §8 y §9 para
  que quede documentado qué es fijo, sin tratarlo como pendiente de arreglar.

---

## 2. Cómo se cablea en la app

- **Registro por convención de carpeta** — `components/invitations/registry.ts`
  hace `import.meta.glob('./**/invitation-view.tsx')`. El nombre de la carpeta
  (`boda-angela`) tiene que coincidir con el `slug` de la template en la DB.
  No hay que registrar nada a mano.
- **Render público** — `pages/public/InvitacionPage.tsx` resuelve
  `getInvitationComponent(invitacion.template.slug)` y monta
  `<InvitationView invitacion=... invitadoParam=... />` dentro de un `<Suspense>`.
  Esta template además tiene su propia pantalla de loading
  (`BodaAngelaLoadingScreen`, definida ahí mismo): un pulso crema en vez del
  spinner genérico gris del resto de las templates.
- **Preview en el wizard admin** —
  `components/admin/crear-invitacion/WizardLivePreview.tsx` monta
  `<InvitationView invitacion=... previewMode />`.
  Con `previewMode` el sobre de bienvenida (`EnvelopeOverlayAngela`) **no** se
  muestra (`showOverlay = !previewMode`).
- **Punto de entrada único**: `invitation-view.tsx` → `InvitationView`. Todo lo
  demás cuelga de ahí.

---

## 3. Estructura de secciones (orden real en `invitation-view.tsx`, verificado 2026-09-21)

Contenedor raíz: `div.relative.min-h-screen.w-full.overflow-hidden`, fondo
`COLOR.parchment`. Encima, dos imágenes de textura absolutas (no
`background-image` del contenedor como decía una versión anterior de este
doc):
- `textura-inv.jpg` — full-bleed (`inset-0 h-full w-full object-cover`),
  `opacity: 0.7`, `mixBlendMode: 'multiply'`. Siempre visible.
- `sections-bg-mobile2.jpg` — mismo full-bleed, **solo mobile** (`sm:hidden`),
  sin blend/opacity especial. No documentada en versiones anteriores de este
  doc.

Adentro, columna de contenido: `mx-auto w-full max-w-[750px]` (no
`max-w-[430px] sm:max-w-[900px]` como decía antes — se unificó a un solo
ancho máximo).

| #  | Componente              | Archivo                        | Condición para mostrarse |
|----|-------------------------|--------------------------------|--------------------------|
| 0  | `EnvelopeOverlayAngela` | `envelope-overlay-angela.tsx`  | `invitacionCompleta && showOverlay` (arranca `!previewMode && invitacionCompleta`, se apaga al abrir el sobre) |
| 0b | `MusicPlayerAngela`     | `music-player-angela.tsx`      | `invitacionCompleta && invitacion.musica && !showOverlay` |
| 1  | `HeroSection`           | `hero-section.tsx`             | siempre (único bloque visible cuando `invitacionCompleta === false`) |
| 2  | `CountdownSection` (evento) | `countdown-section.tsx`    | `invitacionCompleta` **y** si algún `servicio.nombre` incluye "cuenta regresiva" o "countdown" |
| —  | `Divisor`               | inline en `invitation-view.tsx` | `invitacionCompleta` — siempre entre secciones cuando la invitación está completa (ver nota abajo) |
| 3  | `CeremoniaSection`      | `ceremonia-section.tsx`        | `invitacionCompleta` (envuelto en `Reveal`) |
| 4  | `CenaSection`           | `cena-section.tsx`             | `invitacionCompleta` (`Reveal`) |
| 5  | `DetallesSection`       | `detalles-section.tsx`         | `invitacionCompleta` (`Reveal`) |
| 6  | `FechaLimiteSection`    | `fecha-limite-section.tsx`     | `invitacionCompleta` **y** `estadoFechaLimite(...) !== 'vencido'` (devuelve `null` si ya venció) |
| 7  | `RsvpSection`           | `rsvp-section.tsx`             | `invitacionCompleta && invitacion.tieneConfirmacion` (y adentro: 3 ramas — genérica/individual/grupo, ver §9) |
| 8  | `footer`                | inline en `invitation-view.tsx` | `invitacionCompleta` — solo el link `festeja.com.ar` (el `<span>Hecho con </span>` está comentado, no se muestra) |

**Modo "Save the date" (`camposEspecificos.invitacionCompleta === 'false'`,
agregado 2026-09-23)**: todo lo de la tabla salvo `HeroSection` (fila 1) se
oculta — incluido el sobre y la música, que ni se montan (no solo se pausan).
`heroRevealed` arranca en `true` en este modo (no depende de abrir el sobre,
que no existe), así que el hero se muestra directo con sus animaciones.
Pensado para: mostrar el hero como "save the date" hasta una fecha, y luego
el cliente activa el toggle "Mostrar invitación completa" en el wizard
(`Step2Evento.tsx`) para revelar el resto.

**Ya no existe** la vieja secuencia `EventInfoSection → LocationsSection →
MapSection → NoteSection → DresscodeSection → GiftSection` que documentaba
una versión anterior de este doc — esos 5 archivos quedaron huérfanos tras el
refactor del 2026-09-15 y **se borraron el 2026-09-21** (junto con
`dresscode-section.tsx`, que ya no existía — su contenido vive ahora en el
acordeón "Dresscode" de `DetallesSection`).

**`Divisor()`**: ya no es un `<div>` estático — ahora usa
`useRevealOnScroll` igual que las secciones, con `scaleX`/`opacity`
animados al entrar en viewport (`transform-origin: center`,
`cubic-bezier(0.16, 1, 0.3, 1)`). Sigue sin usar los SVG `divisor*.svg`
(que además ya se borraron, ver §7).

**`Reveal` / `useRevealOnScroll`**: patrón compartido nuevo (no existía en
la versión anterior de este doc) — `reveal.tsx` + `use-reveal-on-scroll.ts`.
Envuelve una sección y le aplica fade/scale al entrar en viewport. Varios
componentes además usan `useRevealOnScroll` directo (no vía `<Reveal>`) para
animar sub-bloques internos (p. ej. `CeremoniaSection`/`CenaSection` tienen
2 observadores propios, uno por grupo de contenido).

`CountdownSection` es **reutilizable**: hoy solo se usa una vez (cuenta
regresiva del evento). El 2º uso que documentaba una versión anterior de
este doc (countdown al cierre de confirmaciones) ya no existe — ese rol lo
cumple `FechaLimiteSection`, que es un componente distinto con su propia
lógica de fecha (día calendario en Argentina, no cuenta ms como
`CountdownSection`).

---

## 4. Modelo de datos: qué campos consume cada componente

El tipo `CamposEspecificosBoda` (en `types/invitation.ts`) sigue solo
declarando `novio1`, `novio2`, `tipoCeremonia?`, `dressCode?`, `notas?`. Cada
componente sigue casteando `camposEspecificos` a una interfaz local ad-hoc
(`CamposAngela` en `ceremonia-section.tsx`/`cena-section.tsx`, `CamposGift`
en `detalles-section.tsx`, etc.) — **sigue sin existir un
`CamposEspecificosBodaAngela` unificado** (mismo TODO que antes, ver §8).

| Campo (`camposEspecificos.*`)   | Lo lee                    | Uso | ¿Editable desde el wizard admin? |
|----------------------------------|----------------------------|-----|-----------------------------------|
| `novio1`, `novio2`               | `hero-section`             | nombres de la pareja (título del hero) | Sí (`Step2Evento.tsx`) |
| `horaCeremonia`                  | `ceremonia-section`        | fallback: `invitacion.horaEvento` | No — solo API/DB |
| `lugarCeremonia`                 | `ceremonia-section`        | fallback: `invitacion.ubicacion` | No |
| `direccionCeremonia`             | `ceremonia-section`        | fallback: `invitacion.direccion` | No |
| `linkUbicacion`                  | `ceremonia-section`        | fallback: link de Google Maps armado con lugar+dirección | No |
| `lugarCena`                      | `cena-section`             | fallback: `invitacion.ubicacion` | No |
| `direccionCena`                  | `cena-section`             | fallback: `invitacion.direccion` | No |
| `linkUbicacionCena`              | `cena-section`             | fallback: link de Maps armado | No |
| `fechaLimiteConfirmacion`        | `fecha-limite-section`, `rsvp-section` | fecha de corte del RSVP (fallback fijo `"2027-02-01"` si no está seteado) | Sí (input `type="date"` gateado a `templateSlug === 'boda-angela'` en `Step2Evento.tsx`, sección "Fecha límite de confirmación") |
| `alias`                          | `detalles-section` (acordeón Regalos, cuenta en pesos) | alias bancario (ARS) | Sí |
| `cbu` / `cvu`                    | `detalles-section`         | toma `cbu`, si no `cvu` — cuenta en pesos | Solo `cbu` tiene input; `cvu` no |
| `aliasUsd`                       | `detalles-section`         | alias bancario en USD — **inputs gateados a `templateSlug === 'boda-angela'`** en `Step2Evento.tsx`, no aparecen para las otras bodas | Sí (solo esta template) |
| `cbuUsd`                         | `detalles-section`         | CBU/CVU de la cuenta en USD — **input gateado a `templateSlug === 'boda-angela'`** en `Step2Evento.tsx` | Sí (solo esta template) |
| `invitacionCompleta`             | `invitation-view`           | modo "Save the date" (2026-09-23): `!== 'false'` → invitación completa (default). `'false'` → solo se renderiza `HeroSection`; se ocultan sobre (`EnvelopeOverlayAngela`), música (`MusicPlayerAngela`, no se monta el `<audio>` así no puede sonar), countdown, ceremonia, cena, detalles, fecha límite, RSVP, divisores y footer. `heroRevealed`/`showOverlay` se ajustan para que el hero se vea directo sin animación de sobre | Sí (toggle en `Step2Evento.tsx`, sección "Visibilidad de la invitación") |

Campos de `InvitacionPublica` (nivel raíz) usados hoy: `id`, `titulo`,
`fechaEvento`, `horaEvento`, `ubicacion`, `direccion`, `servicios` (para
detectar el countdown), `musica`, `tieneConfirmacion`,
`mostrarBotonConfirmar`, `invitadoNombre`, `invitadoApellido`,
`puedeAgregarPlusOne`, `yaConfirmado`, `restriccionAlimentariaExistente`,
`plusOneExistente`, `grupo`. **Ya no se usan** `fotosAnfitrion` (el hero usa
imágenes estáticas propias, `s-t-d/std_*`) ni `saludoPersonalizado`.

**Corrección importante respecto a una versión anterior de este doc**: el
sobre de apertura (`EnvelopeOverlayAngela`) **no** usa `novio1`/`novio2` — el
nombre que muestra es el del **invitado/grupo que abre el link**
(`invitacion.grupo.nombre` o `invitacion.invitadoNombre`+`invitadoApellido`),
vía la función interna `getTitularInfo`. "Angie y Fran" como tal solo
aparece hardcodeado en `hero-section.tsx` y `rsvp-section.tsx`
(`NombreCoupla`), nunca en el sobre.

**Contenido fijo por diseño (no cablea a ningún campo, ver §1)**:
- Hero: fecha "SÁBADO 20 FEBRERO 2027" — el link de "Agendar en calendario"
  sí usa `invitacion.fechaEvento` real, pero el texto mostrado no.
- `FechaLimiteSection`: título "1 de febrero" — el contador de días
  ("Faltan N días") sí es dinámico contra `fechaLimiteConfirmacion`, el
  texto de la fecha no.
- `CenaSection`: hora "21:00 HS" + el texto "¡Después del sí... nos espera
  una noche inolvidable!" — sin ningún campo equivalente a `horaCeremonia`.
- `DetallesSection`: los textos de "Niños" y "Puntualidad" son fijos, no
  leen ningún campo (`camposEspecificos.soloAdultos`/`reglaPuntualidad` ya
  no existen como condición — una versión anterior de este doc describía el
  componente viejo `note-section.tsx`, que sí eran data-driven pero está
  borrado desde 2026-09-21).

---

## 5. Tipografías

### 5.1 Guía oficial del diseño (transcripción literal de la imagen de Figma)

> Los **tamaños pueden variar** respecto de lo implementado porque en el diseño
> de Figma están así. Esto es la referencia base tal cual la pasó la clienta/diseño.

Hoja de estilos: `<link rel="stylesheet" href="https://use.typekit.net/ulv5nzn.css">`

| Estilo      | Fuente                         | Tamaño | Line height | Letter spacing | Caso       | `font-family`                          | `font-weight` | `font-style` |
|-------------|--------------------------------|--------|-------------|----------------|------------|---------------------------------------|---------------|--------------|
| **H1**      | Absolute beauty                | 96     | 54          | —              | —          | `"absolute-beauty", sans-serif`       | 700           | normal       |
| **H2**      | Cormorant Garamond Medium      | 28     | auto        | 30%            | Uppercase  | `"cormorant-garamond", serif`         | 500           | normal       |
| **H3**      | Montserrat                     | 16     | 21          | 20%            | Uppercase  | `montserrat, sans-serif`              | 400           | normal       |
| **H4**      | Montserrat                     | 18     | 28          | 8%             | Uppercase  | `montserrat, sans-serif`              | 300           | normal       |
| **Text**    | Montserrat                     | 16     | 23          | —              | —          | `montserrat, sans-serif`              | 400           | normal       |
| **Text2**   | Montserrat                     | 16     | 28          | 10%            | Uppercase  | `montserrat, sans-serif`              | 400           | normal       |
| **Text3**   | Montserrat                     | 15     | 21          | 8%             | Uppercase  | `montserrat, sans-serif`              | 400           | normal       |
| **Timer**   | Garamond Premier Pro Regular   | 36     | auto        | —              | —          | `"garamond-premier-pro", serif`       | 400           | normal       |
| **details-h** | Cormorant Garamond Medium    | 20     | auto        | 15%            | Uppercase  | `"cormorant-garamond", serif`         | 500           | normal       |
| **Horarios** | Garamond Premier Pro Regular  | 36     | auto        | 10%            | —          | `"garamond-premier-pro", serif`       | 400           | normal       |
| **(nº grande, ej. "120")** | Garamond Premier Pro Display | 142 | —      | —              | —          | `"garamond-premier-pro-display", serif` | 400         | normal       |

CSS crudo de cada estilo (como viene en la imagen):

```css
/* H1 — Absolute beauty | 96 / lh 54 */
font-family: "absolute-beauty", sans-serif;
font-weight: 700;
font-style: normal;

/* H2 — Cormorant Garamond Medium | 28 / lh auto / tracking 30% / UPPERCASE */
font-family: "cormorant-garamond", serif;
font-weight: 500;
font-style: normal;

/* H3 — Montserrat | 16 / lh 21 / tracking 20% / UPPERCASE */
font-family: montserrat, sans-serif;
font-weight: 400;
font-style: normal;

/* H4 — Montserrat | 18 / lh 28 / tracking 8% / UPPERCASE */
font-family: montserrat, sans-serif;
font-weight: 300;
font-style: normal;

/* Text — Montserrat | 16 / lh 23 */
font-family: montserrat, sans-serif;
font-weight: 400;
font-style: normal;

/* Text2 — Montserrat | 16 / lh 28 / tracking 10% / UPPERCASE */
font-family: montserrat, sans-serif;
font-weight: 400;
font-style: normal;

/* Text3 — Montserrat | 15 / lh 21 / tracking 8% / UPPERCASE */
font-family: montserrat, sans-serif;
font-weight: 400;
font-style: normal;

/* Timer — Garamond Premier Pro Regular | 36 / lh auto */
font-family: "garamond-premier-pro", serif;
font-weight: 400;
font-style: normal;

/* details-h — Cormorant Garamond Medium | 20 / lh auto / tracking 15% / UPPERCASE */
font-family: "cormorant-garamond", serif;
font-weight: 500;
font-style: normal;

/* Horarios — Garamond Premier Pro Regular | 36 / lh auto / tracking 10% */
font-family: "garamond-premier-pro", serif;
font-weight: 400;
font-style: normal;

/* Número grande (ej. "120") — Garamond Premier Pro Display | 142 */
font-family: "garamond-premier-pro-display", serif;
font-weight: 400;
font-style: normal;
```

### 5.2 Cómo están cargadas hoy

- Kit de **Adobe Fonts (Typekit)** `ulv5nzn`, incluido en
  `invitaciones-frontend/index.html`:
  `<link rel="stylesheet" href="https://use.typekit.net/ulv5nzn.css" />`.
- **Kit verificado (2026-09-09)** — expone las 5 familias de la guía:
  `absolute-beauty` (700), `cormorant-garamond` (400, 500),
  `montserrat` (**solo 300 y 400**), `garamond-premier-pro` (400) y
  `garamond-premier-pro-display` (400).
- `montserrat` también venía por Google Fonts (algunos componentes usan
  `"Montserrat, sans-serif"` con mayúscula). Para esta template usar siempre la
  del kit vía `FONT.sans` (`montserrat, sans-serif`, minúscula).

### 5.3 Fuente de verdad: `theme.ts`

`invitaciones-frontend/src/components/invitations/boda-angela/theme.ts` centraliza
tipografías y colores de esta template. **No usar fuentes ni colores fuera de acá.**

- `FONT` — las 5 familias (`script`, `serif`, `sans`, `garamond`, `garamondDisplay`).
- `TYPO` — presets por estilo de la guía (`h1`, `h2`, `h3`, `h4`, `text`, `text2`,
  `text3`, `timer`, `detailsH`, `horarios`, `numero`) como `CSSProperties`.
- `COLOR` — los 5 colores de la guía (ver sección 6).

Uso: `style={{ ...TYPO.h2, color: COLOR.brown }}`.

### 5.4 Gaps / a resolver con la guía (no re-verificado componente por componente en esta pasada — solo `hero-section.tsx` tenía el pase confirmado como hecho a la fecha de la última revisión)

- **`hanken-grotesk`** — sigue en el kit; confirmar si ya se reemplazó por
  `FONT.sans` en todos los componentes o sigue pendiente en alguno.
- **Pesos fuera del kit** (Montserrat 500/600 sobre un kit que solo trae
  300/400) — mismo estado, no re-verificado.
- Fallback de `absolute-beauty`: `theme.ts` usa `sans-serif` (correcto según
  la guía) — confirmar que no queda ningún `cursive` suelto.

---

## 6. Paleta de colores (guía "Colores" — definitiva)

Los **únicos 5 colores** de la template. Están en `theme.ts` como `COLOR`.

| Nombre       | HEX       | `COLOR.*`   | Uso según la guía |
|--------------|-----------|-------------|-------------------|
| Parchment    | `#F4F2F0` | `parchment` | fondo |
| Negro        | `#0D0D0D` | `negro`     | letras cursivas y animaciones |
| Dark Brown   | `#3B332B` | `darkBrown` | timer y textos |
| Brown        | `#67594C` | `brown`     | textos y números |
| Crema        | `#D4CCC4` | `crema`     | botones |

### 6.1 Colores en el código que NO están en la paleta

Tabla ampliada 2026-09-21 (los primeros son los ya conocidos; los últimos 2
son nuevos, detectados esta pasada en `rsvp-section.tsx`/`detalles-section.tsx`):

| Hex en el código        | Dónde / uso actual            | Reemplazo sugerido |
|--------------------------|-------------------------------|--------------------|
| `#262626`               | nombres, botones (texto)      | `negro` (cursivas) o `darkBrown` (texto) según el caso |
| `#574b42`               | texto secundario dresscode    | `brown` |
| `#c9c0b8` / `#eee9e4`    | hover de botones              | `crema` con `opacity`/filtro |
| `#e9e5e2` / `#e0d8cc`    | placeholders / skeleton        | `parchment` / `crema` |
| `#9a8f82`                | texto tenue, placeholders     | `brown` |
| `#777` / `#555`          | footer                        | `brown` / `darkBrown` |
| `rgba(59,51,43,0.55)`    | dim del overlay               | `darkBrown` con alpha |
| `#e4e4e4`                | fondo de mapa (componente ya borrado, revisar si queda en otro lado) | `parchment` / `crema` |
| `bg-[#E9E5E2]`           | fondo de inputs/textarea en `rsvp-section.tsx` | `crema` |
| `#D3CBC5`                | borde entre filas del acordeón en `detalles-section.tsx` | `brown` con opacidad |

También: `invitation-view` setea `--invitation-primary` / `--invitation-accent`
a `COLOR.brown` (ya no un hex suelto — esto se corrigió respecto a antes). El
fondo del contenedor ya es `COLOR.parchment` (también corregido, antes decía
`bg-white`).

### 6.2 Swatches del dresscode

Hardcodeados en el acordeón "Dresscode" de `detalles-section.tsx` (antes
vivían en el componente ya borrado `dresscode-section.tsx`) — son colores de
vestimenta sugerida, no son de la paleta de marca, quedan como están:
- Mujeres (10, actualizado 2026-09-21 — se agregó `#58422d` al final):
  `#a65f3c #898174 #6f7a49 #458d77 #476a9c #1e2a45 #584b86 #492c45 #151515 #58422d`
- Hombres (4): `#1D2B45 #58422d #8e8e93 #000000`

---

## 7. Assets (`public/boda-angela/`)

### Usados por componentes activos (verificado 2026-09-21, sin referencias rotas)

| Archivo                     | Dónde |
|-----------------------------|-------|
| `s-t-d/std_mobile.webp`     | foto de la pareja mobile (`hero-section`) |
| `s-t-d/std_web.webp`        | foto de la pareja desktop (`hero-section`) |
| `s-t-d/Std-bg-mobile.webp`  | fondo hero mobile |
| `s-t-d/std-bg.webp`         | fondo hero desktop |
| `std_animated.svg`          | animación "Save the date" del hero, se remonta con `key` al abrir el sobre |
| `vector-date.svg`           | ícono del botón "Agendar en calendario" (`hero-section`) |
| `textura-inv.webp`          | textura de fondo global, todas las pantallas |
| `sections-bg-mobile2.webp`  | textura de fondo adicional, **solo mobile** |
| `sobre/bottom.webp`, `sobre/top.webp`, `sobre/sello.webp` | `envelope-overlay-angela.tsx` |
| `novios-recurso.svg`        | ilustración de `ceremonia-section.tsx` |
| `villaelina-recurso.svg`    | ilustración de lugar en `ceremonia-section.tsx` |
| `brindis-recurso.svg`       | ilustración de `cena-section.tsx` |

### Borrados el 2026-09-21 (estaban huérfanos, confirmado por grep en todo `src/`)

`fondo-hero.png` (10 MB), `foto-novios.png`, `divisor.svg`,
`divisor-sm-1.svg`…`divisor-sm-4.svg`, `foto-frame.svg`, `foto-mask.svg`,
`icon-civil.svg`, `icon-celebracion.svg`, `icon-heart.svg` (estos 3 quedaron
huérfanos al borrar `locations-section.tsx`/`gift-section.tsx`), `rec-std.svg`
y `SVG/pruebasvg.svg`/`SVG/pruebasvg2.svg` (SVGs de prueba sin documentar,
carpeta `SVG/` completa eliminada). Todo estaba commiteado, recuperable vía
`git log` si hiciera falta.

### Borrado el 2026-09-22 (B2 de la auditoría)

`villa-elina.png` (400 KB, en realidad un JPEG con extensión `.png` —
confirmado con `sharp`) — huérfano, sin ninguna referencia en `src/`. Estaba
commiteado, recuperable por `git log` si hiciera falta.

**Peso de imágenes — resuelto 2026-09-22 (M1 de la auditoría)**: los 7 PNG/JPG
que quedaban sin optimizar (`s-t-d/std-bg.png` 2.2MB, `s-t-d/Std-bg-mobile.jpg`
570KB, `s-t-d/std_web.png` 435KB, `s-t-d/std_mobile.png` 341KB,
`sobre/bottom.png` 703KB, `sobre/top.png` 321KB, `sobre/sello.png` 66KB) se
convirtieron a `.webp` con `sharp` (calidad 82 fotos / 88 piezas del sobre,
`effort:6`), preservando el canal alpha donde lo tenían. Total: 4.6MB → 426KB
(-91%). Verificado visualmente en el navegador (mobile y desktop) que no hay
pérdida de nitidez ni artefactos, y por red que no queda ningún 404. Los 7
originales se borraron (recuperables por `git log`, estaban commiteados) y
`hero-section.tsx`/`envelope-overlay-angela.tsx` se actualizaron a las rutas
`.webp`.

---

## 8. Puntos abiertos / TODOs

- [ ] **Tipos**: crear `CamposEspecificosBodaAngela` unificado y sacar los
      casts locales ad-hoc (`CamposAngela` en `ceremonia-section.tsx` y
      `cena-section.tsx`, `CamposGift` en `detalles-section.tsx`, etc.).
- [ ] **Pase de fuentes/colores**: no re-verificado componente por
      componente en esta pasada — ver gaps listados en §5.4/§6.1 (2 colores
      nuevos detectados: `#E9E5E2` en inputs de RSVP, `#D3CBC5` en bordes
      del acordeón de Detalles).
- [x] **`villa-elina.png`** — borrado 2026-09-22 (B2), sin referencia activa
      (ver §7).
- [x] **`tsc --noEmit`**: corre limpio, 0 errores (confirmado 2026-09-21 y de
      nuevo 2026-09-22 tras el cambio de imágenes a webp).
- [x] **Imágenes sin optimizar** — resuelto 2026-09-22 (M1 de la auditoría),
      ver detalle en §7. Los 7 PNG/JPG que quedaban pasaron a `.webp`
      (-91% de peso); `textura-inv.jpg`/`sections-bg-mobile2.jpg` ya venían
      en `.webp` de antes.
- [x] **Estructura de secciones desactualizada en este doc** — corregido
      2026-09-21 (esta reescritura).
- [x] **5 archivos huérfanos** (`event-info-section.tsx`, `gift-section.tsx`,
      `locations-section.tsx`, `map-section.tsx`, `note-section.tsx`) +
      assets exclusivos de ellos — borrados 2026-09-21.
- [x] **Commit pendiente** — resuelto, todo el código de la template está
      commiteado (confirmado por `git log`).
- [x] **Migración a producción** — resuelto, template + invitación real ya
      existen en producción (confirmado por el usuario 2026-09-21).

**Ya NO son TODOs** (contenido fijo a propósito, ver §1 y §4 — no tratar
como pendiente de arreglar salvo que la clienta pida explícitamente que
algo pase a ser dinámico):
- Hero con fecha hardcodeada.
- `FechaLimiteSection` con "13 de febrero" hardcodeado.
- `CenaSection` con hora/texto hardcodeados.
- `camposEspecificos` de Ceremonia/Cena/fecha límite sin UI en el wizard
  (solo editables por API/DB directa).

---

## 9. Checklist de revisión componente por componente

Estado real verificado el 2026-09-21 (revisión completa de los 9 archivos
activos + los 2 hooks compartidos de RSVP). Reemplaza la tabla anterior, que
listaba componentes ya borrados.

| Componente               | Estado | Notas |
|---------------------------|--------|-------|
| `invitation-view.tsx`     | ✅ estructura estable | ver §3 para el orden y condiciones actuales; fondo ya en `COLOR.parchment` + 2 capas de textura (general + mobile-only) |
| `envelope-overlay-angela.tsx` | ✅ funcional | auto-apertura a los 20s si no se toca, click manual con guard anti-doble-trigger (`hasTriggeredRef`), bloquea scroll de fondo mientras está abierto. Muestra nombre+cantidad del **invitado/grupo que entra por el link** (no "Angie y Fran", ver corrección en §4) |
| `music-player-angela.tsx` | ✅ (2026-09-19) | FAB + reproductor propios, re-skinneados con `COLOR`/`TYPO`. Autoplay al cerrar el sobre a volumen 20%, con manejo del bloqueo de autoplay del navegador (cae a botón manual sin romper nada). Verificado en vivo contra la invitación real |
| `hero-section.tsx`        | 🔧 pase de fuentes hecho, colores pendiente | Fecha "SÁBADO 20 FEBRERO 2027" y "21:00 HS" de Cena son fijos a propósito (§1/§4, ya no un TODO). Link de calendario SÍ dinámico (`generarLinkCalendario`, evento de todo el día desde 2026-09-21). Nota menor de code quality: `esBoda` es siempre `true` (`Boolean(...) || true`), la rama `else` del `<h1>` es código muerto sin impacto visible — no urgente |
| `countdown-section.tsx`   | ✅ funcional | 3 estados (`antes`/`hoy`/`despues`) recalculados cada 1s; `despues` usa `estadoFechaLimite` de `fecha-limite-section.tsx` para decidir si sigue siendo "hoy" o ya "despues" (no dobles de medianoche simple) |
| `ceremonia-section.tsx`   | ✅ funcional | fallback a `horaEvento`/`ubicacion`/`direccion` generales si no hay overrides específicos (que hoy no tienen UI de carga, ver §4) |
| `cena-section.tsx`        | ✅ funcional | mismo patrón de fallback que Ceremonia; hora y texto descriptivo 100% fijos |
| `detalles-section.tsx`    | ✅ funcional | acordeón de 4 ítems (Niños/Regalos/Puntualidad/Dresscode) con `aria-expanded`/`aria-controls`. "Niños"/"Puntualidad" con texto fijo (ya no data-driven, ver §4). "Regalos" muestra dos `CuentaCard` (cuenta en pesos: `alias`/`cbu`; cuenta en dólares: `aliasUsd`/`cbuUsd`), cada una con su propio botón "Copiar datos" (copia alias+CBU juntos al portapapeles). Dresscode con 14 swatches hardcodeados (§6.2) |
| `fecha-limite-section.tsx` | ✅ conectado (2026-09-18, spec definitiva) | matriz completa de 3 estados (`antes`/`hoy`/`vencido`) × Argentina UTC-3 fijo (sin depender de la zona horaria del navegador/servidor). Título "13 de febrero" fijo a propósito; el contador de días sí es dinámico. Funciones puras `estadoFechaLimite`/`calcularDiasRestantes`/`haPasadoFechaLimite`/`obtenerFechaLimiteStr` ya exportadas — buenas candidatas a test unitario (ver plan de testing) |
| `rsvp-section.tsx`        | ✅ conectado al back | 3 ramas (genérica/individual/grupo) cruzadas con el estado de fecha límite (matriz de 6 casos, ver plan de testing). Individual: contador 1↔2, autocompleta el titular al sumar plus-one, valida que el acompañante tenga nombre+apellido antes de dejar confirmar. Grupo: checkbox por integrante ya precargado, **sin opción de sumar gente nueva** (removida a propósito el 2026-09-18) — un solo submit exitoso marca **todo el grupo** como confirmado, aunque no se haya tildado a todos; **confirmado con el usuario (2026-09-21) que esto es intencional**: el encargado del grupo es responsable de tildar a todos antes de confirmar |

---

## 10. Estado de datos (actualizado 2026-09-21)

- **Producción (Railway)**: el `template` `boda-angela` y la `invitacion`
  real de Angela **ya existen** (confirmado por el usuario). No se
  verificaron los ids exactos de producción en esta pasada — si hace falta
  cruzar referencias entre local y producción, chequear directo en la DB de
  Railway antes de asumir que coinciden con los ids locales.
- **Local**: `invitacion.id = 22325c7d-caae-490d-baac-29352a12e223`,
  `titulo="Nos casamos"`, `fecha_evento=2027-02-20`, `hora_evento=17:30`,
  lugar Villa Elina — cargada a mano (`pedido_id=null`, no pasó por
  checkout).
- **Invitados/grupos**: **ninguno es real todavía**, ni en local ni en
  producción — todos los que hay cargados hoy (individuales y grupos, en
  cualquier entorno) son datos de prueba. No hace falta ninguna migración
  de invitados de local a producción; cuando esté la lista real de Angela
  se carga directo (hay import por Excel ya construido en el back:
  `invitados/helpers/excel-import.helper.ts`).
- Deploy: frontend en Vercel (`invitaciones-frontend/vercel.json`), backend
  en Railway. Rama actual de trabajo: `boda-personalizada` (no `main`) —
  confirmar en cada dashboard qué rama dispara el deploy antes de mergear,
  si todavía no se hizo.

---

## 11. Auditoría sept 2026 — estado de los hallazgos

Informe completo (30 hallazgos por severidad):
https://claude.ai/artifact/8XdvbccAiDk6hACpGJYYQj — ver también memoria
`project_auditoria_sept_2026` para el detalle de qué descartó el usuario y por
qué. Algunos hallazgos son de todo `backend_invitaciones`/routing general, no
solo de esta template — se listan igual acá porque afectan directamente a
cómo los invitados de Angela llegan a la invitación.

**Arreglados:**
- **C2 (2026-09-21)** — un link inválido (`?invitado=`/`?grupo=` que no
  matchea a nadie, o un UUID inexistente) ya no cae en pantalla en blanco.
  `InvitacionPage.tsx` reemplazó el `navigate('/not-found')` roto (esa ruta
  nunca existió) por `InvitacionNoEncontradaScreen`, con mensaje distinto
  según si el link era personalizado o no.
- **C3 (2026-09-21)** — un grupo ya no puede "confirmar" sin tildar a nadie.
  Validación en `rsvp-section.tsx` (`RsvpGrupo`): si `seleccionados.size===0`
  al apretar el botón, corta antes de llamar a `confirmar()` y muestra
  "Marcá al menos una persona para poder confirmar." **Alcance: solo esta
  template** — `invitation-basic` comparte el mismo hook
  (`useRsvpConfirmacionGrupo`) y tiene el mismo agujero sin parchear, a
  propósito, sin que se haya pedido tocarlo.
- **A2 (2026-09-22)** — el rate limit del backend (100 req/min, `app.module.ts`)
  contaba a todos los invitados como una sola IP detrás del proxy de Railway,
  porque Express no confiaba en `X-Forwarded-For` por defecto. Arreglado en
  `backend_invitaciones/src/main.ts`: `app.set('trust proxy', 1)` +
  `NestExpressApplication`. Verificado en local simulando el header tal cual
  lo entrega Railway (un solo valor, no una cadena) — `req.ip` pasó de ser la
  IP de conexión directa a la IP real simulada.
- **M1 (2026-09-22)** — 7 PNG/JPG sin optimizar pasados a `.webp` (4.6MB →
  426KB, -91%). Ver detalle en §7.
- **B2 (2026-09-22)** — `villa-elina.png` (huérfano) borrado. Ver §7.
- **UUID de producción (2026-09-22)** — `invitationSlugs.ts` ya apunta a
  `39eb3de2-4c79-44b0-8bd1-d51c8960422c` (producción), no al id local. Hecho
  al pedir el commit+push a `main` para el deploy. Ver
  `project_template_boda_angela` (memoria) por el detalle y el efecto
  secundario en local (`/angieyfran` ya no resuelve ahí, es esperado).

**Pendientes (por orden de cuándo se tocaron en la auditoría):**
- **A1** — el usuario se encarga a mano de que toda invitación tenga
  contraseña de asistentes segura; no requiere cambio de código.
- **A4/A5** — descartados por el usuario, ver memoria (la fecha límite se
  carga una sola vez y no server-side por decisión de negocio, no por
  descuido).
- **A6** — no hay forma de enterarse si el sistema cae (sin health check, sin
  error tracking, sin logging estructurado). Propuestas comparadas en el
  informe; no implementado, a la espera de que el usuario elija.
- **Sistema de slug "lindo"** (`config/invitationSlugs.ts`, revisado
  2026-09-22, no estaba en el informe original): confirmado que `/uuid` y
  `/slug` funcionan igual, y que el panel de asistentes copia con el slug
  solo para esta invitación. Dos gaps nuevos detectados, sin arreglar
  todavía: (1) un espacio u otro carácter de más al copiar el link rompe el
  match de ruta — a diferencia del slug de invitado individual, este no pasa
  por ningún `toSlug()`/normalización, aunque sí tolera mayúsculas; (2) si un
  slug futuro coincidiera con una ruta reservada (`crear`, `admin`, etc.) ese
  link quedaría atrapado sin aviso, no hay validación que lo prevenga.
- **Medios restantes (M2-M8) y limpieza restante (B1, B3-B14)** del informe —
  todavía no revisados uno por uno con el usuario.
