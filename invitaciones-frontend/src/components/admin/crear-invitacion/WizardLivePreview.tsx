import { Suspense, useMemo } from 'react'
import type { WizardFormState } from '@/types/crearInvitacion'
import type { Template } from '@/services/templateService'
import type { InvitacionPublica } from '@/types/invitation'
import { getInvitationComponent } from '@/components/invitations/registry'
import {
  MOCK_INVITACION_BY_SLUG,
  ScrollingPreviewWrapper,
} from '@/components/landing/InvitationPreview'
import { Loader2 } from 'lucide-react'

// Drop empty / null / undefined values from an object so they don't overwrite
// the mock when spreading user input on top of placeholder data.
function pickNonEmpty<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === '' || v === null || v === undefined) continue
    out[k] = v
  }
  return out as Partial<T>
}

interface Props {
  formState: WizardFormState
  templates: Template[]
}

// Cache lazy components by slug to avoid re-creating them on every render.
const componentCache: Record<string, ReturnType<typeof getInvitationComponent>> = {}
function getCached(slug: string) {
  if (!componentCache[slug]) componentCache[slug] = getInvitationComponent(slug)
  return componentCache[slug]
}

function LoadingFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-[#faf7f2]">
      <Loader2 className="w-5 h-5 animate-spin text-[#c5a572]" />
    </div>
  )
}

