# Política de Privacidad

---

> Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos los datos personales de quienes utilizan la Plataforma, en cumplimiento de la **Ley 25.326 de Protección de Datos Personales** de la República Argentina.

---

## 1. Responsable del Tratamiento de Datos

El responsable del tratamiento de los datos personales recopilados a través de la Plataforma es:

- **Titular:** Syra Moran
- **Domicilio:** Provincia de Entre Ríos, República Argentina
- **Email de contacto:** festeja.plataforma@gmail.com
- **WhatsApp Business:** +543435083034
- **Autoridad de control:** Agencia de Acceso a la Información Pública (AAIP) — [www.argentina.gob.ar/aaip](https://www.argentina.gob.ar/aaip)

---

## 2. Datos que Recopilamos

### 2.1 Datos del Anfitrión (Formulario de Pedido)

| Dato | Tipo | Finalidad |
|---|---|---|
| Nombre completo | Obligatorio | Identificación para coordinación del servicio |
| Teléfono | Obligatorio | Contacto por WhatsApp Business |
| Correo electrónico | Obligatorio | Notificaciones del sistema (pedido, expiración, eliminación) |
| Configuración elegida | Automático | Tipo de evento, template, servicios seleccionados y precio |

### 2.2 Datos de los Invitados

| Dato | Origen | Finalidad |
|---|---|---|
| Nombre y apellido | Proporcionado por el Anfitrión | Generación de URLs personalizadas y saludo en la invitación |
| Confirmación de asistencia | Voluntario (acción del Invitado) | Registro de asistencia al evento |
| Fotos subidas | Voluntario (acción del Invitado) | Galería compartida del evento |

> Los datos de los Invitados son proporcionados por el Anfitrión, quien asume la responsabilidad de haber obtenido el consentimiento correspondiente.

### 2.3 Datos Técnicos (Recopilación Automática)

La Plataforma puede recopilar automáticamente los siguientes datos técnicos:

- **Dirección IP:** Para rate limiting y seguridad (protección contra abuso).
- **Tipo de navegador y dispositivo:** Para compatibilidad y diagnóstico técnico.
- **Cookies técnicas:** Necesarias para el funcionamiento del servicio (ver [Aviso de Cookies](/cookies)).

**No recopilamos datos de navegación, perfiles de usuario ni datos con fines publicitarios.**

---

## 3. Base Legal para el Tratamiento

El tratamiento de datos personales se basa en las siguientes bases legales, conforme al artículo 5 de la Ley 25.326:

| Base Legal | Aplicación |
|---|---|
| **Consentimiento explícito** | El Anfitrión otorga consentimiento al aceptar estos términos mediante el checkbox en el formulario de pedido |
| **Ejecución contractual** | Los datos son necesarios para la prestación del servicio solicitado |
| **Interés legítimo** | Datos técnicos (IP, cookies) para la seguridad y funcionamiento de la Plataforma |

---

## 4. Retención de Datos

| Tipo de Dato | Período de Retención | Acción al Vencer |
|---|---|---|
| Invitación y datos asociados | 3 meses post-evento | Eliminación definitiva (hard delete) de base de datos |
| Galería de fotos | 3 meses post-evento | Eliminación definitiva de Storage |
| Datos de Invitados | 3 meses post-evento | Eliminación por cascada desde la Invitación |
| Datos de pedidos | Indefinido | Conservados como historial comercial del Administrador |
| Logs de eliminación | 6 meses | Eliminación automática por proceso programado |

La eliminación automática se ejecuta diariamente a las **02:00 AM (hora de Argentina)**. El Anfitrión recibirá notificaciones preventivas por email **7 días y 3 días antes** de la eliminación de su invitación y galería.

---

## 5. Derechos del Titular de los Datos

Conforme a la Ley 25.326, el titular de los datos tiene los siguientes derechos:

1. **Acceso:** Solicitar información sobre los datos personales almacenados que le conciernen.
2. **Rectificación:** Solicitar la corrección de datos inexactos o incompletos.
3. **Supresión:** Solicitar la eliminación de sus datos personales cuando ya no sean necesarios para la finalidad que motivó su recolección.
4. **Oposición:** Oponerse al tratamiento de sus datos en determinadas circunstancias.

Para ejercer cualquiera de estos derechos, el titular puede contactarse a través de **festeja.plataforma@gmail.com**. La solicitud será atendida en un plazo máximo de **30 días hábiles**.

---

## 6. Derechos Adicionales para Usuarios de la Unión Europea (GDPR)

En caso de que usuarios residentes en la Unión Europea accedan a la Plataforma, se garantizan adicionalmente los siguientes derechos conforme al Reglamento General de Protección de Datos (GDPR — Reglamento UE 2016/679):

- **Derecho de portabilidad de datos:** Recibir sus datos en un formato estructurado y de uso común.
- **Derecho a la limitación del tratamiento:** Solicitar que el tratamiento de sus datos sea restringido en ciertos supuestos.
- **Mecanismo de solicitud de eliminación accesible:** A través de los canales de contacto indicados.

---

## 7. Compartición de Datos con Terceros

La Plataforma **NO vende, alquila ni comparte datos personales con terceros con fines comerciales.**

Los datos pueden ser compartidos únicamente con los siguientes proveedores de infraestructura, estrictamente necesarios para la prestación del servicio:

| Proveedor | Propósito | Política de Privacidad |
|---|---|---|
| **Cloudflare R2** | Almacenamiento de archivos (fotos y música MP3) | [-](-) |
| **Vercel** | Hosting del frontend (React) | [vercel.com/legal/privacy-policy](https://vercel.com/legal/privacy-policy) |
| **Railway** | Hosting del backend (API) | [railway.app/legal/privacy](https://railway.app/legal/privacy) |
| **Hostinger** | Hosting de base de datos PostgreSQL | [www.hostinger.com/privacy-policy](https://www.hostinger.com/privacy-policy) |
| **Autoridades legales** | Cuando sea requerido por ley o por orden judicial | — |

Todos los proveedores mencionados cuentan con políticas de privacidad propias y están sujetos a sus respectivas normativas de protección de datos.

---

## 8. Medidas de Seguridad

La Plataforma implementa las siguientes medidas técnicas y organizativas para proteger los datos personales:

- **Transmisión cifrada:** HTTPS/TLS obligatorio en todos los endpoints. Sin excepciones.
- **Tokens JWT:** Para autenticación del panel de administración.
- **Rate limiting:** Máximo 100 peticiones por minuto por IP para prevenir abusos.
- **URLs únicas:** Generadas con UUID v4 para evitar que sean adivinables.
- **Validación estricta:** Todos los datos de entrada se validan en el frontend y en el backend.
- **Sanitización HTML:** Limpieza de etiquetas y scripts maliciosos en campos de texto.
- **CORS restringido:** Solo los dominios autorizados pueden realizar peticiones al backend.
- **Cabeceras de seguridad (Helmet):** Content-Security-Policy, X-Content-Type-Options, X-Frame-Options.
- **Backups automáticos:** Semanales para base de datos, galería e información de invitaciones.

---

## 9. Cookies

La Plataforma utiliza únicamente **cookies técnicas estrictamente necesarias** para su funcionamiento. No utiliza cookies de publicidad, seguimiento ni analítica.

Para información detallada, consulte nuestro [Aviso de Cookies](/cookies).

---

## 10. Transferencia Internacional de Datos

Los datos almacenados en Cloudflare R2 pueden ser procesados en servidores ubicados fuera de Argentina.

---

## 11. Cambios en esta Política

El Administrador se reserva el derecho de modificar esta Política de Privacidad en cualquier momento. Los cambios entrarán en vigencia al ser publicados en la Plataforma, con la actualización de la fecha indicada al final del documento. Se recomienda revisar esta página periódicamente.

---

## 12. Contacto y Consultas sobre Privacidad

Para consultas, solicitudes o reclamos relacionados con la protección de sus datos personales:

- **Email:** festeja.plataforma@gmail.com
- **WhatsApp Business:** +543435083034
- **Autoridad de control:** Agencia de Acceso a la Información Pública (AAIP) — [www.argentina.gob.ar/aaip](https://www.argentina.gob.ar/aaip)

---

*última revisión:04/04/2026*
