-- ═══════════════════════════════════════════════════════════════════
-- SCHEMA SQL — Plataforma de Invitaciones Digitales Personalizadas
-- Motor: PostgreSQL 16+
-- Versión: 1.0  |  Fecha: 11 de marzo de 2026
-- Basado en: SRS v1.0, Modelo de Negocio v1.1, Seguridad v1.0
-- ═══════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────
-- 0. EXTENSIONES Y CONFIGURACIÓN
-- ───────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

SET timezone = 'America/Argentina/Buenos_Aires';


-- ═══════════════════════════════════════════
-- 1. TABLAS DE CATÁLOGO Y CONFIGURACIÓN
-- ═══════════════════════════════════════════

-- ───────────────────────────────────────────
-- TABLA: Usuario
-- Almacena credenciales del administrador.
-- MVP: un único usuario con rol ADMIN.
-- ───────────────────────────────────────────
CREATE TABLE Usuario (
  id            SERIAL        PRIMARY KEY,
  username      VARCHAR(100)  NOT NULL UNIQUE,
  email         VARCHAR(255)  NOT NULL,
  password_hash VARCHAR(255)  NOT NULL,
  role          VARCHAR(20)   NOT NULL DEFAULT 'ADMIN',
  created_at    TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ───────────────────────────────────────────
-- TABLA: TipoEvento
-- Tipos de evento soportados (Boda, Quinceañera, Cumpleaños en MVP).
-- campos_especificos: JSONB con esquema dinámico por tipo.
-- ───────────────────────────────────────────
CREATE TABLE TipoEvento (
  id                  SERIAL        PRIMARY KEY,
  nombre              VARCHAR(100)  NOT NULL UNIQUE,
  descripcion         TEXT,
  campos_especificos  JSONB,
  activo              BOOLEAN       NOT NULL DEFAULT TRUE
);

-- ───────────────────────────────────────────
-- TABLA: Template
-- Diseños visuales por tipo de evento (mín. 3 por tipo = 9 MVP).
-- ───────────────────────────────────────────
CREATE TABLE Template (
  id              SERIAL        PRIMARY KEY,
  tipo_evento_id  INT           NOT NULL
    REFERENCES TipoEvento(id),
  nombre          VARCHAR(150)  NOT NULL,
  thumbnail_url   VARCHAR(500),
  descripcion     TEXT,
  activo          BOOLEAN       NOT NULL DEFAULT TRUE
);

CREATE INDEX idx_template_tipo_evento
  ON Template(tipo_evento_id);

-- ───────────────────────────────────────────
-- TABLA: Servicio
-- Servicios adicionales (Confirmación, Cuenta Regresiva, Música, etc.).
-- ───────────────────────────────────────────
CREATE TABLE Servicio (
  id               SERIAL         PRIMARY KEY,
  nombre           VARCHAR(100)   NOT NULL,
  descripcion      TEXT,
  precio           DECIMAL(12,2)  NOT NULL,
  incluido_en_base BOOLEAN        NOT NULL DEFAULT FALSE,
  activo           BOOLEAN        NOT NULL DEFAULT TRUE
);


-- ═══════════════════════════════════════════
-- 2. TABLAS DE GESTIÓN COMERCIAL
-- ═══════════════════════════════════════════

-- ───────────────────────────────────────────
-- TABLA: Pedido
-- Solicitudes desde la landing page.
-- Estado: PENDIENTE → CONTACTADO → COMPLETADO | CANCELADO
-- ───────────────────────────────────────────
CREATE TABLE Pedido (
  id              SERIAL         PRIMARY KEY,
  tipo_evento_id  INT            NOT NULL
    REFERENCES TipoEvento(id),
  template_id     INT            NOT NULL
    REFERENCES Template(id),
  nombre_cliente  VARCHAR(200)   NOT NULL,
  telefono        VARCHAR(30)    NOT NULL,
  email           VARCHAR(255)   NOT NULL,
  precio_base     DECIMAL(12,2)  NOT NULL,
  precio_total    DECIMAL(12,2)  NOT NULL,
  estado          VARCHAR(20)    NOT NULL
    DEFAULT 'PENDIENTE'
    CHECK (estado IN (
      'PENDIENTE', 'CONTACTADO',
      'COMPLETADO', 'CANCELADO'
    )),
  created_at      TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pedido_estado
  ON Pedido(estado);
CREATE INDEX idx_pedido_created
  ON Pedido(created_at);

-- ───────────────────────────────────────────
-- TABLA: PedidoServicio (M:N intermedia)
-- Captura precio_al_momento para historial.
-- ───────────────────────────────────────────
CREATE TABLE PedidoServicio (
  pedido_id         INT            NOT NULL
    REFERENCES Pedido(id) ON DELETE CASCADE,
  servicio_id       INT            NOT NULL
    REFERENCES Servicio(id),
  precio_al_momento DECIMAL(12,2)  NOT NULL,
  PRIMARY KEY (pedido_id, servicio_id)
);


-- ═══════════════════════════════════════════
-- 3. TABLAS DE INVITACIONES Y CONTENIDO
-- ═══════════════════════════════════════════

-- ───────────────────────────────────────────
-- TABLA: Invitacion (CENTRAL)
-- Entidad principal. UUID v4 como PK para evitar enumeración.
-- URL pública: invitaciones.com/{id}
-- URL personalizada: invitaciones.com/{id}?invitado=nombre-apellido
-- fecha_expiracion = fecha_evento + 3 meses (eliminación automática).
-- ───────────────────────────────────────────
CREATE TABLE Invitacion (
  id                     UUID           PRIMARY KEY
    DEFAULT gen_random_uuid(),
  pedido_id              INT
    REFERENCES Pedido(id),
  template_id            INT            NOT NULL
    REFERENCES Template(id),
  tipo_evento_id         INT            NOT NULL
    REFERENCES TipoEvento(id),
  titulo                 VARCHAR(200)   NOT NULL,
  fecha_evento           DATE           NOT NULL,
  hora_evento            TIME           NOT NULL,
  ubicacion              VARCHAR(300)   NOT NULL,
  direccion              VARCHAR(500)   NOT NULL,
  latitud                DECIMAL(10,7)  NOT NULL,
  longitud               DECIMAL(10,7)  NOT NULL,
  color_primario         VARCHAR(7),
  contrasena_asistentes  VARCHAR(255),
  max_fotos              INT            NOT NULL DEFAULT 1000,
  campos_especificos     JSONB,
  activa                 BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at             TIMESTAMP      NOT NULL DEFAULT NOW(),
  fecha_expiracion       DATE           NOT NULL
);

CREATE INDEX idx_invitacion_pedido
  ON Invitacion(pedido_id);
CREATE INDEX idx_invitacion_activa
  ON Invitacion(activa) WHERE activa = TRUE;
CREATE INDEX idx_invitacion_expiracion
  ON Invitacion(fecha_expiracion);
CREATE INDEX idx_invitacion_fecha_evento
  ON Invitacion(fecha_evento);

-- ───────────────────────────────────────────
-- TABLA: InvitacionServicio (M:N intermedia)
-- Servicios habilitados para cada invitación.
-- ───────────────────────────────────────────
CREATE TABLE InvitacionServicio (
  invitacion_id  UUID     NOT NULL
    REFERENCES Invitacion(id) ON DELETE CASCADE,
  servicio_id    INT      NOT NULL
    REFERENCES Servicio(id),
  habilitado     BOOLEAN  NOT NULL DEFAULT TRUE,
  PRIMARY KEY (invitacion_id, servicio_id)
);

-- ───────────────────────────────────────────
-- TABLA: Invitado
-- Invitados individuales con estado de confirmación.
-- Carga masiva vía JSON desde panel admin.
-- Solo primera confirmación cuenta (idempotente).
-- ───────────────────────────────────────────
CREATE TABLE Invitado (
  id                  SERIAL       PRIMARY KEY,
  invitacion_id       UUID         NOT NULL
    REFERENCES Invitacion(id) ON DELETE CASCADE,
  nombre              VARCHAR(100) NOT NULL,
  apellido            VARCHAR(100) NOT NULL,
  confirmado          BOOLEAN      NOT NULL DEFAULT FALSE,
  fecha_confirmacion  TIMESTAMP,
  UNIQUE (invitacion_id, nombre, apellido)
);

CREATE INDEX idx_invitado_invitacion
  ON Invitado(invitacion_id);
CREATE INDEX idx_invitado_confirmado
  ON Invitado(invitacion_id, confirmado);

-- ───────────────────────────────────────────
-- TABLA: HistoriaSeccion
-- Hasta 3 secciones de historia por invitación.
-- Texto sanitizado (XSS prevention). Máx 3000 chars.
-- ───────────────────────────────────────────
CREATE TABLE HistoriaSeccion (
  id              SERIAL         PRIMARY KEY,
  invitacion_id   UUID           NOT NULL
    REFERENCES Invitacion(id) ON DELETE CASCADE,
  texto           VARCHAR(3000)  NOT NULL,
  imagen_url      VARCHAR(500),
  orden           SMALLINT       NOT NULL
    CHECK (orden BETWEEN 1 AND 3)
);

CREATE INDEX idx_historia_invitacion
  ON HistoriaSeccion(invitacion_id);

-- ───────────────────────────────────────────
-- TABLA: FotoAnfitrion
-- Fotos cargadas por el admin al crear invitación (máx. 5).
-- ───────────────────────────────────────────
CREATE TABLE FotoAnfitrion (
  id              SERIAL        PRIMARY KEY,
  invitacion_id   UUID          NOT NULL
    REFERENCES Invitacion(id) ON DELETE CASCADE,
  url             VARCHAR(500)  NOT NULL,
  orden           SMALLINT      NOT NULL,
  tamano          INT           NOT NULL
);

CREATE INDEX idx_foto_anfitrion_inv
  ON FotoAnfitrion(invitacion_id);

-- ───────────────────────────────────────────
-- TABLA: Foto (Galería de invitados)
-- Fotos subidas por invitados vía QR.
-- Máx 1000 por invitación, 15 MB por archivo.
-- MIME verificado en backend (no solo extensión).
-- ───────────────────────────────────────────
CREATE TABLE Foto (
  id              SERIAL        PRIMARY KEY,
  invitacion_id   UUID          NOT NULL
    REFERENCES Invitacion(id) ON DELETE CASCADE,
  url             VARCHAR(500)  NOT NULL,
  tamano          INT           NOT NULL,
  mime_type       VARCHAR(50)   NOT NULL,
  created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_foto_invitacion
  ON Foto(invitacion_id);
CREATE INDEX idx_foto_created
  ON Foto(created_at);

-- ───────────────────────────────────────────
-- TABLA: Musica
-- Un MP3 por invitación (UNIQUE en invitacion_id).
-- Máx 20 MB. Autoplay con volumen bajo tras modal.
-- ───────────────────────────────────────────
CREATE TABLE Musica (
  id              SERIAL        PRIMARY KEY,
  invitacion_id   UUID          NOT NULL UNIQUE
    REFERENCES Invitacion(id) ON DELETE CASCADE,
  archivo_url     VARCHAR(500)  NOT NULL,
  tamano          INT           NOT NULL,
  mime_type       VARCHAR(50)   NOT NULL
    DEFAULT 'audio/mpeg'
);


-- ═══════════════════════════════════════════
-- 4. TABLAS DE AUDITORÍA
-- ═══════════════════════════════════════════

-- ───────────────────────────────────────────
-- TABLA: Notificacion
-- Registro de emails automáticos del sistema.
-- Tipos: NUEVO_PEDIDO, EXPIRACION_PROXIMA, AVISO_ELIMINACION
-- ───────────────────────────────────────────
CREATE TABLE Notificacion (
  id                  SERIAL        PRIMARY KEY,
  tipo                VARCHAR(30)   NOT NULL
    CHECK (tipo IN (
      'NUEVO_PEDIDO',
      'EXPIRACION_PROXIMA',
      'AVISO_ELIMINACION'
    )),
  destinatario_email  VARCHAR(255)  NOT NULL,
  asunto              VARCHAR(255)  NOT NULL,
  mensaje             TEXT          NOT NULL,
  enviada             BOOLEAN       NOT NULL DEFAULT FALSE,
  fecha_envio         TIMESTAMP,
  created_at          TIMESTAMP     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notificacion_tipo
  ON Notificacion(tipo);
CREATE INDEX idx_notificacion_enviada
  ON Notificacion(enviada) WHERE enviada = FALSE;

-- ───────────────────────────────────────────
-- TABLA: LogEliminacion
-- Auditoría de eliminaciones automáticas (cron job).
-- invitacion_id_ref: referencia blanda (UUID, no FK).
-- Retención: 6 meses.
-- ───────────────────────────────────────────
CREATE TABLE LogEliminacion (
  id                  SERIAL     PRIMARY KEY,
  invitacion_id_ref   UUID       NOT NULL,
  fecha_eliminacion   TIMESTAMP  NOT NULL DEFAULT NOW(),
  fotos_eliminadas    INT        NOT NULL DEFAULT 0,
  detalles            TEXT
);

CREATE INDEX idx_log_elim_fecha
  ON LogEliminacion(fecha_eliminacion);


-- ═══════════════════════════════════════════
-- 5. DATOS SEMILLA (MVP)
-- ═══════════════════════════════════════════

-- Usuario administrador (reemplazar hash con valor real de Argon2/bcrypt)
INSERT INTO Usuario (username, email, password_hash, role) VALUES
  ('admin', 'admin@invitaciones.com', '$argon2id$v=19$m=65536,t=3,p=4$PLACEHOLDER_REEMPLAZAR', 'ADMIN');

-- Tipos de Evento MVP
INSERT INTO TipoEvento (nombre, descripcion, campos_especificos) VALUES
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

-- Servicios (precios en ARS según Modelo de Negocio v1.1)
INSERT INTO Servicio (nombre, descripcion, precio, incluido_en_base) VALUES
  ('Información del evento', 'Fecha, hora, ubicación, dress code, campos editables', 0.00, TRUE),
  ('Mapa con ubicación', 'Google Maps embebido + link copeable + abrir en Maps nativo', 0.00, TRUE),
  ('Fotos del anfitrión', 'Hasta 5 fotos del anfitrión en la invitación', 0.00, TRUE),
  ('Confirmación de Asistencia', 'Botón RSVP + panel con confirmados + exportar CSV', 10000.00, FALSE),
  ('Cuenta Regresiva', 'Countdown dinámico (días/h/m/s) hasta el evento', 10000.00, FALSE),
  ('Música', 'MP3 con controles. Se activa al aceptar el modal de bienvenida', 10000.00, FALSE),
  ('Historia', 'Sección de texto (máx. 3000 caracteres) + hasta 3 imágenes', 10000.00, FALSE),
  ('Galería de Fotos (QR)', 'QR para subir fotos, máx. 1000 fotos, máx. 15 MB c/u, descarga ZIP', 50000.00, FALSE),
  ('Múltiples Tarjetas', 'Segunda versión de la invitación (50% descuento)', 15000.00, FALSE);

-- Templates MVP (3 por tipo = 9 total)
INSERT INTO Template (tipo_evento_id, nombre, descripcion) VALUES
  -- Bodas (tipo_evento_id = 1)
  (1, 'Boda Clásica', 'Diseño elegante en tonos dorados y tipografía serif'),
  (1, 'Boda Moderna', 'Diseño minimalista contemporáneo con líneas limpias'),
  (1, 'Boda Rústica', 'Diseño campestre con texturas naturales y tonos tierra'),
  -- Quinceañeras (tipo_evento_id = 2)
  (2, 'Quinceañera Princesa', 'Diseño con coronas, brillos y detalles reales'),
  (2, 'Quinceañera Moderna', 'Diseño juvenil con colores vibrantes y geometría'),
  (2, 'Quinceañera Elegante', 'Diseño sofisticado en tonos pastel y floral'),
  -- Cumpleaños (tipo_evento_id = 3)
  (3, 'Cumpleaños Festivo', 'Diseño colorido con globos, confetti y alegría'),
  (3, 'Cumpleaños Elegante', 'Diseño adulto sofisticado en tonos oscuros'),
  (3, 'Cumpleaños Infantil', 'Diseño divertido con personajes y colores brillantes');


-- ═══════════════════════════════════════════
-- 6. QUERIES DE MANTENIMIENTO (CRON JOBS)
-- ═══════════════════════════════════════════

-- Cron Job: Identificar invitaciones expiradas (diario 02:00 AM)
-- SELECT id, titulo, fecha_evento, fecha_expiracion
-- FROM Invitacion
-- WHERE fecha_expiracion < CURRENT_DATE
--   AND activa = TRUE;

-- Cron Job: Limpieza de logs > 6 meses (mensual)
-- DELETE FROM LogEliminacion
-- WHERE fecha_eliminacion < CURRENT_DATE - INTERVAL '6 months';
