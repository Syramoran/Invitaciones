# Template `boda-angela` — Notas de construcción

> Doc de trabajo. Vamos anotando acá las decisiones clave, el estado de cada
> componente y lo que queda pendiente mientras revisamos la template de a poco.
> Última actualización: 2026-09-19.

---

## 1. Qué es esta template

- Invitación **privada, a medida, para una sola clienta** ("Angie y Fran",
  boda). Diseño de origen: Figma **"Wedding angela"**.
- **No aparece en el catálogo público** del wizard: usa el flag
  `Template.publico = false` (backend). Solo se asigna manualmente desde el admin.
- Registro en DB local (según memoria del proyecto, verificar en la DB actual):
  `id = 14`, `slug = boda-angela`, `publico = false`, `tipo_evento_id = 1` (Boda).
- Carpeta de componentes: `invitaciones-frontend/src/components/invitations/boda-angela/`
- Assets estáticos: `invitaciones-frontend/public/boda-angela/`
- **Todo el código de esta template está sin commitear todavía** (la carpeta
  entera figura como `??` en `git status`). No hay historial git de estos
  archivos: este doc es la única memoria de los cambios hasta que se commitee.

---

## 2. Cómo se cablea en la app

- **Registro por convención de carpeta** — `components/invitations/registry.ts`
  hace `import.meta.glob('./**/invitation-view.tsx')`. El nombre de la carpeta
  (`boda-angela`) tiene que coincidir con el `slug` de la template en la DB.
  No hay que registrar nada a mano.
- **Render público** — `pages/public/InvitacionPage.tsx` resuelve
  `getInvitationComponent(invitacion.template.slug)` y monta
  `<InvitationView invitacion=... invitadoParam=... />` dentro de un `<Suspense>`.
- **Preview en el wizard admin** —
  `components/admin/crear-invitacion/WizardLivePreview.tsx` monta
  `<InvitationView invitacion=... previewMode />`.
  Con `previewMode` el sobre de bienvenida (`EnvelopeOverlayAngela`) **no** se
  muestra (`showOverlay = !previewMode`).
- **Punto de entrada único**: `invitation-view.tsx` → `InvitationView`. Todo lo
  demás cuelga de ahí.

---

## 3. Estructura de secciones (orden real en `invitation-view.tsx`)

Contenedor: `div.min-h-screen` con `background-image: /boda-angela/textura-inv.jpg`
(`cover / top center / no-repeat`) sobre `bg-white`.
Marco interno: `mx-auto max-w-[430px] sm:max-w-[900px] overflow-hidden`.

| #  | Componente              | Archivo                        | Condición para mostrarse |
|----|-------------------------|--------------------------------|--------------------------|
| 0  | `EnvelopeOverlayAngela` | `envelope-overlay-angela.tsx`  | `!previewMode` (sobre de bienvenida, `position: fixed`) |
| 0b | `MusicPlayerAngela`     | `music-player-angela.tsx`      | `invitacion.musica && !showOverlay` |
| 1  | `HeroSection`           | `hero-section.tsx`             | siempre |
| 2  | `CountdownSection`      | `countdown-section.tsx`        | si hay servicio con nombre que incluye "cuenta regresiva" o "countdown" |
| 3  | `EventInfoSection`      | `event-info-section.tsx`       | siempre |
| 4  | `Divisor` + `LocationsSection` | `locations-section.tsx` | siempre (secciones internas condicionadas por campos) |
| 5  | `MapSection`            | `map-section.tsx`              | `ubicacion !== "multiple"` (devuelve `null` si es múltiple) |
| 6  | `Divisor` + `NoteSection` | `note-section.tsx`           | si `soloAdultos` o `reglaPuntualidad` (devuelve `null` si ninguno) |
| 7  | `Divisor` + `DresscodeSection` | `dresscode-section.tsx` | siempre — **100% hardcodeado, sin props** |
| 8  | `Divisor` + `GiftSection` | `gift-section.tsx`           | siempre (bloque de alias/CBU condicionado) |
| 9  | `Divisor` + `CountdownSection` (2º uso) | `countdown-section.tsx` | si `camposEspecificos.fechaLimiteConfirmacion` — countdown al cierre de confirmaciones, `label="Faltan"` |
| 10 | `Divisor` + `RsvpSection` | `rsvp-section.tsx`           | `invitacion.tieneConfirmacion` (y adentro: `mostrarBoton && invitadoParam`) |
| 11 | `footer`                | inline en `invitation-view`   | siempre ("Hecho con festeja.com.ar") |

