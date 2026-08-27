/**
 * API de invitados — pública, sin autenticación.
 *
 *   GET   /api/guests?id=virginia-agudo   → datos del invitado (saludo personalizado)
 *   PATCH /api/guests?id=virginia-agudo   → guarda su respuesta
 *
 * El `id` es el slug del nombre y es también el ID del documento en Firestore,
 * así que la lectura es un acceso directo por clave: sin consultas ni filtros.
 *
 * En PATCH solo se escriben los cuatro campos que el invitado controla. El
 * `nombre` y el `numero` no se pueden modificar desde aquí por diseño: no están
 * en la lista blanca, así que aunque llegasen en el cuerpo de la petición se
 * descartan.
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
//  GET — leer un invitado por su slug
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
//  PATCH — guardar la respuesta del invitado
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Construye el objeto de actualización a partir del cuerpo de la petición.
 * Solo deja pasar los cuatro campos permitidos, ya validados y saneados.
 *
 * @returns {{ campos: object } | { error: string }}
 */
function validar(cuerpo) {
  if (typeof cuerpo !== "object" || cuerpo === null) {
    return { error: "El cuerpo de la petición debe ser un objeto JSON." };
  }

  const campos = {};

  if ("asistencia" in cuerpo) {
    // Aceptamos "Si" sin tilde por comodidad y lo normalizamos.
    const valor = cuerpo.asistencia === "Si" ? "Sí" : cuerpo.asistencia;
    if (!ASISTENCIA_VALIDA.includes(valor)) {
      return { error: `'asistencia' debe ser uno de: ${ASISTENCIA_VALIDA.join(", ")}.` };
    }
    campos.asistencia = valor;
  }

  if ("autobus" in cuerpo) {
    if (typeof cuerpo.autobus !== "boolean") {
      return { error: "'autobus' debe ser true o false." };
    }
    campos.autobus = cuerpo.autobus;
  }

  for (const clave of ["alergia", "cancion"]) {
    if (clave in cuerpo) {
      const valor = cuerpo[clave] ?? "";
      if (typeof valor !== "string") {
        return { error: `'${clave}' debe ser texto.` };
      }
      if (valor.length > MAX_TEXTO) {
        return { error: `'${clave}' no puede pasar de ${MAX_TEXTO} caracteres.` };
      }
      campos[clave] = valor.trim();
    }
  }

  if (Object.keys(campos).length === 0) {
    return { error: "No hay nada que actualizar." };
  }

  return { campos };
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

  const resultado = validar(cuerpo);
  if (resultado.error) {
    return json({ error: resultado.error }, 400);
  }

  try {
    const ref = getDb().collection(COLECCION_INVITADOS).doc(id);

    // update() falla si el documento no existe, que es justo lo que queremos:
    // así una URL inventada no puede crear invitados nuevos.
    await ref.update({
      ...resultado.campos,
      respondidoEn: new Date().toISOString(),
    });

    const doc = await ref.get();
    return json({ invitado: normalizarInvitado(doc) });
  } catch (error) {
    // Código 5 = NOT_FOUND en gRPC/Firestore.
    if (error.code === 5) {
      return json({ error: "Invitación no encontrada." }, 404);
    }
    console.error("[api/guests] PATCH falló:", error);
    return json({ error: "No se pudo guardar la respuesta." }, 500);
  }
}
