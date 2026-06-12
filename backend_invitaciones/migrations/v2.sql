-- ═══════════════════════════════════════════════════════════════════════════
-- MIGRACIÓN v2 — Invitaciones Digitales
-- Ejecutar COMPLETO en una sola transacción contra la BD de desarrollo.
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 0: REVERTIR CAMBIOS MANUALES PREVIOS
-- Se eliminan las columnas agregadas manualmente que no forman parte del
-- schema oficial v2 o que serán re-agregadas correctamente abajo.
-- ─────────────────────────────────────────────────────────────────────────────

-- 0.1 Eliminar FK si existe
ALTER TABLE invitacion DROP CONSTRAINT IF EXISTS fk_invitacion_usuario;

-- 0.2 Eliminar columnas manuales de invitacion
ALTER TABLE invitacion DROP COLUMN IF EXISTS usuario_id;
ALTER TABLE invitacion DROP COLUMN IF EXISTS estado_pago;  -- no forma parte del diseño v2

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 1: TABLA usuario — nuevos campos para clientes
-- ─────────────────────────────────────────────────────────────────────────────

-- 1.1 Nombre visible del cliente (opcional, puede ser igual que username)
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS nombre_completo VARCHAR(200) NULL;

-- 1.2 Flag de cuenta verificada (email verification)
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS verificado BOOLEAN NOT NULL DEFAULT FALSE;

-- 1.3 Token temporal para verificación de email (se limpia al verificar)
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS token_verificacion VARCHAR(255) NULL;

-- 1.4 Token temporal para recuperación de contraseña (futuro)
ALTER TABLE usuario ADD COLUMN IF NOT EXISTS token_recuperacion VARCHAR(255) NULL;

-- 1.5 Agregar unicidad al email (en v1 no tenía UNIQUE constraint)
ALTER TABLE usuario DROP CONSTRAINT IF EXISTS uq_usuario_email;
ALTER TABLE usuario ADD CONSTRAINT uq_usuario_email UNIQUE (email);

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 2: TABLA pedido — soporte para pedidos de clientes y Mercado Pago
-- ─────────────────────────────────────────────────────────────────────────────

-- 2.1 FK al usuario que creó el pedido (NULL = pedido anónimo desde landing)
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS usuario_id INT NULL;
ALTER TABLE pedido DROP CONSTRAINT IF EXISTS fk_pedido_usuario;
ALTER TABLE pedido ADD CONSTRAINT fk_pedido_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_pedido_usuario_id ON pedido(usuario_id);

-- 2.2 ID de la preferencia de pago creada en Mercado Pago
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS mp_preference_id VARCHAR(255) NULL;

-- 2.3 ID del pago confirmado por Mercado Pago
ALTER TABLE pedido ADD COLUMN IF NOT EXISTS mp_payment_id VARCHAR(255) NULL;

-- 2.4 Nuevo estado PAGADO para el flujo de cliente con MP
-- (Si el tipo ya existe como VARCHAR simple, solo necesitamos que el
--  enum en TypeScript acepte el valor; no se necesita ALTER TYPE en PostgreSQL
--  cuando el campo es VARCHAR, solo actualizamos el CHECK si existe)
-- Nota: si hay un CHECK constraint en la columna 'estado', agregarlo aquí:
-- ALTER TABLE pedido DROP CONSTRAINT IF EXISTS pedido_estado_check;
-- ALTER TABLE pedido ADD CONSTRAINT pedido_estado_check
--   CHECK (estado IN ('PENDIENTE','CONTACTADO','COMPLETADO','CANCELADO','PAGADO'));

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 3: TABLA invitacion — soporte para invitaciones de clientes
-- ─────────────────────────────────────────────────────────────────────────────

-- 3.1 FK al usuario dueño de la invitación (NULL = creada por admin sin usuario)
ALTER TABLE invitacion ADD COLUMN IF NOT EXISTS usuario_id INT NULL;
ALTER TABLE invitacion DROP CONSTRAINT IF EXISTS fk_invitacion_usuario;
ALTER TABLE invitacion ADD CONSTRAINT fk_invitacion_usuario
    FOREIGN KEY (usuario_id) REFERENCES usuario(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_invitacion_usuario_id ON invitacion(usuario_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- PASO 4: NUEVA TABLA pago — registro de eventos del webhook de Mercado Pago
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS pago (
    id             SERIAL PRIMARY KEY,
    pedido_id      INT          NOT NULL,
    mp_payment_id  VARCHAR(255) NOT NULL,
    mp_status      VARCHAR(50)  NOT NULL,
    monto          DECIMAL(12,2) NOT NULL,
    raw_data       JSONB,
    created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_pago_pedido FOREIGN KEY (pedido_id)
        REFERENCES pedido(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pago_pedido_id     ON pago(pedido_id);
CREATE INDEX IF NOT EXISTS idx_pago_mp_payment_id ON pago(mp_payment_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- VERIFICACIÓN FINAL
-- ─────────────────────────────────────────────────────────────────────────────

-- Confirmar columnas en usuario
SELECT column_name FROM information_schema.columns
WHERE table_name = 'usuario' ORDER BY ordinal_position;

-- Confirmar columnas en pedido
SELECT column_name FROM information_schema.columns
WHERE table_name = 'pedido' ORDER BY ordinal_position;

-- Confirmar columnas en invitacion
SELECT column_name FROM information_schema.columns
WHERE table_name = 'invitacion' ORDER BY ordinal_position;

-- Confirmar tabla pago
SELECT column_name FROM information_schema.columns
WHERE table_name = 'pago' ORDER BY ordinal_position;

COMMIT;
