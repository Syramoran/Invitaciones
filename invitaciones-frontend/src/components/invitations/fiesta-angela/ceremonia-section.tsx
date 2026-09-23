import type { InvitacionPublica, CamposEspecificosBoda } from '@/types/invitation'
import { COLOR, TYPO } from './theme'
import { useRevealOnScroll } from './use-reveal-on-scroll'

interface CamposAngela extends Partial<CamposEspecificosBoda> {
  horaCeremonia?: string
  lugarCeremonia?: string
  direccionCeremonia?: string
  linkUbicacion?: string
}

interface CeremoniaSectionProps {
  invitacion: InvitacionPublica
}

export function CeremoniaSection({ invitacion }: CeremoniaSectionProps) {
  const campos = (invitacion.camposEspecificos ?? {}) as CamposAngela

  const hora = campos.horaCeremonia ?? invitacion.horaEvento
  const lugar = campos.lugarCeremonia ?? invitacion.ubicacion
  const direccion = campos.direccionCeremonia ?? invitacion.direccion

  const mapsLink =
    campos.linkUbicacion ??
    (lugar || direccion
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([lugar, direccion].filter(Boolean).join(' '))}`
      : null)

  // Dos observadores independientes, uno por grupo
  const { ref: ref1, inView: inView1 } = useRevealOnScroll<HTMLDivElement>()
  const { ref: ref2, inView: inView2 } = useRevealOnScroll<HTMLDivElement>()

  return (
    <section className="flex flex-col items-center px-7 pt-16 pb-16 gap-6">
      {/* Grupo 1: ilustración novios + título + hora */}
      <div ref={ref1} className="flex flex-col items-center gap-4 py-20">
        <div
          className={`opacity-0 ${inView1 ? 'animate-scale-up-in' : ''}`}
          style={{ animationDelay: '0s' }}
        >
          <img
            src="/fiesta-angela/novios-recurso.svg"
            alt="Novios"
            className={`w-[14rem] ${inView1 ? 'animate-pendulum' : ''}`}
            style={{ animationDelay: '1.8s', transformOrigin: 'top center' }}
            loading="lazy"
          />
        </div>

        <h2
          className={`mt-6 text-center opacity-0 ${inView1 ? 'animate-fade-in-up' : ''}`}
          style={{ ...TYPO.h1, lineHeight: '1', color: COLOR.negro, animationDelay: '0.2s' }}
        >
          Ceremonia
        </h2>

        {hora && (
          <div
            className={`mt-6 inline-flex flex-col items-center gap-2 opacity-0 ${inView1 ? 'animate-fade-in-up' : ''}`}
            style={{ animationDelay: '0.4s' }}
          >
            <div className="w-full" style={{ borderTop: `1px solid ${COLOR.brown}` }} />
            <p
              className="text-center whitespace-nowrap"
              style={{ ...TYPO.horarios, color: COLOR.brown }}
            >
              {hora.slice(0, 5)} HS
            </p>
            <div className="w-full" style={{ borderTop: `1px solid ${COLOR.brown}` }} />
          </div>
        )}
      </div>

      {/* Grupo 2: ilustración lugar + nombre + dirección + botón */}
      <div ref={ref2} className="flex flex-col items-center gap-0 py-20">
        <img
          src="/fiesta-angela/villaelina-recurso.svg"
          alt="Lugar"
          className={`w-[260px] opacity-0 ${inView2 ? 'animate-scale-in' : ''}`}
          style={{ animationDelay: '0s' }}
          loading="lazy"
        />

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
            className={`m-12 inline-block px-6 py-3 rounded-sm transition-opacity hover:opacity-70 opacity-0 ${inView2 ? 'animate-fade-in-up' : ''}`}
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
