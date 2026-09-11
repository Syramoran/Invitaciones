import apiClient from './apiClient'
import type {
  AsistentesResponse,
  InvitadoIndividual,
  Grupo,
  IntegranteGrupo,
  CrearInvitadoAsistenteDto,
  ActualizarInvitadoAsistenteDto,
  ActualizarSettingsDto,
  CrearGrupoDto,
  ActualizarGrupoDto,
  IntegranteGrupoDto,
} from '@/types/asistentes'

function headers(password: string) {
  return { headers: { 'x-event-password': password } }
}

export const asistentesService = {
  async obtener(invitacionId: string, password: string): Promise<AsistentesResponse> {
    const { data } = await apiClient.get<AsistentesResponse>(
      `/invitaciones/${invitacionId}/asistentes`,
      headers(password),
    )
    return data
  },

  async crearIndividual(
    invitacionId: string,
    password: string,
    dto: CrearInvitadoAsistenteDto,
  ): Promise<InvitadoIndividual> {
    const { data } = await apiClient.post<InvitadoIndividual>(
      `/invitaciones/${invitacionId}/asistentes/invitados`,
      dto,
      headers(password),
    )
    return data
  },

  async actualizarIndividual(
    invitacionId: string,
    password: string,
    invitadoId: number,
    dto: ActualizarInvitadoAsistenteDto,
  ): Promise<InvitadoIndividual> {
    const { data } = await apiClient.patch<InvitadoIndividual>(
      `/invitaciones/${invitacionId}/asistentes/invitados/${invitadoId}`,
      dto,
      headers(password),
    )
    return data
  },

  async eliminarIndividual(
    invitacionId: string,
    password: string,
    invitadoId: number,
  ): Promise<void> {
    await apiClient.delete(
      `/invitaciones/${invitacionId}/asistentes/invitados/${invitadoId}`,
      headers(password),
    )
  },

  async actualizarSettings(
    invitacionId: string,
    password: string,
    dto: ActualizarSettingsDto,
  ): Promise<{ permitirPlusOne: boolean; maxIntegrantesDefault: number | null }> {
    const { data } = await apiClient.patch(
      `/invitaciones/${invitacionId}/asistentes/settings`,
      dto,
      headers(password),
    )
    return data
  },

  async crearGrupo(
    invitacionId: string,
    password: string,
    dto: CrearGrupoDto,
  ): Promise<Grupo> {
    const { data } = await apiClient.post<Grupo>(
      `/invitaciones/${invitacionId}/asistentes/grupos`,
      dto,
      headers(password),
    )
    return data
  },

  async actualizarGrupo(
    invitacionId: string,
    password: string,
    grupoId: number,
    dto: ActualizarGrupoDto,
  ): Promise<Grupo> {
    const { data } = await apiClient.patch<Grupo>(
      `/invitaciones/${invitacionId}/asistentes/grupos/${grupoId}`,
      dto,
      headers(password),
    )
    return data
  },

  async eliminarGrupo(invitacionId: string, password: string, grupoId: number): Promise<void> {
    await apiClient.delete(
      `/invitaciones/${invitacionId}/asistentes/grupos/${grupoId}`,
      headers(password),
    )
  },

  async agregarIntegrante(
    invitacionId: string,
    password: string,
    grupoId: number,
    dto: IntegranteGrupoDto,
  ): Promise<IntegranteGrupo> {
    const { data } = await apiClient.post<IntegranteGrupo>(
      `/invitaciones/${invitacionId}/asistentes/grupos/${grupoId}/integrantes`,
      dto,
      headers(password),
    )
    return data
  },

  async eliminarIntegrante(
    invitacionId: string,
    password: string,
    grupoId: number,
    invitadoId: number,
  ): Promise<void> {
    await apiClient.delete(
      `/invitaciones/${invitacionId}/asistentes/grupos/${grupoId}/integrantes/${invitadoId}`,
      headers(password),
    )
  },

  async exportarXlsx(invitacionId: string, password: string): Promise<Blob> {
    const { data } = await apiClient.get(
      `/invitaciones/${invitacionId}/asistentes/export`,
      { ...headers(password), responseType: 'blob' },
    )
    return data as Blob
  },
}
