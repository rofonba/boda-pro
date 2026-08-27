/**
 * Migración de invitados.csv → Firestore (colección `invitados`).
 *
 *   npm run migrar:test     ← simulación, no escribe nada (recomendado primero)
 *   npm run migrar          ← escribe en Firestore
 *
 * Formato esperado de invitados.csv:
 *
 *   numero,nombre
 *   1,Virginia Agudo
 *   2,Joaquín
 *
 * Garantías:
 *
 *  • IDEMPOTENTE — se puede re-ejecutar sin miedo. Actualiza `nombre` y
 *    `numero`, pero NUNCA pisa las respuestas que ya haya enviado un invitado
 *    (asistencia, autobús, alergia, canción).
 *
 *  • SIN PÉRDIDAS — los nombres repetidos del listado (hay tres "Inma") se
 *    desambiguan con sufijo, de modo que cada invitado tiene su propio
 *    documento. Ver lib/slug.js.
 *
 *  • LIMPIEZA SEGURA — avisa de los documentos que quedaron huérfanos (por
 *    ejemplo al añadir apellidos y cambiar el slug) y los borra solo si ese
 *    invitado todavía no había respondido. Si había respondido, lo conserva y
 *    te lo señala para que decidas tú.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { COLECCION_INVITADOS, getDb } from "./lib/firebase.js";
import { slugsUnicos } from "./lib/slug.js";

const ARCHIVO_CSV = "invitados.csv";
const SIMULACRO = process.argv.includes("--dry-run");

// Valores por defecto de un invitado que aún no ha respondido.
// Son también los campos que el invitado puede modificar desde la web.
const RESPUESTA_VACIA = {
  asistencia: "Pendiente",
  autobus: false,
  alergia: "",
  cancion: "",
};

/**
 * Lee y valida el CSV.
 * @returns {Array<{ numero: number|null, nombre: string, linea: number }>}
 */
function leerCsv() {
  const ruta = path.join(process.cwd(), ARCHIVO_CSV);

  let contenido;
  try {
    contenido = readFileSync(ruta, "utf8");
  } catch {
    throw new Error(`No encuentro ${ARCHIVO_CSV} en la raíz del proyecto (${ruta}).`);
  }

  const lineas = contenido.split(/\r?\n/);
  const filas = [];
  const avisos = [];

  lineas.forEach((cruda, i) => {
    const linea = i + 1;
    const texto = cruda.trim();

    if (!texto) return; // línea en blanco
    if (linea === 1 && /numero|número/i.test(texto)) return; // cabecera

    // Solo partimos en la PRIMERA coma: así un nombre que contenga comas
    // ("Ruiz, Jose Antonio") no se trocea.
    const coma = texto.indexOf(",");
    if (coma === -1) {
      avisos.push(`línea ${linea}: sin coma, la ignoro → "${texto}"`);
      return;
    }

    const numero = Number.parseInt(texto.slice(0, coma).trim(), 10);
    const nombre = texto.slice(coma + 1).trim();

    if (!nombre) {
      avisos.push(`línea ${linea}: nombre vacío, la ignoro`);
      return;
    }

    filas.push({
      numero: Number.isNaN(numero) ? null : numero,
      nombre,
      linea,
    });
  });

  if (avisos.length) {
    console.log("\n⚠  Filas ignoradas:");
    avisos.forEach((a) => console.log(`   ${a}`));
  }

  if (!filas.length) throw new Error(`${ARCHIVO_CSV} no contiene invitados válidos.`);

  return filas;
}

