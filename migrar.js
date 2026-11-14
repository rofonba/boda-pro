/**
 * Migración de invitados.csv → Firestore (colección `invitados`).
 *
 *   npm run migrar:test     ← simulación, no escribe nada (recomendado primero)
 *   npm run migrar          ← escribe en Firestore
 *
 * Formato esperado de invitados.csv (una PERSONA por fila):
 *
 *   numero,nombre,grupo
 *   1,Virginia Agudo,
 *   7,Tía Beatriz,Pareja 3
 *   8,Xabi,Pareja 3
 *
 *  • Los nombres de las columnas dan igual (valen "Nº,Quién,Relación"): la
 *    primera línea se trata como cabecera si no empieza por un número.
 *  • `grupo` es una ETIQUETA para juntar filas: las que lleven el mismo texto
 *    comparten documento, enlace (?id=) y formulario. Si se deja vacío, la
 *    persona va sola. La etiqueta no se muestra en la web.
 *  • El nombre de la invitación (saludo y enlace) se construye con los
 *    nombres de sus miembros: "Tía Beatriz y Xabi" → /?id=tia-beatriz-y-xabi.
 *  • La tercera columna es opcional: un CSV de dos columnas sigue valiendo.
 *
 * Garantías:
 *
 *  • IDEMPOTENTE — se puede re-ejecutar sin miedo. Actualiza `nombre`,
 *    `numero` y los nombres de los miembros, pero NUNCA pisa las respuestas
 *    ya enviadas (asistencia y alergia de cada miembro, autobús, canción).
 *    Un miembro nuevo en un grupo que ya existía entra como "Pendiente".
 *
 *  • SIN PÉRDIDAS — los grupos con el mismo nombre (hay tres "Inma") se
 *    desambiguan con sufijo, de modo que cada invitación tiene su propio
 *    documento. Ver lib/slug.js.
 *
 *  • LIMPIEZA SEGURA — avisa de los documentos que quedaron huérfanos (por
 *    ejemplo al agrupar a dos personas que antes iban sueltas, o al cambiar
 *    un nombre) y los borra solo si nadie había respondido. Si había
 *    respuesta, los conserva y te los señala para que decidas tú.
 */

import { readFileSync } from "node:fs";
import path from "node:path";
import { COLECCION_INVITADOS, getDb } from "./lib/firebase.js";
import { haRespondido, miembroVacio, normalizarInvitacion } from "./lib/invitacion.js";
import { slugsUnicos } from "./lib/slug.js";

const ARCHIVO_CSV = "invitados.csv";
const SIMULACRO = process.argv.includes("--dry-run");

/**
 * Lee y valida el CSV.
 * @returns {Array<{ numero: number|null, nombre: string, grupo: string, linea: number }>}
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

  // Cabecera: la primera línea, si no empieza por un número. ¿Tiene tercera
  // columna (grupo)? Si no, todas las personas van solas.
  const cabecera = (lineas[0] ?? "").trim();
  const hayCabecera = cabecera !== "" && !/^\d/.test(cabecera);
  const conGrupo = hayCabecera && cabecera.split(",").length >= 3;

  lineas.forEach((cruda, i) => {
    const linea = i + 1;
    const texto = cruda.trim();

    if (!texto) return; // línea en blanco
    if (linea === 1 && hayCabecera) return;

    // Partimos en la PRIMERA coma (número | resto) y, si hay columna grupo,
    // en la ÚLTIMA (nombre | grupo). Así un nombre con coma no se trocea
    // siempre que la fila lleve su coma final (aunque el grupo esté vacío).
    const coma = texto.indexOf(",");
    if (coma === -1) {
      avisos.push(`línea ${linea}: sin coma, la ignoro → "${texto}"`);
      return;
    }

    const numero = Number.parseInt(texto.slice(0, coma).trim(), 10);
    let resto = texto.slice(coma + 1);
    let grupo = "";

    if (conGrupo) {
      const ultima = resto.lastIndexOf(",");
      if (ultima !== -1) {
        grupo = resto.slice(ultima + 1).trim();
        resto = resto.slice(0, ultima);
      }
    }

    const nombre = resto.trim();
    if (!nombre) {
      avisos.push(`línea ${linea}: nombre vacío, la ignoro`);
      return;
    }

    filas.push({
      numero: Number.isNaN(numero) ? null : numero,
      nombre,
      grupo, // "" → invitación individual
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

/** ["Blanca"] → "Blanca" · ["Blanca","Lázaro"] → "Blanca y Lázaro" · 3+ → "A, B y C" */
function nombreInvitacion(nombres) {
  if (nombres.length <= 1) return nombres[0] ?? "";
  return `${nombres.slice(0, -1).join(", ")} y ${nombres.at(-1)}`;
}

