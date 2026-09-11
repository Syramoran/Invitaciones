import { useState } from 'react'
import { asistentesService } from '@/services/asistentesService'
import type { AsistentesResponse } from '@/types/asistentes'
import { SettingsPanel } from './SettingsPanel'
import { InvitadosIndividualesList } from './InvitadosIndividualesList'
import { GruposList } from './GruposList'

interface Props {
  invitacionId: string
  password: string
  data: AsistentesResponse
  onRefetch: (data: AsistentesResponse) => void
}

export function GestionAsistentesPanel({ invitacionId, password, data, onRefetch }: Props) {
  const [error, setError] = useState<string | null>(null)

  async function refrescar() {
    const fresh = await asistentesService.obtener(invitacionId, password)
    onRefetch(fresh)
  }

  async function withErrorHandling(fn: () => Promise<unknown>) {
    setError(null)
    try {
      await fn()
      await refrescar()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data?.message
      setError(Array.isArray(msg) ? msg.join(', ') : msg ?? 'Ocurrió un error. Intentá de nuevo.')
    }
  }

  return (
    <div className="w-full max-w-[720px] space-y-4">
      {/* Contador */}
      <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
        <span className="text-3xl font-bold text-[#1a1a1a]">{data.totalConfirmados}</span>
        <span className="text-lg text-[#999999]"> / {data.totalEsperados}</span>
        <p className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-[#777777]">
          confirmados
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <SettingsPanel
        permitirPlusOne={data.permitirPlusOne}
        maxIntegrantesDefault={data.maxIntegrantesDefault}
        onGuardar={(permitirPlusOne, maxIntegrantesDefault) =>
          withErrorHandling(() =>
            asistentesService.actualizarSettings(invitacionId, password, {
              permitirPlusOne,
              maxIntegrantesDefault,
            }),
          )
        }
      />

      <InvitadosIndividualesList
        individuales={data.individuales}
        permitirPlusOneGlobal={data.permitirPlusOne}
        onCrear={(nombre, apellido, puedeAgregarPlusOne) =>
          withErrorHandling(() =>
            asistentesService.crearIndividual(invitacionId, password, { nombre, apellido, puedeAgregarPlusOne }),
          )
        }
        onEliminar={(invitadoId) =>
          withErrorHandling(() => asistentesService.eliminarIndividual(invitacionId, password, invitadoId))
        }
        onTogglePlusOne={(invitadoId, puedeAgregarPlusOne) =>
          withErrorHandling(() =>
            asistentesService.actualizarIndividual(invitacionId, password, invitadoId, { puedeAgregarPlusOne }),
          )
        }
        onActualizarRestriccion={(invitadoId, restriccionAlimentaria) =>
          withErrorHandling(() =>
            asistentesService.actualizarIndividual(invitacionId, password, invitadoId, { restriccionAlimentaria }),
          )
        }
      />

      <GruposList
        grupos={data.grupos}
        maxIntegrantesDefault={data.maxIntegrantesDefault}
        onCrear={(nombre, maxIntegrantes) =>
          withErrorHandling(() => asistentesService.crearGrupo(invitacionId, password, { nombre, maxIntegrantes }))
        }
        onEliminar={(grupoId) =>
          withErrorHandling(() => asistentesService.eliminarGrupo(invitacionId, password, grupoId))
        }
        onAgregarIntegrante={(grupoId, nombre, apellido) =>
          withErrorHandling(() => asistentesService.agregarIntegrante(invitacionId, password, grupoId, { nombre, apellido }))
        }
        onEliminarIntegrante={(grupoId, invitadoId) =>
          withErrorHandling(() => asistentesService.eliminarIntegrante(invitacionId, password, grupoId, invitadoId))
        }
        onActualizarRestriccion={(grupoId, restriccionAlimentaria) =>
          withErrorHandling(() =>
            asistentesService.actualizarGrupo(invitacionId, password, grupoId, { restriccionAlimentaria }),
          )
        }
      />
    </div>
  )
}