async function migrar() {
  console.log(`\n${"─".repeat(64)}`);
  console.log(`  MIGRACIÓN  ${ARCHIVO_CSV} → Firestore/${COLECCION_INVITADOS}`);
  if (SIMULACRO) console.log("  MODO SIMULACRO — no se escribe nada en Firestore");
  console.log(`${"─".repeat(64)}`);

  // ── 1. CSV → slugs únicos ────────────────────────────────────────────────
  const filas = leerCsv();
  const slugs = slugsUnicos(filas.map((f) => f.nombre));
  const invitados = filas.map((fila, i) => ({ ...fila, slug: slugs[i].slug }));

  console.log(`\n✓ ${invitados.length} invitados leídos de ${ARCHIVO_CSV}`);

  const desambiguados = slugs.filter((s) => s.duplicado);
  if (desambiguados.length) {
    console.log(
      `\n⚠  ${desambiguados.length} nombres repetidos en el CSV. Les doy un sufijo\n` +
        "   para que nadie se sobrescriba. Si quieres URLs más elegantes, añade\n" +
        `   el apellido a estas filas de ${ARCHIVO_CSV} y vuelve a ejecutar:\n`
    );
    desambiguados.forEach((s) => {
      const fila = invitados.find((inv) => inv.slug === s.slug);
      console.log(`   nº ${String(fila.numero).padStart(3)}  ${s.nombre.padEnd(26)} → /?id=${s.slug}`);
    });
  }

  // Números de invitado repetidos: no rompen nada (el ID es el slug), pero
  // suelen delatar una errata en el CSV.
  const porNumero = new Map();
  invitados.forEach((inv) => {
    if (inv.numero !== null) porNumero.set(inv.numero, (porNumero.get(inv.numero) ?? 0) + 1);
  });
  const numerosRepetidos = [...porNumero].filter(([, n]) => n > 1).map(([num]) => num);
  if (numerosRepetidos.length) {
    console.log(`\n⚠  Número de invitado repetido en el CSV: ${numerosRepetidos.join(", ")}`);
    console.log("   (no afecta a las URLs, pero quizá sea una errata)");
  }

  // ── 2. Estado actual en Firestore ────────────────────────────────────────
  const coleccion = getDb().collection(COLECCION_INVITADOS);
  const existentesSnap = await coleccion.get();
  const existentes = new Map(existentesSnap.docs.map((d) => [d.id, d.data()]));
  console.log(`\n✓ ${existentes.size} documentos ya en Firestore`);

  // ── 3. Escritura ─────────────────────────────────────────────────────────
  // Un lote de Firestore admite 500 operaciones; troceamos por seguridad.
  const TAMANO_LOTE = 400;
  let creados = 0;
  let actualizados = 0;

  for (let i = 0; i < invitados.length; i += TAMANO_LOTE) {
    const trozo = invitados.slice(i, i + TAMANO_LOTE);
    const lote = coleccion.firestore.batch();

    for (const inv of trozo) {
      const previo = existentes.get(inv.slug);
      const ref = coleccion.doc(inv.slug);

      if (previo) {
        // Solo la identidad. Las respuestas del invitado se quedan intactas.
        lote.update(ref, { nombre: inv.nombre, numero: inv.numero });
        actualizados += 1;
        console.log(`   ↻ ${inv.slug.padEnd(28)} ${inv.nombre}`);
      } else {
        lote.set(ref, {
          nombre: inv.nombre,
          numero: inv.numero,
          ...RESPUESTA_VACIA,
          creadoEn: new Date().toISOString(),
        });
        creados += 1;
        console.log(`   ✅ Subido: ${inv.slug.padEnd(22)} ${inv.nombre}`);
      }
    }

    if (!SIMULACRO) await lote.commit();
  }

  // ── 4. Huérfanos ─────────────────────────────────────────────────────────
  const slugsActuales = new Set(invitados.map((inv) => inv.slug));
  const huerfanos = [...existentes].filter(([id]) => !slugsActuales.has(id));

  let borrados = 0;
  const conservados = [];

  if (huerfanos.length) {
    console.log(`\n⚠  ${huerfanos.length} documentos en Firestore que ya no están en el CSV:`);

    const lote = coleccion.firestore.batch();
    for (const [id, datos] of huerfanos) {
      const respondio =
        (datos.asistencia && datos.asistencia !== "Pendiente") ||
        datos.autobus === true ||
        (datos.alergia ?? "") !== "" ||
        (datos.cancion ?? "") !== "";

      if (respondio) {
        conservados.push(id);
        console.log(`   ⛔ ${id.padEnd(28)} CONSERVADO — este invitado ya había respondido`);
      } else {
        lote.delete(coleccion.doc(id));
        borrados += 1;
        console.log(`   🗑  ${id.padEnd(28)} borrado (sin respuesta)`);
      }
    }
    if (!SIMULACRO && borrados) await lote.commit();
  }

  // ── 5. Resumen ───────────────────────────────────────────────────────────
  console.log(`\n${"─".repeat(64)}`);
  console.log(`  Creados:      ${creados}`);
  console.log(`  Actualizados: ${actualizados}`);
  console.log(`  Borrados:     ${borrados}`);
  console.log(`  Total CSV:    ${invitados.length}`);
  console.log(`${"─".repeat(64)}`);

  if (conservados.length) {
    console.log(
      "\n⛔ Revisa a mano estos documentos: ya no están en el CSV pero tienen\n" +
        "   respuestas guardadas, así que no los he tocado:"
    );
    conservados.forEach((id) => console.log(`   ${id}`));
  }

  if (SIMULACRO) {
    console.log("\nSimulacro terminado. Nada se ha escrito. Para aplicarlo: npm run migrar\n");
  } else {
    console.log(`\n✓ Migración completada. Prueba una invitación: /?id=${invitados[0].slug}\n`);
  }
}

migrar().catch((error) => {
  console.error(`\n✗ La migración ha fallado: ${error.message}\n`);
  process.exitCode = 1;
});
