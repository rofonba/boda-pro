// Generación de slugs — ÚNICA fuente de verdad.
//
// Este módulo lo comparten el script de migración (migrar.js) y la API
// (app/api/guests/route.js) a propósito: si cada uno tuviera su propia copia,
// cualquier divergencia haría que las URLs dejaran de encontrar al invitado.
// Si tocas la lógica, tócala solo aquí.

/** Slug de reserva cuando un nombre no deja ningún carácter válido. */
const SLUG_RESERVA = "invitado";

/**
 * Convierte un nombre en un slug limpio, humano y apto para URL.
 *
 *   "Virginia Agudo"  → "virginia-agudo"
 *   "Joaquín"         → "joaquin"
 *   "Mª Jose"         → "ma-jose"
 *   "Jose luis"       → "jose-luis"
 *
 * Usa NFKD (no NFD) para que las tildes desaparezcan (á→a, ñ→n) y además los
 * caracteres de compatibilidad se resuelvan a su letra base (ª→a, º→o).
 *
 * @param {string} texto
 * @returns {string} slug, o "" si el texto no deja ningún carácter útil
 */
export function slugify(texto) {
  if (typeof texto !== "string") return "";

  return texto
    .normalize("NFKD") // á→a+´, ñ→n+~, ª→a
    .replace(/[\u0300-\u036f]/g, "") // elimina los acentos ya separados
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-") // todo lo que no sea letra/número → guion
    .replace(/^-+|-+$/g, ""); // sin guiones sobrantes en los extremos
}

/**
 * Convierte una lista de nombres en slugs ÚNICOS, preservando el orden.
 *
 * Necesario porque el listado de invitados repite nombres de pila (hay tres
 * "Inma" y tres "Víctor"): sin desambiguar, unos documentos sobrescribirían a
 * otros en Firestore y se perderían invitados. El primero se queda el slug
 * limpio y los siguientes reciben sufijo numérico:
 *
 *   ["Inma", "Inma", "Inma"] → ["inma", "inma-2", "inma-3"]
 *
 * Importante: se comprueba contra TODOS los slugs ya asignados, no solo contra
 * el nombre base. Si no, un nombre como "Victor 2" (que de forma natural genera
 * "victor-2") chocaría con el sufijo asignado al segundo "Víctor" y uno de los
 * dos invitados se perdería al escribir en Firestore.
 *
 * Es determinista: el mismo CSV produce siempre los mismos slugs, así que el
 * script de migración se puede re-ejecutar sin que cambien las URLs.
 *
 * @param {string[]} nombres
 * @returns {Array<{ nombre: string, slug: string, base: string, duplicado: boolean }>}
 */
export function slugsUnicos(nombres) {
  const asignados = new Set();

  return nombres.map((nombre) => {
    const base = slugify(nombre) || SLUG_RESERVA;

    let slug = base;
    let n = 1;
    while (asignados.has(slug)) {
      n += 1;
      slug = `${base}-${n}`;
    }
    asignados.add(slug);

    return { nombre, slug, base, duplicado: slug !== base };
  });
}
