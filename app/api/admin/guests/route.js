// API Route para obtener lista de invitados (solo admin)
import { getGuestsFromSheet } from "@/lib/googleSheets";

export async function GET(request) {
  try {
    // Verificar contraseña de admin
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      console.error("[Admin Auth] ERROR: ADMIN_PASSWORD no está configurado en variables de entorno");
      return Response.json(
        { success: false, error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    if (!password || password !== correctPassword) {
      console.warn("[Admin Auth] ⚠ Intento de acceso con contraseña incorrecta");
      return Response.json(
        { success: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // Obtener todos los invitados desde Google Sheets
    const guests = await getGuestsFromSheet();

    return Response.json({
      success: true,
      guests: Object.values(guests),
      count: Object.values(guests).length,
    });
  } catch (error) {
    console.error("Error en /api/admin/guests:", error);

    return Response.json(
      {
        success: false,
        error: "No se pudo obtener la lista de invitados",
      },
      { status: 500 }
    );
  }
}
