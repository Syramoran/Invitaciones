// ─── Wizard form types for "Crear Invitación" (6-step flow) ───────────────────

// Step 1 ─────────────────────────────────────────────────────────────────────

export interface WizardStep1 {
  pedidoId: string        // '' means none selected (string so <select> works)
  tipoEventoId: number | null
  templateId: number | null
  titulo: string
}

// Step 2 ─────────────────────────────────────────────────────────────────────

export interface UbicacionEvento {
  tipo: string      // 'Ceremonia religiosa' | 'Ceremonia civil' | 'Recepción / Fiesta'
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
    novio1: '', novio2: '', tipoCeremonia: 'Ambas',
    horaCeremonia: '16:00', lugarCeremonia: '',
    horaRecepcion: '20:00', lugarRecepcion: '',
    dressCode: 'Elegante', notas: '',
  },
  2: {
    nombre: '', colorTematico: '#d4a0b8', horaPresentacion: '21:00',
    valsPareja: '', valsCancion: '', padrinos: '',
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
      latitud: '', longitud: '', colorPrimario: '#c5a572',
      contrasenaAsistentes: '', maxFotos: 1000, camposEspecificos: {}, ubicaciones: [],
    },
    step3: { servicios: [] },
    step4: { fotos: [], fotosPreviews: [], musica: null, musicaNombre: '', historias: [] },
    step5: { generateGuestUrls: false, guestJson: '', guests: [], parseError: null },
  }
}
