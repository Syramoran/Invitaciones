import { LegalLayout, LegalSection } from './LegalLayout'

export default function Disclaimer() {
  return (
    <LegalLayout title="Disclaimer / Aviso Legal" lastUpdated="04/04/2026">

      <LegalSection title="1. Naturaleza del Servicio">
        <p>
          La Plataforma <strong>festejá</strong> es un servicio de creación de invitaciones digitales personalizadas
          para eventos sociales. La Plataforma actúa exclusivamente como intermediaria tecnológica y{' '}
          <strong>no organiza, produce ni coordina los eventos en sí mismos</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Disclaimer de Música y Derechos de Autor">
        <p>
          La Plataforma ofrece un reproductor de música como servicio adicional. El Administrador provee únicamente
          la <strong>funcionalidad técnica del reproductor</strong> (reproducción de archivos MP3 con controles de
          play, pausa y volumen).
        </p>
        <p>
          <strong>El Anfitrión es el único responsable</strong> de garantizar que posee las licencias, permisos o
          autorizaciones necesarias para el uso de la música subida a la Plataforma, de acuerdo con la{' '}
          <strong>Ley 11.723 de Propiedad Intelectual de Argentina</strong> y normativas internacionales de derechos
          de autor. La Plataforma no verifica ni controla los derechos de autor de los archivos MP3 cargados.
        </p>
      </LegalSection>

      <LegalSection title="3. Disclaimer de Galería de Fotos y Derechos de Imagen">
        <p>
          La galería de fotos es una funcionalidad colaborativa donde cualquier persona con acceso al código QR o
          a la URL de la galería puede subir imágenes.
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>El Administrador no modera el contenido de forma automática ni preventiva.</li>
          <li>El Administrador puede eliminar fotos que constituyan una infracción de derechos de imagen o propiedad intelectual.</li>
          <li>El Administrador no es responsable por el contenido fotográfico cargado por los Invitados.</li>
        </ul>
        <p>
          <strong>El Anfitrión es responsable</strong> de contar con el consentimiento de las personas fotografiadas
          para la publicación de imágenes en la galería compartida.
        </p>
      </LegalSection>

      <LegalSection title="4. Disclaimer de Disponibilidad del Servicio">
        <p>
          Si bien el Administrador se esfuerza por mantener un SLA del <strong>99,5% de uptime anual</strong>,
          la Plataforma puede experimentar interrupciones por:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Mantenimiento programado o de emergencia.</li>
          <li>Fallas en proveedores de infraestructura (Vercel, Railway, Firebase, Google Cloud).</li>
          <li>Eventos de fuerza mayor.</li>
        </ul>
        <p>
          El Administrador no es responsable por la cancelación, cambio de horario o cualquier inconveniente
          relacionado con el evento en sí mismo.
        </p>
      </LegalSection>

      <LegalSection title="5. Limitación de Responsabilidad">
        <p>
          La Plataforma se proporciona <strong>"tal cual" ("as is")</strong>. En ningún caso la responsabilidad
          del Administrador excederá el monto pagado por el Anfitrión por la invitación en cuestión.
        </p>
        <p>El Administrador no es responsable por:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Daños indirectos, incidentales o consecuentes derivados del uso de la Plataforma.</li>
          <li>El contenido cargado por los Anfitriones o Invitados (fotos, música, textos).</li>
          <li>Errores en la geolocalización proporcionada por Google Maps.</li>
          <li>Interrupciones del servicio de Google Maps, Firebase, Vercel u otros proveedores externos.</li>
        </ul>
      </LegalSection>

      <LegalSection title="6. Jurisdicción">
        <p>
          Este aviso legal se rige por las leyes de la <strong>República Argentina</strong>. Cualquier controversia
          será sometida a la jurisdicción de los{' '}
          <strong>tribunales ordinarios de la provincia de Entre Ríos</strong>, Argentina.
        </p>
      </LegalSection>

      <LegalSection title="7. Contacto">
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Email:</strong> festeja.plataforma@gmail.com</li>
          <li><strong>WhatsApp Business:</strong> +54 343 5083034</li>
        </ul>
      </LegalSection>

    </LegalLayout>
  )
}
