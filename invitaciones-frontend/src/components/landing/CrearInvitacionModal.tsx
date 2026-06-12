import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Sparkles, HandshakeIcon, Zap } from 'lucide-react'

interface CrearInvitacionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CrearInvitacionModal({ isOpen, onClose }: CrearInvitacionModalProps) {
  const navigate = useNavigate()
  const [isClosing, setIsClosing] = useState(false)

  if (!isOpen) return null

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 300)
  }

  const handleSelfService = () => {
    navigate('/client/register?redirect=create')
    handleClose()
  }

  const handleWithAssistance = () => {
    navigate('/crear')
    handleClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl mx-4 transition-all duration-300 ${
          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header con decoración */}
          <div className="relative bg-gradient-to-r from-charcoal to-charcoal-soft px-8 py-8 flex items-center justify-between">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16" />

            <div className="relative">
              <h2 className="text-3xl font-bold text-champagne-light flex items-center gap-3">
                <Sparkles className="w-8 h-8" />
                Crea tu invitación
              </h2>
            </div>

            <button
              onClick={handleClose}
              className="relative p-1 hover:bg-white/10 rounded-lg transition-colors z-10"
              aria-label="Cerrar"
            >
              <X className="w-6 h-6 text-champagne-light" />
            </button>
          </div>

          {/* Content */}
          <div className="px-8 py-10">
            <p className="text-center text-charcoal-soft mb-12 font-light text-lg">
              Elige cómo prefieres crear tu invitación digital
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Option 1: Self Service */}
              <button
                onClick={handleSelfService}
                className="group relative overflow-hidden p-8 border-2 border-charcoal rounded-2xl hover:bg-charcoal hover:text-white transition-all duration-300 text-left"
              >
                {/* Ícono decorativo */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-16 h-16 text-charcoal" />
                </div>

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-charcoal group-hover:bg-white rounded-xl flex items-center justify-center mb-4 transition-colors">
                    <Zap className="w-6 h-6 text-white group-hover:text-charcoal" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-champagne-light transition-colors">
                    Créala tú mismo
                  </h3>
                  <p className="text-sm text-charcoal-soft group-hover:text-white/70 transition-colors space-y-1">
                    <span className="block">✓ Acceso inmediato</span>
                    <span className="block">✓ Completa control</span>
                    <span className="block">✓ Sin intermediarios</span>
                  </p>
                </div>
              </button>

              {/* Option 2: With Assistance */}
              <button
                onClick={handleWithAssistance}
                className="group relative overflow-hidden p-8 border-2 border-gold rounded-2xl hover:bg-gold hover:text-white transition-all duration-300 text-left"
              >
                {/* Ícono decorativo */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <HandshakeIcon className="w-16 h-16 text-gold" />
                </div>

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gold group-hover:bg-white rounded-xl flex items-center justify-center mb-4 transition-colors">
                    <HandshakeIcon className="w-6 h-6 text-white group-hover:text-gold" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-white transition-colors">
                    Necesito asistencia
                  </h3>
                  <p className="text-sm text-charcoal-soft group-hover:text-white/70 transition-colors space-y-1">
                    <span className="block">✓ Asesoría personalizada</span>
                    <span className="block">✓ Diseño profesional</span>
                    <span className="block">✓ Soporte dedicado</span>
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-white/50 border-t border-charcoal/10">
            <button
              onClick={handleClose}
              className="w-full py-2 text-sm text-charcoal-soft hover:text-charcoal transition-colors font-medium"
            >
              O cerrar esta ventana
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
