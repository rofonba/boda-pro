// Acceso a la colección `invitados` — SOLO SERVIDOR.
//
// Punto único de lectura de invitados: lo usan la página principal (para
// personalizar el saludo antes de enviar el HTML), la API y el cuadro de mando.
// Al estar centralizado, la forma del objeto `invitado` es la misma en toda la
// app y no hay tres mapeos que se puedan desincronizar.
//
// ── Esquema del documento ──────────────────────────────────────────────────
//   ID del documento = slug del nombre (= el ?id= de la URL)
//
//   nombre       string    identidad, la escribe solo migrar.js
//   numero       number    identidad, la escribe solo migrar.js
//   asistencia   string    "Sí" | "No" | "Pendiente"   ← lo edita el invitado
//   autobus      boolean                               ← lo edita el invitado
//   alergia      string                                ← lo edita el invitado
//   cancion      string                                ← lo edita el invitado
//   creadoEn     string    ISO, lo pone migrar.js
//   respondidoEn string    ISO, cuándo contestó por última vez
// ───────────────────────────────────────────────────────────────────────────

import { ASISTENCIA_PENDIENTE, COLECCION_INVITADOS } from "./constantes.js";
import { getDb } from "./firebase";

/**
 * Convierte un documento de Firestore en el objeto `invitado` que consume la
 * app. Aplica valores por defecto para que el frontend nunca reciba undefined,
 * incluso si el documento viene de una importación antigua.
 */
export function normalizarInvitado(doc) {
  const d = doc.data() ?? {};
  return {
    id: doc.id,
    nombre: d.nombre ?? "",
    numero: typeof d.numero === "number" ? d.numero : null,
    asistencia: d.asistencia ?? ASISTENCIA_PENDIENTE,
    autobus: d.autobus === true,
    alergia: d.alergia ?? "",
    cancion: d.cancion ?? "",
  };
}

/**
 * Lee un invitado por su slug. Acceso directo por clave, sin consultas.
 *
 * @param {string | undefined} id slug del invitado (?id= de la URL)
 * @returns {Promise<object|null>} el invitado, o null si el slug no existe
 */
export async function obtenerInvitado(id) {
  const slug = typeof id === "string" ? id.trim() : "";
  if (!slug) return null;

  const doc = await getDb().collection(COLECCION_INVITADOS).doc(slug).get();
  return doc.exists ? normalizarInvitado(doc) : null;
}

/**
 * Lee la lista completa de invitados, ordenada por su número.
 *
 * Se ordena en memoria y no con orderBy("numero") a propósito: una consulta
 * ordenada en Firestore descarta los documentos que no tengan ese campo, y
 * perder un invitado del resumen sería peor que un orden imperfecto.
 *
 * @returns {Promise<object[]>}
 */
export async function listarInvitados() {
  const snap = await getDb().collection(COLECCION_INVITADOS).get();

  return snap.docs
    .map(normalizarInvitado)
    .sort(
      (a, b) =>
        (a.numero ?? Number.MAX_SAFE_INTEGER) - (b.numero ?? Number.MAX_SAFE_INTEGER)
    );
}
