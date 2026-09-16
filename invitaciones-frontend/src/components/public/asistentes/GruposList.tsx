import { useState } from 'react'
import { X, ChevronDown } from 'lucide-react'
import type { Grupo, IntegranteGrupo } from '@/types/asistentes'
import { RestriccionInput } from './RestriccionInput'
import { Badge } from './Badge'
import { ConfirmDialog } from './ConfirmDialog'
import { InvitacionEnviadaToggle } from './InvitacionEnviadaToggle'
import { CopyUrlButton } from './CopyUrlButton'

interface Props {
  grupos: Grupo[]
  onCrear: (nombre: string, maxIntegrantes?: number) => Promise<void>
  onEliminar: (grupoId: number) => Promise<void>
  onAgregarIntegrante: (grupoId: number, nombre: string, apellido: string) => Promise<void>
  onEliminarIntegrante: (grupoId: number, invitadoId: number) => Promise<void>
  onActualizarRestriccion: (grupoId: number, restriccionAlimentaria: string) => Promise<void>
  onActualizarNombre: (grupoId: number, nombre: string) => Promise<void>
  onActualizarMaxIntegrantes: (grupoId: number, maxIntegrantes: number) => Promise<void>
  onCambiarInvitacionEnviada: (grupoId: number, invitacionEnviada: boolean) => Promise<void>
}

