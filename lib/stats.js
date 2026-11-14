// Cálculo del resumen de la boda a partir de la lista de invitaciones.
//
// Función pura: no toca Firestore ni React. Así el mismo cálculo sirve para el
// panel /dashboard (que lee en el servidor) y para /backstage, y se puede
// razonar sobre ella de un vistazo.
//
// Las invitaciones son grupos; los contadores se expresan en PERSONAS (una por
// miembro), que es lo que importa para el catering y el autobús.

import { haRespondido } from "./invitacion.js";

const esta = (m, valor) => m.asistencia === valor;

/**
 * @param {object[]} invitaciones lista normalizada (ver lib/invitacion.js)
 */
export function calcularResumen(invitaciones) {
  // Cada persona, con una referencia a su grupo para el autobús y los listados.
  const personas = invitaciones.flatMap((inv) =>
    inv.miembros.map((m) => ({ ...m, grupo: inv }))
  );
  const total = personas.length;

  const asistencia = {
    confirmados: personas.filter((p) => esta(p, "Sí")).length,
    rechazados: personas.filter((p) => esta(p, "No")).length,
    pendientes: personas.filter((p) => esta(p, "Pendiente")).length,
    total,
  };

  // El autobús es global del grupo y solo cuenta para quienes vienen. Los que
  // aún no han contestado siguen pendientes también aquí: no sabemos si lo
  // necesitarán.
  const autobus = {
    confirmados: personas.filter((p) => esta(p, "Sí") && p.grupo.autobus).length,
    rechazados: personas.filter((p) => esta(p, "No") || (esta(p, "Sí") && !p.grupo.autobus)).length,
    pendientes: personas.filter((p) => esta(p, "Pendiente")).length,
    total,
  };

  // Una canción por grupo.
  const canciones = invitaciones
    .filter((inv) => inv.cancion?.trim())
    .map((inv) => ({ id: inv.id, nombre: inv.nombre, cancion: inv.cancion.trim() }));

  // Una alergia por persona, con el grupo entre paréntesis cuando ayuda.
  const alergias = personas
    .filter((p) => p.alergia?.trim())
    .map((p, i) => ({
      id: `${p.grupo.id}-${i}`,
      nombre: p.grupo.miembros.length > 1 ? `${p.nombre} (${p.grupo.nombre})` : p.nombre,
      alergia: p.alergia.trim(),
    }));

  return { asistencia, autobus, canciones, alergias };
}

/** Nº de invitaciones (grupos) que ya han contestado. */
export function contarRespondidas(invitaciones) {
  return invitaciones.filter(haRespondido).length;
}
