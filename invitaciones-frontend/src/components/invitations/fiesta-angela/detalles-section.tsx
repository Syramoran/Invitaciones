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
  aliasUsd?: string
  cbu?: string
  cvu?: string
  cbuUsd?: string
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

function CuentaCard({
  titulo,
  alias,
  cbu,
}: {
  titulo: string
  alias?: string
  cbu?: string
}) {
  const [copiado, setCopiado] = useState(false)

  if (!alias && !cbu) return null

  const texto = [alias && `Alias: ${alias}`, cbu && `CBU/CVU: ${cbu}`].filter(Boolean).join('\n')

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      // silent
    }
  }

  return (
    <div className="flex w-full flex-col items-start gap-4 text-left">
      <p style={{ ...TYPO.text3, color: COLOR.brown }}>{titulo}</p>
      <div className="flex flex-col gap-2" style={{ color: COLOR.brown }}>
        {alias && (
          <span style={{ ...TYPO.text }}>
            Alias: <span className="break-all">{alias}</span>
          </span>
        )}
        {cbu && (
          <span style={{ ...TYPO.text }}>
            CBU/CVU: <span className="break-all">{cbu}</span>
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={copiar}
        aria-label={`Copiar datos de ${titulo}`}
        className="cursor-pointer rounded px-4 py-2 transition-opacity hover:opacity-70"
        style={{ backgroundColor: COLOR.crema, color: COLOR.darkBrown, ...TYPO.text3 }}
      >
        {copiado ? 'Copiado' : 'Copiar datos'}
      </button>
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
              className="flex flex-col items-start gap-4 pb-8 text-left"
              style={{ ...TYPO.h4, color: COLOR.brown }}
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
  const aliasUsd = campos.aliasUsd
  const cbu = campos.cbu || campos.cvu
  const cbuUsd = campos.cbuUsd

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
          {(alias || cbu || aliasUsd || cbuUsd) && (
            <>
              <p className='py-4'>Si además quisieras hacernos otro, te dejamos esta manera de hacerlo</p>
              <div className="flex w-full flex-col gap-8">
                <CuentaCard titulo="Cuenta en pesos" alias={alias} cbu={cbu} />
                <CuentaCard titulo="Cuenta en dólares" alias={aliasUsd} cbu={cbuUsd} />
              </div>
            </>
          )}
        </AccordionRow>

        <AccordionRow id="puntualidad" label="Puntualidad" open={openId === 'puntualidad'} onToggle={() => toggle('puntualidad')}>
          <p>Se ruega puntualidad</p>
        </AccordionRow>

        <AccordionRow id="movilidad" label="Movilidad" open={openId === 'movilidad'} onToggle={() => toggle('movilidad')}>
          <p>El lugar queda cerca, así que te aconsejamos ir en uber</p>
        </AccordionRow>
      </Reveal>
    </section>
  )
}
