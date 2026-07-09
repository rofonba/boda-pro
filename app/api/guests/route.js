/**
 * API Route: GET /api/guests
 *
 * ACCESO PÚBLICO (sin autenticación requerida)
 * ────────────────────────────────────────────────────────────
 * Esta API es de SOLO LECTURA y está abierta al público.
 * Cualquier usuario puede obtener la lista de invitados.
 *
 * CASOS DE USO:
 * 1. Formulario de invitados (?id=juan-perez) - búsqueda pública
 * 2. GuestProvider - cargar datos del invitado en URL
 * 3. Cualquier cliente que necesite validar IDs de invitados
 *
 * NOTA: No contiene información sensible, solo nombres y IDs.
 * ────────────────────────────────────────────────────────────
 */

import { getGuestsFromSheet } from "@/lib/googleSheets";

export async function GET(request) {
  const timestamp = new Date().toISOString();
  const { searchParams } = new URL(request.url);
  const requestedId = searchParams.get("id");

  console.log("\n" + "=".repeat(80));
  console.log(`[API GUESTS] ${timestamp} - Solicitud de lista de invitados`);
  console.log("=".repeat(80));
  console.log(`[API GUESTS] Acceso: PÚBLICO (sin autenticación)`);
  console.log(`[API GUESTS] Método: ${request.method}`);
  console.log(`[API GUESTS] URL: ${request.url}`);

  if (requestedId) {
    console.log(`[DEBUG] Buscando invitado con ID: ${requestedId}`);
  }

  try {
    console.log(`[API GUESTS]`);
    console.log(`[API GUESTS] Llamando a getGuestsFromSheet()...`);
    const guests = await getGuestsFromSheet();

    const guestCount = Object.keys(guests).length;
    console.log(`[API GUESTS]`);
    console.log(`[API GUESTS] ══════════════════════════════════════════════════════`);
    console.log(`[API GUESTS] RESULTADO`);
    console.log(`[API GUESTS] ══════════════════════════════════════════════════════`);
    console.log(`[API GUESTS] ✓ Total de invitados cargados: ${guestCount}`);

    // Si se solicita un ID específico, mostrar si se encontró
    if (requestedId) {
      const found = guests[requestedId.toLowerCase()];
      if (found) {
        console.log(`[DEBUG] ✓ Invitado encontrado: "${found.nombres}"`);
      } else {
        console.log(`[DEBUG] ✗ Invitado NO encontrado con ID: "${requestedId}"`);
      }
    }

    console.log(`[API GUESTS]`);
    console.log(`[API GUESTS] Primeros 5 IDs disponibles:`);
    Object.keys(guests)
      .slice(0, 5)
      .forEach((id, idx) => {
        const guest = guests[id];
        console.log(
          `[API GUESTS]   ${idx + 1}. ID: "${id}" → Nombre: "${guest.nombres}"`
        );
      });
    if (guestCount > 5) {
      console.log(`[API GUESTS]   ... y ${guestCount - 5} más`);
    }
    console.log(`[API GUESTS] ══════════════════════════════════════════════════════`);
    console.log(`[API GUESTS]\n`);

    return Response.json(
      {
        success: true,
        data: guests,
        count: guestCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`[API GUESTS] ✗ ERROR:`);
    console.error(`[API GUESTS] Tipo:`, error.constructor.name);
    console.error(`[API GUESTS] Mensaje:`, error.message);
    console.error(`[API GUESTS] Stack:`, error.stack);
    console.log("=".repeat(80) + "\n");

    return Response.json(
      {
        success: false,
        error: "No se pudo obtener los datos de invitados: " + error.message,
      },
      { status: 500 }
    );
  }
}

// ISR: revalidar cada 5 minutos
export const revalidate = 300;
