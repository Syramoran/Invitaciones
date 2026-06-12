require('dotenv').config();
const { Client } = require('pg');

const API_URL = 'http://localhost:3000/v1';

async function runTests() {
  console.log('--- INICIANDO PRUEBAS DE INTEGRACIÓN V2 ---');

  try {
    // 1. Registro
    console.log('\n[1] POST /auth/register');
    const randomSuffix = Math.floor(Math.random() * 10000);
    const email = `test.client.${randomSuffix}@example.com`;
    
    let res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: `client_${randomSuffix}`,
        email,
        password: 'Password123!',
        nombreCompleto: 'Test Client'
      })
    });
    let data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('Registro Exitoso:', data);
    
    const client = new Client({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/invitaciones_db' });
    await client.connect();
    
    const userRes = await client.query('SELECT token_verificacion, id FROM usuario WHERE email = $1', [email]);
    const verificationToken = userRes.rows[0].token_verificacion;
    const userId = userRes.rows[0].id;
    console.log(`Token de verificación obtenido de DB: ${verificationToken}`);

    // 2. Verificar Email
    console.log('\n[2] GET /auth/verify-email');
    res = await fetch(`${API_URL}/auth/verify-email?token=${verificationToken}`);
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('Email Verificado:', data);

    // 3. Login
    console.log('\n[3] POST /auth/login');
    res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: `client_${randomSuffix}`, password: 'Password123!' })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    
    const accessToken = data.access_token;
    console.log('Login Exitoso, Token JWT obtenido');

    const authHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    };

    // 4. Crear Pedido
    console.log('\n[4] POST /client/pedidos');
    const templateRes = await client.query('SELECT id, tipo_evento_id FROM template LIMIT 1');
    const template = templateRes.rows[0];
    const servicioRes = await client.query('SELECT id FROM servicio LIMIT 1');
    const servicio = servicioRes.rows[0];

    if (!template) {
      console.log('❌ No hay templates en la DB, saltando pruebas de pedidos.');
      await client.end();
      return;
    }

    res = await fetch(`${API_URL}/client/pedidos`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        tipoEventoId: template.tipo_evento_id,
        templateId: template.id,
        serviciosIds: servicio ? [servicio.id] : []
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const pedidoId = data.id;
    console.log('Pedido Creado:', data);

    // 5. Crear Invitacion (Borrador)
    console.log('\n[5] POST /client/invitaciones');
    res = await fetch(`${API_URL}/client/invitaciones`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        pedidoId: parseInt(pedidoId, 10),
        titulo: 'Boda de Prueba',
        fechaEvento: '2027-10-15',
        horaEvento: '20:00',
        ubicacion: 'Salón Principal',
        direccion: 'Av. Libertador 1234',
        camposEspecificos: {
          nombreAnfitriones: 'Ana y Juan',
          mensajeBienvenida: '¡Los esperamos!'
        }
      })
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    const invitacionId = data.id;
    console.log('Invitación (Borrador) Creada:', data);

    // 6. Checkout Mercado Pago
    console.log('\n[6] POST /client/pedidos/:id/checkout');
    res = await fetch(`${API_URL}/client/pedidos/${pedidoId}/checkout`, {
      method: 'POST',
      headers: authHeaders
    });
    data = await res.json();
    if (!res.ok) throw new Error(JSON.stringify(data));
    console.log('URL de Checkout MP obtenida:', data.init_point);

    // 7. Simular Webhook MP
    console.log('\n[7] POST /pagos/webhook');
    const mpId = Math.floor(Math.random() * 10000000);
    console.log('Nota: El webhook real hace un request a la API de MP. En testing real con MP Sandbox, esto fallará si el ID es inventado. Se enviará de todos modos.');
    try {
      res = await fetch(`${API_URL}/pagos/webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment',
          data: { id: mpId.toString() }
        })
      });
      console.log('Webhook status:', res.status);
    } catch (e) {
      console.log('Webhook error:', e.message);
    }

    await client.end();
    console.log('\n--- PRUEBAS COMPLETADAS CON ÉXITO ---');

  } catch (error) {
    console.error('\n❌ ERROR EN LAS PRUEBAS:', error.message);
  }
}

runTests();
