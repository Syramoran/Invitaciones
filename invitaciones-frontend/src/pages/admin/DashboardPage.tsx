import { useState, useEffect } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { fetchDashboardData } from '@/services/dashboardService'
import { MetricGrid } from '@/components/admin/dashboard/MetricGrid'
import { RecentOrdersPanel } from '@/components/admin/dashboard/RecentOrdersPanel'
import { ExpiringPanel } from '@/components/admin/dashboard/ExpiringPanel'
import type { DashboardData } from '@/types/dashboard'

export default function DashboardPage() {
  const [data,    setData]    = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchDashboardData()
      setData(result)
    } catch {
      setError('No se pudieron cargar los datos. Verificá que la API esté activa.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // ── Loading ───────────────────────────────────────────────────────────────

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-2 text-[#6b7280]">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm">Cargando dashboard...</span>
    </div>
  )

  // ── Error ─────────────────────────────────────────────────────────────────

  if (error || !data) return (
    <div className="flex items-center gap-3 p-4 bg-[#fee2e2] rounded-xl text-[#dc2626] max-w-xl">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span className="text-sm flex-1">{error}</span>
      <button
        onClick={load}
        className="flex items-center gap-1 text-sm font-medium underline hover:no-underline"
      >
        <RefreshCw className="w-3.5 h-3.5" /> Reintentar
      </button>
    </div>
  )

  // ── Content ───────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <button
          onClick={load}
          className="flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#2d2926] transition-colors"
          title="Recargar"
        >
          <RefreshCw className="w-4 h-4" />
          Recargar
        </button>
      </div>

      {/* Metric cards */}
      <MetricGrid metrics={data.metrics} />

      {/* Panels grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <RecentOrdersPanel orders={data.recentOrders} />
        <ExpiringPanel     items={data.expiringItems} />
      </div>
    </div>
  )
}
