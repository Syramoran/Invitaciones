import apiClient from './apiClient'

// ─── DTOs ─────────────────────────────────────────────────────────────────────
export interface CrearPedidoDto {
  nombreCliente: string
  telefono: string
  email: string
  tipoEventoId: number
  templateId: number
  serviciosIds?: number[]
}

export interface PedidoResponseDto {
  id: number
  ordenId: string
  nombreCliente: string
  email: string
  telefono: string
  precioBase: number
  precioTotal: number
  estado: string
  createdAt: string
}

// ─────────────────────────────────────────────────────────────────────────────
// TODO: Descomentar e implementar para traer precios, templates y servicios
//       dinámicamente desde la base de datos. Una vez activo, reemplazar los
//       datos estáticos de TEMPLATES_BY_EVENT, ADDONS_DATA y BASE_PRICE en
//       SolicitarPage.tsx con la respuesta de este endpoint.
//
// export interface ServicioPublico {
//   id: number
//   nombre: string
//   descripcion: string
//   precio: number
//   slug: string
// }
//
// export interface TemplatePublico {
//   id: number
//   nombre: string
//   slug: string
//   imageUrl: string | null
//   tipoEventoId: number
// }
//
// export interface TipoEventoPublico {
//   id: number
//   nombre: string
//   slug: 'boda' | 'quince' | 'cumple'
// }
//
// export interface PreciosYServiciosResponse {
//   tiposEvento: TipoEventoPublico[]
//   templates: TemplatePublico[]
//   servicios: ServicioPublico[]
//   precioBase: number
// }
//
// export async function fetchPreciosYServicios(): Promise<PreciosYServiciosResponse> {
//   const { data } = await apiClient.get<PreciosYServiciosResponse>('/servicios/publicos')
//   return data
// }
// ─────────────────────────────────────────────────────────────────────────────

export async function crearPedido(dto: CrearPedidoDto): Promise<PedidoResponseDto> {
  const { data } = await apiClient.post<PedidoResponseDto>('/pedidos', dto)
  return data
}
