import { Link } from 'react-router-dom'
import { LegalLayout, LegalSection, LegalTable } from './LegalLayout'

export default function PoliticaPrivacidad() {
  return (
    <LegalLayout title="Política de Privacidad" lastUpdated="04/04/2026">

      <p className="text-[0.925rem] font-light leading-relaxed text-charcoal-soft bg-ivory border border-champagne-dark rounded-xl px-5 py-4">
        Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos los datos personales
        de quienes utilizan la Plataforma, en cumplimiento de la{' '}
        <strong>Ley 25.326 de Protección de Datos Personales</strong> de la República Argentina.
      </p>

      <LegalSection title="1. Responsable del Tratamiento de Datos">
        <p>El responsable del tratamiento de los datos personales recopilados a través de la Plataforma es:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Titular:</strong> Syra Moran</li>
          <li><strong>Domicilio:</strong> Provincia de Entre Ríos, República Argentina</li>
          <li><strong>Email de contacto:</strong> festeja.plataforma@gmail.com</li>
          <li><strong>WhatsApp Business:</strong> +543435083034</li>
          <li>
            <strong>Autoridad de control:</strong> Agencia de Acceso a la Información Pública (AAIP) —{' '}
            <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
              www.argentina.gob.ar/aaip
            </a>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Datos que Recopilamos">
        <h3 className="font-semibold text-charcoal mb-2">2.1 Datos del Anfitrión (Formulario de Pedido)</h3>
        <LegalTable
          headers={['Dato', 'Tipo', 'Finalidad']}
          rows={[
            ['Nombre completo', 'Obligatorio', 'Identificación para coordinación del servicio'],
            ['Teléfono', 'Obligatorio', 'Contacto por WhatsApp Business'],
            ['Correo electrónico', 'Obligatorio', 'Notificaciones del sistema (pedido, expiración, eliminación)'],
            ['Configuración elegida', 'Automático', 'Tipo de evento, template, servicios seleccionados y precio'],
          ]}
        />

        <h3 className="font-semibold text-charcoal mt-5 mb-2">2.2 Datos de los Invitados</h3>
        <LegalTable
          headers={['Dato', 'Origen', 'Finalidad']}
          rows={[
            ['Nombre y apellido', 'Proporcionado por el Anfitrión', 'Generación de URLs personalizadas y saludo en la invitación'],
            ['Confirmación de asistencia', 'Voluntario (acción del Invitado)', 'Registro de asistencia al evento'],
            ['Fotos subidas', 'Voluntario (acción del Invitado)', 'Galería compartida del evento'],
          ]}
        />
        <p className="text-sm italic">
          Los datos de los Invitados son proporcionados por el Anfitrión, quien asume la responsabilidad de haber
          obtenido el consentimiento correspondiente.
        </p>

        <h3 className="font-semibold text-charcoal mt-5 mb-2">2.3 Datos Técnicos (Recopilación Automática)</h3>
        <p>La Plataforma puede recopilar automáticamente los siguientes datos técnicos:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Dirección IP:</strong> Para rate limiting y seguridad (protección contra abuso).</li>
          <li><strong>Tipo de navegador y dispositivo:</strong> Para compatibilidad y diagnóstico técnico.</li>
          <li><strong>Cookies técnicas:</strong> Necesarias para el funcionamiento del servicio (ver{' '}
            <Link to="/cookies" className="text-gold hover:underline">Aviso de Cookies</Link>).
          </li>
        </ul>
        <p><strong>No recopilamos datos de navegación, perfiles de usuario ni datos con fines publicitarios.</strong></p>
      </LegalSection>

      <LegalSection title="3. Base Legal para el Tratamiento">
        <p>
          El tratamiento de datos personales se basa en las siguientes bases legales, conforme al artículo 5 de la
          Ley 25.326:
        </p>
        <LegalTable
          headers={['Base Legal', 'Aplicación']}
          rows={[
            [<strong>Consentimiento explícito</strong>, 'El Anfitrión otorga consentimiento al aceptar estos términos mediante el checkbox en el formulario de pedido'],
            [<strong>Ejecución contractual</strong>, 'Los datos son necesarios para la prestación del servicio solicitado'],
            [<strong>Interés legítimo</strong>, 'Datos técnicos (IP, cookies) para la seguridad y funcionamiento de la Plataforma'],
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Retención de Datos">
        <LegalTable
          headers={['Tipo de Dato', 'Período de Retención', 'Acción al Vencer']}
          rows={[
            ['Invitación y datos asociados', '3 meses post-evento', 'Eliminación definitiva (hard delete) de base de datos'],
            ['Galería de fotos', '3 meses post-evento', 'Eliminación definitiva de Storage'],
            ['Datos de Invitados', '3 meses post-evento', 'Eliminación por cascada desde la Invitación'],
            ['Datos de pedidos', 'Indefinido', 'Conservados como historial comercial del Administrador'],
            ['Logs de eliminación', '6 meses', 'Eliminación automática por proceso programado'],
          ]}
        />
        <p>
          La eliminación automática se ejecuta diariamente a las <strong>02:00 AM (hora de Argentina)</strong>.
          El Anfitrión recibirá notificaciones preventivas por email <strong>7 días y 3 días antes</strong> de la
          eliminación de su invitación y galería.
        </p>
      </LegalSection>

      <LegalSection title="5. Derechos del Titular de los Datos">
        <p>Conforme a la Ley 25.326, el titular de los datos tiene los siguientes derechos:</p>
        <ol className="list-decimal list-inside space-y-1 pl-2">
          <li><strong>Acceso:</strong> Solicitar información sobre los datos personales almacenados que le conciernen.</li>
          <li><strong>Rectificación:</strong> Solicitar la corrección de datos inexactos o incompletos.</li>
          <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos personales cuando ya no sean necesarios para la finalidad que motivó su recolección.</li>
          <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos en determinadas circunstancias.</li>
        </ol>
        <p>
          Para ejercer cualquiera de estos derechos, el titular puede contactarse a través de{' '}
          <strong>festeja.plataforma@gmail.com</strong>. La solicitud será atendida en un plazo máximo de{' '}
          <strong>30 días hábiles</strong>.
        </p>
      </LegalSection>

      <LegalSection title="6. Derechos Adicionales para Usuarios de la Unión Europea (GDPR)">
        <p>
          En caso de que usuarios residentes en la Unión Europea accedan a la Plataforma, se garantizan
          adicionalmente los siguientes derechos conforme al Reglamento General de Protección de Datos
          (GDPR — Reglamento UE 2016/679):
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Derecho de portabilidad de datos:</strong> Recibir sus datos en un formato estructurado y de uso común.</li>
          <li><strong>Derecho a la limitación del tratamiento:</strong> Solicitar que el tratamiento de sus datos sea restringido en ciertos supuestos.</li>
          <li><strong>Mecanismo de solicitud de eliminación accesible:</strong> A través de los canales de contacto indicados.</li>
        </ul>
      </LegalSection>

      <LegalSection title="7. Compartición de Datos con Terceros">
        <p>
          La Plataforma <strong>NO vende, alquila ni comparte datos personales con terceros con fines comerciales.</strong>
        </p>
        <p>
          Los datos pueden ser compartidos únicamente con los siguientes proveedores de infraestructura,
          estrictamente necesarios para la prestación del servicio:
        </p>
        <LegalTable
          headers={['Proveedor', 'Propósito', 'Política de Privacidad']}
          rows={[
            ['Cloudflare R2', 'Almacenamiento de archivos (fotos y música MP3)', '—'],
            ['Vercel', 'Hosting del frontend (React)', <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">vercel.com/legal/privacy-policy</a>],
            ['Railway', 'Hosting del backend (API)', <a href="https://railway.app/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">railway.app/legal/privacy</a>],
            ['Hostinger', 'Hosting de base de datos PostgreSQL', <a href="https://www.hostinger.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">hostinger.com/privacy-policy</a>],
            ['Autoridades legales', 'Cuando sea requerido por ley o por orden judicial', '—'],
          ]}
        />
        <p>
          Todos los proveedores mencionados cuentan con políticas de privacidad propias y están sujetos a sus
          respectivas normativas de protección de datos.
        </p>
      </LegalSection>

      <LegalSection title="8. Medidas de Seguridad">
        <p>
          La Plataforma implementa las siguientes medidas técnicas y organizativas para proteger los datos personales:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Transmisión cifrada:</strong> HTTPS/TLS obligatorio en todos los endpoints.</li>
          <li><strong>Tokens JWT:</strong> Para autenticación del panel de administración.</li>
          <li><strong>Rate limiting:</strong> Máximo 100 peticiones por minuto por IP para prevenir abusos.</li>
          <li><strong>URLs únicas:</strong> Generadas con UUID v4 para evitar que sean adivinables.</li>
          <li><strong>Validación estricta:</strong> Todos los datos de entrada se validan en el frontend y en el backend.</li>
          <li><strong>Sanitización HTML:</strong> Limpieza de etiquetas y scripts maliciosos en campos de texto.</li>
          <li><strong>CORS restringido:</strong> Solo los dominios autorizados pueden realizar peticiones al backend.</li>
          <li><strong>Cabeceras de seguridad (Helmet):</strong> Content-Security-Policy, X-Content-Type-Options, X-Frame-Options.</li>
          <li><strong>Backups automáticos:</strong> Semanales para base de datos, galería e información de invitaciones.</li>
        </ul>
      </LegalSection>

      <LegalSection title="9. Cookies">
        <p>
          La Plataforma utiliza únicamente <strong>cookies técnicas estrictamente necesarias</strong> para su
          funcionamiento. No utiliza cookies de publicidad, seguimiento ni analítica.
        </p>
        <p>
          Para información detallada, consulte nuestro{' '}
          <Link to="/cookies" className="text-gold hover:underline">Aviso de Cookies</Link>.
        </p>
      </LegalSection>

      <LegalSection title="10. Transferencia Internacional de Datos">
        <p>
          Los datos almacenados en Cloudflare R2 pueden ser procesados en servidores ubicados fuera de Argentina.
        </p>
      </LegalSection>

      <LegalSection title="11. Cambios en esta Política">
        <p>
          El Administrador se reserva el derecho de modificar esta Política de Privacidad en cualquier momento.
          Los cambios entrarán en vigencia al ser publicados en la Plataforma, con la actualización de la fecha
          indicada al final del documento. Se recomienda revisar esta página periódicamente.
        </p>
      </LegalSection>

      <LegalSection title="12. Contacto y Consultas sobre Privacidad">
        <p>Para consultas, solicitudes o reclamos relacionados con la protección de sus datos personales:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Email:</strong> festeja.plataforma@gmail.com</li>
          <li><strong>WhatsApp Business:</strong> +543435083034</li>
          <li>
            <strong>Autoridad de control:</strong> Agencia de Acceso a la Información Pública (AAIP) —{' '}
            <a href="https://www.argentina.gob.ar/aaip" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
              www.argentina.gob.ar/aaip
            </a>
          </li>
        </ul>
      </LegalSection>

    </LegalLayout>
  )
}
