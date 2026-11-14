/**
 * API de invitaciones — pública, sin autenticación.
 *
 *   GET   /api/guests?id=beatriz-y-xavi   → datos de la invitación (saludo personalizado)
 *   PATCH /api/guests?id=beatriz-y-xavi   → guarda la respuesta del grupo
 *
 * El `id` es el slug del grupo y es también el ID del documento en Firestore,
 * así que la lectura es un acceso directo por clave: sin consultas ni filtros.
 *
 * Cuerpo del PATCH (todo obligatorio):
 *
 *   {
 *     "miembros": [                       ← uno por persona, EN EL MISMO ORDEN
 *       { "asistencia": "Sí", "alergia": "" },
 *       { "asistencia": "No", "alergia": "" }
 *     ],
 *     "autobus": true,
 *     "cancion": "..."
 *   }
 *
 * Los nombres de los miembros y el número de la invitación no se pueden
 * modificar desde aquí por diseño: la API los toma del documento guardado y
 * descarta lo que llegue en el cuerpo. Tampoco se puede cambiar el número de
 * miembros: el array debe tener exactamente la longitud del documento.
 */

import { ASISTENCIA_VALIDA, COLECCION_INVITADOS } from "@/lib/constantes";
import { getDb } from "@/lib/firebase";
import { normalizarInvitado, obtenerInvitado } from "@/lib/invitados";

/** Tope de caracteres en los campos de texto libre (endpoint público). */
const MAX_TEXTO = 500;

/** Datos del invitado nunca se cachean: la respuesta debe verse al instante. */
const SIN_CACHE = { "Cache-Control": "no-store" };

const json = (cuerpo, estado = 200) =>
  Response.json(cuerpo, { status: estado, headers: SIN_CACHE });

// ─────────────────────────────────────────────────────────────────────────────
//  GET — leer una invitación por su slug
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(request) {
  const id = new URL(request.url).searchParams.get("id")?.trim();

  if (!id) {
    return json({ error: "Falta el parámetro 'id'." }, 400);
  }

  try {
    const invitado = await obtenerInvitado(id);

    if (!invitado) {
      return json({ error: "Invitación no encontrada." }, 404);
    }

    return json({ invitado });
  } catch (error) {
    console.error("[api/guests] GET falló:", error);
    return json({ error: "No se pudo leer la invitación." }, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
//  PATCH — guardar la respuesta del grupo
// ─────────────────────────────────────────────────────────────────────────────

/** Texto libre saneado, o un error si no es texto o es demasiado largo. */
function validarTexto(valor, clave) {
  if (valor === undefined || valor === null) return { valor: "" };
  if (typeof valor !== "string") return { error: `'${clave}' debe ser texto.` };
  if (valor.length > MAX_TEXTO) {
    return { error: `'${clave}' no puede pasar de ${MAX_TEXTO} caracteres.` };
  }
  return { valor: valor.trim() };
}

/**
 * Construye el objeto de actualización a partir del cuerpo de la petición y
 * de los miembros ya guardados (de los que se toman los nombres).
 *
 * @param {unknown} cuerpo
 * @param {Array<{nombre: string}>} miembrosGuardados
 * @returns {{ campos: object } | { error: string }}
 */
function validar(cuerpo, miembrosGuardados) {
  if (typeof cuerpo !== "object" || cuerpo === null) {
    return { error: "El cuerpo de la petición debe ser un objeto JSON." };
  }

  if (!Array.isArray(cuerpo.miembros) || cuerpo.miembros.length !== miembrosGuardados.length) {
    return {
      error: `'miembros' debe ser una lista de ${miembrosGuardados.length} elementos, en el mismo orden que la invitación.`,
    };
  }

  const miembros = [];
  for (let i = 0; i < miembrosGuardados.length; i += 1) {
    const m = cuerpo.miembros[i];
    if (typeof m !== "object" || m === null) {
      return { error: `'miembros[${i}]' debe ser un objeto.` };
    }

    // Aceptamos "Si" sin tilde por comodidad y lo normalizamos.
    const asistencia = m.asistencia === "Si" ? "Sí" : m.asistencia;
    if (!ASISTENCIA_VALIDA.includes(asistencia)) {
      return {
        error: `'miembros[${i}].asistencia' debe ser uno de: ${ASISTENCIA_VALIDA.join(", ")}.`,
      };
    }

    const alergia = validarTexto(m.alergia, `miembros[${i}].alergia`);
    if (alergia.error) return { error: alergia.error };

    miembros.push({
      nombre: miembrosGuardados[i].nombre, // del documento, nunca del cuerpo
      asistencia,
      // Quien no viene no come: su alergia no aplica.
      alergia: asistencia === "Sí" ? alergia.valor : "",
    });
  }

  if (typeof cuerpo.autobus !== "boolean") {
    return { error: "'autobus' debe ser true o false." };
  }

  const cancion = validarTexto(cuerpo.cancion, "cancion");
  if (cancion.error) return { error: cancion.error };

  const alguienViene = miembros.some((m) => m.asistencia === "Sí");

  return {
    campos: {
      miembros,
      // Si no viene nadie, el autobús no aplica.
      autobus: alguienViene && cuerpo.autobus,
      cancion: cancion.valor,
    },
  };
}

export async function PATCH(request) {
  const id = new URL(request.url).searchParams.get("id")?.trim();

  if (!id) {
    return json({ error: "Falta el parámetro 'id'." }, 400);
  }

  let cuerpo;
  try {
    cuerpo = await request.json();
  } catch {
    return json({ error: "JSON inválido." }, 400);
  }

  try {
    const ref = getDb().collection(COLECCION_INVITADOS).doc(id);

    // Se lee primero: los nombres salen del documento y la longitud de
    // `miembros` se valida contra él. Si no existe, una URL inventada no puede
    // crear invitaciones nuevas.
    const previo = await ref.get();
    if (!previo.exists) {
      return json({ error: "Invitación no encontrada." }, 404);
    }

    const resultado = validar(cuerpo, normalizarInvitado(previo).miembros);
    if (resultado.error) {
      return json({ error: resultado.error }, 400);
    }

    await ref.update({
      ...resultado.campos,
      respondidoEn: new Date().toISOString(),
    });

    const doc = await ref.get();
    return json({ invitado: normalizarInvitado(doc) });
  } catch (error) {
    console.error("[api/guests] PATCH falló:", error);
    return json({ error: "No se pudo guardar la respuesta." }, 500);
  }
}
