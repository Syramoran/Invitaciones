// ─── Paleta de colores disponibles ───────────────────────────────────────────

export const PALETAS_BODA_CLASICA = [
  { hex: '#444444', label: 'Gris Oscuro' },
  { hex: '#894F8E', label: 'Violeta' },
  { hex: '#B14B8F', label: 'Fucsia' },
  { hex: '#DC83AA', label: 'Rosa' },
  { hex: '#D16A32', label: 'Naranja' },
  { hex: '#BD9848', label: 'Dorado' },
  { hex: '#65795A', label: 'Verde Claro' },
  { hex: '#2A63A8', label: 'Azul' },
  { hex: '#7B1E27', label: 'Bordó' },
] as const

export const PALETAS_BODA_MODERNA = [
  { hex: '#4E1319', label: 'Bordó Oscuro' },
  { hex: '#1A314D', label: 'Azul Noche' },
  { hex: '#304026', label: 'Verde Bosque' },
  { hex: '#84395A', label: 'Ciruela' },
  { hex: '#7E3D1B', label: 'Óxido' },
  { hex: '#262626', label: 'Negro' },
  { hex: '#4F2E52', label: 'Berenjena' },
] as const

export const PALETAS_BODA_RUSTICA = [
  { hex: '#465E38', label: 'Verde Oliva' },
  { hex: '#5F3762', label: 'Berenjena Claro' },
  { hex: '#4E1319', label: 'Bordó' },
  { hex: '#A2466E', label: 'Frambuesa' },
  { hex: '#AC6239', label: 'Teja' },
  { hex: '#74633F', label: 'Ocre' },
  { hex: '#203D60', label: 'Azul Acero' },
] as const

export const PALETAS_QUINCE = [
  { hex: '#DC83AA', label: 'Rosa' },
  { hex: '#894F8E', label: 'Violeta' },
  { hex: '#BD9848', label: 'Dorado' },
  { hex: '#2A63A8', label: 'Azul' },
  { hex: '#65795A', label: 'Verde' },
  { hex: '#CC6933', label: 'Naranja' },
] as const

export const PALETAS_CUMPLE_ELEGANTE = [
  { hex: '#F1F1F1', label: 'Gris Perla' },
  { hex: '#EDE2D4', label: 'Beige Dorado' },
  { hex: '#DAE4F1', label: 'Azul Hielo' },
  { hex: '#E2DAF1', label: 'Lila' },
  { hex: '#F4E1E1', label: 'Rosa Pálido' },
] as const

export const PALETAS_CUMPLE_FESTIVO = [
  { hex: '#B5B5B5', label: 'Gris' },
  { hex: '#FFA366', label: 'Naranja Claro' },
  { hex: '#EDC25E', label: 'Amarillo' },
  { hex: '#C2D65C', label: 'Lima' },
  { hex: '#5C99D6', label: 'Celeste' },
  { hex: '#A285E0', label: 'Lila Claro' },
  { hex: '#E599BF', label: 'Rosa Chicle' },
  { hex: '#FB6A6C', label: 'Salmón' },
] as const

export const PALETAS_CUMPLE_INFANTIL = [
  { hex: '#DA8F0B', label: 'Naranja' },
  { hex: '#CB4D4D', label: 'Rojo' },
  { hex: '#849B4B', label: 'Verde' },
  { hex: '#4D99B2', label: 'Azul' },
  { hex: '#7A5EBA', label: 'Violeta' },
  { hex: '#D775B6', label: 'Rosa' },
] as const

export const TEMPLATE_COLORS: Record<string, { hex: string; label: string }[]> = {
  'boda-clasica': PALETAS_BODA_CLASICA as unknown as { hex: string; label: string }[],
  'boda-moderna': PALETAS_BODA_MODERNA as unknown as { hex: string; label: string }[],
  'boda-rustica': PALETAS_BODA_RUSTICA as unknown as { hex: string; label: string }[],
  'quince-princesa': PALETAS_QUINCE as unknown as { hex: string; label: string }[],
  'quince-moderna': PALETAS_QUINCE as unknown as { hex: string; label: string }[],
  'quince-elegante': PALETAS_QUINCE as unknown as { hex: string; label: string }[],
  'cumple-elegante': PALETAS_CUMPLE_ELEGANTE as unknown as { hex: string; label: string }[],
  'cumple-festivo': PALETAS_CUMPLE_FESTIVO as unknown as { hex: string; label: string }[],
  'cumple-infantil': PALETAS_CUMPLE_INFANTIL as unknown as { hex: string; label: string }[],
}

export const COLORES_PALETA = PALETAS_BODA_CLASICA // Default fallback

// Templates whose selected-color checkmark should be dark (light-colored swatches)
export const DARK_CHECKMARK_SLUGS: string[] = [
  'cumple-elegante', 'boda-clasica', 'cumple-festivo',
]
// ─── Wizard form types for "Crear Invitación" (6-step flow) ───────────────────

