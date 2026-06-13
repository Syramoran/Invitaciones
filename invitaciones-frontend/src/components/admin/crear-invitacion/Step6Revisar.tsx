import { Loader2, AlertCircle, Pencil } from 'lucide-react'
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
  onGoTo: (step: number) => void
}

// ─── Card de revisión ─────────────────────────────────────────────────────────

function ReviewCard({
  title, step, onGoTo, children,
}: {
  title: string
  step: number
  onGoTo: (step: number) => void
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[.78rem] font-semibold text-[#6b7280] uppercase tracking-wider">{title}</h4>
        <button
          type="button"
          onClick={() => onGoTo(step)}
          className="flex items-center gap-1 text-[.72rem] text-[#c5a572] hover:text-[#9e7f4e] font-medium transition-colors"
        >
          <Pencil className="w-3 h-3" />
          Editar
        </button>
      </div>
      <div className="space-y-1.5 text-[.84rem]">{children}</div>
    </div>
  )
}

// ─── Fila de dato ─────────────────────────────────────────────────────────────

function Row({ label, value, dim }: { label: string; value: React.ReactNode; dim?: boolean }) {
  return (
    <div className="flex gap-2 flex-wrap leading-snug">
      <span className="text-[#9ca3af] shrink-0 min-w-[80px]">{label}</span>
      <span className={dim ? 'text-[#9ca3af] italic' : 'text-[#2d2926] font-medium'}>
        {value ?? '—'}
      </span>
    </div>
  )
}

// ─── Check item ───────────────────────────────────────────────────────────────

function CheckItem({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2.5 text-[.84rem]">
      <span className={[
        'w-5 h-5 rounded-full flex items-center justify-center text-[.65rem] font-bold text-white shrink-0',
        ok ? 'bg-[#16a34a]' : 'bg-[#dc2626]',
      ].join(' ')}>
        {ok ? '✓' : '✕'}
      </span>
      <span className={ok ? 'text-[#2d2926]' : 'text-[#dc2626]'}>{text}</span>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Step6Revisar({ formState, templates, loading, error, onGenerate, onPrev, onGoTo }: Props) {
  const { step1, step2, step3, step4, step5 } = formState

  const tpl     = templates.find(t => t.id === step1.templateId)
  const tipoNom = step1.tipoEventoId ? (TIPO_LABEL[step1.tipoEventoId] ?? '—') : '—'
  const enabled = step3.servicios.filter(s => s.enabled)

  const esBoda      = step1.tipoEventoId === 1
  const esQuince    = step1.tipoEventoId === 2
  const esMultiple  = step2.ubicacion === 'multiple'

  const ubicacionOk = esMultiple
    ? step2.ubicaciones.length >= 1 &&
      step2.ubicaciones.every(u => u.nombre.trim() && u.direccion.trim() && u.latitud && u.longitud)
    : !!(step2.ubicacion && step2.direccion && step2.latitud && step2.longitud)

  // Protagonists summary
  const ce = step2.camposEspecificos
  const protagonistasResumen = esBoda
    ? [ce.novio1, ce.novio2].filter(Boolean).join(' & ') || '—'
    : esQuince
      ? ce.nombre || '—'
      : ce.nombre ? `${ce.nombre}${ce.edad ? ` · ${ce.edad} años` : ''}` : '—'

  const checks = [
    { ok: !!step1.tipoEventoId && !!step1.templateId && !!step1.titulo.trim(), text: 'Tipo, diseño y título definidos' },
    { ok: !!(step2.fechaEvento && step2.horaEvento) && ubicacionOk, text: 'Fecha, hora y ubicación completos' },
    { ok: step3.servicios.length > 0, text: 'Servicios configurados' },
    { ok: true, text: 'Contenido multimedia (fotos opcionales)' },
    {
      ok: true,
      text: step5.guests.length > 0
        ? `Lista de invitados cargada (${step5.guests.length})`
        : 'Sin lista de invitados (URL genérica)',
    },
  ]

  const allOk = checks.every(c => c.ok)

  return (
    <div>
      <div className="mb-7">
        <h2 className="text-xl font-semibold text-[#2d2926]">Revisión y generación</h2>
        <p className="text-[.84rem] text-[#6b7280] mt-1">
          Revisá todos los datos antes de generar la invitación. Podés editar cada sección haciendo click en "Editar".
        </p>
      </div>

      {/* ── Cards de revisión ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">

        {/* Diseño */}
        <ReviewCard title="Tipo y diseño" step={1} onGoTo={onGoTo}>
          <Row label="Tipo"     value={tipoNom} />
          <Row label="Diseño"   value={tpl?.nombre ?? '—'} />
          <Row label="Título"   value={step1.titulo || '—'} dim={!step1.titulo} />
          {step1.pedidoId && <Row label="Pedido" value={`PED-${String(step1.pedidoId).padStart(3, '0')}`} />}
        </ReviewCard>

        {/* Protagonistas */}
        <ReviewCard title="Protagonistas" step={2} onGoTo={onGoTo}>
          <Row
            label={esBoda ? 'Pareja' : esQuince ? 'Quinceañera' : 'Festejado/a'}
            value={protagonistasResumen}
          />
          {esBoda && ce.dressCode && <Row label="Dress code" value={ce.dressCode} />}
          {esQuince && ce.tematica && <Row label="Temática" value={ce.tematica} />}
          {!esBoda && !esQuince && ce.tipo && <Row label="Tipo" value={ce.tipo} />}
        </ReviewCard>

        {/* Evento */}
        <ReviewCard title="Fecha y lugar" step={2} onGoTo={onGoTo}>
          <Row label="Fecha"    value={step2.fechaEvento || '—'} dim={!step2.fechaEvento} />
          <Row label="Hora"     value={step2.horaEvento || '—'} dim={!step2.horaEvento} />
          {esMultiple
            ? step2.ubicaciones.map(u => (
                <Row key={u.tipo} label={u.tipo} value={u.nombre || '—'} />
              ))
            : <Row label="Lugar" value={step2.ubicacion || '—'} dim={!step2.ubicacion} />}
        </ReviewCard>

        {/* Servicios */}
        <ReviewCard title="Servicios" step={3} onGoTo={onGoTo}>
          {enabled.length === 0
            ? <span className="text-[#9ca3af] italic text-[.84rem]">Ninguno seleccionado</span>
            : (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {enabled.map(s => (
                  <span key={s.id} className={[
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[.74rem] font-medium',
                    s.incluidoEnBase
                      ? 'bg-[#dcfce7] text-[#16a34a]'
                      : 'bg-[#f4f0ea] text-[#4a4441]',
                  ].join(' ')}>
                    {s.nombre}
                    {s.incluidoEnBase && <span className="text-[.6rem]">✓</span>}
                  </span>
                ))}
              </div>
            )
          }
        </ReviewCard>

        {/* Contenido */}
        <ReviewCard title="Contenido" step={4} onGoTo={onGoTo}>
          <Row label="Fotos"
            value={step4.fotos.length > 0 ? `${step4.fotos.length} foto${step4.fotos.length !== 1 ? 's' : ''}` : 'Sin fotos'}
            dim={step4.fotos.length === 0}
          />
          <Row label="Música"
            value={step4.musica ? step4.musicaNombre : 'Sin música'}
            dim={!step4.musica}
          />
          <Row label="Historia"
            value={step4.historias.length > 0 ? `${step4.historias.length} sección${step4.historias.length !== 1 ? 'es' : ''}` : 'Sin historia'}
            dim={step4.historias.length === 0}
          />
        </ReviewCard>

        {/* Invitados */}
        <ReviewCard title="Invitados" step={5} onGoTo={onGoTo}>
          {step5.guests.length > 0
            ? <Row label="URLs" value={`${step5.guests.length} URLs personalizadas`} />
            : <Row label="Modo" value="URL genérica para todos" dim />
          }
        </ReviewCard>
      </div>

      {/* ── Checklist ── */}
      <div className="bg-white border border-[#f0f0f0] rounded-2xl p-4 sm:p-5 mb-5">
        <h4 className="text-[.78rem] font-semibold text-[#6b7280] uppercase tracking-wider mb-3">
          Checklist de requisitos
        </h4>
        <div className="space-y-2">
          {checks.map((c, i) => <CheckItem key={i} ok={c.ok} text={c.text} />)}
        </div>
        {!allOk && (
          <p className="mt-3 text-[.78rem] text-[#f59e0b] bg-[#fffbeb] rounded-lg px-3 py-2">
            ⚠ Completá los items marcados en rojo antes de generar.
          </p>
        )}
      </div>

      {/* ── Error API ── */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 bg-[#fee2e2] text-[#dc2626] rounded-2xl mb-4 text-[.85rem]">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
        <button type="button" onClick={onPrev} disabled={loading}
          className="px-5 py-2.5 border-[1.5px] border-[#d1d5db] rounded-xl text-[.88rem] font-medium hover:border-[#2d2926] disabled:opacity-40 transition-colors">
          ← Anterior
        </button>
        <button
          type="button"
          onClick={onGenerate}
          disabled={!allOk || loading}
          className="flex items-center gap-2.5 px-7 py-3 bg-[#c5a572] text-white rounded-xl text-[.95rem] font-semibold hover:bg-[#9e7f4e] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {loading ? 'Generando invitación…' : '✨ Generar invitación'}
        </button>
      </div>
    </div>
  )
}
