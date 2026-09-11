import { useState } from 'react'
import type { InvitadoIndividual } from '@/types/asistentes'
import { RestriccionInput } from './RestriccionInput'

interface Props {
  individuales: InvitadoIndividual[]
  permitirPlusOneGlobal: boolean
  onCrear: (nombre: string, apellido: string, puedeAgregarPlusOne?: boolean) => Promise<void>
  onEliminar: (invitadoId: number) => Promise<void>
  onTogglePlusOne: (invitadoId: number, puedeAgregarPlusOne: boolean) => Promise<void>
  onActualizarRestriccion: (invitadoId: number, restriccionAlimentaria: string) => Promise<void>
}

function Badge({ children, tono }: { children: React.ReactNode; tono: 'ok' | 'pendiente' | 'neutro' }) {
  const clases = {
    ok: 'bg-green-100 text-green-700',
    pendiente: 'bg-[#f4f4f4] text-[#999999]',
    neutro: 'bg-blue-100 text-blue-700',
  }[tono]
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${clases}`}>{children}</span>
}

export function InvitadosIndividualesList({
  individuales,
  permitirPlusOneGlobal,
  onCrear,
  onEliminar,
  onTogglePlusOne,
  onActualizarRestriccion,
}: Props) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [creando, setCreando] = useState(false)

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
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#777777]">
        Invitados individuales ({individuales.length})
      </h2>

      <form onSubmit={handleCrear} className="mb-4 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[120px]">
          <label className="mb-1 block text-xs text-[#777777]">Nombre</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[#555555]"
          />
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="mb-1 block text-xs text-[#777777]">Apellido</label>
          <input
            value={apellido}
            onChange={e => setApellido(e.target.value)}
            className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[#555555]"
          />
        </div>
        <button
          type="submit"
          disabled={creando || !nombre.trim() || !apellido.trim()}
          className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          + Agregar
        </button>
      </form>

      {individuales.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#aaaaaa]">Todavía no hay invitados individuales.</p>
      ) : (
        <ul className="divide-y divide-[#f0f0f0]">
          {individuales.map(inv => {
            const puedePlusOne = inv.puedeAgregarPlusOne ?? permitirPlusOneGlobal
            return (
              <li key={inv.id} className="py-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium capitalize text-[#1a1a1a]">
                      {inv.nombre} {inv.apellido}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {inv.confirmado ? <Badge tono="ok">✓ Confirmó</Badge> : <Badge tono="pendiente">Pendiente</Badge>}
                      {inv.invitacionEnviada && <Badge tono="neutro">Invitación enviada</Badge>}
                    </div>
                  </div>
                  <button
                    onClick={() => onEliminar(inv.id)}
                    aria-label="Eliminar"
                    className="shrink-0 rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-xs text-[#999999] hover:border-red-400 hover:text-red-500"
                  >
                    Eliminar
                  </button>
                </div>

                <label className="mt-2 flex items-center gap-2 text-xs text-[#777777]">
                  <input
                    type="checkbox"
                    checked={puedePlusOne}
                    onChange={e => onTogglePlusOne(inv.id, e.target.checked)}
                    className="h-3.5 w-3.5"
                  />
                  Puede agregar plus-one
                  {inv.puedeAgregarPlusOne === null && (
                    <span className="text-[#bbbbbb]">(hereda config. general)</span>
                  )}
                </label>

                <RestriccionInput
                  valor={inv.restriccionAlimentaria}
                  onGuardar={(valor) => onActualizarRestriccion(inv.id, valor)}
                />

                {inv.plusOne && (
                  <div className="ml-4 mt-2 rounded-lg bg-[#faf9f8] px-3 py-2">
                    <p className="text-xs font-medium capitalize text-[#555555]">
                      + {inv.plusOne.nombre} {inv.plusOne.apellido}
                    </p>
                    <div className="mt-1">
                      {inv.plusOne.confirmado ? <Badge tono="ok">✓ Confirmó</Badge> : <Badge tono="pendiente">Pendiente</Badge>}
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
