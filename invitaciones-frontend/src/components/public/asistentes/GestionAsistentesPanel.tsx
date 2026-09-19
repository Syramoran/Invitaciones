import { useState, useMemo } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { asistentesService } from '@/services/asistentesService'
import type { AsistentesResponse } from '@/types/asistentes'
import { InvitadosIndividualesList } from './InvitadosIndividualesList'
import { GruposList } from './GruposList'
import { FeedbackBanner, type Feedback } from './FeedbackBanner'

interface Props {
  invitacionId: string
  password: string
  data: AsistentesResponse
  onRefetch: (data: AsistentesResponse) => void
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-ivory px-2 py-2.5 text-center">
      <p className="text-2xl font-bold text-charcoal">{value}</p>
      <p className="break-words text-[11px] font-semibold uppercase tracking-wide text-warm-gray">{label}</p>
    </div>
  )
}

export function GestionAsistentesPanel({ invitacionId, password, data, onRefetch }: Props) {
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [exportando, setExportando] = useState(false)

  const resumen = useMemo(() => {
    const pendientes = data.totalEsperados - data.totalConfirmados
    const integrantesDeGrupo = data.grupos.reduce((acc, g) => acc + g.integrantes.length, 0)
    return {
      confirmados: data.totalConfirmados,
      pendientes,
      total: data.totalEsperados,
      individuales: data.individuales.length,
      grupos: data.grupos.length,
      integrantesDeGrupo,
    }
  }, [data])

  async function refrescar() {
    const fresh = await asistentesService.obtener(invitacionId, password)
    onRefetch(fresh)
  }

  async function withErrorHandling(fn: () => Promise<unknown>, successMessage?: string) {
    setFeedback(null)
    try {
      await fn()
      await refrescar()
      if (successMessage) {
        setFeedback({ tone: 'success', message: successMessage })
        window.setTimeout(() => {
          setFeedback(cur => (cur?.message === successMessage ? null : cur))
        }, 2500)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setFeedback({ tone: 'error', message: Array.isArray(msg) ? msg.join(', ') : msg ?? 'Ocurrió un error. Intentá de nuevo.' })
      throw err
    }
  }

  async function handleExportar() {
    setExportando(true)
    try {
      const blob = await asistentesService.exportarXlsx(invitacionId, password)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `asistentes-${invitacionId.slice(0, 8)}.xlsx`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      setFeedback({ tone: 'error', message: 'No se pudo descargar el Excel. Intentá de nuevo.' })
    } finally {
      setExportando(false)
    }
  }

  return (
    <div className="w-full max-w-[720px] space-y-4 lg:max-w-[840px]">
      {/* Header: métricas + export */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid flex-1 grid-cols-3 gap-3">
            <StatTile label="Vienen" value={resumen.confirmados} />
            <StatTile label="Faltan" value={resumen.pendientes} />
            <StatTile label="Total" value={resumen.total} />
          </div>
          <button
            type="button"
            onClick={handleExportar}
            disabled={exportando}
            className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-champagne-dark px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-ivory disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-1"
          >
            {exportando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {exportando ? 'Descargando...' : 'Descargar Excel'}
          </button>
        </div>

        <p className="mt-4 text-xs text-warm-gray">
          {resumen.individuales} individual{resumen.individuales !== 1 ? 'es' : ''} · {resumen.grupos} grupo{resumen.grupos !== 1 ? 's' : ''} ({resumen.integrantesDeGrupo} integrante{resumen.integrantesDeGrupo !== 1 ? 's' : ''})
        </p>
      </div>

      <FeedbackBanner feedback={feedback} />

      <div className="space-y-4 xl:grid xl:grid-cols-2 xl:items-start xl:gap-4 xl:space-y-0">
        <InvitadosIndividualesList
          individuales={data.individuales}
          onCrear={(nombre, apellido, puedeAgregarPlusOne) =>
            withErrorHandling(
              () => asistentesService.crearIndividual(invitacionId, password, { nombre, apellido, puedeAgregarPlusOne }),
              'Invitado agregado.',
            )
          }
          onEliminar={(invitadoId) =>
            withErrorHandling(() => asistentesService.eliminarIndividual(invitacionId, password, invitadoId), 'Invitado eliminado.')
          }
          onCambiarPlusOne={(invitadoId, puedeAgregarPlusOne) =>
            withErrorHandling(() =>
              asistentesService.actualizarIndividual(invitacionId, password, invitadoId, { puedeAgregarPlusOne }),
            )
          }
          onCambiarInvitacionEnviada={(invitadoId, invitacionEnviada) =>
            withErrorHandling(() =>
              asistentesService.actualizarIndividual(invitacionId, password, invitadoId, { invitacionEnviada }),
            )
          }
        />

        <GruposList
          grupos={data.grupos}
          onCrear={(nombre, maxIntegrantes) =>
            withErrorHandling(() => asistentesService.crearGrupo(invitacionId, password, { nombre, maxIntegrantes }), 'Grupo creado.')
          }
          onEliminar={(grupoId) =>
            withErrorHandling(() => asistentesService.eliminarGrupo(invitacionId, password, grupoId), 'Grupo eliminado.')
          }
          onAgregarIntegrante={(grupoId, nombre, apellido) =>
            withErrorHandling(
              () => asistentesService.agregarIntegrante(invitacionId, password, grupoId, { nombre, apellido }),
              'Integrante agregado.',
            )
          }
          onEliminarIntegrante={(grupoId, invitadoId) =>
            withErrorHandling(
              () => asistentesService.eliminarIntegrante(invitacionId, password, grupoId, invitadoId),
              'Integrante eliminado.',
            )
          }
          onActualizarNombre={(grupoId, nombre) =>
            withErrorHandling(() => asistentesService.actualizarGrupo(invitacionId, password, grupoId, { nombre }))
          }
          onActualizarMaxIntegrantes={(grupoId, maxIntegrantes) =>
            withErrorHandling(() => asistentesService.actualizarGrupo(invitacionId, password, grupoId, { maxIntegrantes }))
          }
          onCambiarInvitacionEnviada={(grupoId, invitacionEnviada) =>
            withErrorHandling(() => asistentesService.actualizarGrupo(invitacionId, password, grupoId, { invitacionEnviada }))
          }
        />
      </div>
    </div>
  )
}