`Divisor()` = `<div class="h-px w-[90%] sm:w-[75%] bg-[#6b5a50]">` (definido inline
en `invitation-view.tsx`, **no** usa los SVG `divisor*.svg`).

`CountdownSection` es **reutilizable**: se usa una vez para la cuenta regresiva
del evento (paso 2) y otra para el límite de confirmación (paso 9), con distinto
`fechaObjetivo` / `label`.

---

## 4. Modelo de datos: qué campos consume cada componente

El tipo `CamposEspecificosBoda` (en `types/invitation.ts`) hoy solo declara:
`novio1`, `novio2`, `tipoCeremonia?`, `dressCode?`, `notas?`.

Pero los componentes leen **muchos más campos** de `camposEspecificos` con casts
locales ad-hoc. Falta unificar esto en un tipo `CamposEspecificosBodaAngela`:

| Campo (`camposEspecificos.*`)   | Lo lee                    | Uso |
|---------------------------------|---------------------------|-----|
| `novio1`, `novio2`              | `invitation-view`, `hero`, `envelope-overlay` | nombres de la pareja / título del overlay |
| `fechaLimiteConfirmacion`       | `invitation-view`         | dispara el 2º countdown |
| `nombreLugar`                   | `locations-section`       | nombre del salón (fallback: `ubicacion`) |
| `fotoLugar`                     | `locations-section`       | foto del salón (fallback: `/boda-angela/villa-elina.png`) |
| `horaCivil`                     | `locations-section`       | muestra bloque "Civil" |
| `notaCelebracion`               | `locations-section`       | muestra bloque "Celebración" |
| `soloAdultos`                   | `note-section`            | string; se oculta solo si `=== "false"` |
| `reglaPuntualidad`              | `note-section`            | string; se oculta solo si `=== "false"` |
| `alias`                         | `gift-section`            | alias bancario |
| `cbu` / `cvu`                   | `gift-section`            | CBU/CVU (toma `cbu`, si no `cvu`) |

Campos de `InvitacionPublica` (nivel raíz) que se usan: `titulo`, `fechaEvento`,
`horaEvento`, `ubicacion`, `direccion`, `latitud`, `longitud`, `servicios`,
`fotosAnfitrion`, `musica`, `tieneConfirmacion`, `mostrarBotonConfirmar`,
`saludoPersonalizado` (se destructura en `hero` pero **no se usa**).

