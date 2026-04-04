import { Loader2, AlertCircle } from 'lucide-react'
import type { WizardFormState } from '@/types/crearInvitacion'
import type { Template } from '@/services/templateService'
import { TIPO_LABEL } from '@/services/templateService'

interface Props {
  formState: WizardFormState
  templates: Template[]
  loading: boolean
  error: string | null
  onGenerate: () => void
  onPrev: () => void
}

function ReviewCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#f0f0f0] rounded-xl p-4">
      <h4 className="text-[.82rem] font-semibold text-[#6b7280] uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-1 text-[.85rem]">{children}</div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2 flex-wrap">
      <span className="text-[#6b7280] shrink-0">{label}:</span>
      <span className="text-[#2d2926] font-medium">{value ?? '—'}</span>
    </div>
  )
}

function CheckItem({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2 text-[.85rem]">
      <span
        className={[
          'w-5 h-5 rounded-full flex items-center justify-center text-[.65rem] font-bold text-white shrink-0',
          ok ? 'bg-[#16a34a]' : 'bg-[#dc2626]',
        ].join(' ')}
      >
        {ok ? '✓' : '✕'}
      </span>
      <span className={ok ? 'text-[#2d2926]' : 'text-[#dc2626]'}>{text}</span>
    </div>
  )
}

export function Step6Revisar({ formState, templates, loading, error, onGenerate, onPrev }: Props) {
  const { step1, step2, step3, step4, step5 } = formState

  const tpl      = templates.find(t => t.id === step1.templateId)
  const tipoNom  = step1.tipoEventoId ? (TIPO_LABEL[step1.tipoEventoId] ?? '—') : '—'
  const enabled  = step3.servicios.filter(s => s.enabled)

  const esMultiple = step2.ubicacion === 'multiple'
  const ubicacionOk = esMultiple
    ? step2.ubicaciones.length >= 1 &&
      step2.ubicaciones.every(u => u.nombre.trim() && u.direccion.trim() && u.latitud && u.longitud)
    : !!(step2.ubicacion && step2.direccion && step2.latitud && step2.longitud)

  // Checklist
  const checks = [
    { ok: !!step1.tipoEventoId && !!step1.templateId && !!step1.titulo.trim(), text: 'Tipo, template y título definidos' },
    { ok: !!(step2.fechaEvento && step2.horaEvento) && ubicacionOk, text: 'Datos del evento completos' },
    { ok: step3.servicios.length > 0, text: 'Servicios configurados' },
    { ok: true, text: 'Contenido multimedia (fotos opcionales)' },
    { ok: !step5.generateGuestUrls || step5.guests.length > 0, text: step5.generateGuestUrls ? `Lista de invitados cargada (${step5.guests.length})` : 'Sin lista de invitados (URL genérica)' },
  ]

  const allOk = checks.every(c => c.ok)

  return (
    <div>
      <h2 className="text-lg font-semibold mb-5">Revisión y Generación</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {/* Básicos */}
        <ReviewCard title="Datos Básicos">
          <Row label="Tipo"     value={tipoNom} />
          <Row label="Template" value={tpl?.nombre ?? '—'} />
          <Row label="Título"   value={step1.titulo || '—'} />
          {step1.pedidoId && <Row label="Pedido" value={`#${step1.pedidoId}`} />}
        </ReviewCard>

        {/* Evento */}
        <ReviewCard title="Evento">
          <Row label="Fecha"    value={step2.fechaEvento || '—'} />
          <Row label="Hora"     value={step2.horaEvento || '—'} />
          {esMultiple ? (
            step2.ubicaciones.map(u => (
              <Row key={u.tipo} label={u.tipo} value={u.nombre || '—'} />
            ))
          ) : (
            <>
              <Row label="Lugar"    value={step2.ubicacion || '—'} />
              <Row label="Dirección" value={step2.direccion || '—'} />
              {step2.latitud && step2.longitud && (
                <Row label="Coords" value={`${step2.latitud}, ${step2.longitud}`} />
              )}
            </>
          )}
        </ReviewCard>

        {/* Servicios */}
        <ReviewCard title="Servicios">
          {enabled.length === 0
            ? <span className="text-[#9ca3af]">Ninguno seleccionado</span>
            : enabled.map(s => (
                <div key={s.id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#f4f5f7] text-[#4a4441] rounded text-[.78rem] mr-1 mb-1">
                  {s.nombre}
                  {s.incluidoEnBase && <span className="text-[#16a34a] text-[.65rem]">✓</span>}
                </div>
              ))
          }
        </ReviewCard>

        {/* Contenido */}
        <ReviewCard title="Contenido">
          <Row label="Fotos"   value={step4.fotos.length > 0 ? `${step4.fotos.length} foto${step4.fotos.length !== 1 ? 's' : ''}` : 'Sin fotos'} />
          <Row label="Música"  value={step4.musica ? step4.musicaNombre : 'Sin música'} />
          <Row label="Historia" value={step4.historias.length > 0 ? `${step4.historias.length} sección${step4.historias.length !== 1 ? 'es' : ''}` : 'Sin historia'} />
          <Row label="Invitados" value={
            step5.generateGuestUrls
              ? `${step5.guests.length} con URL personalizada`
              : 'URL genérica'
          } />
        </ReviewCard>
      </div>

      {/* Checklist */}
      <div className="bg-white border border-[#f0f0f0] rounded-xl p-4 mb-5">
        <h4 className="text-[.82rem] font-semibold text-[#6b7280] uppercase tracking-wider mb-3">Checklist</h4>
        <div className="space-y-2">
          {checks.map((c, i) => <CheckItem key={i} ok={c.ok} text={c.text} />)}
        </div>
      </div>

      {/* Error from API */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 bg-[#fee2e2] text-[#dc2626] rounded-xl mb-4 text-[.85rem]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev} disabled={loading}
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-lg text-[.88rem] font-medium hover:border-[#2d2926] disabled:opacity-40 transition-colors">
          ← Anterior
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!allOk || loading}
          className="flex items-center gap-2 px-7 py-2.5 bg-[#c5a572] text-white rounded-lg text-[.95rem] font-semibold hover:bg-[#9e7f4e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Generando…' : 'Generar Invitación'}
        </button>
      </div>
    </div>
  )
}
