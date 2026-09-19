import type { CSSProperties } from 'react'

/**
 * Sistema de estilos de la template privada `boda-angela`.
 *
 * Única fuente de verdad para tipografías y colores: sale de las guías de Figma
 * ("Tipografías" y "Colores"). **No usar fuentes ni colores por fuera de acá.**
 *
 * Las fuentes las sirve el kit de Adobe Fonts `ulv5nzn`, ya incluido en
 * `invitaciones-frontend/index.html`:
 *   <link rel="stylesheet" href="https://use.typekit.net/ulv5nzn.css" />
 * (kit verificado el 2026-09-09: expone las 5 familias de abajo, incluida
 * `garamond-premier-pro-display`. `montserrat` solo viene en 300 y 400.)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Colores — guía "Colores"
// ─────────────────────────────────────────────────────────────────────────────

export const COLOR = {
  /** Parchment · fondo */
  parchment: '#F4F2F0',
  /** Negro · letras cursivas y animaciones */
  negro: '#0D0D0D',
  /** Dark Brown · timer y textos */
  darkBrown: '#3B332B',
  /** Brown · textos y números */
  brown: '#67594C',
  /** Crema · botones */
  crema: '#D4CCC4',
} as const

export type ColorName = keyof typeof COLOR

// ─────────────────────────────────────────────────────────────────────────────
// Familias tipográficas — kit `ulv5nzn`
// ─────────────────────────────────────────────────────────────────────────────

export const FONT = {
  /** absolute-beauty 700 — H1, nombres y títulos en cursiva */
  script: '"absolute-beauty", sans-serif',
  /** cormorant-garamond 500 — H2, details-h */
  serif: '"cormorant-garamond", serif',
  /** montserrat 300/400 — H3, H4, Text, Text2, Text3 */
  sans: 'montserrat, sans-serif',
  /** garamond-premier-pro 400 — Timer, Horarios */
  garamond: '"garamond-premier-pro", serif',
  /** garamond-premier-pro-display 400 — número grande (ej. 142) */
  garamondDisplay: '"garamond-premier-pro-display", serif',
} as const

export type FontName = keyof typeof FONT

// ─────────────────────────────────────────────────────────────────────────────
// Presets de texto — guía "Tipografías"
// ─────────────────────────────────────────────────────────────────────────────
//
// Los `fontSize` / `lineHeight` son los valores de la guía en px. En Figma el
// tamaño puede variar según la sección: si hace falta, sobreescribí solo el
// tamaño al aplicar el preset, dejando familia / peso / tracking / transform.
//
//   <h2 style={{ ...TYPO.h2, color: COLOR.brown, fontSize: 22 }}>…</h2>
//
// `letterSpacing` va en `em` = el porcentaje de Figma (30% → 0.3em).
// `lineHeight: 'normal'` representa el "auto" de Figma.

export type TypoName =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'text'
  | 'text2'
  | 'text3'
  | 'timer'
  | 'detailsH'
  | 'horarios'
  | 'numero'

export const TYPO: Record<TypoName, CSSProperties> = {
  /** H1 — absolute-beauty 700 · 90 / 54 */
  h1: {
    fontFamily: FONT.script,
    fontWeight: 700,
    fontSize: 90,
    lineHeight: '54px',
  },
  /** H2 — cormorant-garamond 500 · 22 / auto · tracking 30% · UPPERCASE */
  h2: {
    fontFamily: FONT.serif,
    fontWeight: 500,
    fontSize: 28,
    lineHeight: 'normal',
    letterSpacing: '0.3em',
    textTransform: 'uppercase',
  },
  /** H3 — montserrat 400 · 10 / 21 · tracking 20% · UPPERCASE */
  h3: {
    fontFamily: FONT.sans,
    fontWeight: 400,
    fontSize: 16,
    lineHeight: '21px',
    letterSpacing: '0.2em',
    textTransform: 'uppercase',
  },
  /** H4 — montserrat 300 · 12 / 28 · tracking 8% · UPPERCASE */
  h4: {
    fontFamily: FONT.sans,
    fontWeight: 300,
    fontSize: 15,
    lineHeight: '28px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  /** Text — montserrat 400 · 12 / 23 */
  text: {
    fontFamily: FONT.sans,
    fontWeight: 400,
    fontSize: 14,
    lineHeight: '23px',
  },
  /** Text2 — montserrat 400 · 12 / 28 · tracking 10% · UPPERCASE */
  text2: {
    fontFamily: FONT.sans,
    fontWeight: 300,
    fontSize: 16,
    lineHeight: '28px',
  },
  /** Text3 — montserrat 400 · 12 / 21 · tracking 8% · UPPERCASE */
  text3: {
    fontFamily: FONT.sans,
    fontWeight: 400,
    fontSize: 12,
    lineHeight: '21px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  /** Timer — garamond-premier-pro 400 · 30 / auto */
  timer: {
    fontFamily: FONT.garamond,
    fontWeight: 400,
    fontSize: 30,
    lineHeight: 'normal',
  },
  /** details-h — cormorant-garamond 500 · 14 / auto · tracking 15% · UPPERCASE */
  detailsH: {
    fontFamily: FONT.serif,
    fontWeight: 500,
    fontSize: 24,
    lineHeight: 'normal',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
  },
  /** Horarios — garamond-premier-pro 400 · 30 / auto · tracking 10% */
  horarios: {
    fontFamily: FONT.garamond,
    fontWeight: 400,
    fontSize: 30,
    lineHeight: 'normal',
    letterSpacing: '0.1em',
  },
  /** Número grande — garamond-premier-pro-display 400 · 136 */
  numero: {
    fontFamily: FONT.garamondDisplay,
    fontWeight: 400,
    fontSize: 136,
    lineHeight: 'normal',
  },
}
