import { useState } from 'react'
import type { Grupo } from '@/types/asistentes'
import { RestriccionInput } from './RestriccionInput'

interface Props {
  grupos: Grupo[]
  maxIntegrantesDefault: number | null
  onCrear: (nombre: string, maxIntegrantes?: number) => Promise<void>
  onEliminar: (grupoId: number) => Promise<void>
  onAgregarIntegrante: (grupoId: number, nombre: string, apellido: string) => Promise<void>
  onEliminarIntegrante: (grupoId: number, invitadoId: number) => Promise<void>
  onActualizarRestriccion: (grupoId: number, restriccionAlimentaria: string) => Promise<void>
}

function Badge({ children, tono }: { children: React.ReactNode; tono: 'ok' | 'pendiente' }) {
  const clases = tono === 'ok' ? 'bg-green-100 text-green-700' : 'bg-[#f4f4f4] text-[#999999]'
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${clases}`}>{children}</span>
}

function GrupoCard({
  grupo,
  maxIntegrantesDefault,
  onEliminar,
  onAgregarIntegrante,
  onEliminarIntegrante,
  onActualizarRestriccion,
}: {
  grupo: Grupo
  maxIntegrantesDefault: number | null
  onEliminar: (grupoId: number) => Promise<void>
  onAgregarIntegrante: (grupoId: number, nombre: string, apellido: string) => Promise<void>
  onEliminarIntegrante: (grupoId: number, invitadoId: number) => Promise<void>
  onActualizarRestriccion: (grupoId: number, restriccionAlimentaria: string) => Promise<void>
}) {
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [agregando, setAgregando] = useState(false)

  const maxEfectivo = grupo.maxIntegrantes ?? maxIntegrantesDefault
  const confirmados = grupo.integrantes.filter(i => i.confirmado).length

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
    <div className="rounded-xl border border-[#f0f0f0] p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-[#1a1a1a]">{grupo.nombre}</p>
          <p className="mt-0.5 text-xs text-[#999999]">
            {grupo.integrantes.length}{maxEfectivo !== null ? ` / ${maxEfectivo}` : ''} integrantes ·{' '}
            {confirmados} confirmado{confirmados !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => onEliminar(grupo.id)}
          className="shrink-0 rounded-lg border border-[#e5e7eb] px-2.5 py-1.5 text-xs text-[#999999] hover:border-red-400 hover:text-red-500"
        >
          Eliminar grupo
        </button>
      </div>

      <RestriccionInput
        valor={grupo.restriccionAlimentaria}
        onGuardar={(valor) => onActualizarRestriccion(grupo.id, valor)}
        placeholder="Restricción alimentaria del grupo (ej: Ana - vegetariana)"
      />

      {grupo.integrantes.length > 0 && (
        <ul className="mt-3 divide-y divide-[#f5f5f5]">
          {grupo.integrantes.map(i => (
            <li key={i.id} className="flex items-center justify-between py-1.5">
              <span className="text-sm capitalize text-[#1a1a1a]">{i.nombre} {i.apellido}</span>
              <div className="flex items-center gap-2">
                {i.confirmado ? <Badge tono="ok">✓</Badge> : <Badge tono="pendiente">Pendiente</Badge>}
                <button
                  onClick={() => onEliminarIntegrante(grupo.id, i.id)}
                  className="text-xs text-[#bbbbbb] hover:text-red-500"
                >
                  ×
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAgregar} className="mt-3 flex flex-wrap items-end gap-2">
        <input
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre"
          className="min-w-[100px] flex-1 rounded-lg border border-[#e0e0e0] px-2.5 py-1.5 text-xs outline-none focus:border-[#555555]"
        />
        <input
          value={apellido}
          onChange={e => setApellido(e.target.value)}
          placeholder="Apellido"
          className="min-w-[100px] flex-1 rounded-lg border border-[#e0e0e0] px-2.5 py-1.5 text-xs outline-none focus:border-[#555555]"
        />
        <button
          type="submit"
          disabled={agregando || !nombre.trim() || !apellido.trim() || (maxEfectivo !== null && grupo.integrantes.length >= maxEfectivo)}
          className="rounded-lg bg-[#1a1a1a] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          + Integrante
        </button>
      </form>
    </div>
  )
}

export function GruposList({
  grupos,
  maxIntegrantesDefault,
  onCrear,
  onEliminar,
  onAgregarIntegrante,
  onEliminarIntegrante,
  onActualizarRestriccion,
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
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#777777]">
        Grupos ({grupos.length})
      </h2>

      <form onSubmit={handleCrear} className="mb-4 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-xs text-[#777777]">Nombre del grupo</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Familia Pérez"
            className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[#555555]"
          />
        </div>
        <div className="w-36">
          <label className="mb-1 block text-xs text-[#777777]">Tope integrantes</label>
          <input
            type="number"
            min={1}
            value={maxIntegrantes}
            onChange={e => setMaxIntegrantes(e.target.value)}
            placeholder={maxIntegrantesDefault ? `Default: ${maxIntegrantesDefault}` : 'Sin límite'}
            className="w-full rounded-lg border border-[#e0e0e0] px-3 py-2 text-sm outline-none focus:border-[#555555]"
          />
        </div>
        <button
          type="submit"
          disabled={creando || !nombre.trim()}
          className="rounded-lg bg-[#1a1a1a] px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          + Crear grupo
        </button>
      </form>

      {grupos.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#aaaaaa]">Todavía no hay grupos.</p>
      ) : (
        <div className="space-y-3">
          {grupos.map(g => (
            <GrupoCard
              key={g.id}
              grupo={g}
              maxIntegrantesDefault={maxIntegrantesDefault}
              onEliminar={onEliminar}
              onAgregarIntegrante={onAgregarIntegrante}
              onEliminarIntegrante={onEliminarIntegrante}
              onActualizarRestriccion={onActualizarRestriccion}
            />
          ))}
        </div>
      )}
    </div>
  )
}
