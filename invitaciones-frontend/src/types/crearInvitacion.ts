// ─── Paleta de colores disponibles ───────────────────────────────────────────

export const COLORES_PALETA = [
  { hex: '#A41B1D', label: 'Rojo'        },
  { hex: '#894F8E', label: 'Violeta'     },
  { hex: '#B14B8F', label: 'Fucsia'      },
  { hex: '#DC83AA', label: 'Rosa'        },
  { hex: '#D16A32', label: 'Naranja'     },
  { hex: '#BD9848', label: 'Dorado'      },
  { hex: '#65795A', label: 'Verde Claro' },
  { hex: '#2A63A8', label: 'Azul'        },
  { hex: '#6B1533', label: 'Bordo'       },
] as const

// ─── Wizard form types for "Crear Invitación" (6-step flow) ───────────────────

// Step 1 ─────────────────────────────────────────────────────────────────────

export interface WizardStep1 {
  pedidoId: string        // '' means none selected (string so <select> works)
  tipoEventoId: number | null
  templateId: number | null
  titulo: string
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
}

// Step 5 ─────────────────────────────────────────────────────────────────────

export interface GuestEntry {
  nombre: string
  apellido: string
}

export interface WizardStep5 {
  generateGuestUrls: boolean
  guestJson: string
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
    step1: { pedidoId: '', tipoEventoId: null, templateId: null, titulo: '' },
    step2: {
      fechaEvento: '', horaEvento: '', ubicacion: '', direccion: '',
      latitud: '', longitud: '', colorPrimario: '',
      contrasenaAsistentes: '', maxFotos: 1000, camposEspecificos: {}, ubicaciones: [],
    },
    step3: { servicios: [] },
    step4: { fotos: [], fotosPreviews: [], musica: null, musicaNombre: '', historias: [] },
    step5: { generateGuestUrls: false, guestJson: '', guests: [], parseError: null },
  }
}
