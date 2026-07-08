// API Route para obtener estadísticas de RSVPs
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export async function GET(request) {
  const timestamp = new Date().toISOString();
  console.log(`\n${'='.repeat(70)}`);
  console.log(`[ADMIN STATS] ${timestamp} - Solicitud de estadísticas`);
  console.log(`${'='.repeat(70)}`);

  try {
    // 1. Verificar contraseña de admin
    console.log(`[ADMIN STATS] Verificando autenticación...`);
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password");
    const correctPassword = process.env.ADMIN_PASSWORD;

    if (!correctPassword) {
      console.error(`[ADMIN STATS] ✗ ERROR: ADMIN_PASSWORD no está configurado`);
      return Response.json(
        { success: false, error: "Error de configuración del servidor" },
        { status: 500 }
      );
    }

    if (!password || password !== correctPassword) {
      console.warn(`[ADMIN STATS] ✗ Contraseña incorrecta`);
      return Response.json(
        { success: false, error: "Contraseña incorrecta" },
        { status: 401 }
      );
    }

    console.log(`[ADMIN STATS] ✓ Autenticación correcta`);

    // 2. Obtener todos los RSVPs de Firestore
    console.log(`[ADMIN STATS] Conectando a Firestore...`);
    const rsvpsCollection = collection(db, "rsvps");
    const snapshot = await getDocs(rsvpsCollection);
    console.log(`[ADMIN STATS] ✓ Conectado a Firestore`);

    // 3. Procesar documentos
    console.log(`[ADMIN STATS] Leyendo documentos de Firestore...`);
    const rsvps = [];
    let processedCount = 0;

    snapshot.forEach((doc) => {
      try {
        const data = doc.data();
        rsvps.push({
          id: doc.id,
          ...data,
        });
        processedCount++;
      } catch (docError) {
        console.warn(`[ADMIN STATS] ⚠ Error procesando documento ${doc.id}:`, docError.message);
      }
    });

    console.log(`[ADMIN STATS] ✓ Procesados ${processedCount} documentos de Firestore`);
    console.log(`[ADMIN STATS] Total de RSVPs: ${rsvps.length}`);

    // 4. Calcular estadísticas con validaciones robustas
    console.log(`[ADMIN STATS] Calculando estadísticas...`);

    let confirmados = 0;
    let rechazados = 0;
    let conBus = 0;
    let sinConfirmar = 0;

    const alergias_list = [];

    try {
      for (let i = 0; i < rsvps.length; i++) {
        const rsvp = rsvps[i];

        // Validar asistencia
        if (rsvp.asistencia === "si") {
          confirmados++;
        } else if (rsvp.asistencia === "no") {
          rechazados++;
        } else {
          sinConfirmar++;
        }

        // Validar bus
        if (rsvp.bus === "si") {
          conBus++;
        }

        // Validar alergias (resistente a nulos)
        if (rsvp.alergias && typeof rsvp.alergias === "string") {
          const alergiasText = rsvp.alergias.trim();
          if (alergiasText.length > 0) {
            const nombreInvitado = rsvp.nombre_invitado || "Invitado desconocido";
            alergias_list.push(`${nombreInvitado}: ${alergiasText}`);
          }
        }
      }

      console.log(`[ADMIN STATS] ✓ Estadísticas calculadas:`);
      console.log(`[ADMIN STATS]   Confirmados: ${confirmados}`);
      console.log(`[ADMIN STATS]   Rechazados: ${rechazados}`);
      console.log(`[ADMIN STATS]   Sin confirmar: ${sinConfirmar}`);
      console.log(`[ADMIN STATS]   Con autobús: ${conBus}`);
      console.log(`[ADMIN STATS]   Alergias registradas: ${alergias_list.length}`);
    } catch (calcError) {
      console.error(`[ADMIN STATS] ✗ ERROR calculando estadísticas:`, calcError);
      console.error(`[ADMIN STATS] Mensaje:`, calcError.message);
      console.error(`[ADMIN STATS] Stack:`, calcError.stack);
      throw calcError;
    }

    // 5. Construir respuesta
    const alergias = alergias_list.join("\n");

    const responseData = {
      success: true,
      stats: {
        total: rsvps.length,
        confirmados,
        rechazados,
        conBus,
        sinConfirmar,
      },
      alergias,
      rsvps,
    };

    console.log(`[ADMIN STATS] ✓ Respuesta construida exitosamente`);
    console.log(`${'='.repeat(70)}\n`);

    return Response.json(responseData, { status: 200 });
  } catch (error) {
    console.error(`\n${'='.repeat(70)}`);
    console.error(`[ADMIN STATS] ✗✗✗ ERROR NO CAPTURADO`);
    console.error(`[ADMIN STATS] Tipo de error:`, error.constructor.name);
    console.error(`[ADMIN STATS] Mensaje:`, error.message);
    console.error(`[ADMIN STATS] Stack:`, error.stack);
    console.error(`${'='.repeat(70)}\n`);

    return Response.json(
      {
        success: false,
        error: "No se pudo obtener las estadísticas: " + error.message,
      },
      { status: 500 }
    );
  }
}
