// API Route para obtener lista de invitados (solo admin)
import { getAllDocuments } from "@/lib/firebase";

export async function GET(request) {
  const timestamp = new Date().toISOString();
  console.log(`\n${'='.repeat(70)}`);
  console.log(`[ADMIN GUESTS] ${timestamp} - Solicitud de lista de invitados`);
  console.log(`${'='.repeat(70)}`);

  try {
    // 1. Verificar contraseña de admin
    console.log(`[ADMIN GUESTS] Verificando autenticación...`);
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      console.error(`[ADMIN GUESTS] ✗ ERROR: ADMIN_PASSWORD no está configurado`);
      return Response.json(
        { success: false, error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    if (!password || password !== correctPassword) {
      console.warn(`[ADMIN GUESTS] ✗ Contraseña incorrecta`);
      return Response.json(
        { success: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    console.log(`[ADMIN GUESTS] ✓ Autenticación correcta`);

    // 2. Obtener todos los invitados desde Firestore
    console.log(`[ADMIN GUESTS] Obteniendo invitados desde Firestore...`);
    const guests = await getAllDocuments("invitados");
    console.log(`[ADMIN GUESTS] ✓ ${guests.length} invitados obtenidos`);

    console.log(`${'='.repeat(70)}\n`);

    return Response.json({
      success: true,
      guests: guests,
      count: guests.length,
    });
  } catch (error) {
    console.error(`[ADMIN GUESTS] ✗ ERROR:`, error);

    return Response.json(
      {
        success: false,
        error: "No se pudo obtener la lista de invitados: " + error.message,
      },
      { status: 500 }
    );
  }
}
