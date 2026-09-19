import type { InvitacionPublica, CamposEspecificosBoda } from '@/types/invitation'
import { COLOR, TYPO } from './theme'
import { useRevealOnScroll } from './use-reveal-on-scroll'

interface CamposAngela extends Partial<CamposEspecificosBoda> {
  lugarCena?: string
  direccionCena?: string
  linkUbicacionCena?: string
}

interface CenaSectionProps {
  invitacion: InvitacionPublica
}

export function CenaSection({ invitacion }: CenaSectionProps) {
  const campos = (invitacion.camposEspecificos ?? {}) as CamposAngela

  const lugar = campos.lugarCena ?? invitacion.ubicacion
  const direccion = campos.direccionCena ?? invitacion.direccion

  const mapsLink =
    campos.linkUbicacionCena ??
    (lugar || direccion
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([lugar, direccion].filter(Boolean).join(' '))}`
      : null)

  const { ref: ref1, inView: inView1 } = useRevealOnScroll<HTMLDivElement>()
  const { ref: ref2, inView: inView2 } = useRevealOnScroll<HTMLDivElement>()

  return (
    <section className="flex flex-col items-center px-7 pt-16 pb-16 gap-2">
      {/* Grupo 1: ilustración brindis + título + hora */}
      <div ref={ref1} className="flex flex-col items-center gap-4 py-16">
        <div
          className={`opacity-0 ${inView1 ? 'animate-scale-up-in' : ''}`}
          style={{ animationDelay: '0s' }}
        >
          <img
            src="/boda-angela/brindis-recurso.svg"
            alt="Cena"
            className={`w-[14rem] ${inView1 ? 'animate-pendulum-strong' : ''}`}
            style={{ animationDelay: '1.8s', transformOrigin: 'top center' }}
            loading="lazy"
          />
        </div>

        <h2
          className={`mt-6 text-center opacity-0 ${inView1 ? 'animate-fade-in-up' : ''}`}
          style={{ ...TYPO.h1, lineHeight: '1', color: COLOR.negro, animationDelay: '0.2s' }}
        >
          Cena
        </h2>

        {/* Hora hardcodeada entre líneas */}
        <div
          className={`mt-6 inline-flex flex-col items-center gap-2 opacity-0 ${inView1 ? 'animate-fade-in-up' : ''}`}
          style={{ animationDelay: '0.4s' }}
        >
          <div className="w-full" style={{ borderTop: `1px solid ${COLOR.brown}` }} />
          <p
            className="text-center whitespace-nowrap"
            style={{ ...TYPO.horarios, color: COLOR.brown }}
          >
            21:00 HS
          </p>
          <div className="w-full" style={{ borderTop: `1px solid ${COLOR.brown}` }} />
        </div>

        {/* Texto descriptivo */}
        <p
          className={`mt-20 max-w-[22rem] text-center opacity-0 ${inView1 ? 'animate-fade-in-up' : ''}`}
          style={{ ...TYPO.h3, color: COLOR.brown, animationDelay: '0.55s' }}
        >
          ¡Después del sí... nos espera una noche inolvidable!
        </p>
      </div>

      {/* Grupo 2: nombre + dirección + botón (sin ilustración) */}
      <div ref={ref2} className="flex flex-col items-center gap-0 py-16">
        {lugar && (
          <p
            className={`mt-8 text-center opacity-0 ${inView2 ? 'animate-fade-in-up' : ''}`}
            style={{ ...TYPO.h2, color: COLOR.negro, animationDelay: '0.25s' }}
          >
            {lugar}
          </p>
        )}

        {direccion && (
          <p
            className={`py-6 text-center opacity-0 ${inView2 ? 'animate-fade-in-up' : ''}`}
            style={{ ...TYPO.h3, color: COLOR.brown, animationDelay: '0.4s' }}
          >
            {direccion}
          </p>
        )}

        {mapsLink && (
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`m-6 inline-block px-6 py-3 rounded-sm transition-opacity hover:opacity-70 opacity-0 ${inView2 ? 'animate-fade-in-up' : ''}`}
            style={{
              ...TYPO.h4,
              backgroundColor: COLOR.crema,
              color: COLOR.brown,
              animationDelay: '0.55s',
            }}
          >
            Ver ubicación
          </a>
        )}
      </div>
    </section>
  )
}
