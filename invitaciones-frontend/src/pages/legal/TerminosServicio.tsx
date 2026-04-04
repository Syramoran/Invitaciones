import { LegalLayout, LegalSection, LegalCallout, LegalTable } from './LegalLayout'

export default function TerminosServicio() {
  return (
    <LegalLayout title="Términos de Servicio" lastUpdated="04/04/2026">

      <LegalSection title="1. Aceptación de los Términos">
        <p>
          Al acceder y utilizar la plataforma web de Invitaciones Digitales (en adelante, <strong>"la Plataforma"</strong>),
          el usuario acepta quedar vinculado por los presentes Términos de Servicio. La Plataforma es operada por su
          propietario (en adelante, <strong>"el Administrador"</strong>).
        </p>
        <p>
          El uso continuado de la Plataforma después de cualquier modificación a estos Términos implica la aceptación
          de los nuevos términos vigentes.
        </p>
      </LegalSection>

      <LegalSection title="2. Descripción del Servicio">
        <p>
          La Plataforma permite a los usuarios (en adelante, <strong>"Anfitriones"</strong>) solicitar la creación de
          invitaciones digitales personalizadas para eventos. El servicio incluye:
        </p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>Exploración de tipos de eventos y templates disponibles en el catálogo.</li>
          <li>Configuración de servicios opcionales (cuenta regresiva, música, galería de fotos, confirmación de asistencia, entre otros).</li>
          <li>Cálculo dinámico de precios según los servicios seleccionados.</li>
          <li>Envío de solicitud de pedido y coordinación directa con el Administrador.</li>
          <li>Creación y entrega de la invitación digital con URL única.</li>
          <li>Acceso temporal a la invitación, galería de fotos y funcionalidades asociadas durante el período de retención.</li>
        </ol>
        <p className="font-medium text-charcoal">
          La Plataforma actúa como intermediaria tecnológica y no organiza, produce ni coordina los eventos en sí mismos.
        </p>
      </LegalSection>

      <LegalSection title="3. Registro y Acceso">
        <p>La Plataforma <strong>no requiere registro de cuenta</strong> para los Anfitriones ni para los Invitados.</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>El <strong>Anfitrión</strong> solicita el servicio mediante el formulario de pedido, proporcionando nombre, teléfono y correo electrónico.</li>
          <li>Los <strong>Invitados</strong> acceden a las invitaciones a través de URLs únicas sin necesidad de autenticación.</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Precios y Pagos">
        <p>Los precios de los servicios se muestran en pesos argentinos (ARS).</p>
        <LegalCallout>
          <strong>⚠️ Importante:</strong> Los pagos <strong>no se procesan dentro de la Plataforma</strong>. Toda transacción
          económica se realiza fuera del sistema, mediante transferencia bancaria u otros medios acordados directamente
          con el Administrador a través de WhatsApp Business.
        </LegalCallout>
        <p>
          El Administrador se reserva el derecho de modificar los precios publicados. Los cambios no afectarán
          pedidos ya confirmados y coordinados.
        </p>
      </LegalSection>

      <LegalSection title="5. Proceso de Pedido y Coordinación">
        <p>El flujo de compra es el siguiente:</p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li>El Anfitrión configura su invitación en el catálogo y completa el formulario de pedido.</li>
          <li>El sistema envía una notificación al Administrador.</li>
          <li>El Administrador contacta al Anfitrión por WhatsApp para acordar detalles, información del evento y el pago.</li>
          <li>Una vez confirmado el pago, el Administrador crea la invitación desde el panel de administración.</li>
          <li>El sistema genera la URL única y el Administrador la entrega al Anfitrión.</li>
        </ol>
        <p className="font-medium text-charcoal">
          El Administrador se reserva el derecho de rechazar o cancelar un pedido si lo considera necesario,
          comunicando los motivos al Anfitrión.
        </p>
      </LegalSection>

      <LegalSection title="6. Duración y Eliminación de Datos">
        <p>
          Las invitaciones digitales y todos los datos asociados (galería de fotos, confirmaciones de asistencia,
          archivos de música, secciones de historia) se conservan por un <strong>período máximo de 3 meses
          posteriores a la fecha del evento</strong>.
        </p>
        <p>Transcurrido dicho plazo:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Un proceso automatizado ejecuta la <strong>eliminación definitiva</strong> de todos los datos de la invitación.</li>
          <li>Se enviarán notificaciones por email al Anfitrión con <strong>7 días</strong> y <strong>3 días de anticipación</strong> para que descargue las fotos de la galería antes de la eliminación.</li>
        </ul>
        <LegalCallout>
          <strong>⚠️ La eliminación es irreversible.</strong> El Administrador no podrá recuperar datos una vez ejecutado
          el proceso automático. Es responsabilidad del Anfitrión descargar su contenido dentro del plazo indicado.
        </LegalCallout>
      </LegalSection>

      <LegalSection title="7. Responsabilidades del Anfitrión">
        <p>El Anfitrión es responsable de:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Proporcionar <strong>información veraz y correcta</strong> en el formulario de pedido y en la configuración de la invitación.</li>
          <li>Obtener el <strong>consentimiento de los invitados</strong> para el uso de sus nombres en las URLs personalizadas.</li>
          <li>Garantizar que posee las <strong>licencias necesarias para la música</strong> subida a la invitación (archivos MP3), de acuerdo con la Ley 11.723 de Propiedad Intelectual de Argentina y normativas internacionales de derechos de autor.</li>
          <li>Garantizar que posee los <strong>derechos de imagen</strong> de las personas fotografiadas en las fotos cargadas.</li>
          <li><strong>Descargar las fotos de la galería</strong> dentro del plazo de retención de 3 meses.</li>
          <li>No utilizar la Plataforma para fines ilícitos o contrarios a la legislación argentina vigente.</li>
        </ul>
      </LegalSection>

      <LegalSection title="8. Responsabilidades del Administrador">
        <p>El Administrador se compromete a:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Crear la invitación según las especificaciones acordadas con el Anfitrión.</li>
          <li>Mantener la disponibilidad de la Plataforma.</li>
          <li>Proteger los datos personales conforme a la <strong>Ley 25.326</strong> de Protección de Datos Personales de Argentina.</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Política de Reintegros por Incidentes">
        <LegalTable
          headers={['Tipo de Problema', 'Reintegro']}
          rows={[
            ['Problemas externos al Administrador (caída de proveedor, falla de terceros inevitables)', '30% del valor de la invitación'],
            ['Problemas atribuibles al Administrador (error de configuración, bug)', '50% del valor de la invitación'],
          ]}
        />
        <p>
          Los reintegros se aplican únicamente a incidentes que afecten la disponibilidad o funcionalidad de la
          invitación durante el período del evento. No se aplican reintegros por interrupciones de servicios de
          terceros fuera del control del Administrador (Google Maps, Firebase, Vercel, etc.).
        </p>
      </LegalSection>

      <LegalSection title="10. Limitación de Responsabilidad">
        <p>
          La Plataforma se proporciona <strong>"tal cual" ("as is")</strong>. El Administrador no garantiza que el
          servicio sea ininterrumpido ni libre de errores. En ningún caso la responsabilidad del Administrador
          excederá el <strong>monto pagado por el Anfitrión</strong> por la invitación en cuestión.
        </p>
        <p>El Administrador no es responsable por:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Daños indirectos, incidentales o consecuentes derivados del uso de la Plataforma.</li>
          <li>El contenido cargado por los Anfitriones o Invitados (fotos, música, textos).</li>
          <li>La cancelación, cambio de horario o ubicación del evento.</li>
          <li>Errores en la geolocalización proporcionada por Google Maps.</li>
          <li>Interrupciones del servicio de Google Maps, Firebase, Vercel u otros proveedores externos.</li>
        </ul>
      </LegalSection>

      <LegalSection title="11. Propiedad Intelectual">
        <p>
          Los diseños de templates, el código fuente, la interfaz de usuario y todos los elementos gráficos de la
          Plataforma son <strong>propiedad del Administrador</strong>. El Anfitrión recibe una{' '}
          <strong>licencia limitada y temporal</strong> para el uso de la invitación durante el período de retención
          (3 meses post-evento).
        </p>
        <p>
          El Anfitrión conserva la propiedad de las fotos, textos y archivos que cargue en la Plataforma, otorgando
          al Administrador una licencia de uso temporal únicamente para la prestación del servicio.
        </p>
      </LegalSection>

      <LegalSection title="12. Disclaimer de Música y Licencias">
        <p>
          La Plataforma ofrece un reproductor de música como servicio adicional. El Administrador provee únicamente
          la <strong>funcionalidad técnica del reproductor</strong> (reproducción de archivos MP3 con controles de
          play, pausa y volumen).
        </p>
        <p>
          <strong>El Anfitrión es el único responsable</strong> de garantizar que posee las licencias, permisos o
          autorizaciones necesarias para el uso de la música subida a la Plataforma. La Plataforma no verifica,
          controla ni asume responsabilidad alguna sobre los derechos de autor de los archivos MP3 cargados por
          los usuarios.
        </p>
      </LegalSection>

      <LegalSection title="13. Disclaimer de Galería de Fotos">
        <p>
          La galería de fotos es una funcionalidad colaborativa donde cualquier persona con acceso al código QR o
          a la URL de la galería puede subir imágenes. El Administrador:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>No modera el contenido de forma automática ni preventiva.</li>
          <li>Puede eliminar fotos que, a su criterio, constituyan una infracción de derechos de imagen, propiedad intelectual u otras normativas aplicables.</li>
          <li>No es responsable por el contenido fotográfico cargado por los Invitados.</li>
        </ul>
        <p>
          El Anfitrión es responsable de contar con el consentimiento de las personas fotografiadas para la
          publicación de las imágenes en la galería compartida.
        </p>
      </LegalSection>

      <LegalSection title="14. Disclaimer de Disponibilidad del Servicio">
        <p>
          Si bien el Administrador se esfuerza por mantener un SLA del 99,5% de uptime anual, la Plataforma puede
          experimentar interrupciones por:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Mantenimiento programado o de emergencia.</li>
          <li>Fallas en proveedores de infraestructura (Vercel, Railway, Firebase, Google Cloud).</li>
          <li>Eventos de fuerza mayor.</li>
        </ul>
        <p>
          En caso de caída del servidor, se mostrará una <strong>página de mantenimiento estática</strong> con
          información de contacto. Las invitaciones previamente cacheadas podrán visualizarse en su última
          versión conocida.
        </p>
      </LegalSection>

      <LegalSection title="15. Modificaciones a los Términos">
        <p>
          El Administrador se reserva el derecho de modificar estos Términos de Servicio en cualquier momento.
          Los cambios entrarán en vigencia al ser publicados en la Plataforma.{' '}
          <strong>El uso continuado de la Plataforma después de las modificaciones implica la aceptación de los
          nuevos términos.</strong>
        </p>
      </LegalSection>

      <LegalSection title="16. Jurisdicción y Ley Aplicable">
        <p>
          Estos Términos se rigen por las leyes de la <strong>República Argentina</strong>. Cualquier controversia
          será sometida a la jurisdicción de los <strong>tribunales ordinarios de la provincia de Entre Ríos</strong>,
          Argentina.
        </p>
      </LegalSection>

      <LegalSection title="17. Contacto">
        <p>Para consultas sobre estos Términos de Servicio:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>WhatsApp Business:</strong> +54 343 5083034</li>
          <li><strong>Email:</strong> festeja.plataforma@gmail.com</li>
        </ul>
      </LegalSection>

    </LegalLayout>
  )
}
