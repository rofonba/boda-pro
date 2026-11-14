// Acceso a la colección `invitados` — SOLO SERVIDOR.
//
// Punto único de lectura de invitaciones: lo usan la página principal (para
// personalizar el saludo antes de enviar el HTML), la API y el cuadro de mando.
//
// Cada documento es una INVITACIÓN (grupo/familia) con uno o varios miembros.
// El esquema completo está documentado en lib/invitacion.js, que es también
// quien normaliza los datos para que la forma del objeto sea la misma en toda
// la app.

import { COLECCION_INVITADOS } from "./constantes.js";
import { getDb } from "./firebase";
import { normalizarInvitacion, ordenarPorNumero } from "./invitacion.js";

/** Documento de Firestore → invitación normalizada. */
export function normalizarInvitado(doc) {
  return normalizarInvitacion(doc.id, doc.data() ?? {});
}

/**
 * Lee una invitación por su slug. Acceso directo por clave, sin consultas.
 *
 * @param {string | undefined} id slug de la invitación (?id= de la URL)
 * @returns {Promise<object|null>} la invitación, o null si el slug no existe
 */
export async function obtenerInvitado(id) {
  const slug = typeof id === "string" ? id.trim() : "";
  if (!slug) return null;

  const doc = await getDb().collection(COLECCION_INVITADOS).doc(slug).get();
  return doc.exists ? normalizarInvitado(doc) : null;
}

/**
 * Lee la lista completa de invitaciones, ordenada por su número.
 *
 * Se ordena en memoria y no con orderBy("numero") a propósito: una consulta
 * ordenada en Firestore descarta los documentos que no tengan ese campo, y
 * perder una invitación del resumen sería peor que un orden imperfecto.
 *
 * @returns {Promise<object[]>}
 */
export async function listarInvitados() {
  const snap = await getDb().collection(COLECCION_INVITADOS).get();
  return ordenarPorNumero(snap.docs.map(normalizarInvitado));
}