function GrupoRow({
  grupo,
  onEliminar,
  onAgregarIntegrante,
  onEliminarIntegrante,
  onActualizarRestriccion,
  onActualizarNombre,
  onActualizarMaxIntegrantes,
  onCambiarInvitacionEnviada,
}: {
  grupo: Grupo
  onEliminar: (grupoId: number) => Promise<void>
  onAgregarIntegrante: (grupoId: number, nombre: string, apellido: string) => Promise<void>
  onEliminarIntegrante: (grupoId: number, invitadoId: number) => Promise<void>
  onActualizarRestriccion: (grupoId: number, restriccionAlimentaria: string) => Promise<void>
  onActualizarNombre: (grupoId: number, nombre: string) => Promise<void>
  onActualizarMaxIntegrantes: (grupoId: number, maxIntegrantes: number) => Promise<void>
  onCambiarInvitacionEnviada: (grupoId: number, invitacionEnviada: boolean) => Promise<void>
}) {
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [agregando, setAgregando] = useState(false)
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false)
  const [aQuitar, setAQuitar] = useState<IntegranteGrupo | null>(null)

  const maxEfectivo = grupo.maxIntegrantes
  const confirmados = grupo.integrantes.filter(i => i.confirmado).length
  const btnId = `grupo-btn-${grupo.id}`
  const panelId = `grupo-panel-${grupo.id}`

  async function handleAgregar(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim() || !apellido.trim()) return
    setAgregando(true)
    try {
      await onAgregarIntegrante(grupo.id, nombre.trim(), apellido.trim())
      setNombre('')
      setApellido('')
    } finally {
      setAgregando(false)
    }
  }

  return (
    <div className="rounded-xl border border-champagne-dark/60 p-4">
      <button
        type="button"
        id={btnId}
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={() => setAbierto(v => !v)}
        className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-1"
      >
        <span className="text-sm font-semibold text-charcoal">{grupo.nombre}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-warm-gray transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: abierto ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div id={panelId} role="region" aria-labelledby={btnId} className="flex flex-col gap-3 pt-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex-1">
                <label htmlFor={`grupo-nombre-${grupo.id}`} className="sr-only">Nombre del grupo</label>
                <RestriccionInput
                  id={`grupo-nombre-${grupo.id}`}
                  valor={grupo.nombre}
                  onGuardar={(valor) => (valor.trim() ? onActualizarNombre(grupo.id, valor.trim()) : Promise.resolve())}
                  placeholder="Nombre del grupo"
                  className="!mt-0 !border-0 !bg-transparent !px-0 !py-0 text-sm font-semibold text-charcoal focus:!ring-0"
                />
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-warm-gray">
                  <label htmlFor={`grupo-max-${grupo.id}`} className="sr-only">Tope de integrantes</label>
                  <RestriccionInput
                    id={`grupo-max-${grupo.id}`}
                    type="number"
                    valor={grupo.maxIntegrantes !== null ? String(grupo.maxIntegrantes) : ''}
                    onGuardar={(valor) => {
                      const n = Number(valor)
                      return Number.isFinite(n) && n >= 1 ? onActualizarMaxIntegrantes(grupo.id, n) : Promise.resolve()
                    }}
                    placeholder="Sin límite"
                    className="!mt-0 w-24 !py-1"
                  />
                  <span>
                    {grupo.integrantes.length}{maxEfectivo !== null ? ` / ${maxEfectivo}` : ''} integrantes · {confirmados} confirmado{confirmados !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="mt-1.5">
                  <InvitacionEnviadaToggle
                    enviada={grupo.invitacionEnviada}
                    onChange={(v) => onCambiarInvitacionEnviada(grupo.id, v)}
                  />
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <CopyUrlButton url={grupo.urlPersonalizada} />
                <button
                  onClick={() => setConfirmandoEliminar(true)}
                  aria-label={`Eliminar el grupo ${grupo.nombre}`}
                  className="shrink-0 rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-xs text-warm-gray hover:border-red-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-1"
                >
                  Eliminar grupo
                </button>
              </div>
            </div>

            <RestriccionInput
              valor={grupo.restriccionAlimentaria}
              onGuardar={(valor) => onActualizarRestriccion(grupo.id, valor)}
              placeholder="Restricción alimentaria del grupo (ej: Ana - vegetariana)"
            />

            {grupo.integrantes.length > 0 && (
              <ul className="divide-y divide-[#f5f5f5]">
                {grupo.integrantes.map(i => (
                  <li key={i.id} className="flex items-center justify-between py-1.5">
                    <span className="text-sm capitalize text-charcoal">{i.nombre} {i.apellido}</span>
                    <div className="flex items-center gap-2">
                      {i.confirmado ? <Badge tono="ok">✓</Badge> : <Badge tono="pendiente">Pendiente</Badge>}
                      <button
                        onClick={() => setAQuitar(i)}
                        aria-label={`Eliminar a ${i.nombre} ${i.apellido} del grupo`}
                        className="text-warm-gray-light hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleAgregar} className="flex flex-wrap items-end gap-2">
              <div className="min-w-[100px] flex-1">
                <label htmlFor={`integrante-nombre-${grupo.id}`} className="sr-only">Nombre del integrante</label>
                <input
                  id={`integrante-nombre-${grupo.id}`}
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  placeholder="Nombre"
                  className="w-full rounded-lg border border-champagne-dark px-2.5 py-1.5 text-xs outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 focus-visible:ring-2 focus-visible:ring-gold/50"
                />
              </div>
              <div className="min-w-[100px] flex-1">
                <label htmlFor={`integrante-apellido-${grupo.id}`} className="sr-only">Apellido del integrante</label>
                <input
                  id={`integrante-apellido-${grupo.id}`}
                  value={apellido}
                  onChange={e => setApellido(e.target.value)}
                  placeholder="Apellido"
                  className="w-full rounded-lg border border-champagne-dark px-2.5 py-1.5 text-xs outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 focus-visible:ring-2 focus-visible:ring-gold/50"
                />
              </div>
              <button
                type="submit"
                disabled={agregando || !nombre.trim() || !apellido.trim() || (maxEfectivo !== null && grupo.integrantes.length >= maxEfectivo)}
                className="rounded-lg bg-charcoal px-3 py-1.5 text-xs font-semibold text-cream transition-opacity hover:opacity-80 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-1"
              >
                + Integrante
              </button>
            </form>
            {maxEfectivo !== null && grupo.integrantes.length >= maxEfectivo && (
              <p className="text-[11px] text-warm-gray-light">Este grupo ya alcanzó su tope de {maxEfectivo} integrantes.</p>
            )}
          </div>
        </div>
      </div>

      {confirmandoEliminar && (
        <ConfirmDialog
          titulo="Eliminar grupo"
          mensaje={
            grupo.integrantes.length > 0
              ? `Se eliminará el grupo "${grupo.nombre}" y sus ${grupo.integrantes.length} integrante${grupo.integrantes.length !== 1 ? 's' : ''}. Esta acción no se puede deshacer.`
              : `Se eliminará el grupo "${grupo.nombre}". Esta acción no se puede deshacer.`
          }
          onConfirm={async () => {
            try {
              await onEliminar(grupo.id)
              setConfirmandoEliminar(false)
            } catch {
              // el banner de error ya lo explica; se deja el diálogo abierto para reintentar o cancelar
            }
          }}
          onCancel={() => setConfirmandoEliminar(false)}
        />
      )}

      {aQuitar && (
        <ConfirmDialog
          titulo="Sacar integrante"
          mensaje={`Se quitará a ${aQuitar.nombre} ${aQuitar.apellido} del grupo "${grupo.nombre}".`}
          confirmLabel="Sacar"
          onConfirm={async () => {
            try {
              await onEliminarIntegrante(grupo.id, aQuitar.id)
              setAQuitar(null)
            } catch {
              // el banner de error ya lo explica; se deja el diálogo abierto para reintentar o cancelar
            }
          }}
          onCancel={() => setAQuitar(null)}
        />
      )}
    </div>
  )
}

export function GruposList({
  grupos,
  onCrear,
  onEliminar,
  onAgregarIntegrante,
  onEliminarIntegrante,
  onActualizarRestriccion,
  onActualizarNombre,
  onActualizarMaxIntegrantes,
  onCambiarInvitacionEnviada,
}: Props) {
  const [nombre, setNombre] = useState('')
  const [maxIntegrantes, setMaxIntegrantes] = useState('')
  const [creando, setCreando] = useState(false)

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim()) return
    setCreando(true)
    try {
      const max = maxIntegrantes.trim() === '' ? undefined : Number(maxIntegrantes)
      await onCrear(nombre.trim(), max)
      setNombre('')
      setMaxIntegrantes('')
    } finally {
      setCreando(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-warm-gray">
        Grupos ({grupos.length})
      </h2>

      <form onSubmit={handleCrear} className="mb-4 flex flex-wrap items-end gap-2">
        <div className="min-w-[140px] flex-1">
          <label htmlFor="grupo-nombre-nuevo" className="mb-1 block text-xs text-warm-gray">Nombre del grupo</label>
          <input
            id="grupo-nombre-nuevo"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Familia Pérez"
            className="w-full rounded-lg border border-champagne-dark px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 focus-visible:ring-2 focus-visible:ring-gold/50"
          />
        </div>
        <div className="w-36">
          <label htmlFor="grupo-tope-nuevo" className="mb-1 block text-xs text-warm-gray">Tope integrantes</label>
          <input
            id="grupo-tope-nuevo"
            type="number"
            min={1}
            value={maxIntegrantes}
            onChange={e => setMaxIntegrantes(e.target.value)}
            placeholder="Sin límite"
            className="w-full rounded-lg border border-champagne-dark px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 focus-visible:ring-2 focus-visible:ring-gold/50"
          />
        </div>
        <button
          type="submit"
          disabled={creando || !nombre.trim()}
          className="rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-cream transition-opacity hover:opacity-80 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-1"
        >
          + Crear grupo
        </button>
      </form>

      {grupos.length === 0 ? (
        <p className="py-6 text-center text-sm text-warm-gray-light">Todavía no hay grupos.</p>
      ) : (
        <div className="space-y-3">
          {grupos.map(g => (
            <GrupoRow
              key={g.id}
              grupo={g}
              onEliminar={onEliminar}
              onAgregarIntegrante={onAgregarIntegrante}
              onEliminarIntegrante={onEliminarIntegrante}
              onActualizarRestriccion={onActualizarRestriccion}
              onActualizarNombre={onActualizarNombre}
              onActualizarMaxIntegrantes={onActualizarMaxIntegrantes}
              onCambiarInvitacionEnviada={onCambiarInvitacionEnviada}
            />
          ))}
        </div>
      )}
    </div>
  )
}
