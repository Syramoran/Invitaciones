export interface ColorPalette {
  primary: string
  accent: string
  label: string
}

export const PALETTES: ColorPalette[] = [
  { primary: '#DA8F0B', accent: '#F7A921', label: 'Naranja'  },
  { primary: '#CB4D4D', accent: '#F5ADA3', label: 'Rojo'     },
  { primary: '#849B4B', accent: '#C4D98D', label: 'Verde'    },
  { primary: '#4D99B2', accent: '#8DCCD9', label: 'Azul'     },
  { primary: '#7A5EBA', accent: '#D3C0E7', label: 'Violeta'  },
  { primary: '#D775B6', accent: '#E7C0DA', label: 'Rosa'     },
]

/** Devuelve el color de acento que corresponde al primario dado.
 *  Si el primario no está en la tabla, usa la primera paleta como fallback. */
export function getAccentColor(primary: string | null | undefined): string {
  if (!primary) return PALETTES[0].accent
  const found = PALETTES.find(
    (p) => p.primary.toLowerCase() === primary.toLowerCase()
  )
  return found?.accent ?? PALETTES[0].accent
}