// Step 1 ─────────────────────────────────────────────────────────────────────

export interface WizardStep1 {
  pedidoId: string        // '' means none selected (string so <select> works)
  tipoEventoId: number | null
  templateId: number | null
  titulo: string
  colorPrimario: string   // Selected in step 1, synced to step 2
  nombreNovio1?: string
  nombreNovio2?: string
  nombreHomenajeados?: string
}

// Step 2 ─────────────────────────────────────────────────────────────────────

export type TipoUbicacion = 'Iglesia' | 'Civil' | 'Recepción' | 'Fiesta'

export const TIPOS_UBICACION_OPTIONS: TipoUbicacion[] = ['Iglesia', 'Civil', 'Recepción', 'Fiesta']

export interface UbicacionEvento {
  tipo: TipoUbicacion
  nombre: string
  direccion: string
  latitud: string
  longitud: string
  hora?: string
}

export interface WizardStep2 {
  fechaEvento: string     // YYYY-MM-DD
  horaEvento: string      // HH:mm
  ubicacion: string
  direccion: string
  latitud: string
  longitud: string
  colorPrimario: string   // #RRGGBB
  contrasenaAsistentes: string
  maxFotos: number
  googleMapsUrl?: string
  /** Dynamic fields per event type stored as a flat key→value map */
  camposEspecificos: Record<string, string>
  /** Multiple locations mode: if non-empty, overrides single ubicacion/direccion/lat/long */
  ubicaciones: UbicacionEvento[]
}

// Default camposEspecificos per tipoEventoId (1=Boda, 2=Quinceañera, 3=Cumpleaños)
export const INITIAL_CAMPOS: Record<number, Record<string, string>> = {
  1: {
    novio1: '', novio2: '', tipoCeremonia: 'Recepción',
    dressCode: 'Elegante',
    mostrarLluviaSobres: 'true', alias: '', cbu: '',
    infoAdicional: '',
  },
  2: {
    nombre: '', colorTematico: '#DC83AA',
    dressCode: 'Elegante', tematica: '',
  },
  3: {
    nombre: '', edad: '', tipo: 'Adulto',
    actividades: '', dressCode: 'Casual elegante',
    notas: '',
  },
}

// Step 3 ─────────────────────────────────────────────────────────────────────

export interface ServiceToggle {
  id: number
  nombre: string
  descripcion: string | null
  precio?: number | string
  incluidoEnBase: boolean
  enabled: boolean
}

export interface WizardStep3 {
  servicios: ServiceToggle[]
}

// Step 4 ─────────────────────────────────────────────────────────────────────

export interface HistoriaSeccion {
  id: string            // local uuid for React keys
  texto: string
  orden: number
  imagen: File | null
  imagenPreview: string | null
}

export interface WizardStep4 {
  fotos: File[]
  fotosPreviews: string[]
  musica: File | null
  musicaNombre: string
  historias: HistoriaSeccion[]
  // For edit mode: existing server-side media
  existingFotos: { id: number; url: string }[]
  removedFotoIds: number[]
  existingMusica: { id: number; archivoUrl: string } | null
  removeMusica: boolean
}

// Step 5 ─────────────────────────────────────────────────────────────────────

export interface GuestEntry {
  nombre: string
  apellido: string
}

export interface WizardStep5 {
  generateGuestUrls: boolean
  guestText: string
  guests: GuestEntry[]
  parseError: string | null
}

// Full wizard form state ───────────────────────────────────────────────────────

export interface WizardFormState {
  step1: WizardStep1
  step2: WizardStep2
  step3: WizardStep3
  step4: WizardStep4
  step5: WizardStep5
}

// Result after successful creation ────────────────────────────────────────────

export interface CrearInvitacionResult {
  id: string
  titulo: string
  csvDownloadUrl?: string
}

// Factory – call once to initialise the wizard ────────────────────────────────

export function createInitialFormState(): WizardFormState {
  return {
    step1: {
      pedidoId: '', tipoEventoId: null, templateId: null, titulo: '', colorPrimario: '',
      nombreNovio1: '', nombreNovio2: '', nombreHomenajeados: '',
    },
    step2: {
      fechaEvento: '', horaEvento: '', ubicacion: '', direccion: '',
      latitud: '', longitud: '', colorPrimario: '',
      contrasenaAsistentes: '', maxFotos: 1000, camposEspecificos: {}, ubicaciones: [],
    },
    step3: { servicios: [] },
    step4: { fotos: [], fotosPreviews: [], musica: null, musicaNombre: '', historias: [], existingFotos: [], removedFotoIds: [], existingMusica: null, removeMusica: false },
    step5: { generateGuestUrls: false, guestText: '', guests: [], parseError: null },
  }
}