export function WizardLivePreview({ formState, templates }: Props) {
  const selectedTemplate = templates.find(t => t.id === formState.step1.templateId)
  const slug = selectedTemplate?.slug

  const InvitationView = useMemo(() => slug ? getCached(slug) : null, [slug])

  if (!slug || !InvitationView) {
    return (
      <div className="text-center px-4 py-8">
        <div className="w-12 h-12 rounded-2xl bg-[#e8e3dc] flex items-center justify-center mx-auto mb-3">
          <span className="text-xl">🎨</span>
        </div>
        <p className="text-[.82rem] text-[#9ca3af] leading-relaxed">
          Seleccioná un diseño para ver la vista previa en vivo
        </p>
      </div>
    )
  }

  // Base placeholder data: every section renders with realistic content from
  // the moment the user picks a template. User input then overlays this mock
  // field-by-field, so the preview gradually transforms into their invitation
  // as they fill the wizard.
  const baseMock = MOCK_INVITACION_BY_SLUG[slug]

  const colorPrimario = formState.step2.colorPrimario || formState.step1.colorPrimario || null

  const activeExistingFotos = formState.step4.existingFotos
    .filter(f => !formState.step4.removedFotoIds.includes(f.id))
    .map((f, i) => ({ id: f.id, url: f.url, orden: i }))

  const newFotos = formState.step4.fotosPreviews
    .map((url, i) => ({ id: 1000 + i, url, orden: activeExistingFotos.length + i }))

  const userFotos = [...activeExistingFotos, ...newFotos]
  const userHistorias = formState.step4.historias
    .filter(h => h.texto.trim())
    .map((h, i) => ({ id: i, texto: h.texto, imagenUrl: h.imagenPreview, orden: i + 1 }))
  const userUbicaciones = (formState.step2.ubicaciones ?? []).filter(
    u => u && (u.nombre || u.direccion),
  )

  // Merge campos: start from the mock, overlay only non-empty user values.
  const mockCampos = (baseMock?.camposEspecificos ?? {}) as Record<string, unknown>
  const userCampos = pickNonEmpty(formState.step2.camposEspecificos ?? {})
  const mergedCampos: Record<string, unknown> = { ...mockCampos, ...userCampos }
  if (userUbicaciones.length > 0) {
    mergedCampos.ubicaciones = userUbicaciones
  }

  const userTitulo = formState.step1.titulo.trim()
  const userLat = parseFloat(formState.step2.latitud || '')
  const userLng = parseFloat(formState.step2.longitud || '')

  // ── Services merge ─────────────────────────────────────────────────────────
  // Each InvitationView gates sections (countdown, story, RSVP, etc.) by the
  // services array. If we only use the user's enabled services, the preview
  // looks empty at step 1 (services list might exclude things like "Cuenta
  // regresiva" or "Historia"). To keep the preview complete out of the box, we
  // start from the mock's services and only remove items the user has
  // *explicitly* toggled off in step 3. User-enabled extras are added too.
  const mockServicios = baseMock?.servicios ?? []
  const explicitlyDisabled = new Set(
    formState.step3.servicios.filter(s => !s.enabled).map(s => s.nombre.toLowerCase()),
  )
  const serviciosByName = new Map<string, { id: number; nombre: string }>()
  for (const s of mockServicios) {
    if (!explicitlyDisabled.has(s.nombre.toLowerCase())) {
      serviciosByName.set(s.nombre.toLowerCase(), { id: s.id, nombre: s.nombre })
    }
  }
  for (const s of formState.step3.servicios) {
    if (s.enabled) {
      serviciosByName.set(s.nombre.toLowerCase(), { id: s.id, nombre: s.nombre })
    }
  }
  const previewServicios = Array.from(serviciosByName.values())

  const invitacion: InvitacionPublica = baseMock
    ? {
        ...baseMock,
        id: 'preview',
        titulo: userTitulo || baseMock.titulo,
        fechaEvento: formState.step2.fechaEvento || baseMock.fechaEvento,
        horaEvento: formState.step2.horaEvento || baseMock.horaEvento,
        ubicacion: formState.step2.ubicacion || baseMock.ubicacion,
        direccion: formState.step2.direccion || baseMock.direccion,
        latitud: Number.isFinite(userLat) && userLat !== 0 ? userLat : baseMock.latitud,
        longitud: Number.isFinite(userLng) && userLng !== 0 ? userLng : baseMock.longitud,
        colorPrimario: colorPrimario ?? baseMock.colorPrimario,
        camposEspecificos: mergedCampos,
        template: {
          id: selectedTemplate.id,
          nombre: selectedTemplate.nombre,
          slug: selectedTemplate.slug,
          thumbnailUrl: selectedTemplate.thumbnailUrl,
        },
        servicios: previewServicios,
        fotosAnfitrion: userFotos.length > 0 ? userFotos : baseMock.fotosAnfitrion,
        musica:
          formState.step4.existingMusica && !formState.step4.removeMusica
            ? {
                id: formState.step4.existingMusica.id,
                archivoUrl: formState.step4.existingMusica.archivoUrl,
              }
            : baseMock.musica,
        historias: userHistorias.length > 0 ? userHistorias : baseMock.historias,
        saludoPersonalizado: null,
        // Force RSVP section to render so the preview shows every block of the
        // template. The section component itself is a no-op without an
        // `invitado` URL param (just shows "Te esperamos"), so this is safe.
        tieneConfirmacion: true,
        mostrarBotonConfirmar: false,
      }
    : {
        // Fallback: template without a registered mock — render with whatever the user has.
        id: 'preview',
        titulo: userTitulo || 'Tu evento',
        fechaEvento: formState.step2.fechaEvento || new Date().toISOString().split('T')[0],
        horaEvento: formState.step2.horaEvento || '20:00',
        ubicacion: formState.step2.ubicacion || 'Por confirmar',
        direccion: formState.step2.direccion || '',
        latitud: Number.isFinite(userLat) ? userLat : 0,
        longitud: Number.isFinite(userLng) ? userLng : 0,
        colorPrimario,
        camposEspecificos: mergedCampos,
        template: {
          id: selectedTemplate.id,
          nombre: selectedTemplate.nombre,
          slug: selectedTemplate.slug,
          thumbnailUrl: selectedTemplate.thumbnailUrl,
        },
        servicios: previewServicios,
        fotosAnfitrion: userFotos,
        musica:
          formState.step4.existingMusica && !formState.step4.removeMusica
            ? {
                id: formState.step4.existingMusica.id,
                archivoUrl: formState.step4.existingMusica.archivoUrl,
              }
            : null,
        historias: userHistorias,
        saludoPersonalizado: null,
        tieneConfirmacion: true,
        mostrarBotonConfirmar: false,
      }

  return (
    // Intercept clicks on Router Links / buttons inside the preview so they
    // don't navigate or submit. We use a capture-phase listener instead of an
    // overlay div so the wrapper still receives wheel/touch events for
    // manual scroll.
    <div
      className="relative w-full h-full"
      onClickCapture={blockNavigation}
    >
      <ScrollingPreviewWrapper>
        <Suspense fallback={<LoadingFallback />}>
          <InvitationView invitacion={invitacion} previewMode />
        </Suspense>
      </ScrollingPreviewWrapper>
    </div>
  )
}

function blockNavigation(e: React.MouseEvent) {
  const target = e.target as HTMLElement | null
  if (target && (target.closest('a') || target.closest('button'))) {
    e.preventDefault()
    e.stopPropagation()
  }
}
