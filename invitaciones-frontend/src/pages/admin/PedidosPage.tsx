import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { adminPedidoService } from '@/services/adminPedidoService'
import type { Pedido, EstadoPedido } from '@/types/adminPedido'
import {
  PedidoFilters,
  type PedidoFilterValues,
} from '@/components/admin/pedidos/PedidoFilters'
import { PedidosTable } from '@/components/admin/pedidos/PedidosTable'
import { PedidoDetailModal } from '@/components/admin/pedidos/PedidoDetailModal'

const EMPTY_FILTERS: PedidoFilterValues = { estado: '', tipo: '', cliente: '' }

export default function PedidosPage() {
  const navigate = useNavigate()

  const [pedidos,     setPedidos]     = useState<Pedido[]>([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState<string | null>(null)
  const [filters,     setFilters]     = useState<PedidoFilterValues>(EMPTY_FILTERS)
  const [selected,    setSelected]    = useState<Pedido | null>(null)

  // ── Fetch ─────────────────────────────────────────────────────────────────
  // estado is the only server-side filter; tipo/cliente are applied locally.

  const fetchAll = useCallback(async (estado?: EstadoPedido | '') => {
    setLoading(true)
    setError(null)
    try {
      const result = await adminPedidoService.getAll({
        limit: 100,
        ...(estado ? { estado } : {}),
      })
      setPedidos(result.data)
    } catch {
      setError('No se pudieron cargar los pedidos. Verificá que la API esté activa.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Re-fetch when the estado filter changes (server-side)
  function handleFiltersChange(next: PedidoFilterValues) {
    setFilters(next)
    if (next.estado !== filters.estado) {
      fetchAll(next.estado)
    }
  }

  // ── Client-side filtering (tipo + cliente) ────────────────────────────────

  const filtered = useMemo(() => {
    const tipo    = filters.tipo.toLowerCase()
    const cliente = filters.cliente.toLowerCase()
    return pedidos.filter(p => {
      const matchTipo    = !tipo    || p.tipoEventoNombre.toLowerCase().includes(tipo)
      const matchCliente = !cliente || p.nombreCliente.toLowerCase().includes(cliente)
      return matchTipo && matchCliente
    })
  }, [pedidos, filters.tipo, filters.cliente])

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleCrearInvitacion(p: Pedido) {
    navigate('/admin/invitaciones/crear', { state: { pedidoId: p.id } })
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-2 text-[#6b7280]">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Cargando pedidos...</span>
    </div>
  )

  if (error) return (
    <div className="flex items-center gap-3 p-4 bg-[#fee2e2] rounded-xl text-[#dc2626] max-w-xl">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm flex-1">{error}</span>
      <button
        onClick={() => fetchAll(filters.estado)}
        className="flex items-center gap-1 text-sm font-medium underline hover:no-underline"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Reintentar
      </button>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-2xl font-semibold">Pedidos</h1>
          <p className="text-[.82rem] text-[#6b7280] mt-0.5">
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => fetchAll(filters.estado)}
          className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#2d2926] transition-colors"
          title="Recargar"
        >
          <RefreshCw className="w-4 h-4" />
          Recargar
        </button>
      </div>

      {/* Filters */}
      <PedidoFilters values={filters} onChange={handleFiltersChange} />

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#f0f0f0] shadow-sm p-5">
        <PedidosTable
          pedidos={filtered}
          onView={setSelected}
          onCrearInvitacion={handleCrearInvitacion}
        />
      </div>

      {/* Detail modal */}
      {selected && (
        <PedidoDetailModal
          pedido={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
