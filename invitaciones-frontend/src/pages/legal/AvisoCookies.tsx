import { Link } from 'react-router-dom'
import { LegalLayout, LegalSection, LegalTable } from './LegalLayout'

export default function AvisoCookies() {
  return (
    <LegalLayout title="Aviso de Cookies" lastUpdated="04/04/2026">

      <LegalSection title="1. ¿Qué son las Cookies?">
        <p>
          Las cookies son pequeños archivos de texto que los sitios web almacenan en el navegador del usuario
          cuando este visita una página. Se utilizan para recordar preferencias, mantener sesiones activas y
          recopilar información técnica necesaria para el funcionamiento del sitio.
        </p>
        <p>
          Las cookies <strong>no contienen información personal identificable</strong> por sí mismas y no pueden
          ejecutar programas ni transmitir virus.
        </p>
      </LegalSection>

      <LegalSection title="2. ¿Qué Cookies Utilizamos?">
        <p>
          La Plataforma utiliza <strong>únicamente cookies técnicas estrictamente necesarias</strong> para su
          funcionamiento. No utilizamos cookies publicitarias, de seguimiento ni de analítica.
        </p>
        <LegalTable
          headers={['Nombre', 'Tipo', 'Duración', 'Finalidad']}
          rows={[
            [
              <code className="bg-champagne/40 px-1.5 py-0.5 rounded text-xs">cookie_consent</code>,
              'Técnica — Propia',
              '1 año',
              'Registra si el usuario ha aceptado el aviso de cookies para no mostrar el banner nuevamente',
            ],
            [
              <code className="bg-champagne/40 px-1.5 py-0.5 rounded text-xs">auth_token</code>,
              'Técnica — Propia',
              '24 horas',
              'Token JWT para la sesión del panel de administración. Solo se genera para el Administrador, nunca para Anfitriones ni Invitados',
            ],
          ]}
        />

        <h3 className="font-semibold text-charcoal mt-5 mb-2">Cookies de Terceros</h3>
        <LegalTable
          headers={['Proveedor', 'Tipo', 'Finalidad']}
          rows={[
            [
              <strong>Google Maps</strong>,
              'Funcional',
              <span>
                Google Maps puede instalar cookies propias al cargar el mapa embebido del evento. Su uso está sujeto a la{' '}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                  Política de Privacidad de Google
                </a>
              </span>,
            ],
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Cookies que NO Utilizamos">
        <p>La Plataforma <strong>no utiliza</strong> ninguno de los siguientes tipos de cookies:</p>
        <ul className="space-y-1 pl-2">
          <li className="flex items-start gap-2"><span className="text-[#c0392b] shrink-0">✗</span> Cookies de publicidad o seguimiento (<em>tracking</em>).</li>
          <li className="flex items-start gap-2"><span className="text-[#c0392b] shrink-0">✗</span> Cookies de analítica (Google Analytics u otras herramientas de medición).</li>
          <li className="flex items-start gap-2"><span className="text-[#c0392b] shrink-0">✗</span> Cookies de terceros con fines comerciales.</li>
          <li className="flex items-start gap-2"><span className="text-[#c0392b] shrink-0">✗</span> Cookies para elaborar perfiles de usuario o historial de navegación.</li>
          <li className="flex items-start gap-2"><span className="text-[#c0392b] shrink-0">✗</span> Cookies de redes sociales.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Base Legal">
        <p>
          El uso de cookies técnicas estrictamente necesarias se fundamenta en el <strong>interés legítimo</strong> del
          Administrador para garantizar el correcto funcionamiento técnico de la Plataforma, conforme a la Ley 25.326
          de Protección de Datos Personales de Argentina.
        </p>
        <p>
          Las cookies de terceros (Google Maps) están sujetas al consentimiento y a las políticas de privacidad del
          proveedor correspondiente.
        </p>
      </LegalSection>

      <LegalSection title="5. Gestión y Control de Cookies">
        <h3 className="font-semibold text-charcoal mb-2">5.1 Desde la Plataforma</h3>
        <p>
          Al ingresar por primera vez a la Plataforma, se mostrará un <strong>banner informativo</strong> en la
          parte inferior de la pantalla con:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Un texto breve explicando el uso de cookies técnicas.</li>
          <li>Un botón <strong>"Aceptar"</strong> para cerrar el banner y registrar el consentimiento.</li>
          <li>Un enlace <strong>"Más información"</strong> que dirige a esta página.</li>
        </ul>
        <p>Una vez aceptado, el banner no volverá a mostrarse en ese navegador.</p>

        <h3 className="font-semibold text-charcoal mt-4 mb-2">5.2 Desde la Configuración del Navegador</h3>
        <p>
          El usuario puede configurar su navegador para bloquear o eliminar cookies en cualquier momento.
          Tenga en cuenta que bloquear las cookies técnicas puede afectar el funcionamiento de la Plataforma.
        </p>
      </LegalSection>

      <LegalSection title="6. Actualizaciones de este Aviso">
        <p>
          Este Aviso de Cookies puede ser actualizado para reflejar cambios en los servicios ofrecidos o en la
          legislación aplicable. La fecha de última actualización siempre estará indicada al final de este documento.
        </p>
        <p>Le recomendamos revisar esta página periódicamente para estar informado sobre el uso de cookies.</p>
      </LegalSection>

      <LegalSection title="7. Más Información">
        <p>Para cualquier consulta sobre el uso de cookies o sobre la privacidad de sus datos:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Email:</strong> festeja.plataforma@gmail.com</li>
          <li><strong>WhatsApp Business:</strong> +543435083034</li>
        </ul>
        <p>
          Puede consultar también nuestra{' '}
          <Link to="/privacidad" className="text-gold hover:underline">Política de Privacidad</Link>{' '}
          para información completa sobre el tratamiento de datos personales.
        </p>
      </LegalSection>

    </LegalLayout>
  )
}
