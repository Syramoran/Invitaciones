/**
 * Links "lindos" para invitaciones puntuales: slug -> uuid real de la
 * invitación. Se usa para:
 *  - el redirect público en App.tsx (/<slug> -> /<uuid>)
 *  - mostrar/copiar URLs con el slug en vez del uuid en el panel de /asistentes
 *
 * Agregar acá una entrada por cada slug que se quiera habilitar.
 */
export const SLUG_REDIRECTS: Record<string, string> = {
  angieyfran: '39eb3de2-4c79-44b0-8bd1-d51c8960422c',
  franyangie: 'c156203a-7d76-4232-9ecb-a78bf657ac12',
}

const UUID_TO_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(SLUG_REDIRECTS).map(([slug, uuid]) => [uuid, slug]),
)

/** Si la URL contiene el uuid de una invitación con slug configurado, lo reemplaza por el slug. */
export function toPrettyInvitationUrl(url: string): string {
  for (const [uuid, slug] of Object.entries(UUID_TO_SLUG)) {
    if (url.includes(uuid)) {
      return url.replace(uuid, slug)
    }
  }
  return url
}
