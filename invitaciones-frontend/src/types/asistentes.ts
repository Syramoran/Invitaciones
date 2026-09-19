// ═══════════════════════════════════════════
// Tipos del panel /asistentes (espejo de los DTOs del backend)
// ═══════════════════════════════════════════

export interface PlusOneAsistente {
  id: number
  nombre: string
  apellido: string
  confirmado: boolean
}

export interface InvitadoIndividual {
  id: number
  nombre: string
  apellido: string
  confirmado: boolean
  fechaConfirmacion: string | null
  slug: string | null
  urlPersonalizada: string
  invitacionEnviada: boolean
  /** null se trata igual que false: sin plus-one salvo que se habilite explícitamente */
  puedeAgregarPlusOne: boolean | null
  restriccionAlimentaria: string | null
  plusOne: PlusOneAsistente | null
}

export interface IntegranteGrupo {
  id: number
  nombre: string
  apellido: string
  confirmado: boolean
}

export interface Grupo {
  id: number
  nombre: string
  slug: string
  maxIntegrantes: number | null
  restriccionAlimentaria: string | null
  invitacionEnviada: boolean
  urlPersonalizada: string
  integrantes: IntegranteGrupo[]
}

export interface AsistentesResponse {
  totalEsperados: number
  totalConfirmados: number
  individuales: InvitadoIndividual[]
  grupos: Grupo[]
}

export interface CrearInvitadoAsistenteDto {
  nombre: string
  apellido: string
  puedeAgregarPlusOne?: boolean
}

export interface ActualizarInvitadoAsistenteDto {
  invitacionEnviada?: boolean
  puedeAgregarPlusOne?: boolean | null
  restriccionAlimentaria?: string
}

export interface IntegranteGrupoDto {
  nombre: string
  apellido: string
}

export interface CrearGrupoDto {
  nombre: string
  maxIntegrantes?: number
  integrantes?: IntegranteGrupoDto[]
}

export interface ActualizarGrupoDto {
  nombre?: string
  maxIntegrantes?: number
  invitacionEnviada?: boolean
  restriccionAlimentaria?: string
}
