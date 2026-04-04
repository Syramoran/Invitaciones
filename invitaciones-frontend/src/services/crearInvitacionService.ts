import apiClient from './apiClient'
import type { WizardFormState, CrearInvitacionResult } from '@/types/crearInvitacion'

// ─── FormData builder ─────────────────────────────────────────────────────────

function buildFormData(form: WizardFormState): FormData {
  const { step1, step2, step3, step4 } = form
  const fd = new FormData()

  // Step 1
  if (step1.pedidoId) fd.append('pedidoId', step1.pedidoId)
  fd.append('templateId',   String(step1.templateId!))
  fd.append('tipoEventoId', String(step1.tipoEventoId!))
  fd.append('titulo', step1.titulo.trim())

  // Step 2
  fd.append('fechaEvento', step2.fechaEvento)
  fd.append('horaEvento',  step2.horaEvento)
  if (step2.colorPrimario)          fd.append('colorPrimario',          step2.colorPrimario)
  if (step2.contrasenaAsistentes)   fd.append('contrasenaAsistentes',   step2.contrasenaAsistentes.trim())
  fd.append('maxFotos', String(step2.maxFotos || 1000))

  const campos = step2.camposEspecificos
  const modoMultiple = step2.ubicaciones.length > 0

  if (modoMultiple) {
    fd.append('ubicacion', 'multiple')
    fd.append('direccion', 'multiple')
    fd.append('latitud', '0')
    fd.append('longitud', '0')
    const camposConUbicaciones = { ...campos, ubicaciones: step2.ubicaciones }
    fd.append('camposEspecificos', JSON.stringify(camposConUbicaciones))
  } else {
    fd.append('ubicacion', step2.ubicacion.trim())
    fd.append('direccion', step2.direccion.trim())
    fd.append('latitud',   step2.latitud)
    fd.append('longitud',  step2.longitud)
    if (Object.keys(campos).length > 0) {
      fd.append('camposEspecificos', JSON.stringify(campos))
    }
  }

  // Step 3 — only enabled service IDs
  step3.servicios
    .filter(s => s.enabled)
    .forEach(s => fd.append('serviciosIds', String(s.id)))

  // Step 4 — files
  step4.fotos.forEach(f => fd.append('fotos', f))
  if (step4.musica) fd.append('musica', step4.musica)

  return fd
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const crearInvitacionService = {
  /**
   * POST /invitaciones
   * Creates the invitation (multipart/form-data), then creates each historia section.
   */
  async crear(form: WizardFormState): Promise<CrearInvitacionResult> {
    const fd = buildFormData(form)
    const { data } = await apiClient.post<CrearInvitacionResult>('/invitaciones', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // Create historia sections sequentially using the dedicated endpoint
    const historias = form.step4.historias.filter(h => h.texto.trim() || h.imagen)
    for (const historia of historias) {
      const hfd = new FormData()
      hfd.append('texto', historia.texto)
      hfd.append('orden', String(historia.orden))
      if (historia.imagen) hfd.append('imagen', historia.imagen)
      await apiClient.post(`/invitaciones/${data.id}/historias`, hfd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    }

    return data
  },
}
