/**
 * Normaliza un texto a slug: minusculas, sin acentos, espacios -> guiones.
 * Mismo algoritmo que ya se usa para los links ?invitado= existentes -
 * no modificar sin correr de nuevo el backfill, rompe links ya compartidos.
 * Ejemplo: "Jose Echevarria" -> "jose-echevarria"
 */
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/\s+/g, '-') // Espacios -> guiones
    .trim();
}

/**
 * Genera un slug unico sufijando -2, -3... ante colision con yaUsados.
 */
export function generarSlugUnico(base: string, yaUsados: Set<string>): string {
  const slugBase = toSlug(base);
  let slug = slugBase;
  let sufijo = 2;

  while (yaUsados.has(slug)) {
    slug = `${slugBase}-${sufijo}`;
    sufijo++;
  }

  return slug;
}
