import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { InvitadoIndividual } from '@/types/asistentes'
import { Badge } from './Badge'
import { ConfirmDialog } from './ConfirmDialog'
import { InvitacionEnviadaToggle } from './InvitacionEnviadaToggle'
import { CopyUrlButton } from './CopyUrlButton'

interface Props {
  individuales: InvitadoIndividual[]
  onCrear: (nombre: string, apellido: string, puedeAgregarPlusOne?: boolean) => Promise<void>
  onEliminar: (invitadoId: number) => Promise<void>
  onCambiarPlusOne: (invitadoId: number, puedeAgregarPlusOne: boolean) => Promise<void>
  onCambiarInvitacionEnviada: (invitadoId: number, invitacionEnviada: boolean) => Promise<void>
}

function InvitadoRow({
  inv,
  onCambiarPlusOne,
  onCambiarInvitacionEnviada,
  onSolicitarEliminar,
}: {
  inv: InvitadoIndividual
  onCambiarPlusOne: (invitadoId: number, puedeAgregarPlusOne: boolean) => Promise<void>
  onCambiarInvitacionEnviada: (invitadoId: number, invitacionEnviada: boolean) => Promise<void>
  onSolicitarEliminar: (inv: InvitadoIndividual) => void
}) {
  const [abierto, setAbierto] = useState(false)
  const plusOneValue = inv.puedeAgregarPlusOne === true ? 'si' : 'no'
  const btnId = `invitado-btn-${inv.id}`
  const panelId = `invitado-panel-${inv.id}`

  return (
    <li className="py-1">
      <button
        type="button"
        id={btnId}
        aria-expanded={abierto}
        aria-controls={panelId}
        onClick={() => setAbierto(v => !v)}
        className="flex w-full items-center justify-between gap-2 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-1"
      >
        <span className="text-sm font-medium capitalize text-charcoal">{inv.nombre} {inv.apellido}</span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-warm-gray transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>

      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: abierto ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div
            id={panelId}
            role="region"
            aria-labelledby={btnId}
            className="flex flex-col gap-3 pb-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1.5">
                {inv.confirmado ? <Badge tono="ok">✓ Confirmó</Badge> : <Badge tono="pendiente">Pendiente</Badge>}
                <InvitacionEnviadaToggle
                  enviada={inv.invitacionEnviada}
                  onChange={(v) => onCambiarInvitacionEnviada(inv.id, v)}
                />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <CopyUrlButton url={inv.urlPersonalizada} />
                <button
                  onClick={() => onSolicitarEliminar(inv)}
                  aria-label={`Eliminar a ${inv.nombre} ${inv.apellido}`}
                  className="shrink-0 rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-xs text-warm-gray hover:border-red-400 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-1"
                >
                  Eliminar
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor={`plusone-${inv.id}`} className="text-xs text-warm-gray">Acompañante:</label>
              <select
                id={`plusone-${inv.id}`}
                value={plusOneValue}
                onChange={e => onCambiarPlusOne(inv.id, e.target.value === 'si')}
                className="rounded-lg border border-champagne-dark bg-white px-2 py-1 text-xs text-charcoal outline-none focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50"
              >
                <option value="no">No puede agregar</option>
                <option value="si">Sí puede agregar</option>
              </select>
            </div>

            <div>
              <p className="text-xs text-warm-gray">Restricción alimentaria</p>
              {inv.restriccionAlimentaria ? (
                <p className="mt-1 rounded-lg bg-ivory px-2.5 py-1.5 text-xs text-charcoal">
                  {inv.restriccionAlimentaria}
                </p>
              ) : (
                <p className="mt-1 text-xs italic text-warm-gray-light">
                  Sin restricciones informadas todavía — la completa el invitado al confirmar.
                </p>
              )}
            </div>

            {inv.plusOne && (
              <div className="rounded-lg bg-[#faf9f8] px-3 py-2">
                <p className="text-xs font-medium capitalize text-charcoal-soft">
                  + {inv.plusOne.nombre} {inv.plusOne.apellido}
                </p>
                <div className="mt-1">
                  {inv.plusOne.confirmado ? <Badge tono="ok">✓ Confirmó</Badge> : <Badge tono="pendiente">Pendiente</Badge>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

export function InvitadosIndividualesList({
  individuales,
  onCrear,
  onEliminar,
  onCambiarPlusOne,
  onCambiarInvitacionEnviada,
}: Props) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [creando, setCreando] = useState(false)
  const [aEliminar, setAEliminar] = useState<InvitadoIndividual | null>(null)

  async function handleCrear(e: React.FormEvent) {
    e.preventDefault()
    if (!nombre.trim() || !apellido.trim()) return
    setCreando(true)
    try {
      await onCrear(nombre.trim(), apellido.trim())
      setNombre('')
      setApellido('')
    } finally {
      setCreando(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-warm-gray">
        Invitados individuales ({individuales.length})
      </h2>

      <form onSubmit={handleCrear} className="mb-4 flex flex-wrap items-end gap-2">
        <div className="min-w-[120px] flex-1">
          <label htmlFor="ind-nombre" className="mb-1 block text-xs text-warm-gray">Nombre</label>
          <input
            id="ind-nombre"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full rounded-lg border border-champagne-dark px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 focus-visible:ring-2 focus-visible:ring-gold/50"
          />
        </div>
        <div className="min-w-[120px] flex-1">
          <label htmlFor="ind-apellido" className="mb-1 block text-xs text-warm-gray">Apellido</label>
          <input
            id="ind-apellido"
            value={apellido}
            onChange={e => setApellido(e.target.value)}
            className="w-full rounded-lg border border-champagne-dark px-3 py-2 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 focus-visible:ring-2 focus-visible:ring-gold/50"
          />
        </div>
        <button
          type="submit"
          disabled={creando || !nombre.trim() || !apellido.trim()}
          className="rounded-lg bg-charcoal px-4 py-2 text-sm font-semibold text-cream transition-opacity hover:opacity-80 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-1"
        >
          + Agregar
        </button>
      </form>

      {individuales.length === 0 ? (
        <p className="py-6 text-center text-sm text-warm-gray-light">Todavía no hay invitados individuales.</p>
      ) : (
        <ul className="divide-y divide-champagne-dark/40">
          {individuales.map(inv => (
            <InvitadoRow
              key={inv.id}
              inv={inv}
              onCambiarPlusOne={onCambiarPlusOne}
              onCambiarInvitacionEnviada={onCambiarInvitacionEnviada}
              onSolicitarEliminar={setAEliminar}
            />
          ))}
        </ul>
      )}

      {aEliminar && (
        <ConfirmDialog
          titulo="Eliminar invitado"
          mensaje={
            aEliminar.plusOne
              ? `Se eliminará a ${aEliminar.nombre} ${aEliminar.apellido} y a su acompañante, ${aEliminar.plusOne.nombre} ${aEliminar.plusOne.apellido}. Esta acción no se puede deshacer.`
              : `Se eliminará a ${aEliminar.nombre} ${aEliminar.apellido}. Esta acción no se puede deshacer.`
          }
          onConfirm={async () => {
            try {
              await onEliminar(aEliminar.id)
              setAEliminar(null)
            } catch {
              // el banner de error ya lo explica; se deja el diálogo abierto para reintentar o cancelar
            }
          }}
          onCancel={() => setAEliminar(null)}
        />
      )}
    </div>
  )
}
