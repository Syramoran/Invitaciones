import { Heart, Crown, Cake, type LucideIcon } from 'lucide-react'

// ─── FieldDef ────────────────────────────────────────────────────────────────

export interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'color' | 'checkbox' | 'time' | 'section'
  placeholder?: string
  options?: string[]
  fullWidth?: boolean
}

// ─── EventConfig ─────────────────────────────────────────────────────────────

export interface EventConfig {
  id: number | null
  label: string
  icon: LucideIcon
  /** How names are captured for this event type */
  nombresType: 'novios' | 'homenajeado' | 'none'
  /** Initial camposEspecificos when switching to this event type */
  initialCampos: Record<string, string>
  /** Dynamic extra fields rendered in Step2 */
  camposEspecificos: FieldDef[]
  /** Whether this event supports multiple location cards */
  allowMultipleLocations: boolean
  /** If true, colorPrimario is synced to camposEspecificos.colorTematico */
  syncColorTematico: boolean
}

// ─── Per-type configs (keyed by tipoEventoId) ────────────────────────────────

const CASAMIENTO: EventConfig = {
  id: 1,
  label: 'Casamiento',
  icon: Heart,
  nombresType: 'novios',
  initialCampos: {
    novio1: '',
    novio2: '',
    tipoCeremonia: 'Recepción',
  },
  camposEspecificos: [],
  allowMultipleLocations: true,
  syncColorTematico: false,
}

const QUINCEANIOS: EventConfig = {
  id: 2,
  label: 'Quinceaños',
  icon: Crown,
  nombresType: 'homenajeado',
  initialCampos: {
    nombre: '',
    colorTematico: '#DC83AA',
  },
  camposEspecificos: [
    {
      key: 'colorTematico',
      label: 'Color temático',
      type: 'color',
    },
    {
      key: 'frase',
      label: 'Info adicional o frase',
      type: 'textarea',
      placeholder: 'Ej: "Que todos tus sueños se hagan realidad…"',
      fullWidth: true,
    },
  ],
  allowMultipleLocations: true,
  syncColorTematico: true,
}

const CUMPLEANIOS: EventConfig = {
  id: 3,
  label: 'Cumpleaños',
  icon: Cake,
  nombresType: 'homenajeado',
  initialCampos: {
    nombre: '',
  },
  camposEspecificos: [
    {
      key: 'frase',
      label: 'Frase o dedicatoria',
      type: 'textarea',
      placeholder: 'Ej: "¡A festejar!"',
      fullWidth: true,
    },
  ],
  allowMultipleLocations: false,
  syncColorTematico: false,
}

// Default fallback when no config is registered for the given ID
const DEFAULT_CONFIG: EventConfig = {
  id: null,
  label: 'Evento',
  icon: Cake,
  nombresType: 'none',
  initialCampos: {},
  camposEspecificos: [],
  allowMultipleLocations: false,
  syncColorTematico: false,
}

/** All known event configs indexed by their DB id */
const EVENT_CONFIGS: Record<number, EventConfig> = {
  1: CASAMIENTO,
  2: QUINCEANIOS,
  3: CUMPLEANIOS,
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the EventConfig for the given tipoEventoId.
 * Falls back to a generic config when the id is null or unknown.
 */
export function getEventConfig(id: number | null): EventConfig {
  if (id === null || id === undefined) return DEFAULT_CONFIG
  return EVENT_CONFIGS[id] ?? { ...DEFAULT_CONFIG, id }
}
