// Types matching InvitacionResponseDto / PaginatedInvitacionesDto from the API

export interface InvitacionServicio {
  servicioId: number
  nombre: string
  habilitado: boolean
}

// Matches FotoResponseDto returned in fotosAnfitrion[]
export interface FotoAnfitrionAdmin {
  id:     number
  url:    string
  orden:  number
  tamano: number   // bytes
}

export interface InvitacionAdmin {
  id: string
  pedidoId: number
  usuarioId: number | null
  usuarioUsername: string | null
  templateId: number
  templateNombre: string
  tipoEventoId: number
  tipoEventoNombre: string
  titulo: string
  fechaEvento: string       // ISO date string (YYYY-MM-DD)
  horaEvento: string        // HH:mm
  ubicacion: string
  direccion: string
  latitud: number
  longitud: number
  colorPrimario: string | null
  contrasenaAsistentes: string | null
  maxFotos: number
  camposEspecificos: Record<string, unknown> | null
  activa: boolean
  fechaExpiracion: string   // ISO date string
  servicios:       InvitacionServicio[]
  fotosAnfitrion?: FotoAnfitrionAdmin[]   // host photos (FotoAnfitrion entity)
  createdAt: string
}

export interface PaginatedInvitaciones {
  data: InvitacionAdmin[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface InvitacionQuery {
  page?: number
  limit?: number
  activa?: boolean
  tipoEventoId?: number
}

// ── Galería stats (GET /invitaciones/:id/galeria/stats) ───────────────────────

export interface GaleriaStats {
  invitacionId:          string
  totalFotos:            number
  maxFotos:              number
  tamanoTotalBytes:      number
  tamanoTotalMB:         string
  espacioUsadoPorcentaje: number
}

// ── Derived status ────────────────────────────────────────────────────────────

export type InvitacionStatus = 'active' | 'expiring' | 'expired'

export function getDaysLeft(fechaEvento: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [y, m, d] = fechaEvento.split('T')[0].split('-').map(Number)
  const event = new Date(y, m - 1, d)
  return Math.round((event.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getInvitacionStatus(inv: InvitacionAdmin): InvitacionStatus {
  if (!inv.activa) return 'expired'
  const days = getDaysLeft(inv.fechaEvento)
  if (days < 0) return 'expired'
  if (days <= 7) return 'expiring'
  return 'active'
}
