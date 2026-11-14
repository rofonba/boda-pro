// Forma de una invitación (grupo/familia) — compartida por servidor y navegador.
//
// Este módulo no importa Firebase a propósito: lo usan lib/invitados.js
// (Admin SDK, servidor), lib/guests.js (SDK web, /backstage), migrar.js y
// lib/stats.js. Así la normalización es una sola y las vistas reciben siempre
// el mismo objeto, vengan los datos de donde vengan.
//
// ── Esquema del documento (colección `invitados`) ───────────────────────────
//   ID del documento = slug del grupo (= el ?id= de la URL)
//
//   nombre       string    nombre de la invitación: "Beatriz y Xavi"   (migrar.js)
//   numero       number    orden en la lista (nº del primer miembro)    (migrar.js)
//   miembros     array     una entrada por persona, en orden:
//     .nombre    string    "Beatriz"                                     (migrar.js)
//     .asistencia string   "Sí" | "No" | "Pendiente"            ← lo edita el invitado
//     .alergia   string    alergias de ESA persona               ← lo edita el invitado
//   autobus      boolean   global del grupo                      ← lo edita el invitado
//   cancion      string    global del grupo                      ← lo edita el invitado
//   creadoEn     string    ISO, lo pone migrar.js
//   respondidoEn string    ISO, cuándo contestó por última vez
// ────────────────────────────────────────────────────────────────────────────

import { ASISTENCIA_PENDIENTE, ASISTENCIA_VALIDA } from "./constantes.js";

/** Miembro recién creado, sin respuesta. */
export function miembroVacio(nombre) {
  return { nombre, asistencia: ASISTENCIA_PENDIENTE, alergia: "" };
}

function normalizarMiembro(m) {
  const nombre = typeof m?.nombre === "string" ? m.nombre : "";
  const asistencia = ASISTENCIA_VALIDA.includes(m?.asistencia)
    ? m.asistencia
    : ASISTENCIA_PENDIENTE;
  return { nombre, asistencia, alergia: typeof m?.alergia === "string" ? m.alergia : "" };
}

/**
 * Convierte los datos crudos de un documento en la invitación que consume la
 * app. Aplica valores por defecto para que el frontend nunca reciba undefined.
 *
 * Compatibilidad: un documento del modelo antiguo (una persona por documento,
 * con asistencia/alergia en la raíz) se convierte en un grupo de un miembro.
 * Así el panel sigue funcionando antes de volver a ejecutar migrar.js.
 *
 * @param {string} id slug del documento
 * @param {object} d datos del documento
 */
export function normalizarInvitacion(id, d = {}) {
  const nombre = d.nombre ?? "";

  const miembros = Array.isArray(d.miembros) && d.miembros.length > 0
    ? d.miembros.map(normalizarMiembro)
    : [normalizarMiembro({ nombre, asistencia: d.asistencia, alergia: d.alergia })];

  return {
    id,
    nombre,
    numero: typeof d.numero === "number" ? d.numero : null,
    miembros,
    autobus: d.autobus === true,
    cancion: typeof d.cancion === "string" ? d.cancion : "",
  };
}

/** ¿Alguien del grupo ha contestado ya? */
export function haRespondido(invitacion) {
  return invitacion.miembros.some((m) => m.asistencia !== ASISTENCIA_PENDIENTE);
}

/** Miembros que han confirmado que vienen. */
export function asistentes(invitacion) {
  return invitacion.miembros.filter((m) => m.asistencia === "Sí");
}

/** Orden estable por número; los que no tienen número van al final. */
export function ordenarPorNumero(invitaciones) {
  return [...invitaciones].sort(
    (a, b) =>
      (a.numero ?? Number.MAX_SAFE_INTEGER) - (b.numero ?? Number.MAX_SAFE_INTEGER)
  );
}
