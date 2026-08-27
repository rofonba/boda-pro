// Cálculo del resumen de la boda a partir de la lista de invitados.
//
// Función pura: no toca Firestore ni React. Así el mismo cálculo sirve para el
// panel /dashboard (que lee en el servidor) y para cualquier otra vista, y se
// puede razonar sobre ella de un vistazo.

/** ¿Ha contestado ya este invitado? */
const haRespondido = (inv) => inv.asistencia === "Sí" || inv.asistencia === "No";

/**
 * @param {Array<{nombre:string, asistencia:string, autobus:boolean, alergia:string, cancion:string}>} invitados
 */
export function calcularResumen(invitados) {
  const total = invitados.length;

  const asistencia = {
    confirmados: invitados.filter((i) => i.asistencia === "Sí").length,
    rechazados: invitados.filter((i) => i.asistencia === "No").length,
    pendientes: invitados.filter((i) => !haRespondido(i)).length,
    total,
  };

  // El autobús se guarda como booleano, así que el tercer estado ("pendiente")
  // se deduce de quien todavía no ha contestado el formulario: mientras no
  // responda, no sabemos si necesita plaza.
  const autobus = {
    confirmados: invitados.filter((i) => i.autobus === true).length,
    rechazados: invitados.filter((i) => haRespondido(i) && i.autobus !== true).length,
    pendientes: invitados.filter((i) => !haRespondido(i)).length,
    total,
  };

  const canciones = invitados
    .filter((i) => i.cancion?.trim())
    .map((i) => ({ id: i.id, nombre: i.nombre, cancion: i.cancion.trim() }));

  const alergias = invitados
    .filter((i) => i.alergia?.trim())
    .map((i) => ({ id: i.id, nombre: i.nombre, alergia: i.alergia.trim() }));

  return { asistencia, autobus, canciones, alergias };
}
