import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';

import { PedidosController } from './pedidos.controller';
import { PedidosService } from './pedidos.service';
import { JwtAuthGuard } from '../auth/guards/jwt.auth.guard';

// ═══════════════════════════════════════════
// Logger visual para consola
// ═══════════════════════════════════════════

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  dim: '\x1b[2m',
  bold: '\x1b[1m',
  white: '\x1b[37m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
  bgCyan: '\x1b[46m',
};

const METHOD_COLORS: Record<string, string> = {
  GET: COLORS.cyan,
  POST: COLORS.green,
  PATCH: COLORS.yellow,
  DELETE: COLORS.red,
};

function logEndpoint(method: string, path: string, description: string) {
  const color = METHOD_COLORS[method] || COLORS.white;
  console.log(
    `\n${COLORS.bold}${color}  ${method}${COLORS.reset} ` +
    `${COLORS.bold}${path}${COLORS.reset}` +
    `${COLORS.dim} — ${description}${COLORS.reset}`,
  );
}

function logRequest(body: any) {
  if (body && Object.keys(body).length > 0) {
    console.log(`${COLORS.dim}  ► Request Body:${COLORS.reset}`);
    console.log(
      JSON.stringify(body, null, 2)
        .split('\n')
        .map((line) => `    ${COLORS.dim}${line}${COLORS.reset}`)
        .join('\n'),
    );
  }
}

function logResponse(status: number, body: any) {
  const statusColor =
    status < 300 ? COLORS.green : status < 400 ? COLORS.yellow : COLORS.red;

  const statusLabel =
    status < 300 ? '✔ OK' : status < 400 ? '→ REDIRECT' : '✘ ERROR';

  console.log(
    `${COLORS.dim}  ◄ Response:${COLORS.reset} ` +
    `${COLORS.bold}${statusColor}${status} ${statusLabel}${COLORS.reset}`,
  );
  console.log(
    JSON.stringify(body, null, 2)
      .split('\n')
      .map((line) => `    ${statusColor}${line}${COLORS.reset}`)
      .join('\n'),
  );
}

function logSeparator(title: string) {
  console.log(
    `\n${COLORS.bold}${COLORS.magenta}${'═'.repeat(60)}${COLORS.reset}`,
  );
  console.log(
    `${COLORS.bold}${COLORS.magenta}  ${title}${COLORS.reset}`,
  );
  console.log(
    `${COLORS.bold}${COLORS.magenta}${'═'.repeat(60)}${COLORS.reset}`,
  );
}

// ═══════════════════════════════════════════
// Datos de prueba
// ═══════════════════════════════════════════

const pedidoResponse = {
  id: 1,
  nombreCliente: 'Juan Pérez',
  telefono: '+5493411234567',
  email: 'juan@example.com',
  tipoEventoId: 1,
  tipoEventoNombre: 'Boda',
  templateId: 1,
  templateNombre: 'Elegante Dorado',
  precioBase: 30000,
  precioTotal: 40000,
  estado: 'PENDIENTE',
  servicios: [
    { servicioId: 1, nombre: 'Galería de Fotos', precioAlMomento: 5000 },
    { servicioId: 2, nombre: 'Música de Fondo', precioAlMomento: 5000 },
  ],
  createdAt: '2026-03-20T10:00:00.000Z',
};

const pedidoContactado = {
  ...pedidoResponse,
  estado: 'CONTACTADO',
};

const resumenResponse = {
  id: 1,
  nombreCliente: 'Juan Pérez',
  tipoEvento: 'Boda',
  template: 'Elegante Dorado',
  precioBase: 30000,
  precioTotal: 40000,
  servicios: [
    { nombre: 'Galería de Fotos', precio: 5000 },
    { nombre: 'Música de Fondo', precio: 5000 },
  ],
  estado: 'PENDIENTE',
  whatsappLink: 'https://wa.me/5493411111111?text=%C2%A1Hola!%20Soy%20Juan%20P%C3%A9rez...',
};

const listadoPaginado = {
  data: [pedidoResponse],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
};

// ═══════════════════════════════════════════
// Tests E2E
// ═══════════════════════════════════════════

