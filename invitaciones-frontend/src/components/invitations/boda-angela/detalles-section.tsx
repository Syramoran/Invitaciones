import { useState } from 'react'
import type { ReactNode } from 'react'
import type { InvitacionPublica } from '@/types/invitation'
import { Reveal } from './reveal'
import { COLOR, TYPO } from './theme'

interface DetallesSectionProps {
  invitacion: InvitacionPublica
}

interface CamposGift {
  alias?: string
  cbu?: string
  cvu?: string
}

function PlusIcon({ isOpen }: { isOpen: boolean }) {
  const bar =
    'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out-expo'
  return (
    <span aria-hidden="true" className="relative inline-block h-5 w-5 shrink-0">
      <span
        className={`${bar} h-5 w-px ${isOpen ? 'scale-y-0 opacity-0' : 'scale-y-100 opacity-100'}`}
        style={{ backgroundColor: COLOR.darkBrown }}
      />
      <span className={`${bar} h-px w-5`} style={{ backgroundColor: COLOR.darkBrown }} />
    </span>
  )
}

function CopyField({ label, value }: { label: string; value: string }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // silent
    }
  }

  return (
    <div className="flex w-full items-center justify-between gap-4">
      <div className="flex flex-col" style={{ color: COLOR.brown }}>
        <span style={{ ...TYPO.text3 }}>{label}</span>
        <span className="break-all" style={{ ...TYPO.text }}>{value}</span>
      </div>
      <button
        type="button"
        onClick={copiar}
        aria-label={`Copiar ${label}`}
        className="shrink-0 cursor-pointer rounded px-4 py-2 transition-opacity hover:opacity-70"
        style={{ backgroundColor: COLOR.crema, color: COLOR.darkBrown, ...TYPO.text3 }}
      >
        {copiado ? 'Copiado' : 'Copiar'}
      </button>
    </div>
  )
}

function ColorPalette({ colors }: { colors: string[] }) {
  return (
    <div className="flex">
      {colors.map((color, i) => (
        <div
          key={color}
          style={{
            backgroundColor: color,
            width: 48,
            height: 72,
            borderRadius: 8,
            marginLeft: i === 0 ? 0 : -6,
            border: `2px solid ${COLOR.parchment}`,
          }}
        />
      ))}
    </div>
  )
}

function AccordionRow({
  id,
  label,
  open,
  onToggle,
  children,
}: {
  id: string
  label: string
  open: boolean
  onToggle: () => void
  children?: ReactNode
}) {
  return (
    <div style={{ borderBottom: `1px solid #D3CBC5` }}>
      <button
        type="button"
        id={`detalles-btn-${id}`}
        aria-expanded={open}
        aria-controls={`detalles-panel-${id}`}
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent py-5 outline-none"
      >
        <span style={{ ...TYPO.detailsH, color: COLOR.darkBrown }}>{label}</span>
        <PlusIcon isOpen={open} />
      </button>

      <div
        id={`detalles-panel-${id}`}
        role="region"
        aria-labelledby={`detalles-btn-${id}`}
        className="grid transition-[grid-template-rows] duration-300 ease-out-expo"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          {children && (
            <div
              className="flex flex-col items-start gap-8 pb-8 text-left"
              style={{ ...TYPO.h3, color: COLOR.brown }}
            >
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function DetallesSection({ invitacion }: DetallesSectionProps) {
  const campos = (invitacion.camposEspecificos ?? {}) as CamposGift
  const alias = campos.alias
  const cbu = campos.cbu || campos.cvu

  const [openId, setOpenId] = useState<string | null>(null)

  const toggle = (id: string) => setOpenId((prev) => (prev === id ? null : id))

  return (
    <section aria-labelledby="detalles-titulo" className="flex flex-col items-center gap-12 px-7 py-40">
      <Reveal>
        <h2 id="detalles-titulo" className="text-center" style={{ ...TYPO.h1, lineHeight: '1', color: COLOR.negro }}>
          Los detalles
        </h2>
      </Reveal>

      <Reveal>
        <p className="text-center" style={{ ...TYPO.h3, color: COLOR.brown }}>
          Pequeñas cosas
          <br />
          para tener en cuenta
        </p>
      </Reveal>

      <Reveal className="w-full max-w-[400px]">
        <AccordionRow id="ninos" label="Niños" open={openId === 'ninos'} onToggle={() => toggle('ninos')}>
          <p className='py-4'>Adoramos a los más chicos, pero será una celebración exclusiva para adultos</p>
        </AccordionRow>

        <AccordionRow id="regalos" label="Regalos" open={openId === 'regalos'} onToggle={() => toggle('regalos')}>
          <p className='py-4'>Tu presencia es nuestro más valioso regalo</p>
          {(alias || cbu) && (
            <>
              <p className='py-4'>Si además quisieras hacernos otro regalo te dejamos esta manera de hacerlo</p>
              <p className='py-4' style={{ color: COLOR.brown }}>Info de cuenta</p>
              <div className="flex w-full flex-col gap-4">
                {alias && <CopyField label="Alias" value={alias} />}
                {cbu && <CopyField label="CBU" value={cbu} />}
              </div>
            </>
          )}
        </AccordionRow>

        <AccordionRow id="puntualidad" label="Puntualidad" open={openId === 'puntualidad'} onToggle={() => toggle('puntualidad')}>
          <p>Se ruega puntualidad especialmente para la ceremonia</p>
        </AccordionRow>

        <AccordionRow id="dresscode" label="Dresscode" open={openId === 'dresscode'} onToggle={() => toggle('dresscode')}>
          {/* MUJERES Y ACLARACIÓN */}
          <div className="flex flex-col gap-12 py-6 w-full">
            <p className="w-fit" style={{ ...TYPO.h3, color: COLOR.brown, paddingBottom: 6, borderBottom: '1px solid #D3CBC5' }}>Mujeres</p>
            <p>Elegante,<br />Largo y liso</p>
            <p>Sin estampas y del terracota al negro, cualquier tono en esta gama es bienvenido</p>
            <ColorPalette colors={['#a65f3c', '#898174', '#6f7a49', '#458d77', '#476a9c', '#1e2a45', '#584b86', '#492c45', '#151515']} />

            {/* Aclaración */}
            <p style={{ ...TYPO.text, color: COLOR.brown, textTransform: 'none', letterSpacing: 'normal' }}>
              Aclaración:<br />
              Blanco y colores muy claros están<br />
              reservados para la novia
            </p>
          </div>

          {/* HOMBRES */}
          <div className="flex flex-col gap-12 py-6 w-full">
            <p className="w-fit" style={{ ...TYPO.h3, color: COLOR.brown, paddingBottom: 6, borderBottom: '1px solid #D3CBC5' }}>Hombres</p>
            <p>Elegante</p>
            <p>Colores oscuros:<br />azul, marrones, gris y negro</p>
            <ColorPalette colors={['#1D2B45', '#58422d', '#8e8e93', '#000000']} />
          </div>
        </AccordionRow>
      </Reveal>
    </section>
  )
}
