import { useState, useEffect, useId } from 'react'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface Props {
  titulo: string
  mensaje: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export function ConfirmDialog({
  titulo,
  mensaje,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: Props) {
  const [confirmando, setConfirmando] = useState(false)
  const tituloId = useId()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onCancel])

  async function handleConfirm() {
    setConfirmando(true)
    try {
      await onConfirm()
    } finally {
      setConfirmando(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <h3 id={tituloId} className="text-base font-semibold text-charcoal">{titulo}</h3>
        </div>

        <p className="mb-6 text-sm text-warm-gray">{mensaje}</p>

        <div className="flex gap-3">
          <button
            type="button"
            autoFocus
            onClick={onCancel}
            disabled={confirmando}
            className="flex-1 rounded-lg border border-champagne-dark px-4 py-2.5 text-sm font-medium text-charcoal transition-colors hover:bg-[#faf9f8] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-1"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={confirmando}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-1"
          >
            {confirmando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Eliminando...
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
