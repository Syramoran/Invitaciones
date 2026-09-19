/**
 * Script one-off — NO forma parte del runtime de la app.
 *
 * Recorre `invitado ORDER BY id ASC` y calcula su `slug` con el mismo
 * algoritmo que ya genera las URLs ?invitado= existentes (toSlug), sufijando
 * -2, -3... ante colisión dentro de la misma invitacion_id. Reproduce
 * determinísticamente el comportamiento del Array.find en memoria que usaba
 * el código viejo (mismo orden por id).
 *
 * Uso:
 *   npx ts-node -r tsconfig-paths/register scripts/backfill-invitado-slug.ts           (dry-run, no escribe)
 *   npx ts-node -r tsconfig-paths/register scripts/backfill-invitado-slug.ts --apply    (escribe los UPDATE)
 */
import 'dotenv/config';
import { Client } from 'pg';
import { toSlug } from '../src/common/utils/slug.util';

async function main() {
  const apply = process.argv.includes('--apply');

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const { rows: invitados } = await client.query(
      `SELECT id, invitacion_id, nombre, apellido, slug
       FROM invitado
       ORDER BY id ASC`,
    );

    const usadosPorInvitacion = new Map<string, Set<string>>();
    const cambios: { id: number; invitacionId: string; nombre: string; apellido: string; slugViejo: string | null; slugNuevo: string }[] = [];

    for (const inv of invitados) {
      const invitacionId: string = inv.invitacion_id;
      if (!usadosPorInvitacion.has(invitacionId)) {
        usadosPorInvitacion.set(invitacionId, new Set());
      }
      const usados = usadosPorInvitacion.get(invitacionId)!;

      const base = toSlug(`${inv.nombre}-${inv.apellido}`);
      let slug = base;
      let sufijo = 2;
      while (usados.has(slug)) {
        slug = `${base}-${sufijo}`;
        sufijo++;
      }
      usados.add(slug);

      if (inv.slug !== slug) {
        cambios.push({
          id: inv.id,
          invitacionId,
          nombre: inv.nombre,
          apellido: inv.apellido,
          slugViejo: inv.slug,
          slugNuevo: slug,
        });
      }
    }

    console.log(`Total invitados: ${invitados.length}`);
    console.log(`Slugs a asignar/actualizar: ${cambios.length}`);
    console.table(
      cambios.map((c) => ({
        id: c.id,
        nombre: `${c.nombre} ${c.apellido}`,
        slugViejo: c.slugViejo ?? '(vacío)',
        slugNuevo: c.slugNuevo,
      })),
    );

    if (!apply) {
      console.log('\nDRY-RUN — no se escribió nada. Corré con --apply para aplicar los UPDATE.');
      return;
    }

    await client.query('BEGIN');
    for (const c of cambios) {
      await client.query('UPDATE invitado SET slug = $1 WHERE id = $2', [c.slugNuevo, c.id]);
    }
    await client.query('COMMIT');
    console.log(`\n✅ Aplicado: ${cambios.length} filas actualizadas.`);
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('❌ Error en backfill:', err);
  process.exit(1);
});
