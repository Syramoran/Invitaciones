import * as jwt from 'jsonwebtoken';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const token = jwt.sign({ sub: 1, email: 'admin@invitaciones.com', role: 'admin' }, process.env.JWT_SECRET || 'd09a2d7a4e243b69f223a2b291602ca8d0a3aff48c9da00bf01b1fe767a56908', { expiresIn: '1h' });
  
  const res = await fetch('http://localhost:3000/v1/pagos/crear-preferencia/22fc8018-cfdd-478b-a0bc-3372aa80483a', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({title: 'cumple', price: 30000})
  });
  
  console.log(res.status);
  console.log(await res.text());
}
run();
