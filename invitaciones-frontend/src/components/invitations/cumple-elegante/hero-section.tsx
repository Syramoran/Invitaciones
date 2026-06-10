import { useRef, useEffect } from "react"
import type { InvitacionPublica, CamposEspecificosCumple } from "@/types/invitation"

// ─── Color system ─────────────────────────────────────────────────────────────
// Background color (colorPrimario) → predefined accent color

const DEFAULT_BG = "#EDE2D4"
const DEFAULT_ACCENT = "#BD9848"

const ACCENT_MAP: Record<string, string> = {
  "#f1f1f1": "#404040",
  "#ede2d4": "#BD9848",
  "#dae4f1": "#5378AC",
  "#e2daf1": "#8C64B4",
  "#f4e1e1": "#A3292B",
}

function resolveAccent(bgColor: string | null): string {
  if (!bgColor) return DEFAULT_ACCENT
  return ACCENT_MAP[bgColor.toLowerCase()] ?? DEFAULT_ACCENT
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

const DIAS_SEMANA = [
  "DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO",
]
const MESES = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
]

function parseFecha(fechaISO: string) {
  const [dateStr] = fechaISO.split("T")
  const [y, m, d] = dateStr.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return {
    dia: d,
    diaSemana: DIAS_SEMANA[date.getDay()],
    mes: MESES[m - 1],
    año: y,
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface HeroSectionProps {
  invitacion: InvitacionPublica
  invitadoParam?: string | null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function HeroSection({ invitacion, invitadoParam }: HeroSectionProps) {
  const bgColor = invitacion.colorPrimario || DEFAULT_BG
  const accentColor = resolveAccent(invitacion.colorPrimario)

  const campos = (invitacion.camposEspecificos ?? {}) as CamposEspecificosCumple
  const nombre = campos.nombre || invitacion.titulo
  const edad = campos.edad || ""

  const { dia, diaSemana, mes, año } = parseFecha(invitacion.fechaEvento)

  const saludo =
    invitacion.saludoPersonalizado ||
    (invitadoParam ? `¡Hola ${invitadoParam.replace(/-/g, " ")}!` : null)

  const foto =
    invitacion.fotosAnfitrion.length > 0
      ? [...invitacion.fotosAnfitrion].sort((a, b) => a.orden - b.orden)[0]
      : null

  const numberRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = numberRef.current
    if (!el || !el.parentElement) return
    const resize = () => {
      el.style.fontSize = "100px"
      const parentW = el.parentElement!.getBoundingClientRect().width
      const elW = el.getBoundingClientRect().width
      if (elW === 0) return
      el.style.fontSize = `${100 * (parentW / elW)}px`
    }
    document.fonts.ready.then(() => {
      resize()
      const ro = new ResizeObserver(resize)
      ro.observe(el.parentElement!)
      return () => ro.disconnect()
    })
  }, [edad])

  return (
    <>
      {/* ── Hero card ─────────────────────────────────────────────────────── */}
      <section
        className="relative z-10 overflow-visible"
        style={{
          backgroundColor: bgColor,
          boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
        }}
      >
        {/* Age number – fills full width */}
        {edad && (
          <div
            ref={numberRef}
            aria-hidden="true"
            className="pointer-events-none absolute select-none leading-none whitespace-nowrap"
            style={{
              top: "-0.15em",
              left: 0,
              fontFamily: "'Raleway', sans-serif",
              fontWeight: 900,
              color: "#ffffff",
              opacity: 0.45,
              letterSpacing: "-0.04em",
              zIndex: 0,
            }}
          >
            {edad}
          </div>
        )}

        {/* Content row: birthday script left · info block right */}
        <div className="relative z-10 flex min-h-[600px]">

          {/* Birthday calligraphy – left side, full height */}
          <div
            className="shrink-0 self-stretch overflow-hidden"
            style={{ width: "150px" }}
          >
            <img
              src="/cumple-elegante/birthday.png"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover object-left"
              loading="eager"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>

          {/* Info block – bottom-right corner */}
          <div 
            className="flex flex-col self-end ml-auto pb-8 pl-4 pr-5"
            style={{ 
              width: "calc(100% - 150px)",
              containerType: "inline-size"
            }}
          >

            {/* Greeting */}
            {saludo && (
              <p
                className="mb-1 text-[0.95rem] text-[#555]"
                style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 400 }}
              >
                {saludo}
              </p>
            )}

            {/* Invite text */}
            {edad && (
              <p
                className="mb-2 text-[0.95rem] italic text-[#555]"
                style={{ fontFamily: "'Raleway', sans-serif", fontWeight: 400 }}
              >
                Acompáñame a celebrar mis {edad}
              </p>
            )}

            {/* Name */}
            {(() => {
              const words = nombre.split(" ")
              const maxWordLength = Math.max(...words.map(w => w.length))
              
              // Libre Baskerville is a wide serif font, so we use a conservative factor (125) 
              // to ensure even the widest letters fit.
              // We floor the value and cap the minimum divisor to 5.
              const cqiValue = Math.floor(125 / Math.max(maxWordLength, 5))
              const sizeClass = `clamp(1rem, ${cqiValue}cqi, 3rem)`

              return (
                <h1
                  className="mb-5 break-words leading-none tracking-wider"
                  style={{
                    fontFamily: "'Libre Baskerville', Georgia, serif",
                    fontWeight: 400,
                    fontSize: sizeClass,
                    color: accentColor,
                    textTransform: "uppercase",
                  }}
                >
                  {nombre}
                </h1>
              )
            })()}

            {/* Date: [day] | [day-name / day+month / year] */}
            <div className="flex items-start gap-3">
              {/* Day number */}
              <span
                className="leading-none"
                style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontWeight: 700,
                  fontSize: "clamp(2.1rem, 9vw, 2.6rem)",
                  color: "#333",
                }}
              >
                {dia}
              </span>

              {/* Vertical divider */}
              <div
                className="mt-0.5 self-stretch"
                style={{
                  width: "1px",
                  backgroundColor: accentColor,
                  opacity: 0.55,
                  minHeight: "2.4rem",
                }}
              />

              {/* Day name / day+month / year */}
              <div
                className="flex flex-col gap-[3px] uppercase leading-tight text-[#444]"
                style={{
                  fontFamily: "'Libre Baskerville', Georgia, serif",
                  fontWeight: 400,
                  fontSize: "0.82rem",
                  letterSpacing: "0.07em",
                }}
              >
                <span>{diaSemana}</span>
                <span>{dia} DE {mes}</span>
                <span>{año}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Photo – hero shadow falls over this ─────────────────────────── */}
      {foto && (
        <div className="relative z-0">
          <img
            src={foto.url}
            alt={nombre}
            className="w-full object-cover object-top"
            style={{ height: "420px" }}
            loading="eager"
          />
        </div>
      )}
    </>
  )
}
