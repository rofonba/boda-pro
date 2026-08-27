// Constantes compartidas por servidor y navegador.
//
// Este módulo no importa nada a propósito: así lo puede usar tanto el código de
// servidor (Admin SDK) como el del cliente sin arrastrar dependencias de Node
// al paquete del navegador.

/** Nombre de la colección de invitados en Firestore. */
export const COLECCION_INVITADOS = "invitados";

/** Estado de un invitado que todavía no ha contestado. */
export const ASISTENCIA_PENDIENTE = "Pendiente";

/** Valores admitidos en el campo de asistencia. */
export const ASISTENCIA_VALIDA = ["Sí", "No", ASISTENCIA_PENDIENTE];
