export interface FotoAnfitrion {
  id: number
  url: string
  orden: number
}

export interface Musica {
  id: number
  archivoUrl: string
}

export interface Historia {
  id: number
  texto: string
  imagenUrl: string | null
  orden: number
}

export interface Servicio {
  id: number
  nombre: string
}

export interface Template {
  id: number
  nombre: string
  slug: string
  thumbnailUrl: string | null
}

export interface CamposEspecificosBoda {
  nombreNovia: string
  nombreNovio: string
  vestimenta?: string
  dresscode?: string
}

export interface InvitacionPublica {
  id: string
  titulo: string
  fechaEvento: string
  horaEvento: string
  ubicacion: string
  direccion: string
  latitud: number
  longitud: number
  colorPrimario: string | null
  camposEspecificos: Record<string, unknown> | null
  template: Template
  servicios: Servicio[]
  fotosAnfitrion: FotoAnfitrion[]
  musica: Musica | null
  historias: Historia[]
  saludoPersonalizado: string | null
  tieneConfirmacion: boolean
  mostrarBotonConfirmar: boolean
}