**Ojo:** el `HeroSection` muestra la fecha **hardcodeada** ("SÁBADO 20 FEBRERO
2027"), no `invitacion.fechaEvento`. `EventInfoSection` sí usa la fecha real
(`formatDiaMes(fechaEvento)`). Hay que decidir si el hero se cablea a data o si
queda fijo para esta clienta.

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
  `garamond-premier-pro-display` (400). O sea: **no falta importar nada en
  Adobe**, `garamond-premier-pro-display` ya estaba en el kit, solo no se usaba
  en el código.
- `montserrat` también venía por Google Fonts (algunos componentes usan
  `"Montserrat, sans-serif"` con mayúscula). Para esta template usar siempre la
  del kit vía `FONT.sans` (`montserrat, sans-serif`, minúscula).

### 5.3 Fuente de verdad: `theme.ts`

`invitaciones-frontend/src/components/invitations/boda-angela/theme.ts` centraliza
tipografías y colores de esta template. **No usar fuentes ni colores fuera de acá.**

- `FONT` — las 5 familias (`script`, `serif`, `sans`, `garamond`, `garamondDisplay`).
- `TYPO` — presets por estilo de la guía (`h1`, `h2`, `h3`, `h4`, `text`, `text2`,
  `text3`, `timer`, `detailsH`, `horarios`, `numero`) como `CSSProperties`
  (familia + peso + `fontSize` px de la guía + `lineHeight` + `letterSpacing` en
  `em` = % de Figma + `textTransform`). El `fontSize` se puede sobreescribir por
  sección si el frame de Figma difiere.
- `COLOR` — los 5 colores de la guía (ver sección 6).

Uso: `style={{ ...TYPO.h2, color: COLOR.brown }}`.

### 5.4 Gaps / a resolver con la guía

- **`hanken-grotesk`** — está en el kit y se usa en `dresscode-section` y
  `rsvp-section` (labels), pero **no figura en la guía**. Por la regla "solo las
  fuentes de la guía" → reemplazar por `FONT.sans` (Montserrat) en el pase
  componente por componente.
- **Pesos fuera del kit** — el kit trae Montserrat solo 300/400, pero hay
  componentes que usan `fontWeight: 500`/`600` o `font-semibold` sobre Montserrat
  (ej. botón del hero, `rsvp` estado success) → el browser lo simula (faux bold).
  La guía solo usa 300/400: bajar esos pesos.
- Fallback de `absolute-beauty`: la guía escribe `sans-serif`; `theme.ts` ya usa
  `sans-serif`. Falta migrar los componentes que aún ponen `cursive`.
- Mapa estilo-de-guía → componente: se arma en la sección 9 a medida que se
  revisa cada sección.

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

### 6.1 Colores en el código que NO están en la paleta (a eliminar en el pase)

| Hex en el código        | Dónde / uso actual            | Reemplazo por |
|-------------------------|-------------------------------|---------------|
| `#262626`               | nombres, botones (texto)      | `negro` (cursivas) o `darkBrown` (texto) según el caso |
| `#574b42`               | texto secundario dresscode    | `brown` |
| `#6b5a50`               | color de los `Divisor`        | `brown` (o `darkBrown`) |
| `#c9c0b8` / `#eee9e4`    | hover de botones              | `crema` con `opacity`/filtro |
| `#e9e5e2` / `#e0d8cc`    | placeholders / skeleton       | `parchment` / `crema` |
| `#9a8f82`               | texto tenue, placeholders     | `brown` |
| `#777` / `#555`         | footer                        | `brown` / `darkBrown` |
| `rgba(59,51,43,0.55)`   | dim del overlay               | `darkBrown` con alpha |
| `#e4e4e4`               | fondo del `iframe` del mapa   | `parchment` / `crema` |

También: `invitation-view` setea `--invitation-primary` / `--invitation-accent`
a `#67594c` (= `brown`). El fondo del contenedor es `bg-white` → debería ser
`parchment`.

### 6.2 Swatches del dresscode

Hardcodeados en `dresscode-section.tsx` — son colores de vestimenta sugerida, no
son de la paleta de marca. Quedan como están (los define el diseño de esa
sección), pero revisar contra el Figma cuando toquemos ese componente:
- Mujeres: `#bf7340 #6b2e2e #5e3b1a #5f743e #abc76b #39acac #5398c6 #223677`
- Hombres: `#2a365c #58422d #000000`

---

## 7. Assets (`public/boda-angela/`)

### Usados por componentes
| Archivo                     | Peso    | Dónde |
|-----------------------------|---------|-------|
| `s-t-d/std_mobile.png`      | 349 KB  | foto de la pareja en **mobile** (`hero`) — 695×744, polaroid con marco+sombra integrados, fondo transparente |
| `s-t-d/std_web.png`         | 446 KB  | foto de la pareja en **desktop** (`hero`) — 764×816, ídem |
| `s-t-d/Std-bg-mobile.jpg`   | 584 KB  | fondo hero **mobile** — 645×1296, textura de papel lisa. Vía `background-image` full-bleed en la `<section>` |
| `s-t-d/std-bg.png`          | **2.2 MB** ⚠️ | fondo hero **desktop** — 1038×1548, hoja de papel con borde rasgado. Vía `<img>` absoluto `w-full h-auto` + `opacity .63` + `mix-blend luminosity` (specs Figma, ancho 674px) |
| `textura-inv.jpg`           | **3.0 MB** ⚠️  | fondo global en `invitation-view` |
| `villa-elina.png`           | 391 KB  | fallback foto del salón (`locations-section`) |
| `icon-civil.svg`            | 3.7 KB  | bloque Civil (`locations-section`) |
| `icon-celebracion.svg`      | 3.4 KB  | bloque Celebración (`locations-section`) |
| `icon-heart.svg`            | 1.5 KB  | cierre de `gift-section` |
| `vector-date.svg`           | 858 B   | ícono del botón "Agendar" en `hero-section` |

La **foto** de la pareja usa `<picture>` + `<source media="(min-width:640px)">`
→ el browser baja solo la del breakpoint activo. El **fondo** es distinto por
breakpoint: mobile `background-image` en la `<section>`, desktop `<img>` aparte
(ver §8).

### En la carpeta pero **sin usar**
| Archivo | Nota |
|---------|------|
| `fondo-hero.png` (**10 MB**) | era el fondo viejo del hero; **reemplazado** por `s-t-d/std-bg*`. Borrar cuando se confirme. |
| `foto-novios.png` | placeholder viejo de la pareja; el hero ahora usa `s-t-d/std_*`. Borrar. |
| `Save the date.svg` | el hero escribe "Save the date" como `<p>` en `absolute-beauty`, no usa este SVG |
| `divisor.svg`, `divisor-sm-1..4.svg` | `Divisor()` es un `<div>` CSS |
| `foto-frame.svg`, `foto-mask.svg` | la foto ya trae el marco integrado |

⚠️ **Peso de imágenes**: `s-t-d/std-bg.png` (2.2 MB, solo desktop) y
`textura-inv.jpg` (3 MB) siguen pesados para mobile. Optimizar / pasar a `.webp`
antes de publicar. `fondo-hero.png` (10 MB) queda para borrar.

---

## 8. Puntos abiertos / TODOs

- [ ] **Fondo/textura**: según memoria del proyecto quedó revertido a blanco y
      hubo varias vueltas sin poder verificar visualmente. Hoy el código sí
      aplica `textura-inv.jpg` como `background-image` en `invitation-view`.
      Confirmar en el navegador real de la usuaria cómo se ve (el screenshot del
      preview pane de Claude no es confiable en este repo).
- [x] **Hero — fondo + fotos responsive** (2026-09-09):
      - Foto de la pareja: `<picture>` + `(min-width:640px)` — mobile
        `std_mobile.png`, desktop `std_web.png`. Contenedor `w-[350px] max-w-full`.
        Se dejó de usar `fotosAnfitrion` (foto estática de la clienta).
      - **Estructura final (2026-09-09)** — se simplificó (se descartó el
        overlay absoluto y el debate de `max-w`):
        - `invitation-view`: div externo full-width + textura de página
          (`<img textura-inv>` `opacity .8` + `mixBlendMode: multiply` sobre
          `bg-[#F4F2F0]`, edición de la usuaria). Adentro, **columna de
          contenido** `mx-auto w-[80%] max-w-[450px]` — la usan todas las
          secciones.
        - `hero-section` `<section>`: `mx-auto mt-4 w-[80%]` (del ancho de la
          columna), `flex flex-col items-center justify-center` (contenido en
          flujo normal), `aspect-[645/1296]` mobile · `sm:aspect-[1038/1548]`
          desktop → el alto sale del ratio de la imagen.
        - Fondo std al 100% del ancho de la sección: mobile por `background-image`
          (`bg-cover bg-center`); desktop `std-bg.png` como `<img>`
          `absolute inset-0 -z-10 object-cover` + `opacity .63` +
          `mixBlendMode: 'luminosity'`; `sm:bg-none` en la sección.
      - `eslint` + `vite build` OK. **Pendiente de verificación visual.**
- [ ] **Hero / columna — a verificar con la usuaria**:
      - El contenido fluye normal: si no entra en la caja del `aspect-ratio`, la
        empuja más alto que la imagen. Ajustar tamaños/espaciado contra Figma.
      - `mix-blend luminosity`: el hero está dentro de `div.relative.z-10` de
        `invitation-view` (stacking context) → el blend puede no llegar a la
        textura de página. Si no se ve → ajuste en `invitation-view`.
      - La columna `w-[80%] max-w-[450px]` ahora aplica a **todas** las secciones
        (countdown, locations, map, dresscode…), que todavía no se revisaron a
        ese ancho.
- [ ] **Hero**: fecha hardcodeada ("SÁBADO 20 FEBRERO 2027") y botón "Agendar en
      calendario" **sin `onClick`** (el de `EventInfoSection` sí funciona).
      Decidir: cablear a data o quitar el duplicado. (No tocado — pendiente el
      pase de fuentes/contenido.)
- [ ] **DresscodeSection**: 100% hardcodeada (textos, colores, aclaración). Al
      ser template de 1 clienta puede estar OK, pero dejar constancia de que no
      sale de la data.
- [ ] **Tipos**: crear `CamposEspecificosBodaAngela` y sacar los casts locales
      (`CamposAngela`, `CamposNota`, `CamposGift`, `CamposGift.cvu`, etc.).
- [x] **`theme.ts`** creado — `FONT` / `TYPO` / `COLOR` como fuente de verdad
      (2026-09-09). `garamond-premier-pro-display` confirmada en el kit `ulv5nzn`.
- [ ] **Pase de fuentes** (componente por componente): reemplazar `hanken-grotesk`
      por `FONT.sans`; bajar pesos de Montserrat 500/600 a 300/400; cambiar
      fallback `cursive` → `sans-serif`; migrar los `style={{ fontFamily: … }}`
      inline a `FONT` / `TYPO`.
      - [x] `hero-section.tsx` (2026-09-09) — todo vía `theme.ts`. "Save the date"
        y nombres → `TYPO.h1` (STD bajó de 128px→96px, la de la guía);
        "Nos casamos" → `TYPO.h2` (28px, sin cambio); SÁBADO/FEBRERO → `FONT.serif`;
        "20"/"2027" → `FONT.garamond` peso 400 (antes 300, cara inexistente en el
        kit), se dejó el `tracking-[0.2em]` del 2027; botón → `FONT.sans` peso 400.
        Tamaños de "20" (64px) y "2027" (32px) se dejaron como estaban (la guía no
        fija tamaño para esos números).
- [ ] **Pase de colores** (componente por componente): reemplazar todos los hex
      sueltos por `COLOR.*` según la tabla 6.1; fondo del contenedor a `parchment`.
- [ ] **Imágenes**: borrar `fondo-hero.png` / `foto-novios.png` (ya sin uso);
      optimizar `s-t-d/std-bg.png` (2.2 MB) y `textura-inv.jpg` (3 MB) → `.webp`.
- [ ] **`tsc --noEmit`**: queda **1** error en la template (no rompe `vite build`
      porque el build no corre `tsc`): `locations-section.tsx` — cast
      `Record<string, unknown> → CamposAngela` inválido (lo resuelve el tipo
      `CamposEspecificosBodaAngela`). Los 2 de `hero-section.tsx` (`invitadoParam`
      / `saludoPersonalizado` sin usar) se corrigieron en el pase de imágenes.
- [ ] **Commit**: quedan cambios del último pase de RSVP (autocompletar
      titular del plus-one) sin commitear — 3 archivos de back, 10 de front y
      `shared/apiError.ts` nuevo.
- [x] Verificar en la DB actual que `id/slug/publico/tipo_evento_id` sigan como
      dice la sección 1 (2026-09-19, ver §10 — **confirmado en local**, pero
      **no existe todavía en producción**).

---

## 9. Checklist de revisión componente por componente

Vamos completando `Estado` y `Notas` a medida que revisamos cada uno contra el
Figma.

| Componente               | Estado | Notas |
|--------------------------|--------|-------|
| `invitation-view.tsx`    | ⏳ por revisar | orden de secciones, fondo, marco, divisores |
| `envelope-overlay-angela.tsx` | ⏳ | tipografías del overlay, animación, "y" en nombres |
| `music-player-angela.tsx` | ✅ (2026-09-19) | FAB + reproductor propios (antes usaba el `MusicPlayer` genérico de `invitation-basic`, con colores/fuente ajenos a la template). Reusa la misma lógica (autoplay al abrir el sobre, loop, seek, skip ±10s) pero re-skinneado 100% con `COLOR`/`TYPO` de `theme.ts`: FAB y chip ícono en `crema`/`darkBrown` (mismo tono que "Agendar en calendario"), panel en `parchment` con borde `brown` al 20% de opacidad, botón play/pausa invertido (`darkBrown` sobre `parchment`), barras de progreso/volumen `darkBrown` sobre track `crema`, label "MÚSICA" con `TYPO.text3`. Volumen inicial 20% (`audio.volume = 0.2`), el slider deja subirlo. Verificado en vivo contra la invitación real de Angela (tiene música cargada): autoplay a 20% al abrir el sobre, pausa, subida de volumen a 75% y apertura/cierre del panel confirmados por estado real del `<audio>` + estilos computados, y por screenshot en viewport mobile. |
| `hero-section.tsx`       | 🔧 en progreso | ✅ imágenes responsive (`<picture>`) · ✅ fuentes vía `theme.ts` (`TYPO.h1/h2`, `FONT.serif/garamond/sans`) · ⏳ falta: colores → `COLOR`, fecha dinámica, botón "Agendar" sin acción, `<p>Save the date</p>` vs SVG, ajustes de fondo (ver TODO Hero) |
| `countdown-section.tsx`  | ⏳ | estilo de cajas, tipografía Timer, doble uso |
| `event-info-section.tsx` | ⏳ | usa data real, link de calendario OK |
| `locations-section.tsx`  | ⏳ | 3 bloques condicionales, íconos, fallback de foto |
| `map-section.tsx`        | ⏳ | iframe de Google Maps, botón copiar dirección |
| `note-section.tsx`       | ⏳ | lógica `!== "false"`, textos fijos |
| `dresscode-section.tsx`  | ⏳ | todo hardcodeado, swatches, `hanken-grotesk` |
| `gift-section.tsx`       | ⏳ | alias/CBU/CVU, ícono corazón |
| `rsvp-section.tsx`       | ✅ conectado al back (2026-09-15) | Segundo pase el mismo día: se conectó de verdad. Tres ramas dentro de `RsvpSection` (`invitacion.tieneConfirmacion` primero — si es `false`, `return null`): (1) sin `?invitado=`/`?grupo=` válido (`!invitacion.mostrarBotonConfirmar`) → solo "¡Te esperamos!"; (2) `invitado` individual → `RsvpIndividual` usa el hook compartido `useRsvpConfirmacion` (mismo que `invitation-basic`) — si `puedeAgregarPlusOne` es `false` la decisión del usuario fue mostrar **solo título + restricción alimentaria + botón** (sin contador ni subtítulo); si es `true`, el contador (1/2) alterna `agregarPlusOne` del hook y a los 2 aparecen dos inputs separados **Nombre/Apellido** (no "Nombre y apellido" combinado como en el mock — el DTO real `ConfirmarAsistenciaDto.plusOne` pide los campos separados); (3) `invitacion.grupo` → `RsvpGrupo` usa el hook nuevo `useRsvpConfirmacionGrupo` (extraído de `GrupoRsvpSection`, ver `shared/`) — checkbox por integrante ya precargado (no editable, el back no permite corregirle el nombre desde este endpoint) + mini-form "Nombre/Apellido + Agregar" para sumar gente nueva hasta `maxIntegrantesEfectivo`. Botón "Confirmar asistencia" ahora sí llama al back de verdad (`confirmar()` de cada hook), con estados loading/success/error (`EstadoError` compartido entre las dos ramas). Estilos: se conservaron los ajustes visuales que el usuario había hecho a mano en paralelo mientras yo investigaba el backend (labels en `TYPO.text2`, inputs `bg-[#E9E5E2] shadow-sm rounded-sm`, textarea `rounded-xl`, número del contador `fontSize:90` `COLOR.brown`, botón `rounded-sm cursor-pointer`) y el `<h1>Angie y Fran</h1>` que agregó al final de la sección — "dejalo así por ahora", pendiente de que decida si lo mueve/saca. Probado en vivo contra el back local: invitado sin plus-one ya confirmado (`syra-moran`), invitado con plus-one habilitado por PATCH temporal (`agostina-chiapino`, revertido después), y un grupo de prueba creado/borrado por API (`familia-test-claude` / `familia-test-visual`, con integrantes precargados + suma de nuevos hasta el tope) — sin dejar residuos en la DB.

**Actualización (mismo día, 3er pedido):** cuando el invitado con plus-one habilitado suma una persona (contador a 2), "Invitado 1" ahora se autocompleta con el nombre/apellido real del titular (inputs `disabled`, `INPUT_DISABLED_CLASS`) y debajo aparecen los campos editables de "Invitado 2" (el acompañante). Esto requirió exponer el nombre/apellido del titular en el back, porque **no se puede derivar de forma confiable desde el slug** (`toSlug` convierte espacios Y el separador nombre-apellido al mismo `-`, así que un nombre u apellido compuesto — común en español — vuelve el slug ambiguo para partirlo de nuevo). Cambios de back: `InvitacionPublicDto.invitadoNombre/invitadoApellido` (nuevos, opcionales) en `invitacion.dto.ts`, poblados en `invitacion.mapper.ts` desde `invitadoEncontrado.nombre/apellido` (o solo el nombre, derivado del slug, si el invitado todavía no está precargado — el apellido queda `null` en ese caso). Reflejado en `types/invitation.ts` del frontend. **Ojo**: el backend corre acá como build compilado (`node dist/src/main`, no `nest start --watch`) — hace falta `npm run build` + reiniciar el proceso a mano después de tocar código del back, no alcanza con guardar el archivo. |

---

## 10. Estado de producción (verificado 2026-09-19)

Chequeado directo contra la DB de Railway (solo lectura):

- **`template` `boda-angela`: no existe en producción.** En local es `id=14,
  slug=boda-angela, publico=false, tipo_evento_id=1, nombre="Boda Angela",
  activo=true` — hay que crearlo igual en prod.
- **La `invitacion` de Angela tampoco existe en producción.** En local:
  `id=22325c7d-caae-490d-baac-29352a12e223`, `titulo="Nos casamos"`,
  `fecha_evento=2027-02-20`, `activa=true`, `estado_pago=PENDIENTE`,
  `pedido_id=null` (no está atada a ninguna orden — se cargó a mano). Definir
  antes de migrar si en prod va como `PENDIENTE` o se marca `PAGADO`.
- **Los `invitado`/`grupo` cargados hoy bajo esa invitación en local son de
  prueba, no la lista real de Angela**: "Syra Moran" / "Daniel Moran" (grupo
  "Flia Moran"), "Agostina Chiapino" + su plus-one "Thiago Totaro", y una
  "Familia Romanoli" vacía. **No migrar esta data tal cual** — reemplazar por
  la lista real de invitados de Angela cuando la tengamos (hay import por
  Excel ya construido en el back: `invitados/helpers/excel-import.helper.ts`).
- Deploy: frontend en Vercel (`invitaciones-frontend/vercel.json`), backend en
  Railway. No hay config de rama en el repo — confirmar en cada dashboard qué
  rama dispara el deploy antes de mergear (estamos parados en
  `boda-personalizada`, no en `main`).
