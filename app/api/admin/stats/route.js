// API Route para obtener estadísticas de RSVPs
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(request) {
  try {
    // Verificar contraseña de admin
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");

    if (!password || password !== process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      return Response.json(
        { success: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    // Obtener todos los RSVPs
    const rsvpsCollection = collection(db, "rsvps");
    const snapshot = await getDocs(rsvpsCollection);

    const rsvps = [];
    snapshot.forEach((doc) => {
      rsvps.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Calcular estadísticas
    const confirmados = rsvps.filter((r) => r.asistencia === "si").length;
    const rechazados = rsvps.filter((r) => r.asistencia === "no").length;
    const conBus = rsvps.filter((r) => r.bus === "si").length;
    const alergias = rsvps
      .filter((r) => r.alergias && r.alergias.trim())
      .map((r) => `${r.nombre_invitado}: ${r.alergias}`)
      .join("\n");

    return Response.json({
      success: true,
      stats: {
        total: rsvps.length,
        confirmados,
        rechazados,
        conBus,
        sinConfirmar: rsvps.filter((r) => !r.asistencia).length,
      },
      alergias,
      rsvps,
    });
  } catch (error) {
    console.error("Error en /api/admin/stats:", error);

    return Response.json(
      {
        success: false,
        error: "No se pudo obtener las estadísticas",
      },
      { status: 500 }
    );
  }
}