describe('Pedidos — Tests E2E (endpoints HTTP)', () => {
  let app: INestApplication;
  let pedidosService: Record<string, jest.Mock>;

  beforeAll(async () => {
    // Mock del service completo
    pedidosService = {
      crear: jest.fn(),
      listar: jest.fn(),
      obtenerPorId: jest.fn(),
      cambiarEstado: jest.fn(),
      obtenerResumen: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PedidosController],
      providers: [
        { provide: PedidosService, useValue: pedidosService },
      ],
    })
      // Desactivar guard JWT para testear los endpoints sin token
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();

    // Activar ValidationPipe como en producción
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    console.log(
      `\n${COLORS.bold}${COLORS.green}` +
      `  🚀 Servidor de test levantado — testeando módulo PEDIDOS` +
      `${COLORS.reset}\n`,
    );
  });

  afterAll(async () => {
    await app.close();
    console.log(
      `\n${COLORS.bold}${COLORS.green}` +
      `  ✅ Todos los endpoints verificados correctamente` +
      `${COLORS.reset}\n`,
    );
  });

  // ─────────────────────────────────────
  // POST /pedidos
  // ─────────────────────────────────────

  describe('POST /pedidos', () => {
    const requestBody = {
      nombreCliente: 'Juan Pérez',
      telefono: '+5493411234567',
      email: 'juan@example.com',
      tipoEventoId: 1,
      templateId: 1,
      serviciosIds: [1, 2],
    };

    it('201 — Crear pedido exitosamente', async () => {
      logSeparator('POST /pedidos — Crear pedido desde landing (público)');
      logEndpoint('POST', '/pedidos', 'Crear pedido con datos válidos');
      logRequest(requestBody);

      pedidosService.crear.mockResolvedValue(pedidoResponse);

      const res = await request(app.getHttpServer())
        .post('/pedidos')
        .send(requestBody)
        .expect(201);

      logResponse(res.status, res.body);

      expect(res.body.id).toBe(1);
      expect(res.body.estado).toBe('PENDIENTE');
      expect(res.body.precioTotal).toBe(40000);
      expect(res.body.servicios).toHaveLength(2);
    });

    it('400 — Validación: campos requeridos vacíos', async () => {
      const bodyInvalido = { email: 'no-es-email' };

      logEndpoint('POST', '/pedidos', 'Request con campos inválidos');
      logRequest(bodyInvalido);

      const res = await request(app.getHttpServer())
        .post('/pedidos')
        .send(bodyInvalido)
        .expect(400);

      logResponse(res.status, res.body);

      expect(res.status).toBe(400);
      expect(res.body.message).toBeDefined();
    });

    it('400 — Validación: email con formato inválido', async () => {
      const bodyEmailMalo = {
        ...requestBody,
        email: 'esto-no-es-un-email',
      };

      logEndpoint('POST', '/pedidos', 'Request con email inválido');
      logRequest(bodyEmailMalo);

      const res = await request(app.getHttpServer())
        .post('/pedidos')
        .send(bodyEmailMalo)
        .expect(400);

      logResponse(res.status, res.body);

      expect(res.status).toBe(400);
    });

    it('400 — Validación: campo no permitido (whitelisted)', async () => {
      const bodyConCampoExtra = {
        ...requestBody,
        campoHacker: 'valor malicioso',
      };

      logEndpoint('POST', '/pedidos', 'Request con campo no permitido');
      logRequest(bodyConCampoExtra);

      const res = await request(app.getHttpServer())
        .post('/pedidos')
        .send(bodyConCampoExtra)
        .expect(400);

      logResponse(res.status, res.body);

      expect(res.status).toBe(400);
    });
  });

  // ─────────────────────────────────────
  // GET /pedidos
  // ─────────────────────────────────────

  describe('GET /pedidos', () => {
    it('200 — Listar pedidos paginados (sin filtro)', async () => {
      logSeparator('GET /pedidos — Listar pedidos (admin, JWT)');
      logEndpoint('GET', '/pedidos', 'Listar todos sin filtro');
      logRequest({});

      pedidosService.listar.mockResolvedValue(listadoPaginado);

      const res = await request(app.getHttpServer())
        .get('/pedidos')
        .expect(200);

      logResponse(res.status, res.body);

      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('200 — Listar con filtro por estado y paginación', async () => {
      const filtrado = {
        data: [pedidoResponse],
        meta: { page: 2, limit: 5, total: 8, totalPages: 2 },
      };

      logEndpoint(
        'GET',
        '/pedidos?page=2&limit=5&estado=PENDIENTE',
        'Con filtro de estado + paginación',
      );
      logRequest({ query: 'page=2&limit=5&estado=PENDIENTE' });

      pedidosService.listar.mockResolvedValue(filtrado);

      const res = await request(app.getHttpServer())
        .get('/pedidos?page=2&limit=5&estado=PENDIENTE')
        .expect(200);

      logResponse(res.status, res.body);

      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.limit).toBe(5);
    });
  });

  // ─────────────────────────────────────
  // GET /pedidos/:id
  // ─────────────────────────────────────

  describe('GET /pedidos/:id', () => {
    it('200 — Obtener pedido por ID', async () => {
      logSeparator('GET /pedidos/:id — Obtener pedido (admin, JWT)');
      logEndpoint('GET', '/pedidos/1', 'Pedido existente');
      logRequest({});

      pedidosService.obtenerPorId.mockResolvedValue(pedidoResponse);

      const res = await request(app.getHttpServer())
        .get('/pedidos/1')
        .expect(200);

      logResponse(res.status, res.body);

      expect(res.body.id).toBe(1);
      expect(res.body.tipoEventoNombre).toBe('Boda');
      expect(res.body.servicios).toHaveLength(2);
    });

    it('404 — Pedido no encontrado', async () => {
      logEndpoint('GET', '/pedidos/999', 'Pedido inexistente');
      logRequest({});

      pedidosService.obtenerPorId.mockRejectedValue(
        new (require('@nestjs/common').NotFoundException)(
          'Pedido #999 no encontrado.',
        ),
      );

      const res = await request(app.getHttpServer())
        .get('/pedidos/999')
        .expect(404);

      logResponse(res.status, res.body);

      expect(res.body.statusCode).toBe(404);
      expect(res.body.message).toContain('999');
    });
  });

  // ─────────────────────────────────────
  // PATCH /pedidos/:id/estado
  // ─────────────────────────────────────

  describe('PATCH /pedidos/:id/estado', () => {
    it('200 — PENDIENTE → CONTACTADO (transición válida)', async () => {
      logSeparator('PATCH /pedidos/:id/estado — Cambiar estado (admin, JWT)');
      const body = { estado: 'CONTACTADO' };

      logEndpoint('PATCH', '/pedidos/1/estado', 'PENDIENTE → CONTACTADO');
      logRequest(body);

      pedidosService.cambiarEstado.mockResolvedValue(pedidoContactado);

      const res = await request(app.getHttpServer())
        .patch('/pedidos/1/estado')
        .send(body)
        .expect(200);

      logResponse(res.status, res.body);

      expect(res.body.estado).toBe('CONTACTADO');
    });

    it('200 — CONTACTADO → COMPLETADO (transición válida)', async () => {
      const body = { estado: 'COMPLETADO' };

      logEndpoint('PATCH', '/pedidos/1/estado', 'CONTACTADO → COMPLETADO');
      logRequest(body);

      pedidosService.cambiarEstado.mockResolvedValue({
        ...pedidoResponse,
        estado: 'COMPLETADO',
      });

      const res = await request(app.getHttpServer())
        .patch('/pedidos/1/estado')
        .send(body)
        .expect(200);

      logResponse(res.status, res.body);

      expect(res.body.estado).toBe('COMPLETADO');
    });

    it('200 — CONTACTADO → CANCELADO (transición válida)', async () => {
      const body = { estado: 'CANCELADO' };

      logEndpoint('PATCH', '/pedidos/1/estado', 'CONTACTADO → CANCELADO');
      logRequest(body);

      pedidosService.cambiarEstado.mockResolvedValue({
        ...pedidoResponse,
        estado: 'CANCELADO',
      });

      const res = await request(app.getHttpServer())
        .patch('/pedidos/1/estado')
        .send(body)
        .expect(200);

      logResponse(res.status, res.body);

      expect(res.body.estado).toBe('CANCELADO');
    });

    it('409 — Transición inválida PENDIENTE → COMPLETADO', async () => {
      const body = { estado: 'COMPLETADO' };

      logEndpoint('PATCH', '/pedidos/1/estado', 'PENDIENTE → COMPLETADO (inválido)');
      logRequest(body);

      pedidosService.cambiarEstado.mockRejectedValue(
        new (require('@nestjs/common').ConflictException)(
          'No se puede cambiar de PENDIENTE a COMPLETADO. Transiciones válidas desde PENDIENTE: CONTACTADO.',
        ),
      );

      const res = await request(app.getHttpServer())
        .patch('/pedidos/1/estado')
        .send(body)
        .expect(409);

      logResponse(res.status, res.body);

      expect(res.body.statusCode).toBe(409);
    });

    it('400 — Estado inválido (no existe en el enum)', async () => {
      const body = { estado: 'INVENTADO' };

      logEndpoint('PATCH', '/pedidos/1/estado', 'Estado que no existe en el enum');
      logRequest(body);

      const res = await request(app.getHttpServer())
        .patch('/pedidos/1/estado')
        .send(body)
        .expect(400);

      logResponse(res.status, res.body);

      expect(res.status).toBe(400);
    });
  });

  // ─────────────────────────────────────
  // GET /pedidos/:id/resumen
  // ─────────────────────────────────────

  describe('GET /pedidos/:id/resumen', () => {
    it('200 — Resumen público con link de WhatsApp', async () => {
      logSeparator('GET /pedidos/:id/resumen — Resumen público');
      logEndpoint('GET', '/pedidos/1/resumen', 'Resumen con WhatsApp link');
      logRequest({});

      pedidosService.obtenerResumen.mockResolvedValue(resumenResponse);

      const res = await request(app.getHttpServer())
        .get('/pedidos/1/resumen')
        .expect(200);

      logResponse(res.status, res.body);

      expect(res.body.whatsappLink).toContain('wa.me');
      expect(res.body.precioTotal).toBe(40000);
      expect(res.body.servicios).toHaveLength(2);
    });

    it('404 — Resumen de pedido inexistente', async () => {
      logEndpoint('GET', '/pedidos/999/resumen', 'Pedido inexistente');
      logRequest({});

      pedidosService.obtenerResumen.mockRejectedValue(
        new (require('@nestjs/common').NotFoundException)(
          'Pedido #999 no encontrado.',
        ),
      );

      const res = await request(app.getHttpServer())
        .get('/pedidos/999/resumen')
        .expect(404);

      logResponse(res.status, res.body);

      expect(res.body.statusCode).toBe(404);
    });
  });
});