async function migrar() {
  console.log(`\n${"─".repeat(64)}`);
  console.log(`  MIGRACIÓN  ${ARCHIVO_CSV} → Firestore/${COLECCION_INVITADOS}`);
  if (SIMULACRO) console.log("  MODO SIMULACRO — no se escribe nada en Firestore");
  console.log(`${"─".repeat(64)}`);

  // ── 1. CSV → grupos → slugs únicos ───────────────────────────────────────
  const filas = leerCsv();

  // Las filas con el mismo grupo (texto exacto) forman una invitación, en el
  // orden de su primera aparición en el CSV. Una fila sin grupo va sola: dos
  // personas que se llamen igual ("Inma" e "Inma") NO se juntan por eso; se
  // juntan solo si se les pone el mismo grupo.
  const porGrupo = new Map();
  for (const fila of filas) {
    const clave = fila.grupo || `\u0000fila-${fila.linea}`;
    if (!porGrupo.has(clave)) porGrupo.set(clave, []);
    porGrupo.get(clave).push(fila);
  }

  const grupos = [...porGrupo.values()].map((miembros) => ({
    nombre: nombreInvitacion(miembros.map((m) => m.nombre)),
    miembros,
    // El número de la invitación es el más bajo de sus miembros.
    numero: miembros.reduce(
      (min, m) => (m.numero !== null && (min === null || m.numero < min) ? m.numero : min),
      null
    ),
  }));

  const slugs = slugsUnicos(grupos.map((g) => g.nombre));
  const invitados = grupos.map((g, i) => ({ ...g, slug: slugs[i].slug }));

  console.log(
    `\n✓ ${filas.length} personas leídas de ${ARCHIVO_CSV}, en ${invitados.length} invitaciones`
  );

  const desambiguados = slugs.filter((s) => s.duplicado);
  if (desambiguados.length) {
    console.log(
      `\n⚠  ${desambiguados.length} invitaciones con el mismo nombre en el CSV. Les doy un\n` +
        "   sufijo para que nadie se sobrescriba. Si quieres URLs más elegantes,\n" +
        `   distingue esos nombres (o grupos) en ${ARCHIVO_CSV} y vuelve a ejecutar:\n`
    );
    desambiguados.forEach((s) => {
      const inv = invitados.find((i) => i.slug === s.slug);
      console.log(`   nº ${String(inv.numero).padStart(3)}  ${s.nombre.padEnd(26)} → /?id=${s.slug}`);
    });
  }

  // Números de invitado repetidos: no rompen nada (el ID es el slug), pero
  // suelen delatar una errata en el CSV.
  const porNumero = new Map();
  filas.forEach((f) => {
    if (f.numero !== null) porNumero.set(f.numero, (porNumero.get(f.numero) ?? 0) + 1);
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

      const nombres = inv.miembros.map((m) => m.nombre);

      if (previo) {
        // Solo la identidad. Las respuestas se conservan: cada miembro se
        // empareja por nombre con el guardado; si es nuevo, entra pendiente.
        const guardados = normalizarInvitacion(inv.slug, previo).miembros;
        const miembros = nombres.map(
          (nombre) => guardados.find((g) => g.nombre === nombre) ?? miembroVacio(nombre)
        );
        lote.update(ref, { nombre: inv.nombre, numero: inv.numero, miembros });
        actualizados += 1;
        console.log(`   ↻ ${inv.slug.padEnd(28)} ${inv.nombre}  (${nombres.join(", ")})`);
      } else {
        lote.set(ref, {
          nombre: inv.nombre,
          numero: inv.numero,
          miembros: nombres.map(miembroVacio),
          autobus: false,
          cancion: "",
          creadoEn: new Date().toISOString(),
        });
        creados += 1;
        console.log(`   ✅ Subido: ${inv.slug.padEnd(22)} ${inv.nombre}  (${nombres.join(", ")})`);
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
      // normalizarInvitacion entiende también el modelo antiguo (una persona
      // por documento), así que un huérfano de antes de los grupos se evalúa
      // igual de bien.
      const inv = normalizarInvitacion(id, datos);
      const respondio =
        haRespondido(inv) ||
        inv.autobus ||
        inv.cancion !== "" ||
        inv.miembros.some((m) => m.alergia !== "");

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
  console.log(`  Invitaciones: ${invitados.length}  (${filas.length} personas)`);
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
