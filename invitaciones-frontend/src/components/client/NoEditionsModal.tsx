import { X, AlertCircle, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Props {
  invitacionTitulo: string
  onClose: () => void
}

export default function NoEditionsModal({ invitacionTitulo, onClose }: Props) {
  const navigate = useNavigate()

  const handleCreateNew = () => {
    navigate('/client/create-invitation')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <h3 className="text-lg font-semibold text-[#2d2926]">
            Límite de ediciones alcanzado
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[#9ca3af] hover:text-[#2d2926] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[.9rem] font-semibold text-yellow-900 mb-1">
                Se alcanzó el límite de ediciones
              </p>
              <p className="text-[.85rem] text-yellow-800">
                "{invitacionTitulo}" ya ha sido editada 5 veces, que es el máximo permitido.
              </p>
            </div>
          </div>

          <div className="bg-[#fcfaf8] rounded-lg p-4 mb-4">
            <p className="text-[.9rem] text-[#2d2926] mb-3">
              Para hacer cambios adicionales, puedes:
            </p>
            <ul className="space-y-2 text-[.85rem] text-[#6b7280]">
              <li className="flex items-start gap-2">
                <span className="text-[#c5a572] font-semibold">1.</span>
                <span>Crear una nueva invitación para el mismo evento</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#c5a572] font-semibold">2.</span>
                <span>Contacta a nuestro equipo de soporte para ediciones adicionales</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#f0f0f0] bg-[#fcfaf8] flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 border border-[#d1d5db] rounded-lg text-[.88rem] font-medium text-[#2d2926] hover:border-[#2d2926] transition-colors"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#c5a572] hover:bg-[#b09365] text-white rounded-lg text-[.88rem] font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear nueva
          </button>
        </div>
      </div>
    </div>
  )
}
