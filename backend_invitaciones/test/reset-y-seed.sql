-- ═══════════════════════════════════════════════════════════════
-- RESET COMPLETO + SEED — Invitaciones Digitales
-- Ejecutar en pgAdmin (Query Tool) o psql
-- ═══════════════════════════════════════════════════════════════

-- 1. TRUNCAR TODAS LAS TABLAS (respeta orden de FK)
-- CASCADE elimina datos dependientes automáticamente
TRUNCATE TABLE
  "log_eliminacion",
  "notificacion",
  "foto",
  "foto_anfitrion",
  "musica",
  "historia_seccion",
  "invitado",
  "invitacion_servicio",
  "invitacion",
  "pedido_servicio",
  "pedido",
  "template",
  "servicio",
  "tipo_evento",
  "usuario"
CASCADE;

-- 2. RESETEAR SECUENCIAS (auto-increment vuelve a 1)
ALTER SEQUENCE usuario_id_seq RESTART WITH 1;
ALTER SEQUENCE tipo_evento_id_seq RESTART WITH 1;
ALTER SEQUENCE template_id_seq RESTART WITH 1;
ALTER SEQUENCE servicio_id_seq RESTART WITH 1;
ALTER SEQUENCE pedido_id_seq RESTART WITH 1;
ALTER SEQUENCE invitado_id_seq RESTART WITH 1;
ALTER SEQUENCE historia_seccion_id_seq RESTART WITH 1;
ALTER SEQUENCE foto_id_seq RESTART WITH 1;
ALTER SEQUENCE foto_anfitrion_id_seq RESTART WITH 1;
ALTER SEQUENCE musica_id_seq RESTART WITH 1;
ALTER SEQUENCE notificacion_id_seq RESTART WITH 1;
ALTER SEQUENCE log_eliminacion_id_seq RESTART WITH 1;

-- ═══════════════════════════════════════════════════════════════
-- 3. SEED: Usuario Admin
-- ═══════════════════════════════════════════════════════════════

INSERT INTO "usuario" (username, email, password_hash, role) VALUES
('admin', 'admin@invitaciones.com', '$argon2id$v=19$m=65536,t=3,p=4$t0CaX91ZrJxZfpV2Lz34gw$z6BUYEJrj3US0rQfqqyNsXHMjQ4uILEzCpHY01nGBDw', 'ADMIN');

-- ═══════════════════════════════════════════════════════════════
-- 4. SEED: Tipos de Evento (3)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO "tipo_evento" (nombre, descripcion, campos_especificos) VALUES
('Boda', 'Celebración de matrimonio', '{
  "nombres_novios": "string",
  "foto_pareja": "string",
  "ceremonia_tipo": "string",
  "ceremonia_hora": "time",
  "recepcion_hora": "time",
  "recepcion_lugar": "string",
  "trasnoche": "boolean"
}'::jsonb),
('Quinceañera', 'Fiesta de 15 años', '{
  "nombre_quinceañera": "string",
  "foto_quinceañera": "string",
  "vals_pareja": "string",
  "vals_cancion": "string",
  "tematica": "string",
  "dress_code": "string"
}'::jsonb),
('Cumpleaños', 'Fiesta de cumpleaños', '{
  "nombre_festejado": "string",
  "foto_festejado": "string",
  "edad": "number",
  "tipo_fiesta": "string",
  "actividades": "string"
}'::jsonb);

-- ═══════════════════════════════════════════════════════════════
-- 5. SEED: Servicios (9)
--    3 incluidos en base (precio 0) + 6 opcionales con precio
-- ═══════════════════════════════════════════════════════════════

INSERT INTO "servicio" (nombre, descripcion, precio, incluido_en_base) VALUES
-- Incluidos en el precio base ($30.000)
('Información del evento',
 'Fecha, hora, ubicación, dress code, campos editables',
 0.00, TRUE),
('Mapa con ubicación',
 'Google Maps embebido + link copeable + abrir nativo',
 0.00, TRUE),
('Fotos del anfitrión',
 'Hasta 5 fotos del anfitrión en la invitación',
 0.00, TRUE),

-- Servicios adicionales (à la carte)
('Confirmación de Asistencia',
 'Botón RSVP + panel confirmados + exportar CSV',
 10000.00, FALSE),
('Cuenta Regresiva',
 'Countdown dinámico días/h/m/s hasta el evento',
 10000.00, FALSE),
('Música',
 'MP3 con controles. Activa al aceptar modal',
 10000.00, FALSE),
('Historia',
 'Sección texto + fotos (máx 3000 chars, 3 secciones)',
 10000.00, FALSE),
('Galería de Fotos (QR)',
 'QR para subir fotos, máx 1000, 15 MB c/u, ZIP',
 50000.00, FALSE),
('Múltiples Tarjetas',
 'Segunda versión de la invitación (50% desc.)',
 15000.00, FALSE);

-- ═══════════════════════════════════════════════════════════════
-- 6. SEED: Templates (9 = 3 por tipo de evento)
-- ═══════════════════════════════════════════════════════════════

INSERT INTO "template" (tipo_evento_id, nombre, descripcion) VALUES
-- Bodas (tipo_evento_id = 1)
(1, 'Boda Clásica', 'Diseño elegante en tonos dorados'),
(1, 'Boda Moderna', 'Diseño minimalista contemporáneo'),
(1, 'Boda Rústica', 'Diseño campestre con texturas naturales'),
-- Quinceañeras (tipo_evento_id = 2)
(2, 'Quinceañera Princesa', 'Diseño con coronas y detalles reales'),
(2, 'Quinceañera Moderna', 'Diseño juvenil con colores vibrantes'),
(2, 'Quinceañera Elegante', 'Diseño sofisticado en tonos pastel'),
-- Cumpleaños (tipo_evento_id = 3)
(3, 'Cumpleaños Festivo', 'Diseño colorido con globos y confetti'),
(3, 'Cumpleaños Elegante', 'Diseño adulto sofisticado'),
(3, 'Cumpleaños Infantil', 'Diseño divertido para niños');

-- ═══════════════════════════════════════════════════════════════
-- VERIFICACIÓN — Ejecutar después del seed
-- ═══════════════════════════════════════════════════════════════

SELECT 'Usuarios' AS tabla, COUNT(*) AS registros FROM "usuario"
UNION ALL SELECT 'Tipos de evento', COUNT(*) FROM "tipo_evento"
UNION ALL SELECT 'Templates', COUNT(*) FROM "template"
UNION ALL SELECT 'Servicios', COUNT(*) FROM "servicio"
UNION ALL SELECT 'Pedidos', COUNT(*) FROM "pedido"
UNION ALL SELECT 'Invitaciones', COUNT(*) FROM "invitacion"
UNION ALL SELECT 'Notificaciones', COUNT(*) FROM "notificacion"
UNION ALL SELECT 'Logs eliminación', COUNT(*) FROM "log_eliminacion";

-- Resultado esperado:
-- Usuarios:          1
-- Tipos de evento:   3
-- Templates:         9
-- Servicios:         9
-- Pedidos:           0
-- Invitaciones:      0
-- Notificaciones:    0
-- Logs eliminación:  0
