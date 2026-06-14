import { FileText } from 'lucide-react'

interface Props {
  onResume: () => void
  onStartFresh: () => void
}

export function ResumeDraftModal({ onResume, onStartFresh }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#fdf8f0] border border-[#f3ead8] flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-[#c5a572]" />
          </div>
          <h2 className="text-[1.1rem] font-display font-semibold text-[#2d2926]">
            Tenés un borrador guardado
          </h2>
        </div>

        <p className="text-[.86rem] text-[#6b7280] mb-2 leading-relaxed">
          Encontramos información de una invitación que empezaste a completar. ¿Querés retomar desde donde lo dejaste?
        </p>
        <p className="text-[.75rem] text-[#9ca3af] mb-8 leading-relaxed">
          Las fotos y música no se guardan localmente — deberás subirlas nuevamente.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onResume}
            className="w-full py-3 bg-[#c5a572] text-white rounded-full text-[.9rem] font-semibold hover:bg-[#9e7f4e] transition-colors"
          >
            Sí, continuar donde lo dejé
          </button>
          <button
            onClick={onStartFresh}
            className="w-full py-3 border border-[#d1d5db] rounded-full text-[.9rem] font-medium text-[#6b7280] hover:bg-gray-50 transition-colors"
          >
            Empezar de nuevo
          </button>
        </div>
      </div>
    </div>
  )
}
