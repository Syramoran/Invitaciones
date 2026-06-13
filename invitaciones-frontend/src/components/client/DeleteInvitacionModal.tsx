import { useState } from 'react'
import { AlertTriangle, Loader2, X } from 'lucide-react'

interface Props {
  invitacionTitulo: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function DeleteInvitacionModal({ invitacionTitulo, onConfirm, onCancel }: Props) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const requiredText = 'eliminar'
  const isConfirmed = confirmText.toLowerCase().trim() === requiredText

  async function handleConfirm() {
    if (!isConfirmed) return

    setLoading(true)
    setError(null)
    try {
      await onConfirm()
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'No se pudo eliminar la invitación. Intentá de nuevo.'
      setError(errorMsg)
      console.error('Delete error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-[#2d2926]">Eliminar invitación</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-[#aaa] hover:text-[#555] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-sm text-[#6b7280] mb-3">
            Esta acción <strong>no se puede deshacer</strong>. Se eliminarán permanentemente:
          </p>
          <ul className="text-sm text-[#6b7280] list-disc list-inside space-y-1 mb-4">
            <li>La invitación "{invitacionTitulo}"</li>
            <li>Todas las fotos cargadas en la galería</li>
            <li>Toda la información asociada</li>
          </ul>

          {/* Confirmation input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-[#2d2926] mb-2">
              Para continuar, escribí: <span className="font-bold text-red-600">{requiredText}</span>
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="Escribí aquí..."
              className="w-full px-3 py-2 border border-[#d1d5db] rounded-lg focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100 text-[.9rem]"
              autoFocus
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 border border-[#d1d5db] rounded-lg text-[#2d2926] font-medium hover:bg-[#f5f5f5] transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!isConfirmed || loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 enabled:bg-red-600 enabled:hover:bg-red-700 enabled:text-white"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              'Eliminar invitación'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
