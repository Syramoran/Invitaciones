import { useState } from 'react'
import type { WizardStep3, ServiceToggle } from '@/types/crearInvitacion'
import { FieldTooltip } from './FieldTooltip'

const INPUT = 'w-full px-3 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] focus:border-[#c5a572] focus:outline-none bg-white transition-colors placeholder:text-[#b0b7c3]'

interface Props {
  state: WizardStep3
  onChange: (updates: Partial<WizardStep3>) => void
  onNext: () => void
  onPrev: () => void
  contrasenaAsistentes?: string
  onChangeContrasena?: (value: string) => void
}

function ServiceRow({ svc, onToggle }: { svc: ServiceToggle; onToggle: (id: number, val: boolean) => void }) {
  const isOn = svc.enabled

  return (
    <div
      className={[
        'flex items-center gap-4 px-4 py-3 rounded-xl border-[1.5px] transition-colors',
        isOn && !svc.incluidoEnBase
          ? 'border-[#c5a572] bg-[rgba(197,165,114,.04)]'
          : svc.incluidoEnBase
            ? 'border-[#d1d5db] bg-[#f4f5f7]/60'
            : 'border-[#f0f0f0] bg-white',
      ].join(' ')}
    >
      {/* Toggle */}
      <label className="relative w-11 h-6 shrink-0 cursor-pointer">
        <input
          type="checkbox"
          checked={svc.enabled}
          disabled={svc.incluidoEnBase}
          onChange={e => onToggle(svc.id, e.target.checked)}
          className="sr-only peer"
        />
        <span
          className={[
            'absolute inset-0 rounded-full transition-colors',
            svc.incluidoEnBase
              ? 'bg-[#c5a572]/40 cursor-not-allowed'
              : isOn
                ? 'bg-[#c5a572] cursor-pointer'
                : 'bg-[#d1d5db] cursor-pointer',
          ].join(' ')}
        />
        <span
          className={[
            'absolute top-[3px] w-[18px] h-[18px] bg-white rounded-full shadow transition-transform',
            isOn ? 'translate-x-[22px]' : 'translate-x-[3px]',
          ].join(' ')}
        />
      </label>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[.9rem] text-[#2d2926]">{svc.nombre}</span>
          {svc.incluidoEnBase && (
            <span className="text-[.68rem] px-2 py-0.5 rounded-full bg-[#dcfce7] text-[#16a34a] font-medium">
              Incluido
            </span>
          )}
        </div>
        {svc.descripcion && (
          <p className="text-[.76rem] text-[#6b7280] mt-0.5 truncate">{svc.descripcion}</p>
        )}
      </div>
    </div>
  )
}

export function Step3Servicios({ state, onChange, onNext, onPrev, contrasenaAsistentes, onChangeContrasena }: Props) {
  const [showPass, setShowPass] = useState(false)

  function handleToggle(id: number, val: boolean) {
    onChange({
      servicios: state.servicios.map(s => s.id === id ? { ...s, enabled: val } : s),
    })
  }

  const included  = state.servicios.filter(s => s.incluidoEnBase)
  const optional  = state.servicios.filter(s => !s.incluidoEnBase)
  const activeOpt = optional.filter(s => s.enabled).length

  const confirmacionSvc = state.servicios.find(
    s => s.nombre.toLowerCase().includes('confirmaci')
  )
  const tieneConfirmacion = confirmacionSvc?.enabled ?? false

  return (
    <div>
      <h2 className="text-lg font-semibold mb-1">Servicios</h2>
      <p className="text-[.82rem] text-[#6b7280] mb-5">
        Los servicios incluidos siempre están activos. Habilitá los adicionales que necesite esta invitación.
      </p>

      {state.servicios.length === 0 ? (
        <p className="text-[.85rem] text-[#9ca3af] py-6 text-center">
          No hay servicios disponibles. Verificá la API.
        </p>
      ) : (
        <div className="space-y-2">
          {/* Included (always on) */}
          {included.length > 0 && (
            <>
              <p className="text-[.72rem] font-semibold uppercase tracking-wider text-[#9ca3af] px-1 mb-1">
                Incluidos en el precio base
              </p>
              {included.map(s => (
                <ServiceRow key={s.id} svc={s} onToggle={handleToggle} />
              ))}
            </>
          )}

          {/* Optional */}
          {optional.length > 0 && (
            <>
              <p className="text-[.72rem] font-semibold uppercase tracking-wider text-[#9ca3af] px-1 mt-4 mb-1">
                Servicios adicionales
              </p>
              {optional.map(s => (
                <ServiceRow key={s.id} svc={s} onToggle={handleToggle} />
              ))}
            </>
          )}
        </div>
      )}

      {/* Summary */}
      {optional.length > 0 && (
        <p className="text-[.78rem] text-[#6b7280] mt-3">
          {activeOpt} servicio{activeOpt !== 1 ? 's' : ''} adicional{activeOpt !== 1 ? 'es' : ''} habilitado{activeOpt !== 1 ? 's' : ''}
        </p>
      )}

      {/* Password — only when RSVP service is enabled */}
      {tieneConfirmacion && onChangeContrasena !== undefined && (
        <div className="mt-5 p-4 rounded-xl border border-[#c5a572]/30 bg-[rgba(197,165,114,.04)]">
          <div className="flex items-center gap-1.5 mb-1.5">
            <label className="text-[.75rem] font-semibold uppercase tracking-wide text-[#6b7280]">
              Contraseña lista de asistentes
            </label>
            <FieldTooltip text="Si olvidás la contraseña deberás comunicarte con soporte: festeja.plataforma@gmail.com. Elegí una que no vayas a olvidar." />
          </div>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              maxLength={255}
              placeholder="Clave para ver quién confirmó asistencia"
              value={contrasenaAsistentes ?? ''}
              onChange={e => onChangeContrasena(e.target.value)}
              className={INPUT + ' pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#6b7280] transition-colors text-[.72rem] font-medium"
            >
              {showPass ? 'Ocultar' : 'Ver'}
            </button>
          </div>
          <p className="text-[.72rem] text-[#9ca3af] mt-1">
            Esta clave la usás vos para ver las confirmaciones. No la ven los invitados.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-6 pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev}
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] font-medium hover:border-[#2d2926] transition-colors">
          ← Anterior
        </button>
        <button type="button" onClick={onNext}
          className="px-5 py-2.5 bg-[#2d2926] text-[#fefcf9] rounded-lg text-[.88rem] font-medium hover:bg-[#4a4441] transition-colors">
          Siguiente →
        </button>
      </div>
    </div>
  )
}
